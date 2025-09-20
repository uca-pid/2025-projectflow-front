"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma-client";

export async function getTasks() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session.user) {
    const tasks = await prisma.task.findMany({
      where: {
        creatorId: session.user?.id,
      },
    });
    return tasks;
  } else {
    return [];
  }
}
