import parse from "node-html-parser";
import { prisma } from "../../lib/prisma";

export const gh = {
  // create function that runs all the steps
  fetchContributionsAndAddToDatabase: async function ({
    username,
    gitAccountId,
    userId,
  }: FetchContributionsAndAddToDatabaseArgs) {
    const calendarData = await this.fetchProfilePage(username);
    const unSavedContributions = this.parseHtmlPage(calendarData);
    return await this.addContributionsToDatabase({ unSavedContributions, gitAccountId, userId });
  },

  // 21  ---- only get numbers at start of string
  countRegex: /^\d+/,

  // YYYY-MM-DD
  dateRegex: /^\d{4}-\d{2}-\d{2}$/,

  selectors: {
    contributionSquare: "rect.ContributionCalendar-day",
  },

  fetchProfilePage: async function (githubUsername: string): Promise<string> {
    try {
      const res = await fetch(`https://github.com/${githubUsername}`);
      if (res.status !== 200) throw `Github returned status code ${res.status}`;

      const html = await res.text();
      if (!html) throw "Github returned empty response";

      return html;
    } catch (error) {
      console.error(error);
      throw `Error fetching Github calendar data for ${githubUsername}`;
    }
  },

  parseHtmlPage: function (pageContents: string): GithubCalendarData[] {
    const page = parse(pageContents);
    const response: GithubCalendarData[] = [];

    const contributionSquares = page.querySelectorAll(this.selectors.contributionSquare);
    if (contributionSquares.length === 0) throw `Could not find contribution squares (${this.selectors.contributionSquare})`;

    contributionSquares.forEach((square) => {
      const date = square.getAttribute("data-date");
      const count = square.innerText.match(this.countRegex)?.[0];
      if (date && count) {
        if (this.dateRegex.test(date)) {
          response.push({ date, count: parseInt(count) });
        }
      }
    });

    return response;
  },

  addContributionsToDatabase: async ({ unSavedContributions, gitAccountId, userId }: AddContributionsToDatabaseArgs) => {
    const contributionsToCreate = unSavedContributions.map((c) => ({
      ...c,
      date: new Date(c.date),
      gitAccountId,
      userId,
    }));
    return await prisma.contribution.createMany({ data: contributionsToCreate, skipDuplicates: true });
  },
};

type GithubCalendarData = { date: string; count: number };
type AddContributionsToDatabaseArgs = {
  unSavedContributions: GithubCalendarData[];
  gitAccountId: number;
  userId: number;
};

export type FetchContributionsAndAddToDatabaseArgs = {
  username: string;
  gitAccountId: number;
  userId: number;
};
