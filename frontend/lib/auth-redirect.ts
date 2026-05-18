import { apiRequest } from "@/lib/api";
import type { OnboardingStatus } from "@/lib/profile";

export const resolvePostAuthPath = async (): Promise<string> => {
  try {
    const status = await apiRequest<OnboardingStatus>("/profile/onboarding/status");
    if (!status.onboardingCompleted) {
      return "/onboarding";
    }
    return `/portfolio/${status.slug}`;
  } catch {
    return "/onboarding";
  }
};
