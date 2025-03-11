import { UserSchema } from "prisma/generated/zod";
import { z } from "zod";

export const UserSearchParam = z.object({
  identifier: z.string().max(255).openapi({
    description: "ID, Username, or email of the user",
  }),
});

export const GetUsers = UserSchema.omit({
  email: true,
  password: true,
}).array();

export const GetUserDetail = UserSchema.omit({
  email: true,
  password: true,
});
