import { body, param } from "express-validator";
import { Role } from "@prisma/client";

export const userIdParamValidator = [param("id").isUUID().withMessage("Invalid id")];

export const updateUserValidator = [
  body("role").optional().isIn(Object.values(Role)).withMessage("Invalid role"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];
