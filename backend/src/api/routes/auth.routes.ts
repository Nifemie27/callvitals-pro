import { Router } from "express";
import * as authController from "@/api/controllers/auth.controller";
import { registerValidator, loginValidator } from "@/api/validators/auth.validator";
import { validate } from "@/api/middleware/validate";
import { authenticate } from "@/api/middleware/auth";
import { authRateLimiter } from "@/api/middleware/rateLimiters";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  registerValidator,
  validate,
  authController.register,
);

authRouter.post(
  "/login",
  authRateLimiter,
  loginValidator,
  validate,
  authController.login,
);

authRouter.post("/refresh", authController.refresh);

authRouter.post("/logout", authController.logout);

authRouter.get("/me", authenticate, authController.me);
