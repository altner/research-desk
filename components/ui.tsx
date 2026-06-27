"use client";

import { PLATFORM_ABBR, PLATFORM_COLORS, STATUS_LABELS, CATEGORY_LABELS, CREDIBILITY_LABELS } from "@/lib/types";
import type { Platform, SourceStatus, IdeaCategory, Credibility } from "@/lib/types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform] ?? "#78909C";
  const abbr = PLATFORM_ABBR[platform] ?? "??";
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: "50%",
        background: color + "22", color,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.03em", flexShrink: 0,
      }}
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
    <span style={{
      display: "inline-block", padding: "1px 6px",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`, borderRadius: 2,
    }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

const CATEGORY_COLORS: Record<IdeaCategory, { color: string; border: string }> = {
  geheimtipp:             { color: "#2D7A77", border: "#2D7A77" },
  warnung_abzocke:        { color: "#C8892E", border: "#C8892E" },
  erwartung_vs_realitaet: { color: "#7B5EA7", border: "#7B5EA7" },
  food_tipp:              { color: "#2D7A44", border: "#2D7A44" },
  stimmungsbild:          { color: "#1E5C8A", border: "#1E5C8A" },
  kultureller_fauxpas:    { color: "#C05C2B", border: "#C05C2B" },
  praktischer_tipp:       { color: "#1E5C8A", border: "#1E5C8A" },
  sonstige:               { color: "#7A6E61", border: "#C8BFB0" },
};

export function CategoryBadge({ category }: { category: IdeaCategory }) {
  const c = CATEGORY_COLORS[category] ?? { color: "#7A6E61", border: "#C8BFB0" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      color: c.color, border: `1px solid ${c.border}`, borderRadius: 2,
      textTransform: "uppercase",
    }}>
      {CATEGORY_LABELS[category]}
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: c.color }}>
      <span style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} style={{
            display: "block", width: 3,
            height: 4 + i * 3,
            background: i <= c.bars ? c.color : "#D8CFBF",
            borderRadius: 1,
          }} />
        ))}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#7A6E61", fontSize: 12 }}>
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0 }}>
        <path d="M5 1C3.067 1 1.5 2.567 1.5 4.5c0 2.625 3.5 6.5 3.5 6.5s3.5-3.875 3.5-6.5C8.5 2.567 6.933 1 5 1z"
          stroke="#7A6E61" strokeWidth="1.2"/>
        <circle cx="5" cy="4.5" r="1" fill="#7A6E61"/>
      </svg>
      {parts.join(" › ")}
    </span>
  );
}

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
  const styles = {
    primary:   { background: "#C8892E", color: "#fff", border: "1px solid #C8892E" },
    secondary: { background: "transparent", color: "#1F1A13", border: "1px solid #C8BFB0" },
    danger:    { background: "transparent", color: "#C0392B", border: "1px solid #C0392B" },
    ghost:     { background: "transparent", color: "#7A6E61", border: "none" },
  };
  const pads = { sm: "4px 10px", md: "6px 14px" };
  const s = styles[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        padding: pads[size],
        fontSize: size === "sm" ? 12 : 13,
        fontWeight: 500,
        borderRadius: 5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
