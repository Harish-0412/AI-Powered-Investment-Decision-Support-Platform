import type { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";
import { getLocalPrisma } from "../lib/prisma-local";
import { DEFAULT_APP_PROJECT, DEFAULT_SKILLS } from "../constants/default-portfolio";
import type { OnboardingPayload, PublicProfile } from "../types/profile.types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "developer";

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
  githubUsername: string | null;
  contactEmail: string | null;
  linkedin: string | null;
  twitter: string | null;
  calendly: string | null;
  discord: string | null;
  resumeUrl: string | null;
  onboardingCompleted: boolean;
}): PublicProfile => ({
  slug: profile.slug,
  fullName: profile.fullName,
  role: profile.role,
  tagline: profile.tagline,
  bio: profile.bio,
  yearsLearning: profile.yearsLearning,
  currentlyBuilding: profile.currentlyBuilding,
  technologies: (profile.technologies as string[] | null) ?? null,
  skills: (profile.skills as PublicProfile["skills"]) ?? null,
  projects: (profile.projects as PublicProfile["projects"]) ?? null,
  experience: (profile.experience as PublicProfile["experience"]) ?? null,
  githubUsername: profile.githubUsername,
  contactEmail: profile.contactEmail,
  linkedin: profile.linkedin,
  twitter: profile.twitter,
  calendly: profile.calendly,
  discord: profile.discord,
  resumeUrl: profile.resumeUrl,
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
      githubUsername: primary.githubUsername,
      contactEmail: primary.contactEmail,
      linkedin: primary.linkedin,
      twitter: primary.twitter,
      calendly: primary.calendly,
      discord: primary.discord,
      resumeUrl: primary.resumeUrl,
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

  const slug = await uniqueSlug(name || email.split("@")[0] || "developer");
  const profile = await getPrisma().userProfile.create({
    data: {
      userId,
      slug,
      fullName: name ?? null,
      contactEmail: email,
      projects: [DEFAULT_APP_PROJECT],
      skills: DEFAULT_SKILLS,
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
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.tagline !== undefined) data.tagline = payload.tagline;
  if (payload.bio !== undefined) data.bio = payload.bio;
  if (payload.yearsLearning !== undefined) data.yearsLearning = payload.yearsLearning;
  if (payload.currentlyBuilding !== undefined) data.currentlyBuilding = payload.currentlyBuilding;
  if (payload.technologies !== undefined) data.technologies = payload.technologies;
  if (payload.skills !== undefined) data.skills = payload.skills;
  if (payload.projects !== undefined) data.projects = payload.projects;
  if (payload.experience !== undefined) data.experience = payload.experience;
  if (payload.githubUsername !== undefined) data.githubUsername = payload.githubUsername;
  if (payload.contactEmail !== undefined) data.contactEmail = payload.contactEmail;
  if (payload.linkedin !== undefined) data.linkedin = payload.linkedin;
  if (payload.twitter !== undefined) data.twitter = payload.twitter;
  if (payload.calendly !== undefined) data.calendly = payload.calendly;
  if (payload.discord !== undefined) data.discord = payload.discord;
  if (payload.resumeUrl !== undefined) data.resumeUrl = payload.resumeUrl;

  if (payload.complete) {
    data.onboardingCompleted = true;
    data.onboardingStep = 6;
  }

  const updated = await getPrisma().userProfile.update({
    where: { userId },
    data,
  });

  await syncToLocal(userId);
  return toPublicProfile(updated);
};

export const fetchGithubStats = async (username: string) => {
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!userRes.ok) return null;

  const user = (await userRes.json()) as {
    login: string;
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    html_url: string;
    avatar_url: string;
  };

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`,
    { headers: { Accept: "application/vnd.github+json" } }
  );

  const repos = reposRes.ok
    ? ((await reposRes.json()) as Array<{
        name: string;
        description: string | null;
        html_url: string;
        stargazers_count: number;
        language: string | null;
        updated_at: string;
      }>)
    : [];

  return {
    user,
    repos: repos.map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      updatedAt: repo.updated_at,
    })),
  };
};
