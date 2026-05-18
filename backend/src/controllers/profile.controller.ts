import type { Request, Response } from "express";
import { z } from "zod";
import * as profileService from "../services/profile.service";
import { AppError } from "../utils/errors";

const skillDomainsSchema = z.object({
  frontend: z.array(z.string()).optional(),
  backend: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
  aiMl: z.array(z.string()).optional(),
  devops: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string().min(1),
  problem: z.string(),
  architecture: z.string(),
  techStack: z.array(z.string()),
  features: z.array(z.string()),
  engineeringHighlights: z.array(z.string()),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  featured: z.boolean().optional(),
});

const experienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  period: z.string(),
  description: z.string(),
  type: z.enum(["hackathon", "opensource", "freelance", "project", "work", "research"]),
});

const onboardingSchema = z.object({
  step: z.number().int().min(0).max(6),
  fullName: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().max(160).optional(),
  tagline: z.string().trim().max(280).optional(),
  bio: z.string().trim().max(4000).optional(),
  yearsLearning: z.number().int().min(0).max(50).optional(),
  currentlyBuilding: z.string().trim().max(2000).optional(),
  technologies: z.array(z.string()).optional(),
  skills: skillDomainsSchema.optional(),
  projects: z.array(projectSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  githubUsername: z.string().trim().max(80).optional(),
  contactEmail: z.string().email().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  calendly: z.string().url().optional().or(z.literal("")),
  discord: z.string().trim().max(120).optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
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
