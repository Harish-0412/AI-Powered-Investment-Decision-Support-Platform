import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const profileRouter = Router();

profileRouter.get("/public/:slug", profileController.getPublicProfile);
profileRouter.get("/github/:username", profileController.getGithubActivity);

profileRouter.get("/me", requireAuth, profileController.getMyProfile);
profileRouter.get("/onboarding/status", requireAuth, profileController.getOnboardingStatus);
profileRouter.patch("/onboarding", requireAuth, profileController.saveOnboarding);
