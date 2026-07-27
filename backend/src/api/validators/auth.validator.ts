import { body } from "express-validator";
import { PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from "@/constants/validation";

export const registerValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").matches(PASSWORD_RULE).withMessage(PASSWORD_RULE_MESSAGE),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
