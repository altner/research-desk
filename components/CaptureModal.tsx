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
  "hidden_gem", "warning", "expectation_vs_reality", "food_drink",
  "atmosphere", "cultural_note", "practical_tip", "other",
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
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>("hidden_gem");
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
    <div
      className="fixed inset-0 bg-black/35 z-[1000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-overlay rounded-[10px] p-[24px_28px] w-[500px] max-h-[90vh] overflow-auto shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[17px] font-bold">Add New Source</h2>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted text-[18px] leading-none">×</button>
        </div>

        <Field label="URL" required>
          <div className="relative">
            <svg className="absolute left-[10px] top-1/2 -translate-y-1/2 text-text-faint"
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
              className={`${INPUT_CLS} pl-[30px]`} />
          </div>
        </Field>

        <Field label="Title" hint="optional">
          <div className="flex gap-[6px]">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best street food in Chiang Mai"
              className={`${INPUT_CLS} flex-1`} />
            <FetchButton url={url} fetching={fetchingTitle} onClick={async () => {
              setFetchingTitle(true);
              const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`);
              const d = await res.json();
              if (d.title) setTitle(d.title);
              setFetchingTitle(false);
            }} />
          </div>
        </Field>

        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={INPUT_CLS}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
        </Field>

        <Field label="Note">
          <textarea value={rawText} onChange={(e) => setRawText(e.target.value)}
            placeholder="Your own observation — do not paste original text verbatim ..."
            rows={4}
            className={`${INPUT_CLS} resize-y leading-relaxed`} />
        </Field>

        <Field label="Topic Area" hint="optional">
          <LocationPicker locations={locations as never} value={locationId} onChange={setLocationId} />
        </Field>

        <div className="border border-border rounded-md p-[10px_12px] mb-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={createIdea} onChange={(e) => setCreateIdea(e.target.checked)}
              className="mt-[2px] w-[15px] h-[15px] accent-amber" />
            <div>
              <div className="text-[13px] font-semibold">Also create as Kanban card</div>
              <div className="text-[11px] text-text-faint">Provide a title and category</div>
            </div>
          </label>

          {createIdea && (
            <div className="mt-3">
              <Field label="Title / Angle">
                <input value={ideaTitle} onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="e.g. Hidden beach on Koh Lanta: what to expect"
                  className={INPUT_CLS} />
              </Field>
              <div>
                <label className={LABEL_CLS}>Category</label>
                <div className="flex gap-[6px] flex-wrap mt-[6px]">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setIdeaCategory(c)}
                      className={[
                        "px-[10px] py-1 rounded cursor-pointer text-[11px] font-bold tracking-[0.05em] border",
                        ideaCategory === c
                          ? "bg-action text-white border-action"
                          : "bg-transparent text-text-muted border-border",
                      ].join(" ")}>
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Source"}</Button>
        </div>
      </div>
    </div>
  );
}

const INPUT_CLS = "w-full px-[10px] py-[8px] text-[13px] border border-border rounded-[5px] bg-card outline-none text-text";
const LABEL_CLS = "block text-[11px] font-bold text-text-muted tracking-[0.07em] uppercase mb-[5px]";

function FetchButton({ url, fetching, onClick }: { url: string; fetching: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={!url || fetching}
      onClick={onClick}
      className={[
        "shrink-0 h-9 px-3 text-xs border border-border rounded-[5px] bg-sand-light whitespace-nowrap",
        url ? "text-text cursor-pointer" : "text-text-faint cursor-default",
      ].join(" ")}
    >
      {fetching ? "…" : "Fetch"}
    </button>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-danger-subtle text-danger px-3 py-2 rounded-[5px] text-[13px] mb-3">{children}</div>
  );
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="mb-[14px]">
      <label className={LABEL_CLS}>
        {label}
        {hint && <span className="font-normal normal-case tracking-normal ml-[6px]">({hint})</span>}
        {required && <span className="text-[#C0392B] ml-[2px]">*</span>}
      </label>
      {children}
    </div>
  );
}
