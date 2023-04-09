import { Prisma } from "@prisma/client";
import express from "express";
import { prisma } from "../../lib/prisma";
import { gh } from "../../utils/github";
import { gl } from "../../utils/gitlab";
import addUserToRequest from "../middleware/addUserToRequest";
const router = express.Router();

router.post("/user", async (req, res) => {
  const { email, globalUsername } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, globalUsername },
      include: { accounts: { include: { contributions: true } } },
    });
    return res.status(201).json(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).send(`User with globalUsername ${globalUsername} already exists`);
    }
    console.error(e);
    return res.status(500).send("Internal server error");
  }
});

router.get("/user", async (req, res) => {
  const users = await prisma.user.findMany();
  return res.status(200).json(users);
});

router.get("/user/:globalUsername", addUserToRequest, async (req, res) => {
  if (!req.user) {
    return res.status(404).send(`User ${req.params.globalUsername} not found`);
  }

  const accounts = await prisma.gitAccount.findMany({
    where: { user: { every: { id: req.user.id } } },
    include: { contributions: { orderBy: { date: "asc" } } },
  });

  return res.status(200).json({
    ...req.user,
    accounts,
  });
});

router.get("/user/:globalUsername/git-source/:source", addUserToRequest, async (req, res) => {
  const { globalUsername, source } = req.params;
  if (!req.user) {
    return res.status(404).send(`User ${globalUsername} not found`);
  }

  const accounts = await prisma.gitAccount.findMany({
    where: { source, user: { every: { id: req.user.id } } },
    include: { contributions: { orderBy: { date: "asc" } } },
  });

  return res.status(200).json({
    accounts,
  });
});

router.post("/user/:globalUsername/git-source/:source/username", addUserToRequest, async (req, res) => {
  const { globalUsername, source } = req.params;
  const { gitSourceUsername } = req.body;
  if (!req.user) {
    return res.status(404).send(`User ${globalUsername} not found`);
  }

  if (source !== "gitlab" && source !== "github") {
    return res.status(400).send(`Source ${source} not supported`);
  }

  try {
    const account = await prisma.gitAccount.create({
      data: { source, username: gitSourceUsername, user: { connect: { id: req.user.id } } },
    });

    let contributionRecordAmount: Prisma.BatchPayload = { count: 0 };

    switch (source) {
      case "gitlab":
        contributionRecordAmount = await gl.fetchContributionsAndAddToDatabase({
          gitAccountId: account.id,
          username: gitSourceUsername,
        });
        break;

      case "github":
        contributionRecordAmount = await gh.fetchContributionsAndAddToDatabase({
          gitAccountId: account.id,
          username: gitSourceUsername,
        });

        break;
      default:
        throw "Unknown source";
    }
    return res.status(201).json({ account, uploadedCalendarRecords: contributionRecordAmount.count });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).send(`Account "${gitSourceUsername}" already exists for source ${source}`);
    }
    console.log(e);
    if (typeof e === "string") return res.status(500).send(e);
    return res.status(500).send("Unknown error while creating the user");
  }
});

router.get("/user/:globalUsername/git-source/:source/username/:username", addUserToRequest, async (req, res) => {
  const { globalUsername, source, username } = req.params;
  if (!req.user) {
    return res.status(404).send(`User ${globalUsername} not found`);
  }

  const account = await prisma.gitAccount.findUnique({
    where: { source_username: { source, username } },
    include: { contributions: { orderBy: { date: "asc" } } },
  });

  if (!account) {
    return res.status(404).send(`Account ${username} not found for source ${source}`);
  }

  return res.status(200).json(account);
});

export default router;
