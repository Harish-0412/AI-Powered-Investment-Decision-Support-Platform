"use client";

import { useEffect } from "react";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import type { PublicProfile } from "@/lib/profile";

function PortfolioMeRedirect() {
  useEffect(() => {
    apiRequest<PublicProfile>("/profile/me")
      .then((profile) => {
        if (!profile.onboardingCompleted) {
          window.location.href = "/onboarding";
          return;
        }
        window.location.href = `/portfolio/${profile.slug}`;
      })
      .catch(() => {
        window.location.href = "/onboarding";
      });
  }, []);

  return <main className="portfolio-loading">Opening your portfolio…</main>;
}

export default function PortfolioMePage() {
  return (
    <AuthGate>
      <PortfolioMeRedirect />
    </AuthGate>
  );
}
