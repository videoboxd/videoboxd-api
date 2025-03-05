import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import { LoginUser, RegisterUser } from "./schema";

export const registerUser = async ({
  username,
  email,
  password,
}: RegisterUser): Promise<Partial<User>> => {
  const existingUser = await prisma.user.findUnique({ where: { username } });

  if (existingUser) {
    throw new HTTPException(400, {
      message: "User with this username already exists",
    });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });

  if (existingEmail) {
    throw new HTTPException(400, {
      message: "User with this email already exists",
    });
  }

  const hashedPassword = await Bun.password.hash(password);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullName: username,
      avatarUrl: `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${username}&size=64`,
    },
  });

  return {
    id: newUser.id,
    fullName: newUser.fullName,
    username: newUser.username,
    email: newUser.email,
    avatarUrl: newUser.avatarUrl,
  };
};

export const loginUser = async ({ username, password }: LoginUser) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new HTTPException(400, {
      message: "User not found",
    });
  }

  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    throw new HTTPException(401, {
      message: "Invalid password",
    });
  }

  const accessTokenPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    tokenOrigin: "/api/auth/login",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
  };

  const refreshTokenPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    tokenOrigin: "/api/auth/login",
    exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 7 days
  };

  return { accessTokenPayload, refreshTokenPayload };
};
