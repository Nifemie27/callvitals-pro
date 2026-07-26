import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Enter a valid email address"),
  password: z.string().regex(
    PASSWORD_RULE,
    "At least 8 characters, with an uppercase letter, a lowercase letter, and a number",
  ),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
