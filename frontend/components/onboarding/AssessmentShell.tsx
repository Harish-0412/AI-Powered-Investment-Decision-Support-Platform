"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Briefcase, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_IMAGES = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 18 },
  },
};

type AssessmentShellProps = {
  step: number;
  totalSteps: number;
  stepLabels: readonly string[];
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  message?: string;
};

export function AssessmentShell({
  step,
  totalSteps,
  stepLabels,
  title,
  subtitle,
  children,
  footer,
  message,
}: AssessmentShellProps) {
  const progress = Math.round(((step + 1) / totalSteps) * 100);
  const imageUrl = STEP_IMAGES[step] ?? STEP_IMAGES[0];

  return (
    <motion.div
      className={cn("w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0 items-stretch bg-white rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(16,20,18,0.12)] border border-[#e8ece9] min-h-[min(720px,92vh)]">
        <motion.div
          className="flex flex-col p-6 sm:p-8 lg:p-10 bg-[#fafbf9]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={step}
        >
          <motion.div variants={itemVariants} className="mb-5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#52625a]">
              <Briefcase className="h-4 w-4 text-[#4aa87a]" aria-hidden />
              Investment Intelligence · Profile assessment
              <Link href="/app" className="ml-1 text-[#4aa87a] hover:underline font-bold">
                Skip to app
              </Link>
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4aa87a]">
                Step {step + 1} of {totalSteps}
              </span>
              <span className="text-xs font-bold text-[#101412]">{progress}%</span>
            </div>
            <motion.div className="h-1.5 w-full rounded-full bg-[#e8ece9] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#4aa87a]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </motion.div>
            <motion.div className="flex flex-wrap gap-2 mt-4">
              {stepLabels.map((label, index) => (
                <span
                  key={label}
                  className={cn(
                    "text-[0.7rem] font-bold px-2.5 py-1 rounded-full border transition-colors",
                    index === step
                      ? "bg-[#111816] text-white border-[#111816]"
                      : index < step
                        ? "bg-[#e8f5ee] text-[#2d6b4a] border-[#c5e6d4]"
                        : "bg-white text-[#8a9a92] border-[#e8ece9]"
                  )}
                >
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[#101412] leading-[1.08] tracking-tight mb-2"
          >
            {title}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-[#52625a] text-base sm:text-lg leading-relaxed mb-6 max-w-xl">
            {subtitle}
          </motion.p>

          {message && (
            <motion.p
              variants={itemVariants}
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              role="alert"
            >
              {message}
            </motion.p>
          )}

          <motion.div variants={itemVariants} className="flex-1 space-y-4 assessment-form-body">
            {children}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-[#e8ece9]">
            {footer}
          </motion.div>

          <motion.p variants={itemVariants} className="mt-4 text-xs text-[#8a9a92] flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-[#4aa87a]" aria-hidden />
            Your answers power a public profile focused on your investment strategy.
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </motion.p>
        </motion.div>

        <motion.div
          className="relative hidden lg:block min-h-[400px] bg-[#111816]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          key={`img-${step}`}
        >
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e0c] via-[#0a0e0c]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-[#79d7a8] mb-2">
              {stepLabels[step]}
            </p>
            <p className="text-2xl font-bold leading-snug max-w-sm">
              Build a comprehensive investment profile.
            </p>
            <p className="mt-3 text-sm text-white/75 max-w-sm leading-relaxed">
              Showcase your market focus, investment journey, and strategic asset allocation.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
