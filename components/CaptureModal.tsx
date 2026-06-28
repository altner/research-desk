"use client";

import { useState, useEffect } from "react";
import { Button, CategoryBadge } from "@/components/ui";
import type { Platform, IdeaCategory, Location } from "@/lib/types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/lib/types";
import LocationPicker from "@/components/LocationPicker";
import { useApiFetch } from "@/lib/use-api-fetch";
import { detectPlatform } from "@/lib/url-utils";

const PLATFORMS: Platform[] = ["reddit", "tiktok", "instagram", "facebook", "youtube", "forum", "other"];
const CATEGORIES: IdeaCategory[] = [
  "geheimtipp", "warnung_abzocke", "erwartung_vs_realitaet", "food_tipp",
  "stimmungsbild", "kultureller_fauxpas", "praktischer_tipp", "sonstige",
];

export default function CaptureModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const apiFetch = useApiFetch();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("reddit");
  const [rawText, setRawText] = useState("");
  const [locationId, setLocationId] = useState("");
  const [originSourceId, setOriginSourceId] = useState("");
  const [createIdea, setCreateIdea] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>("geheimtipp");
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/locations?flat=true").then((r) => r.json()).then(setLocations);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!url) { setError("URL is required"); return; }
    if (createIdea && !ideaTitle) { setError("Title is required when creating an idea"); return; }
    if (createIdea && !locationId) { setError("Topic area is required when creating an idea"); return; }
    setSaving(true);
    setError("");
    const res = await apiFetch("/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url, title: title || null, platform, rawText: rawText || null,
        locationId: locationId || null,
        originSourceId: originSourceId || null,
        ...(createIdea ? { createIdea: { title: ideaTitle, category: ideaCategory } } : {}),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Error saving");
      setSaving(false);
      return;
    }
    onSaved();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#FDFAF6", borderRadius: 10, padding: "24px 28px", width: 500, maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add New Source</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A6E61", fontSize: 18 }}>×</button>
        </div>

        <Field label="URL" required>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#A89C8E" }}
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 7.5a3.5 3.5 0 005 0l1-1a3.536 3.536 0 10-5-5l-.5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M8.5 6.5a3.5 3.5 0 00-5 0l-1 1a3.536 3.536 0 105 5l.5-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input value={url} onChange={(e) => {
              const val = e.target.value;
              setUrl(val);
              const detected = detectPlatform(val);
              setPlatform(detected as Platform);
            }}
              placeholder="https://..."
              style={{ ...inputStyle, paddingLeft: 30 }} />
          </div>
        </Field>

        <Field label="Title" hint="optional">
          <div style={{ display: "flex", gap: 6 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best street food in Chiang Mai"
              style={{ ...inputStyle, flex: 1 }} />
            <button
              type="button"
              disabled={!url || fetchingTitle}
              onClick={async () => {
                setFetchingTitle(true);
                const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`);
                const d = await res.json();
                if (d.title) setTitle(d.title);
                setFetchingTitle(false);
              }}
              style={{
                flexShrink: 0, height: 36, padding: "0 12px", fontSize: 12,
                border: "1px solid #D8CFBF", borderRadius: 5, cursor: url ? "pointer" : "default",
                background: "#F4EFE6", color: url ? "#1F1A13" : "#A89C8E", whiteSpace: "nowrap",
              }}
            >
              {fetchingTitle ? "…" : "Fetch"}
            </button>
          </div>
        </Field>

        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} style={inputStyle}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
        </Field>

        <Field label="Note">
          <textarea value={rawText} onChange={(e) => setRawText(e.target.value)}
            placeholder="Your own observation — do not paste original text verbatim ..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
        </Field>

        <Field label="Topic Area" hint="optional">
          <LocationPicker locations={locations as never} value={locationId} onChange={setLocationId} />
        </Field>

        {/* Create as Kanban card */}
        <div style={{
          border: "1px solid #D8CFBF", borderRadius: 6, padding: "10px 12px",
          marginBottom: 16,
        }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={createIdea} onChange={(e) => setCreateIdea(e.target.checked)}
              style={{ marginTop: 2, width: 15, height: 15, accentColor: "#C8892E" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Also create as Kanban card</div>
              <div style={{ fontSize: 11, color: "#A89C8E" }}>Provide a title and category</div>
            </div>
          </label>

          {createIdea && (
            <div style={{ marginTop: 12 }}>
              <Field label="Title / Angle">
                <input value={ideaTitle} onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="e.g. Hidden beach on Koh Lanta: what to expect"
                  style={inputStyle} />
              </Field>
              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setIdeaCategory(c)}
                      style={{
                        padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                        border: "1px solid",
                        ...(ideaCategory === c
                          ? { background: "#C8892E", color: "#fff", borderColor: "#C8892E" }
                          : { background: "transparent", color: "#7A6E61", borderColor: "#D8CFBF" }),
                      }}>
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#FDECEA", color: "#C0392B", padding: "8px 12px",
            borderRadius: 5, fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Source"}</Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid #D8CFBF", borderRadius: 5, background: "#F4EFE6",
  outline: "none", color: "#1F1A13",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#7A6E61",
  letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5,
};

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>
        {label}
        {hint && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>({hint})</span>}
        {required && <span style={{ color: "#C0392B", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
