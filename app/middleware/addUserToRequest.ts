import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export default async function (req: Request, res: Response, next: NextFunction) {
  const { globalUsername } = req.params;

  const user = await prisma.user.findUnique({
    where: { globalUsername },
  });

  if (!user) {
    return res.status(404).send(`User ${globalUsername} not found`);
  }

  req.user = user as User;

  return next();
}
