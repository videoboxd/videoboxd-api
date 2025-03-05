import { prisma } from "@/lib/prisma";
import { User } from "@prisma/generated/zod";
import { HTTPException } from "hono/http-exception";

export const getAllUsers = async (): Promise<User[]> => {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getUserByParam = async (param: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: param }, { email: param }, { username: param }],
    },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
      comments: { orderBy: { createdAt: "desc" } },
      playlists: { orderBy: { createdAt: "desc" } },
      likes: true,
    },
  });

  if (!user) {
    throw new HTTPException(404, {
      message:
        "User not found. The provided ID, username, or email does not match any user.",
    });
  }

  return user;
};
