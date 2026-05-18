"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { resolvePostAuthPath } from "@/lib/auth-redirect";
import type { PortfolioExperience, PortfolioProject, PublicProfile, SkillDomains } from "@/lib/profile";
import { joinTags, parseTags, SKILL_DOMAIN_LABELS } from "@/lib/profile";
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

const STEPS = ["Identity", "About", "Skills", "Projects", "Experience", "Contact"] as const;

const STEP_COPY: Record<number, { title: string; subtitle: string }> = {
  0: {
    title: "Start with who you are",
    subtitle: "Recruiters decide in seconds. Lead with a clear name, role, and one-line specialization.",
  },
  1: {
    title: "Describe your technical focus",
    subtitle: "Skip generic passion statements. Explain what you build, how long you've been learning, and your stack.",
  },
  2: {
    title: "Organize skills by domain",
    subtitle: "Group technologies the way engineering teams think — frontend, backend, data, AI, and DevOps.",
  },
  3: {
    title: "Present projects like products",
    subtitle: "Each project needs a problem, architecture, features, and engineering highlights.",
  },
  4: {
    title: "Show your journey",
    subtitle: "Hackathons, open source, freelance work, and self-built products count as real experience.",
  },
  5: {
    title: "Make it easy to hire you",
    subtitle: "Add GitHub, email, LinkedIn, and optional scheduling links for recruiters and clients.",
  },
};

const emptyProject = (): PortfolioProject => ({
  id: crypto.randomUUID(),
  slug: "new-project",
  name: "",
  problem: "",
  architecture: "",
  techStack: [],
  features: [],
  engineeringHighlights: [],
  featured: true,
});

const emptyExperience = (): PortfolioExperience => ({
  id: crypto.randomUUID(),
  title: "",
  organization: "",
  period: "",
  description: "",
  type: "project",
});

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [yearsLearning, setYearsLearning] = useState(3);
  const [currentlyBuilding, setCurrentlyBuilding] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [skills, setSkills] = useState<SkillDomains>({});
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [experience, setExperience] = useState<PortfolioExperience[]>([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [calendly, setCalendly] = useState("");
  const [discord, setDiscord] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    apiRequest<PublicProfile>("/profile/me")
      .then((profile) => {
        setFullName(profile.fullName ?? "");
        setRole(profile.role ?? "");
        setTagline(profile.tagline ?? "");
        setBio(profile.bio ?? "");
        setYearsLearning(profile.yearsLearning ?? 3);
        setCurrentlyBuilding(profile.currentlyBuilding ?? "");
        setTechnologies(joinTags(profile.technologies ?? undefined));
        setSkills(profile.skills ?? {});
        setProjects(profile.projects?.length ? profile.projects : [emptyProject()]);
        setExperience(profile.experience ?? []);
        setGithubUsername(profile.githubUsername ?? "");
        setContactEmail(profile.contactEmail ?? "");
        setLinkedin(profile.linkedin ?? "");
        setTwitter(profile.twitter ?? "");
        setCalendly(profile.calendly ?? "");
        setDiscord(profile.discord ?? "");
        setResumeUrl(profile.resumeUrl ?? "");
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
          role,
          tagline,
          bio,
          yearsLearning,
          currentlyBuilding,
          technologies: parseTags(technologies),
          skills,
          projects,
          experience,
          githubUsername,
          contactEmail,
          linkedin: linkedin || undefined,
          twitter: twitter || undefined,
          calendly: calendly || undefined,
          discord,
          resumeUrl: resumeUrl || undefined,
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

  const updateSkillDomain = (key: keyof SkillDomains, value: string) => {
    setSkills((prev) => ({ ...prev, [key]: parseTags(value) }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#52625a] font-semibold">
        Preparing your portfolio setup…
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
          {saving ? "Finishing…" : "Publish portfolio"}
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
          <FieldLabel>Role</FieldLabel>
          <FieldInput
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Full Stack Developer & AI Systems Builder"
          />
        </label>
        <label>
          <FieldLabel hint="One sentence recruiters will remember">Specialization</FieldLabel>
          <FieldInput
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Building intelligent, scalable web applications with AI and modern engineering."
          />
        </label>
      </FieldGroup>
    );
  } else if (step === 1) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>Technical bio</FieldLabel>
          <FieldTextarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Full-stack focus on AI systems, scalable backends, recommendation engines…"
          />
        </label>
        <label>
          <FieldLabel>Years learning / building</FieldLabel>
          <FieldInput
            type="number"
            min={0}
            value={yearsLearning}
            onChange={(e) => setYearsLearning(Number(e.target.value))}
          />
        </label>
        <label>
          <FieldLabel>Currently building</FieldLabel>
          <FieldTextarea
            value={currentlyBuilding}
            onChange={(e) => setCurrentlyBuilding(e.target.value)}
            rows={2}
            placeholder="Investment Intelligence — AI portfolio & market analytics platform"
          />
        </label>
        <label>
          <FieldLabel hint="Comma-separated">Core technologies</FieldLabel>
          <FieldInput
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="TypeScript, Node.js, PostgreSQL, Redis, Next.js"
          />
        </label>
      </FieldGroup>
    );
  } else if (step === 2) {
    stepContent = (
      <div className="space-y-3 max-h-[min(420px,50vh)] overflow-y-auto pr-1">
        {Object.entries(SKILL_DOMAIN_LABELS).map(([key, label]) => (
          <FieldGroup key={key} className="!p-4">
            <label>
              <FieldLabel>{label}</FieldLabel>
              <FieldInput
                value={joinTags(skills[key as keyof SkillDomains])}
                onChange={(e) => updateSkillDomain(key as keyof SkillDomains, e.target.value)}
                placeholder="React, Next.js, Tailwind"
              />
            </label>
          </FieldGroup>
        ))}
      </div>
    );
  } else if (step === 3) {
    stepContent = (
      <div className="space-y-4 max-h-[min(480px,55vh)] overflow-y-auto pr-1">
        {projects.map((project, index) => (
          <FieldGroup key={project.id}>
            <label>
              <FieldLabel>Project name</FieldLabel>
              <FieldInput
                value={project.name}
                onChange={(e) => {
                  const next = [...projects];
                  next[index] = {
                    ...project,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "project",
                  };
                  setProjects(next);
                }}
              />
            </label>
            <label>
              <FieldLabel>Problem solved</FieldLabel>
              <FieldTextarea
                value={project.problem}
                onChange={(e) => {
                  const next = [...projects];
                  next[index] = { ...project, problem: e.target.value };
                  setProjects(next);
                }}
                rows={2}
              />
            </label>
            <label>
              <FieldLabel>Architecture</FieldLabel>
              <FieldTextarea
                value={project.architecture}
                onChange={(e) => {
                  const next = [...projects];
                  next[index] = { ...project, architecture: e.target.value };
                  setProjects(next);
                }}
                rows={2}
              />
            </label>
            <label>
              <FieldLabel hint="Comma-separated">Tech stack</FieldLabel>
              <FieldInput
                value={joinTags(project.techStack)}
                onChange={(e) => {
                  const next = [...projects];
                  next[index] = { ...project, techStack: parseTags(e.target.value) };
                  setProjects(next);
                }}
              />
            </label>
            <label>
              <FieldLabel hint="Comma-separated">Key features</FieldLabel>
              <FieldInput
                value={joinTags(project.features)}
                onChange={(e) => {
                  const next = [...projects];
                  next[index] = { ...project, features: parseTags(e.target.value) };
                  setProjects(next);
                }}
              />
            </label>
            <label>
              <FieldLabel hint="Comma-separated">Engineering highlights</FieldLabel>
              <FieldInput
                value={joinTags(project.engineeringHighlights)}
                onChange={(e) => {
                  const next = [...projects];
                  next[index] = { ...project, engineeringHighlights: parseTags(e.target.value) };
                  setProjects(next);
                }}
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                <FieldLabel>GitHub URL</FieldLabel>
                <FieldInput
                  value={project.githubUrl ?? ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[index] = { ...project, githubUrl: e.target.value };
                    setProjects(next);
                  }}
                />
              </label>
              <label>
                <FieldLabel>Live demo URL</FieldLabel>
                <FieldInput
                  value={project.liveUrl ?? ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[index] = { ...project, liveUrl: e.target.value };
                    setProjects(next);
                  }}
                />
              </label>
            </div>
          </FieldGroup>
        ))}
        <SecondaryButton type="button" onClick={() => setProjects((p) => [...p, emptyProject()])} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add another project
        </SecondaryButton>
      </div>
    );
  } else if (step === 4) {
    stepContent = (
      <div className="space-y-4 max-h-[min(480px,55vh)] overflow-y-auto pr-1">
        {experience.length === 0 && (
          <p className="text-sm text-[#52625a]">No entries yet — add your first milestone below.</p>
        )}
        {experience.map((item, index) => (
          <FieldGroup key={item.id}>
            <label>
              <FieldLabel>Title</FieldLabel>
              <FieldInput
                value={item.title}
                onChange={(e) => {
                  const next = [...experience];
                  next[index] = { ...item, title: e.target.value };
                  setExperience(next);
                }}
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                <FieldLabel>Organization</FieldLabel>
                <FieldInput
                  value={item.organization}
                  onChange={(e) => {
                    const next = [...experience];
                    next[index] = { ...item, organization: e.target.value };
                    setExperience(next);
                  }}
                />
              </label>
              <label>
                <FieldLabel>Period</FieldLabel>
                <FieldInput
                  value={item.period}
                  onChange={(e) => {
                    const next = [...experience];
                    next[index] = { ...item, period: e.target.value };
                    setExperience(next);
                  }}
                  placeholder="2024 – Present"
                />
              </label>
            </div>
            <label>
              <FieldLabel>Type</FieldLabel>
              <FieldSelect
                value={item.type}
                onChange={(e) => {
                  const next = [...experience];
                  next[index] = { ...item, type: e.target.value as PortfolioExperience["type"] };
                  setExperience(next);
                }}
              >
                <option value="project">Self-built product</option>
                <option value="hackathon">Hackathon</option>
                <option value="opensource">Open source</option>
                <option value="freelance">Freelance</option>
                <option value="work">Work</option>
                <option value="research">Research</option>
              </FieldSelect>
            </label>
            <label>
              <FieldLabel>Description</FieldLabel>
              <FieldTextarea
                value={item.description}
                onChange={(e) => {
                  const next = [...experience];
                  next[index] = { ...item, description: e.target.value };
                  setExperience(next);
                }}
                rows={3}
              />
            </label>
          </FieldGroup>
        ))}
        <SecondaryButton type="button" onClick={() => setExperience((e) => [...e, emptyExperience()])} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add experience
        </SecondaryButton>
      </div>
    );
  } else if (step === 5) {
    stepContent = (
      <FieldGroup>
        <label>
          <FieldLabel>GitHub username</FieldLabel>
          <FieldInput
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="your-handle"
          />
        </label>
        <label>
          <FieldLabel>Contact email</FieldLabel>
          <FieldInput
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label>
            <FieldLabel>LinkedIn</FieldLabel>
            <FieldInput value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" />
          </label>
          <label>
            <FieldLabel>X / Twitter</FieldLabel>
            <FieldInput value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </label>
        </div>
        <label>
          <FieldLabel>Calendly (optional)</FieldLabel>
          <FieldInput value={calendly} onChange={(e) => setCalendly(e.target.value)} />
        </label>
        <label>
          <FieldLabel>Discord (optional)</FieldLabel>
          <FieldInput value={discord} onChange={(e) => setDiscord(e.target.value)} />
        </label>
        <label>
          <FieldLabel>Resume PDF URL</FieldLabel>
          <FieldInput value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://…" />
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
