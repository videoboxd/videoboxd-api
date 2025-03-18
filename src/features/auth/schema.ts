import { z } from "zod";

export const RegisterUser = z.object({
  email: z.string().email().openapi({
    description: "User's email address",
    example: "example@gmail.com",
  }),
  password: z.string().min(6).max(20).openapi({
    description: "Password for the user account",
    example: "examplepassword",
  }),
  fullName: z.string().min(3).max(20).openapi({
    description: "Full name of the user",
    example: "Example User",
  }),
  username: z.string().min(3).max(20).openapi({
    description: "username of the user",
    example: "example",
  }),
});

export type RegisterUser = z.infer<typeof RegisterUser>;

export const LoginUser = z.object({
  username: z.string().min(3).max(20).openapi({
    description: "Full name of the user",
    example: "example",
  }),
  password: z.string().min(6).max(20).openapi({
    description: "Password for the user account",
    example: "examplepassword",
  }),
});

export type LoginUser = z.infer<typeof LoginUser>;
