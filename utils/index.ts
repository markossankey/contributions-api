// @ts-nocheck
import parse from "node-html-parser";

export const calendarDaysList = (): string[] => {
  let days = [];
  const today = dayjs();
  let startOfCalendar = today.startOf("week").subtract(52, "weeks");
  while (!startOfCalendar.isSame(today.add(1, "day"), "date")) {
    days.push(startOfCalendar.format("YYYY-MM-DD"));
    startOfCalendar = startOfCalendar.add(1, "day");
  }
  return days;
};

export const getGitlabCalendarData = async (gitlabUsername: string) =>
  await fetch(`https://gitlab.com/users/${gitlabUsername}/calendar.json`);

export const getGithubCalendarData = async (githubUsername: string) => await fetch(`https://github.com/${githubUsername}`);

export const parseGithubCalendarHtml = ({ data: html }) => {
  let totalContributions = 0;
  const doc = parse(html);
  const contributions = doc.querySelectorAll(".ContributionCalendar-day")?.reduce((results, { attributes, innerText }) => {
    if (attributes["data-date"]) {
      console.log(innerText);
      const { "data-date": date } = attributes;
      const count = Number(innerText.split(" ")[0]) || 0;
      totalContributions += count;
      return [...results, { count, date }];
    } else {
      return results;
    }
  }, [] as ContributionDay[]);
  return { totalContributions, contributions };
};

export const parseGitlabCalendar = ({ gitlabCalendar }) => {
  let totalContributions = 0;
  const contributions = calendarDaysList().map((date) => {
    const count = gitlabCalendar[date] || 0;
    totalContributions += count;
    return { count, date };
  });
  return { totalContributions, contributions };
};

export const parseAndCombineCalendars = ([{ data: githubCalendarHtmlString }, { data: gitlabCalendarJson }]) => {
  let totalContributions = 0;
  const doc = parse(githubCalendarHtmlString);
  const combinedContributions = doc
    .querySelectorAll(".ContributionCalendar-day")
    ?.reduce((results, { attributes, innerText }) => {
      if (!!attributes["data-date"]) {
        const date = attributes["data-date"];
        const githubContributions = Number(innerText.split(" ")[0]) || 0;
        const gitlabContributions = gitlabCalendarJson[date] || 0;
        const count = gitlabContributions + Number(githubContributions);
        console.log({ count, totalContributions });
        totalContributions += count;
        return [...results, { count, date }];
      } else {
        return results;
      }
    }, []);
  return { totalContributions, combinedContributions };
};
