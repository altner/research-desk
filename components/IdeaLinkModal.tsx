"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import type { IdeaCategory, Location, Idea } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import LocationPicker from "@/components/LocationPicker";
import { useApiFetch } from "@/lib/use-api-fetch";

const CATEGORIES: IdeaCategory[] = [
  "hidden_gem", "warning", "expectation_vs_reality", "food_drink",
  "atmosphere", "cultural_note", "practical_tip", "other",
];

export default function IdeaLinkModal({
  sourceIds, onClose, onSaved,
}: { sourceIds: string[]; onClose: () => void; onSaved: () => void }) {
  const apiFetch = useApiFetch();
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("hidden_gem");
  const [summary, setSummary] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/locations?flat=true").then((r) => r.json()).then(setLocations);
    apiFetch("/api/ideas").then((r) => r.json()).then(setIdeas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    const body =
      mode === "existing"
        ? { sourceIds, ideaId: selectedIdeaId }
        : { sourceIds, newIdea: { title, category, summary, locationId } };

    if (mode === "new" && (!title || !locationId)) {
      setError("Title and topic area are required");
      setSaving(false);
      return;
    }
    if (mode === "existing" && !selectedIdeaId) {
      setError("Please select an idea");
      setSaving(false);
      return;
    }

    const res = await apiFetch("/api/sources/bulk-link-idea", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Error");
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
        className="bg-overlay rounded-[10px] p-[24px_28px] w-[480px] max-h-[85vh] overflow-auto shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] font-bold">
            Link {sourceIds.length} source{sourceIds.length !== 1 ? "s" : ""} to an Idea
          </h2>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted text-[18px] leading-none">×</button>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-[18px] border border-border rounded-md overflow-hidden">
          {(["new", "existing"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={[
                "flex-1 py-[7px] text-[13px] font-semibold border-none cursor-pointer",
                mode === m ? "bg-action text-white" : "bg-transparent text-text-muted",
              ].join(" ")}>
              {m === "new" ? "Create new Idea" : "Existing Idea"}
            </button>
          ))}
        </div>

        {mode === "new" && (
          <>
            <div className="mb-3">
              <label className={LABEL_CLS}>Title / Angle</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hidden beach on Koh Lanta"
                className={INPUT_CLS} />
            </div>
            <div className="mb-3">
              <label className={LABEL_CLS}>Category</label>
              <div className="flex gap-[5px] flex-wrap mt-[5px]">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={[
                      "px-[9px] py-[3px] rounded cursor-pointer text-[11px] font-bold border",
                      category === c
                        ? "bg-action text-white border-action"
                        : "bg-transparent text-text-muted border-border",
                    ].join(" ")}>
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className={LABEL_CLS}>Summary</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                rows={3} placeholder="Your own description of the topic ..."
                className={`${INPUT_CLS} resize-y`} />
            </div>
            <div className="mb-3">
              <label className={LABEL_CLS}>Topic Area</label>
              <LocationPicker locations={locations as never} value={locationId} onChange={setLocationId} />
            </div>
          </>
        )}

        {mode === "existing" && (
          <div className="mb-3">
            <label className={LABEL_CLS}>Select Idea</label>
            <select value={selectedIdeaId} onChange={(e) => setSelectedIdeaId(e.target.value)} className={INPUT_CLS}>
              <option value="">Choose idea...</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>{idea.title}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="bg-[#FDECEA] text-[#C0392B] px-3 py-2 rounded-[5px] text-[13px] mb-3">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Link"}</Button>
        </div>
      </div>
    </div>
  );
}

const INPUT_CLS = "w-full px-[10px] py-[8px] text-[13px] border border-border rounded-[5px] bg-card outline-none text-text";
const LABEL_CLS = "block text-[11px] font-bold text-text-muted tracking-[0.07em] uppercase mb-[5px]";
