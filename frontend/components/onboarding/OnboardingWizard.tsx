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

const STEPS = ["Identity", "Application Usage", "Market Focus", "Investment History", "Contact"] as const;

const STEP_COPY: Record<number, { title: string; subtitle: string }> = {
  0: {
    title: "Define your investor identity",
    subtitle: "Lead with your primary investment goal and core philosophy.",
  },
  1: {
    title: "How will you use this platform?",
    subtitle: "Explain your interest in market insights and your current focus areas.",
  },
  2: {
    title: "Organize focus by market sectors",
    subtitle: "Group your interests the way portfolio managers think — Equity, Fixed Income, Crypto, etc.",
  },
  3: {
    title: "Share your investment journey",
    subtitle: "Past investments and methods help tailor your insights.",
  },
  4: {
    title: "Stay connected",
    subtitle: "Add your contact details for personalized updates and collaboration.",
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
  const [appUsageInterest, setAppUsageInterest] = useState("");
  const [investmentExperienceYears, setInvestmentExperienceYears] = useState(1);
  const [currentFocus, setCurrentFocus] = useState("");
  const [stocksWatching, setStocksWatching] = useState("");
  const [sectors, setSectors] = useState<MarketSectors>({});
  const [pastInvestments, setPastInvestments] = useState<PastInvestment[]>([]);
  const [investmentMethods, setInvestmentMethods] = useState<InvestmentMethod[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    apiRequest<PublicProfile>("/profile/me")
      .then((profile) => {
        setFullName(profile.fullName ?? "");
        setInvestmentGoal(profile.investmentGoal ?? "");
        setInvestmentPhilosophy(profile.investmentPhilosophy ?? "");
        setAppUsageInterest(profile.appUsageInterest ?? "");
        setInvestmentExperienceYears(profile.investmentExperienceYears ?? 1);
        setCurrentFocus(profile.currentFocus ?? "");
        setStocksWatching(joinTags(profile.stocksWatching ?? undefined));
        setSectors(profile.sectors ?? {});
        setPastInvestments(profile.pastInvestments?.length ? profile.pastInvestments : [emptyInvestment()]);
        setInvestmentMethods(profile.investmentMethods ?? []);
        setContactEmail(profile.contactEmail ?? "");
        setLinkedin(profile.linkedin ?? "");
        if (profile.onboardingCompleted) {
          window.location.href = `/portfolio/${profile.slug}`;
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
          appUsageInterest,
          investmentExperienceYears,
          currentFocus,
          stocksWatching: parseTags(stocksWatching),
          sectors,
          pastInvestments,
          investmentMethods,
          contactEmail,
          linkedin: linkedin || undefined,
          complete,
        }),
      });

      if (complete) {
        const path = await resolvePostAuthPath();
        window.location.href = path;
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
          <FieldInput
            value={investmentGoal}
            onChange={(e) => setInvestmentGoal(e.target.value)}
            placeholder="Wealth Creation / Retirement / Passive Income"
          />
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
          <FieldLabel>Application usage interest</FieldLabel>
          <FieldTextarea
            value={appUsageInterest}
            onChange={(e) => setAppUsageInterest(e.target.value)}
            rows={4}
            placeholder="I want to use Investment Intelligence for tracking my portfolio risk and finding market insights…"
          />
        </label>
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
          <FieldLabel>Current investment focus</FieldLabel>
          <FieldTextarea
            value={currentFocus}
            onChange={(e) => setCurrentFocus(e.target.value)}
            rows={2}
            placeholder="Focusing on blue-chip stocks and emerging technology sectors."
          />
        </label>
        <label>
          <FieldLabel hint="Comma-separated tickers">Stocks you are watching</FieldLabel>
          <FieldInput
            value={stocksWatching}
            onChange={(e) => setStocksWatching(e.target.value)}
            placeholder="AAPL, MSFT, GOOGL, RELIANCE"
          />
        </label>
      </FieldGroup>
    );
  } else if (step === 2) {
    stepContent = (
      <div className="space-y-3 max-h-[min(420px,50vh)] overflow-y-auto pr-1">
        {Object.entries(SECTOR_LABELS).map(([key, label]) => (
          <FieldGroup key={key} className="!p-4">
            <label>
              <FieldLabel>{label}</FieldLabel>
              <FieldInput
                value={joinTags(sectors[key as keyof MarketSectors])}
                onChange={(e) => updateSectorDomain(key as keyof MarketSectors, e.target.value)}
                placeholder="Technology, Healthcare, Finance"
              />
            </label>
          </FieldGroup>
        ))}
      </div>
    );
  } else if (step === 3) {
    stepContent = (
      <div className="space-y-4 max-h-[min(480px,55vh)] overflow-y-auto pr-1">
        <h3 className="text-sm font-semibold text-[#101412] px-1">Past investments</h3>
        {pastInvestments.map((investment, index) => (
          <FieldGroup key={investment.id}>
            <label>
              <FieldLabel>Investment name</FieldLabel>
              <FieldInput
                value={investment.name}
                onChange={(e) => {
                  const next = [...pastInvestments];
                  next[index] = { ...investment, name: e.target.value };
                  setPastInvestments(next);
                }}
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                <FieldLabel>Asset class</FieldLabel>
                <FieldInput
                  value={investment.assetClass}
                  onChange={(e) => {
                    const next = [...pastInvestments];
                    next[index] = { ...investment, assetClass: e.target.value };
                    setPastInvestments(next);
                  }}
                  placeholder="Equity / Mutual Fund"
                />
              </label>
              <label>
                <FieldLabel>Duration</FieldLabel>
                <FieldInput
                  value={investment.duration}
                  onChange={(e) => {
                    const next = [...pastInvestments];
                    next[index] = { ...investment, duration: e.target.value };
                    setPastInvestments(next);
                  }}
                  placeholder="2 years"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                <FieldLabel>Entry price</FieldLabel>
                <FieldInput
                  value={investment.entryPrice}
                  onChange={(e) => {
                    const next = [...pastInvestments];
                    next[index] = { ...investment, entryPrice: e.target.value };
                    setPastInvestments(next);
                  }}
                />
              </label>
              <label>
                <FieldLabel>Exit price (if applicable)</FieldLabel>
                <FieldInput
                  value={investment.exitPrice ?? ""}
                  onChange={(e) => {
                    const next = [...pastInvestments];
                    next[index] = { ...investment, exitPrice: e.target.value };
                    setPastInvestments(next);
                  }}
                />
              </label>
            </div>
            <label>
              <FieldLabel>Key takeaway</FieldLabel>
              <FieldTextarea
                value={investment.keyTakeaway}
                onChange={(e) => {
                  const next = [...pastInvestments];
                  next[index] = { ...investment, keyTakeaway: e.target.value };
                  setPastInvestments(next);
                }}
                rows={2}
              />
            </label>
          </FieldGroup>
        ))}
        <SecondaryButton type="button" onClick={() => setPastInvestments((p) => [...p, emptyInvestment()])} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add another investment
        </SecondaryButton>

        <hr className="my-6 border-[#1014121a]" />
        
        <h3 className="text-sm font-semibold text-[#101412] px-1">Investment methods</h3>
        {investmentMethods.map((item, index) => (
          <FieldGroup key={item.id}>
            <label>
              <FieldLabel>Title</FieldLabel>
              <FieldInput
                value={item.title}
                onChange={(e) => {
                  const next = [...investmentMethods];
                  next[index] = { ...item, title: e.target.value };
                  setInvestmentMethods(next);
                }}
                placeholder="Monthly SIP in Index Funds"
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                <FieldLabel>Platform / Broker</FieldLabel>
                <FieldInput
                  value={item.platform}
                  onChange={(e) => {
                    const next = [...investmentMethods];
                    next[index] = { ...item, platform: e.target.value };
                    setInvestmentMethods(next);
                  }}
                  placeholder="Zerodha / Groww / Vanguard"
                />
              </label>
              <label>
                <FieldLabel>Period</FieldLabel>
                <FieldInput
                  value={item.period}
                  onChange={(e) => {
                    const next = [...investmentMethods];
                    next[index] = { ...item, period: e.target.value };
                    setInvestmentMethods(next);
                  }}
                  placeholder="2022 – Present"
                />
              </label>
            </div>
            <label>
              <FieldLabel>Type</FieldLabel>
              <FieldSelect
                value={item.type}
                onChange={(e) => {
                  const next = [...investmentMethods];
                  next[index] = { ...item, type: e.target.value as InvestmentMethod["type"] };
                  setInvestmentMethods(next);
                }}
              >
                <option value="sip">SIP (Systematic Investment Plan)</option>
                <option value="lumpsum">Lumpsum</option>
                <option value="trading">Active Trading</option>
                <option value="index">Index Investing</option>
                <option value="other">Other</option>
              </FieldSelect>
            </label>
            <label>
              <FieldLabel>Description</FieldLabel>
              <FieldTextarea
                value={item.description}
                onChange={(e) => {
                  const next = [...investmentMethods];
                  next[index] = { ...item, description: e.target.value };
                  setInvestmentMethods(next);
                }}
                rows={3}
              />
            </label>
          </FieldGroup>
        ))}
        <SecondaryButton type="button" onClick={() => setInvestmentMethods((e) => [...e, emptyMethod()])} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add investment method
        </SecondaryButton>
      </div>
    );
  } else if (step === 4) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>Contact email</FieldLabel>
          <FieldInput
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          <FieldLabel>LinkedIn (optional)</FieldLabel>
          <FieldInput value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" />
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
