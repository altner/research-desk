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
      className="fixed inset-0 bg-black/35 z-[1000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-overlay rounded-[10px] p-[24px_28px] w-[500px] max-h-[90vh] overflow-auto shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[17px] font-bold">Edit Source</h2>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted text-[18px] leading-none">×</button>
        </div>

        <Field label="Title" hint="optional">
          <div className="flex gap-[6px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best street food in Chiang Mai"
              className={`${INPUT_CLS} flex-1`}
            />
            <FetchButton url={url} fetching={fetchingTitle} onClick={async () => {
              setFetchingTitle(true);
              const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`);
              const d = await res.json();
              if (d.title) setTitle(d.title);
              setFetchingTitle(false);
            }} />
          </div>
        </Field>

        <Field label="URL" required>
          <div className="relative">
            <svg className="absolute left-[10px] top-1/2 -translate-y-1/2 text-text-faint"
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 7.5a3.5 3.5 0 005 0l1-1a3.536 3.536 0 10-5-5l-.5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M8.5 6.5a3.5 3.5 0 00-5 0l-1 1a3.536 3.536 0 105 5l.5-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={`${INPUT_CLS} pl-[30px]`}
            />
          </div>
        </Field>

        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={INPUT_CLS}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
        </Field>

        <Field label="Note">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Your own observation…"
            rows={5}
            className={`${INPUT_CLS} resize-y leading-relaxed`}
          />
        </Field>

        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT_CLS}>
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
          <div className="mb-[14px]">
            <div className={`${LABEL_CLS} mb-[6px]`}>Linked Ideas</div>
            {(source as Source & { ideaSources?: { idea: { id: string; title: string; category: string; articles?: { id: string; title: string; publishStatus: string }[] } }[] })
              .ideaSources!.map(({ idea }) => {
                const article = idea.articles?.[0];
                return (
                  <div key={idea.id} className="bg-sand-light border border-[#E0D8C8] rounded-[5px] mb-1 overflow-hidden">
                    <div className="px-[10px] py-[6px] text-[12px] font-medium text-text">
                      <span className="text-[10px] font-bold text-text-muted uppercase mr-[6px]">
                        {CATEGORY_LABELS[idea.category as IdeaCategory]}
                      </span>
                      {idea.title}
                    </div>
                    {article && (
                      <a href={`/articles/${article.id}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-[6px] px-[10px] py-1 text-[11px] text-amber no-underline border-t border-[#E0D8C8]">
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {article.title.slice(0, 55)}{article.title.length > 55 ? "…" : ""}
                        <span className="ml-auto text-text-faint uppercase tracking-[0.05em] text-[10px]">
                          {article.publishStatus}
                        </span>
                      </a>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {error && <ErrorBox>{error}</ErrorBox>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
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
