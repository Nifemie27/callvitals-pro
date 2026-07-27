import { z } from "zod";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Enter a valid email address"),
  password: z.string().regex(
    PASSWORD_RULE,
    "At least 8 characters, with an uppercase letter, a lowercase letter, and a number",
  ),
  role: z.enum(["ADMIN", "ANALYST"]),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
