import { prisma } from "../../lib/prisma";
import { FetchContributionsAndAddToDatabaseArgs } from "../github";

export const gl = {
  // add function to fetch calendar data from gitlab and add it to the database
  fetchContributionsAndAddToDatabase: async function ({ username, gitAccountId }: FetchContributionsAndAddToDatabaseArgs) {
    const calendarData = await this.fetchContributions(username);
    const unSavedContributions = this.mapJsonContributions(calendarData);
    return await this.addContributionsToDatabase({ unSavedContributions, gitAccountId });
  },
  dateRegex: /^\d{4}-\d{2}-\d{2}$/,
  fetchContributions: async function (gitlabUsername: string): Promise<DirtyGitlabCalendarData> {
    try {
      const res = await fetch(`https://gitlab.com/users/${gitlabUsername}/calendar.json`);
      if (res.status !== 200) throw `Gitlab returned status code ${res.status}`;

      const json = await res.json();
      if (typeof json !== "object") throw "Unexpected format for Gitlab calendar data";
      // Check that the JSON is in the expected format { "YYYY-MM-DD": number, ...}
      if (
        Object.entries(json).every(([date, count]) => {
          return this.dateRegex.test(date) && typeof count === "number";
        })
      ) {
        return json;
      }
      throw "Unexpected JSON format for Gitlab calendar data";
    } catch (error) {
      console.error(error);
      throw `Error fetching Gitlab calendar data for ${gitlabUsername}`;
    }
  },

  mapJsonContributions: (json: DirtyGitlabCalendarData): GitlabCalendarData[] =>
    Object.entries(json).map(([date, count]) => ({ date, count })),

  addContributionsToDatabase: async ({ unSavedContributions, gitAccountId }: AddContributionsToDatabaseArgs) => {
    const contributionsToCreate = unSavedContributions.map((c) => ({
      ...c,
      date: new Date(c.date),
      gitAccountId,
    }));
    return await prisma.contribution.createMany({ data: contributionsToCreate, skipDuplicates: true });
  },
};

type DirtyGitlabCalendarData = Record<string, number>;
type GitlabCalendarData = { date: string; count: number };
type AddContributionsToDatabaseArgs = {
  unSavedContributions: GitlabCalendarData[];
  gitAccountId: number;
};
