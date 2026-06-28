"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import type { Platform, Source, Location, IdeaCategory } from "@/lib/types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/lib/types";
import LocationPicker from "@/components/LocationPicker";
import { useApiFetch } from "@/lib/use-api-fetch";

const PLATFORMS: Platform[] = ["reddit", "tiktok", "instagram", "facebook", "youtube", "forum", "other"];

export default function EditSourceModal({
  source,
  onClose,
  onSaved,
}: {
  source: Source;
  onClose: () => void;
  onSaved: () => void;
}) {
  const apiFetch = useApiFetch();
  const [url, setUrl] = useState(source.url);
  const [title, setTitle] = useState((source as Source & { title?: string | null }).title ?? "");
  const [platform, setPlatform] = useState<Platform>(source.platform as Platform);
  const [rawText, setRawText] = useState(source.rawText ?? "");
  const [locationId, setLocationId] = useState(source.locationId ?? "");
  const [status, setStatus] = useState(source.status);
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
    setSaving(true);
    setError("");

    const urlRes = await apiFetch(`/api/sources/${source.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        title: title || null,
        platform,
        rawText: rawText || null,
        locationId: locationId || null,
        status,
      }),
    });

    if (!urlRes.ok) {
      const d = await urlRes.json();
      setError(d.error ?? "Error saving");
      setSaving(false);
      return;
    }

    onSaved();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FDFAF6", borderRadius: 10, padding: "24px 28px", width: 500,
          maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Edit Source</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A6E61", fontSize: 18 }}>×</button>
        </div>

        <Field label="Title" hint="optional">
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best street food in Chiang Mai"
              style={{ ...inputStyle, flex: 1 }}
            />
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

        <Field label="URL" required>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#A89C8E" }}
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 7.5a3.5 3.5 0 005 0l1-1a3.536 3.536 0 10-5-5l-.5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M8.5 6.5a3.5 3.5 0 00-5 0l-1 1a3.536 3.536 0 105 5l.5-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              style={{ ...inputStyle, paddingLeft: 30 }}
            />
          </div>
        </Field>

        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} style={inputStyle}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
        </Field>

        <Field label="Note">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Your own observation…"
            rows={5}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </Field>

        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="linked_to_idea">Linked to Idea</option>
            <option value="discarded">Discarded</option>
          </select>
        </Field>

        <Field label="Topic Area" hint="optional">
          <LocationPicker locations={locations as never} value={locationId} onChange={setLocationId} />
        </Field>

        {(source.ideaSources?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7A6E61", letterSpacing: "0.07em",
              textTransform: "uppercase", marginBottom: 6 }}>Linked Ideas</div>
            {(source as Source & { ideaSources?: { idea: { id: string; title: string; category: string; articles?: { id: string; title: string; publishStatus: string }[] } }[] })
              .ideaSources!.map(({ idea }) => {
                const article = idea.articles?.[0];
                return (
                  <div key={idea.id} style={{
                    background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 5,
                    marginBottom: 4, overflow: "hidden",
                  }}>
                    <div style={{ padding: "6px 10px", fontSize: 12, fontWeight: 500, color: "#1F1A13" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#7A6E61",
                        textTransform: "uppercase", marginRight: 6 }}>
                        {CATEGORY_LABELS[idea.category as IdeaCategory]}
                      </span>
                      {idea.title}
                    </div>
                    {article && (
                      <a href={`/articles/${article.id}`} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6,
                          padding: "4px 10px", fontSize: 11, color: "#C8892E",
                          textDecoration: "none", borderTop: "1px solid #E0D8C8" }}>
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {article.title.slice(0, 55)}{article.title.length > 55 ? "…" : ""}
                        <span style={{ marginLeft: "auto", color: "#A89C8E", textTransform: "uppercase",
                          letterSpacing: "0.05em", fontSize: 10 }}>
                          {article.publishStatus}
                        </span>
                      </a>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {error && (
          <div style={{
            background: "#FDECEA", color: "#C0392B", padding: "8px 12px",
            borderRadius: 5, fontSize: 13, marginBottom: 12,
          }}>{error}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
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
