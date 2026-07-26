import { body } from "express-validator";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .matches(PASSWORD_RULE)
    .withMessage(
      "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number",
    ),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
