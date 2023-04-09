import { PrismaClient } from "@prisma/client";
import { email, githubData, gitlabData, markosGithubContributions, markosGitlabContributions } from "./data";

const prisma = new PrismaClient();

async function main() {
  const globalAccount = await prisma.user.create({
    data: {
      email,
      globalUsername: "markossankey",
    },
  });

  const gitAccounts = await Promise.all([
    prisma.gitAccount.create({
      data: {
        ...githubData,
        user: { connect: { id: globalAccount.id } },
        contributions: {
          createMany: {
            data: markosGithubContributions.map((v) => ({
              ...v,
              date: new Date(v.date),
            })),
          },
        },
      },
    }),
    prisma.gitAccount.create({
      data: {
        ...gitlabData,
        user: { connect: { id: globalAccount.id } },
        contributions: {
          createMany: {
            data: markosGitlabContributions.map((v) => ({
              ...v,
              date: new Date(v.date),
            })),
          },
        },
      },
    }),
  ]);

  const contributions = await prisma.contribution.findMany();
  // console.log nested objects in markos object
  console.log(
    `
  User Seeded: ${globalAccount.email}\n
  Accounts Added:${gitAccounts.map((v) => `\n    ${v.source} - ${v.username}`).join("")}\n
  Contributions Added: ${contributions.length}
  `
  );
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
