import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { gh } from "../utils/github";
import { gl } from "../utils/gitlab";

export default async function updateContributions() {
  const accounts = await prisma.gitAccount
    .findMany()
    .catch((error) => console.error(`cron-job: Error fetching accounts: ${error}`));
  let promises: Promise<Prisma.BatchPayload>[] = [];

  if (!accounts) return;
  if (accounts.length === 0) return console.log("cron-job: No accounts to update contributions for");

  console.log("cron-job: Starting to update contributions...");
  for (const account of accounts) {
    if (account.source === "gitlab") {
      promises.push(
        gl.fetchContributionsAndAddToDatabase({
          username: account.username,
          gitAccountId: account.id,
        })
      );
    } else if (account.source === "github") {
      promises.push(
        gh.fetchContributionsAndAddToDatabase({
          username: account.username,
          gitAccountId: account.id,
        })
      );
    }
    continue;
  }

  const results = await Promise.all(promises).catch((error) => {
    console.error(`cron-job: Error updating contributions: ${error}`);
  });

  if (!results) return;
  console.log(`cron-job: Updated contributions for ${results.length} accounts`);
}
