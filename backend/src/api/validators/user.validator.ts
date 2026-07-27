import { body, param } from "express-validator";
import { Role } from "@prisma/client";
import { PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from "@/constants/validation";

export const userIdParamValidator = [param("id").isUUID().withMessage("Invalid id")];

export const createUserValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").matches(PASSWORD_RULE).withMessage(PASSWORD_RULE_MESSAGE),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("role").isIn(Object.values(Role)).withMessage("Invalid role"),
];

export const updateUserValidator = [
  body("role").optional().isIn(Object.values(Role)).withMessage("Invalid role"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];
