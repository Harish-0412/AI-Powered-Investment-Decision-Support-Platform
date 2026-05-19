import type { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";
import { getLocalPrisma } from "../lib/prisma-local";
import { DEFAULT_APP_PROJECT, DEFAULT_SECTORS } from "../constants/default-portfolio";
import type { OnboardingPayload, PublicProfile } from "../types/profile.types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "investor";

const uniqueSlug = async (base: string, excludeUserId?: string) => {
  let slug = slugify(base);
  let attempt = 0;

  while (true) {
    const existing = await getPrisma().userProfile.findUnique({ where: { slug } });
    if (!existing || existing.userId === excludeUserId) return slug;
    attempt += 1;
    slug = `${slugify(base)}-${attempt}`;
  }
};

const toPublicProfile = (profile: {
  slug: string;
  fullName: string | null;
  role: string | null;
  tagline: string | null;
  bio: string | null;
  yearsLearning: number | null;
  currentlyBuilding: string | null;
  technologies: unknown;
  skills: unknown;
  projects: unknown;
  experience: unknown;
  contactEmail: string | null;
  linkedin: string | null;
  onboardingCompleted: boolean;
}): PublicProfile => ({
  slug: profile.slug,
  fullName: profile.fullName,
  investmentGoal: profile.role,
  investmentPhilosophy: profile.tagline,
  appUsageInterest: profile.bio,
  investmentExperienceYears: profile.yearsLearning,
  currentFocus: profile.currentlyBuilding,
  stocksWatching: (profile.technologies as string[] | null) ?? null,
  sectors: (profile.skills as PublicProfile["sectors"]) ?? null,
  pastInvestments: (profile.projects as PublicProfile["pastInvestments"]) ?? null,
  investmentMethods: (profile.experience as PublicProfile["investmentMethods"]) ?? null,
  contactEmail: profile.contactEmail,
  linkedin: profile.linkedin,
  onboardingCompleted: profile.onboardingCompleted,
});

const syncToLocal = async (userId: string) => {
  const local = getLocalPrisma();
  if (!local) return;

  try {
    const primary = await getPrisma().userProfile.findUnique({ where: { userId } });
    if (!primary) return;

    const row = {
      id: primary.id,
      userId: primary.userId,
      slug: primary.slug,
      fullName: primary.fullName,
      role: primary.role,
      tagline: primary.tagline,
      bio: primary.bio,
      yearsLearning: primary.yearsLearning,
      currentlyBuilding: primary.currentlyBuilding,
      technologies: primary.technologies ?? undefined,
      skills: primary.skills ?? undefined,
      projects: primary.projects ?? undefined,
      experience: primary.experience ?? undefined,
      contactEmail: primary.contactEmail,
      linkedin: primary.linkedin,
      onboardingCompleted: primary.onboardingCompleted,
      onboardingStep: primary.onboardingStep,
    };

    await local.userProfile.upsert({
      where: { userId },
      create: row,
      update: row,
    });
  } catch (error) {
    console.warn("[profile] Local DB sync skipped:", error instanceof Error ? error.message : error);
  }
};

export const ensureProfileForUser = async (userId: string, email: string, name?: string | null) => {
  const existing = await getPrisma().userProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  const slug = await uniqueSlug(name || email.split("@")[0] || "investor");
  const profile = await getPrisma().userProfile.create({
    data: {
      userId,
      slug,
      fullName: name ?? null,
      contactEmail: email,
      projects: [DEFAULT_APP_PROJECT],
      skills: DEFAULT_SECTORS,
    },
  });

  await syncToLocal(userId);
  return profile;
};

export const getProfileByUserId = async (userId: string) => {
  const profile = await getPrisma().userProfile.findUnique({ where: { userId } });
  return profile ? toPublicProfile(profile) : null;
};

export const getProfileBySlug = async (slug: string) => {
  const profile = await getPrisma().userProfile.findUnique({ where: { slug } });
  if (!profile) return null;
  return toPublicProfile(profile);
};

export const getOnboardingState = async (userId: string) => {
  const profile = await getPrisma().userProfile.findUnique({
    where: { userId },
    select: {
      onboardingCompleted: true,
      onboardingStep: true,
      slug: true,
    },
  });
  return profile;
};

export const updateOnboarding = async (userId: string, payload: OnboardingPayload) => {
  let profile = await getPrisma().userProfile.findUnique({ where: { userId } });
  if (!profile) {
    const user = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!user) return null;
    profile = await ensureProfileForUser(userId, user.email, user.name);
  }

  const data: Prisma.UserProfileUpdateInput = {
    onboardingStep: payload.step,
  };

  if (payload.fullName !== undefined) data.fullName = payload.fullName;
  if (payload.investmentGoal !== undefined) data.role = payload.investmentGoal;
  if (payload.investmentPhilosophy !== undefined) data.tagline = payload.investmentPhilosophy;
  if (payload.appUsageInterest !== undefined) data.bio = payload.appUsageInterest;
  if (payload.investmentExperienceYears !== undefined) data.yearsLearning = payload.investmentExperienceYears;
  if (payload.currentFocus !== undefined) data.currentlyBuilding = payload.currentFocus;
  if (payload.stocksWatching !== undefined) data.technologies = payload.stocksWatching;
  if (payload.sectors !== undefined) data.skills = payload.sectors;
  if (payload.pastInvestments !== undefined) data.projects = payload.pastInvestments;
  if (payload.investmentMethods !== undefined) data.experience = payload.investmentMethods;
  if (payload.contactEmail !== undefined) data.contactEmail = payload.contactEmail;
  if (payload.linkedin !== undefined) data.linkedin = payload.linkedin;

  if (payload.complete) {
    data.onboardingCompleted = true;
    data.onboardingStep = 5; // Reduced from 6 since we removed a step
  }

  const updated = await getPrisma().userProfile.update({
    where: { userId },
    data,
  });

  await syncToLocal(userId);
  return toPublicProfile(updated);
};

export const fetchGithubStats = async (username: string) => {
  // Keeping this for now to avoid breaking other potential uses, 
  // but we won't call it in our new flow.
  return null;
};
