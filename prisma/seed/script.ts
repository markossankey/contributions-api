import { PrismaClient } from "@prisma/client";
import {
  email,
  githubData,
  gitlabData,
  markosGithubContributions,
  markosGitlabContributions,
  testAccount,
  testGithubAccounts,
  testGitlabAccounts,
} from "./data";

const prisma = new PrismaClient();

async function main() {
  const markos = await prisma.user.create({
    data: {
      email,
      globalUsername: "markossankey",
      accounts: {
        createMany: {
          data: [githubData, gitlabData],
        },
      },
    },
    include: { accounts: true },
  });

  markos.accounts.forEach(async (account) => {
    if (account.source === "github") {
      console.log("creating github contributions");
      await prisma.contribution.createMany({
        data: markosGithubContributions.map((v) => ({
          ...v,
          gitAccountId: account.id,
          userId: markos.id,
          date: new Date(v.date),
        })),
        skipDuplicates: true,
      });
    } else if (account.source === "gitlab") {
      console.log("creating gitlab contributions");
      await prisma.contribution.createMany({
        data: markosGitlabContributions.map((v) => ({
          ...v,
          gitAccountId: account.id,
          userId: markos.id,
          date: new Date(v.date),
        })),
      });
    }
  });

  // console.log nested objects in markos object
  console.dir(markos, { depth: null });

  const testUser = await prisma.user.create({
    data: {
      ...testAccount,
      accounts: {
        createMany: {
          data: [
            ...testGithubAccounts.map((username) => ({ source: "github", username })),
            ...testGitlabAccounts.map((username) => ({ source: "gitlab", username })),
          ],
        },
      },
    },
  });

  console.dir(testUser, { depth: null });
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
