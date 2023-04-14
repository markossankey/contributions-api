import { Contribution, GitAccount } from "@prisma/client";

export function combinedContributions(accounts: AccountWithContributions[]) {
  const combinedContributionsObj: CombinedContributionsObj = {};

  accounts.forEach((account) => {
    account.contributions.forEach((contribution) => {
      const date = new Date(contribution.date).toISOString().split("T")[0];
      if (!combinedContributionsObj[date]) {
        combinedContributionsObj[date] = {
          total: 0,
          contributionByAccount: [],
        };
      }
      combinedContributionsObj[date].total += contribution.count;
      combinedContributionsObj[date].contributionByAccount.push({
        count: contribution.count,
        account: account.username,
        source: account.source,
      });
    });
  });

  return combinedContributionsObj;
}

type AccountWithContributions = GitAccount & { contributions: Contribution[] };
export type CombinedContributionsObj = {
  [date: string]: { total: number; contributionByAccount: { count: number; account: string; source: string }[] };
};
