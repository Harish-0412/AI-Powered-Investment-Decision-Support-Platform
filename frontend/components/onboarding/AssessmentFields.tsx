"use client";

import { cn } from "@/lib/utils";

export function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-[#e8ece9] bg-white p-4 sm:p-5 space-y-4", className)}>{children}</div>;
}

export function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="block text-sm font-bold text-[#101412] mb-1.5">
      {children}
      {hint && <span className="block text-xs font-medium text-[#8a9a92] mt-0.5">{hint}</span>}
    </span>
  );
}

export function FieldInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-[#dfe5e1] bg-[#fafbf9] px-3.5 py-2.5 text-[#101412] placeholder:text-[#a8b5ae]",
        "focus:outline-none focus:ring-2 focus:ring-[#4aa87a]/35 focus:border-[#4aa87a]",
        "transition-shadow",
        className
      )}
    />
  );
}

export function FieldTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-[#dfe5e1] bg-[#fafbf9] px-3.5 py-2.5 text-[#101412] placeholder:text-[#a8b5ae] resize-y min-h-[88px]",
        "focus:outline-none focus:ring-2 focus:ring-[#4aa87a]/35 focus:border-[#4aa87a]",
        className
      )}
    />
  );
}

export function FieldSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-lg border border-[#dfe5e1] bg-[#fafbf9] px-3.5 py-2.5 text-[#101412]",
        "focus:outline-none focus:ring-2 focus:ring-[#4aa87a]/35 focus:border-[#4aa87a]",
        className
      )}
    >
      {children}
    </select>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#111816] text-white font-bold text-sm",
        "h-12 px-6 hover:bg-[#1e2a24] transition-colors disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-[#dfe5e1] bg-white text-[#101412] font-bold text-sm",
        "h-12 px-6 hover:bg-[#f0f4f1] transition-colors disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
