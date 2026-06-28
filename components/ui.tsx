"use client";

import { PLATFORM_ABBR, PLATFORM_COLORS, STATUS_LABELS, CATEGORY_LABELS, CREDIBILITY_LABELS } from "@/lib/types";
import type { Platform, SourceStatus, IdeaCategory, Credibility } from "@/lib/types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform] ?? "#78909C";
  const abbr = PLATFORM_ABBR[platform] ?? "??";
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold tracking-[0.03em] shrink-0"
      style={{ background: color + "22", color }}
    >
      {abbr}
    </span>
  );
}

const STATUS_STYLES: Record<SourceStatus, { color: string; bg: string; border: string }> = {
  new:           { color: "#2D7A77", bg: "#E8F5F4", border: "#2D7A77" },
  reviewed:      { color: "#7A6E61", bg: "#F4EFE6", border: "#C8BFB0" },
  linked_to_idea:{ color: "#1E5C8A", bg: "#E8F1F8", border: "#4A90C4" },
  discarded:     { color: "#C0392B", bg: "#FDECEA", border: "#C0392B" },
  merged:        { color: "#8B7355", bg: "#F0EBE2", border: "#C8BFB0" },
};

export function StatusBadge({ status }: { status: SourceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-block px-[6px] py-[1px] text-[10px] font-bold tracking-[0.06em] rounded-[2px] border"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const CATEGORY_COLORS_STATIC: Record<string, string> = {
  hidden_gem: "#2D7A77", warning: "#C8892E", expectation_vs_reality: "#7B5EA7",
  food_drink: "#2D7A44", atmosphere: "#1E5C8A", cultural_note: "#C05C2B",
  practical_tip: "#1E5C8A", other: "#7A6E61",
};

export function CategoryBadge({ category, label, color }: {
  category: string;
  label?: string;
  color?: string;
}) {
  const displayColor = color ?? CATEGORY_COLORS_STATIC[category] ?? "#7A6E61";
  const displayLabel = label ?? CATEGORY_LABELS[category as IdeaCategory] ?? category;
  return (
    <span
      className="inline-block px-[7px] py-[2px] text-[10px] font-bold tracking-[0.06em] uppercase rounded-[2px] border"
      style={{ color: displayColor, borderColor: displayColor }}
    >
      {displayLabel}
    </span>
  );
}

const CRED_STYLES: Record<Credibility, { color: string; bars: number }> = {
  niedrig:    { color: "#A89C8E", bars: 1 },
  mittel:     { color: "#C8892E", bars: 2 },
  hoch:       { color: "#2D7A44", bars: 3 },
  bestaetigt: { color: "#2D7A77", bars: 4 },
};

export function CredibilityBadge({ credibility }: { credibility: Credibility }) {
  const c = CRED_STYLES[credibility];
  return (
    <span className="inline-flex items-center gap-1" style={{ color: c.color }}>
      <span className="flex items-end gap-[1.5px]">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} style={{
            display: "block", width: 3,
            height: 4 + i * 3,
            background: i <= c.bars ? c.color : "#D8CFBF",
            borderRadius: 1,
          }} />
        ))}
      </span>
      <span className="text-[10px] font-bold tracking-[0.06em]">
        {CREDIBILITY_LABELS[credibility]}
      </span>
    </span>
  );
}

export function LocationCrumb({ location }: {
  location: {
    nameEn?: string;
    nameDe: string;
    parent?: { nameEn?: string; nameDe: string; parent?: { nameEn?: string; nameDe: string } | null } | null;
  };
}) {
  const name = (l: { nameEn?: string; nameDe: string }) => l.nameEn || l.nameDe;
  const parts: string[] = [];
  if (location.parent?.parent) parts.push(name(location.parent.parent));
  if (location.parent) parts.push(name(location.parent));
  parts.push(name(location));

  return (
    <span className="inline-flex items-center gap-[3px] text-text-muted text-xs">
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="shrink-0">
        <path d="M5 1C3.067 1 1.5 2.567 1.5 4.5c0 2.625 3.5 6.5 3.5 6.5s3.5-3.875 3.5-6.5C8.5 2.567 6.933 1 5 1z"
          stroke="#7A6E61" strokeWidth="1.2"/>
        <circle cx="5" cy="4.5" r="1" fill="#7A6E61"/>
      </svg>
      {parts.join(" › ")}
    </span>
  );
}

const BUTTON_VARIANTS = {
  primary:   "bg-action text-white border border-action hover:opacity-90",
  secondary: "bg-transparent text-text border border-border-strong hover:bg-card",
  danger:    "bg-transparent text-danger border border-danger hover:bg-danger-subtle",
  ghost:     "bg-transparent text-text-muted border-none hover:text-text",
};

const BUTTON_SIZES = {
  sm: "px-[10px] py-[4px] text-xs",
  md: "px-[14px] py-[6px] text-[13px]",
};

export function Button({
  children, onClick, variant = "primary", size = "md", disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "font-medium rounded-[5px] whitespace-nowrap transition-opacity duration-150",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
