import { z } from "zod";

export const RegisterUser = z.object({
  email: z.string().email().openapi({
    description: "User's email address",
    example: "sandhika@gmail.com",
  }),
  password: z.string().min(6).max(20).openapi({
    description: "Password for the user account",
    example: "password",
  }),
  fullName: z.string().min(3).max(20).openapi({
    description: "Full name of the user",
    example: "Sandhika Galih",
  }),
  username: z.string().min(3).max(20).openapi({
    description: "Full name of the user",
    example: "sandhika",
  }),
});

export type RegisterUser = z.infer<typeof RegisterUser>;

export const LoginUser = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .openapi({ description: "Full name of the user", example: "sandhika" }),
  password: z.string().min(6).max(20).openapi({
    description: "Password for the user account",
    example: "password",
  }),
});

export type LoginUser = z.infer<typeof LoginUser>;
