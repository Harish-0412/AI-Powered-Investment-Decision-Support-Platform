import type { Request, Response } from "express";
import { z } from "zod";
import * as profileService from "../services/profile.service";
import { AppError } from "../utils/errors";

const marketSectorsSchema = z.object({
  equity: z.array(z.string()).optional(),
  fixedIncome: z.array(z.string()).optional(),
  commodities: z.array(z.string()).optional(),
  crypto: z.array(z.string()).optional(),
  realEstate: z.array(z.string()).optional(),
});

const pastInvestmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  assetClass: z.string(),
  entryPrice: z.string(),
  exitPrice: z.string().optional(),
  duration: z.string(),
  keyTakeaway: z.string(),
});

const investmentMethodSchema = z.object({
  id: z.string(),
  title: z.string(),
  platform: z.string(),
  period: z.string(),
  description: z.string(),
  type: z.enum(["sip", "lumpsum", "trading", "index", "other"]),
});

const onboardingSchema = z.object({
  step: z.number().int().min(0).max(5),
  fullName: z.string().trim().min(1).max(120).optional(),
  investmentGoal: z.string().trim().max(160).optional(),
  investmentPhilosophy: z.string().trim().max(280).optional(),
  appUsageInterest: z.string().trim().max(4000).optional(),
  investmentExperienceYears: z.number().int().min(0).max(50).optional(),
  currentFocus: z.string().trim().max(2000).optional(),
  stocksWatching: z.array(z.string()).optional(),
  sectors: marketSectorsSchema.optional(),
  pastInvestments: z.array(pastInvestmentSchema).optional(),
  investmentMethods: z.array(investmentMethodSchema).optional(),
  contactEmail: z.string().email().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  complete: z.boolean().optional(),
});

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await profileService.ensureProfileForUser(userId, req.user!.email);
  const profile = await profileService.getProfileByUserId(userId);

  if (!profile) {
    throw new AppError(404, "Profile not found");
  }

  res.json(profile);
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const normalizedSlug = slug?.toLowerCase();
  if (!normalizedSlug) {
    throw new AppError(400, "Profile slug is required");
  }

  const profile = await profileService.getProfileBySlug(normalizedSlug);

  if (!profile) {
    throw new AppError(404, "Profile not found");
  }

  res.json(profile);
};

export const getOnboardingStatus = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await profileService.ensureProfileForUser(userId, req.user!.email);
  const state = await profileService.getOnboardingState(userId);
  res.json(state);
};

export const saveOnboarding = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const payload = onboardingSchema.parse(req.body);
  const profile = await profileService.updateOnboarding(userId, payload);

  if (!profile) {
    throw new AppError(404, "Profile not found");
  }

  res.json(profile);
};

export const getGithubActivity = async (req: Request, res: Response) => {
  const rawUsername = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const username = rawUsername?.trim();
  if (!username) {
    throw new AppError(400, "GitHub username is required");
  }

  const stats = await profileService.fetchGithubStats(username);

  if (!stats) {
    throw new AppError(404, "GitHub user not found");
  }

  res.json(stats);
};
