"use client";

import { useState, useEffect } from "react";

interface LocationFlat {
  id: string;
  type: string;
  parentId: string | null;
  nameDe: string;
  nameEn: string;
  slug: string;
  parent?: { nameDe: string; slug: string; type: string } | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid #D8CFBF", borderRadius: 5, background: "#F4EFE6",
  outline: "none", color: "#1F1A13",
};

function displayName(loc: LocationFlat) {
  return loc.nameEn || loc.nameDe;
}

/** Returns the ancestor chain of a location, from root to the location itself. */
function getAncestors(id: string, all: LocationFlat[]): string[] {
  const chain: string[] = [];
  let current: LocationFlat | undefined = all.find(l => l.id === id);
  while (current) {
    chain.unshift(current.id);
    current = current.parentId ? all.find(l => l.id === current!.parentId) : undefined;
  }
  // Drop the country level (we don't show it as a selectable level)
  const withoutCountry = chain.filter(cid => {
    const loc = all.find(l => l.id === cid);
    return loc?.type !== "country";
  });
  return withoutCountry;
}

/**
 * Cascading location picker that supports arbitrary depth.
 * Each level only appears when the previous level has children.
 * Calls onChange with the deepest selected location ID.
 */
export default function LocationPicker({ locations, value, onChange, required }: {
  locations: LocationFlat[];
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}) {
  // Top-level options: non-country locations whose parent is a country or have no parent
  const topLevel = locations
    .filter(l => l.type !== "country" && (!l.parentId || l.parent?.type === "country"))
    .sort((a, b) => displayName(a).localeCompare(displayName(b)));

  // selected[i] = ID selected at depth i (index 0 = top level)
  const [selected, setSelected] = useState<string[]>(() =>
    value ? getAncestors(value, locations) : []
  );

  // Sync when value or locations change externally
  useEffect(() => {
    setSelected(value ? getAncestors(value, locations) : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelect = (depth: number, id: string) => {
    const next = [...selected.slice(0, depth), ...(id ? [id] : [])];
    setSelected(next);
    onChange(id || selected[depth - 1] || "");
  };

  // Build the list of dropdowns to render
  // Level 0 always shown; level N shown when level N-1 has children
  const levels: { options: LocationFlat[]; selectedId: string; depth: number }[] = [];

  // Level 0
  levels.push({ options: topLevel, selectedId: selected[0] ?? "", depth: 0 });

  // Subsequent levels: show if the previously selected location has children
  let depth = 0;
  while (selected[depth]) {
    const children = locations
      .filter(l => l.parentId === selected[depth] && l.type !== "country")
      .sort((a, b) => displayName(a).localeCompare(displayName(b)));
    if (children.length === 0) break;
    depth++;
    levels.push({ options: children, selectedId: selected[depth] ?? "", depth });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {levels.map(({ options, selectedId, depth: d }) => (
        <select
          key={d}
          value={selectedId}
          onChange={(e) => handleSelect(d, e.target.value)}
          required={required && d === 0}
          style={{
            ...inputStyle,
            paddingLeft: d > 0 ? 20 : 10,
            color: selectedId ? "#1F1A13" : "#A89C8E",
          }}
        >
          <option value="">
            {d === 0 ? "Select region…" : "↳ entire " + displayName(locations.find(l => l.id === selected[d - 1])!)}
          </option>
          {options.map((l) => (
            <option key={l.id} value={l.id}>{displayName(l)}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
