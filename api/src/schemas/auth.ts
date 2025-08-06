import { z } from "zod";
import { UserRole } from "../types/auth.type.js";

const passwordRequirements = [
  { regex: /[A-Z]/, message: "at least one uppercase letter" },
  { regex: /[a-z]/, message: "at least one lowercase letter" },
  { regex: /[0-9]/, message: "at least one number" },
  { regex: /[^A-Za-z0-9]/, message: "at least one special character" },
];

export const signUpSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.enum(["ADMIN", "STAFF"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => passwordRequirements.every((req) => req.regex.test(val)), {
      message:
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
    }),
});

export const signInSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});
