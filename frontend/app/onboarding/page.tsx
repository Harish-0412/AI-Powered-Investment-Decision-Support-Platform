"use client";

import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef1ee] flex flex-col">
        <header className="px-6 py-5 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-[#101412] no-underline">
            <span className="grid w-9 h-9 place-items-center border border-[#101412]/20 text-xs font-black">II</span>
            Investment Intelligence
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center pb-10">
          <OnboardingWizard />
        </div>
      </main>
    </AuthGate>
  );
}
