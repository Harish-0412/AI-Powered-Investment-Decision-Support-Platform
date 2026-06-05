"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { resolvePostAuthPath } from "@/lib/auth-redirect";
import type { InvestmentMethod, PastInvestment, PublicProfile, MarketSectors } from "@/lib/profile";
import { joinTags, parseTags, SECTOR_LABELS } from "@/lib/profile";
import { AssessmentShell } from "./AssessmentShell";
import {
  FieldGroup,
  FieldInput,
  FieldLabel,
  FieldSelect,
  FieldTextarea,
  PrimaryButton,
  SecondaryButton,
} from "./AssessmentFields";

const STEPS = ["Profile", "Strategy", "Markets", "Portfolio", "Contact"] as const;

const STEP_COPY: Record<number, { title: string; subtitle: string }> = {
  0: {
    title: "Define your investor profile",
    subtitle: "What are your primary goals and philosophy?",
  },
  1: {
    title: "Investment strategy",
    subtitle: "Tell us about your experience and risk appetite.",
  },
  2: {
    title: "Market focus",
    subtitle: "Which sectors and asset classes are you tracking?",
  },
  3: {
    title: "Set up your portfolio",
    subtitle: "Create your first portfolio to start tracking.",
  },
  4: {
    title: "Stay connected",
    subtitle: "Add your contact details for personalized updates.",
  },
};

const emptyInvestment = (): PastInvestment => ({
  id: crypto.randomUUID(),
  name: "",
  assetClass: "",
  entryPrice: "",
  exitPrice: "",
  duration: "",
  keyTakeaway: "",
});

const emptyMethod = (): InvestmentMethod => ({
  id: crypto.randomUUID(),
  title: "",
  platform: "",
  period: "",
  description: "",
  type: "sip",
});

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [investmentPhilosophy, setInvestmentPhilosophy] = useState("");
  const [investmentExperienceYears, setInvestmentExperienceYears] = useState(1);
  const [riskTolerance, setRiskTolerance] = useState("Moderate");
  const [investmentStyle, setInvestmentStyle] = useState("Value");
  const [sectors, setSectors] = useState<MarketSectors>({});
  const [portfolioName, setPortfolioName] = useState("My Main Portfolio");
  const [contactEmail, setContactEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    apiRequest<PublicProfile>("/profile/me")
      .then((profile) => {
        setFullName(profile.fullName ?? "");
        setInvestmentGoal(profile.investmentGoal ?? "");
        setInvestmentPhilosophy(profile.investmentPhilosophy ?? "");
        setInvestmentExperienceYears(profile.investmentExperienceYears ?? 1);
        setRiskTolerance(profile.currentFocus ?? "Moderate");
        setInvestmentStyle(profile.appUsageInterest ?? "Value");
        setSectors(profile.sectors ?? {});
        setContactEmail(profile.contactEmail ?? "");
        setLinkedin(profile.linkedin ?? "");
        if (profile.onboardingCompleted) {
          window.location.href = `/portfolio/me`;
        }
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const saveStep = async (nextStep: number, complete = false) => {
    setSaving(true);
    setMessage("");
    try {
      await apiRequest<PublicProfile>("/profile/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          step: nextStep,
          fullName,
          investmentGoal,
          investmentPhilosophy,
          investmentExperienceYears,
          currentFocus: riskTolerance, // Mapping risk tolerance to currentFocus
          appUsageInterest: investmentStyle, // Mapping investment style to appUsageInterest
          sectors,
          contactEmail,
          linkedin: linkedin || undefined,
          complete,
        }),
      });

      if (complete) {
        // Create initial portfolio if it doesn't exist
        try {
          const portfolios = await apiRequest<any[]>("/portfolios");
          if (portfolios.length === 0) {
            await apiRequest("/portfolios", {
              method: "POST",
              body: JSON.stringify({ name: portfolioName }),
            });
          }
        } catch (e) {
          console.error("Failed to create initial portfolio", e);
        }

        window.location.href = "/portfolio/me";
        return;
      }

      setStep(nextStep);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateSectorDomain = (key: keyof MarketSectors, value: string) => {
    setSectors((prev) => ({ ...prev, [key]: parseTags(value) }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#52625a] font-semibold">
        Preparing your assessment setup…
      </div>
    );
  }

  const copy = STEP_COPY[step] ?? STEP_COPY[0];

  const footer = (
    <>
      {step > 0 && (
        <SecondaryButton disabled={saving} onClick={() => setStep(step - 1)}>
          Back
        </SecondaryButton>
      )}
      {step < STEPS.length - 1 ? (
        <PrimaryButton disabled={saving} onClick={() => saveStep(step + 1)}>
          {saving ? "Saving…" : "Continue"}
          {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
        </PrimaryButton>
      ) : (
        <PrimaryButton disabled={saving} onClick={() => saveStep(step, true)}>
          {saving ? "Finishing…" : "Publish profile"}
          {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
        </PrimaryButton>
      )}
    </>
  );

  let stepContent: ReactNode = null;

  if (step === 0) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>Full name</FieldLabel>
          <FieldInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Harish K" />
        </label>
        <label>
          <FieldLabel>Primary investment goal</FieldLabel>
          <FieldSelect value={investmentGoal} onChange={(e) => setInvestmentGoal(e.target.value)}>
            <option value="">Select a goal</option>
            <option value="Wealth Creation">Wealth Creation</option>
            <option value="Retirement">Retirement</option>
            <option value="Passive Income">Passive Income</option>
            <option value="Short-term Gains">Short-term Gains</option>
          </FieldSelect>
        </label>
        <label>
          <FieldLabel hint="One sentence about your approach">Investment philosophy</FieldLabel>
          <FieldInput
            value={investmentPhilosophy}
            onChange={(e) => setInvestmentPhilosophy(e.target.value)}
            placeholder="Value investing with a focus on long-term compound growth."
          />
        </label>
      </FieldGroup>
    );
  } else if (step === 1) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>Years of investment experience</FieldLabel>
          <FieldInput
            type="number"
            min={0}
            value={investmentExperienceYears}
            onChange={(e) => setInvestmentExperienceYears(Number(e.target.value))}
          />
        </label>
        <label>
          <FieldLabel>Risk tolerance</FieldLabel>
          <FieldSelect value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
            <option value="Conservative">Conservative (Capital preservation)</option>
            <option value="Moderate">Moderate (Balanced growth)</option>
            <option value="Aggressive">Aggressive (High growth)</option>
            <option value="Very Aggressive">Very Aggressive (Speculative)</option>
          </FieldSelect>
        </label>
        <label>
          <FieldLabel>Investment style</FieldLabel>
          <FieldSelect value={investmentStyle} onChange={(e) => setInvestmentStyle(e.target.value)}>
            <option value="Value">Value Investing</option>
            <option value="Growth">Growth Investing</option>
            <option value="Dividend">Dividend / Income</option>
            <option value="Index">Index / Passive</option>
            <option value="Momentum">Momentum / Trading</option>
          </FieldSelect>
        </label>
      </FieldGroup>
    );
  } else if (step === 2) {
    stepContent = (
      <div className="space-y-3 max-h-[min(420px,50vh)] overflow-y-auto pr-1">
        {Object.entries(SECTOR_LABELS).map(([key, label]) => (
          <FieldGroup key={key}>
            <FieldLabel hint={`Comma-separated tickers for ${label}`}>{label}</FieldLabel>
            <FieldInput
              value={joinTags(sectors[key as keyof MarketSectors])}
              onChange={(e) => updateSectorDomain(key as keyof MarketSectors, e.target.value)}
              placeholder="AAPL, MSFT, GOOGL..."
            />
          </FieldGroup>
        ))}
      </div>
    );
  } else if (step === 3) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>Portfolio Name</FieldLabel>
          <FieldInput
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            placeholder="e.g., My Main Portfolio"
          />
        </label>
        <p className="text-xs text-[#52625a] mt-2">
          You can add stocks and transactions to this portfolio after completing the onboarding.
        </p>
      </FieldGroup>
    );
  } else if (step === 4) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>Contact Email</FieldLabel>
          <FieldInput
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="hello@example.com"
          />
        </label>
        <label>
          <FieldLabel>LinkedIn (optional)</FieldLabel>
          <FieldInput
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </label>
      </FieldGroup>
    );
  }

  return (
    <AssessmentShell
      step={step}
      totalSteps={STEPS.length}
      stepLabels={STEPS}
      title={copy.title}
      subtitle={copy.subtitle}
      message={message}
      footer={footer}
    >
      {stepContent}
    </AssessmentShell>
  );
}
