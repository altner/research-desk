"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import type { IdeaCategory, Location, Idea } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import LocationPicker from "@/components/LocationPicker";

const CATEGORIES: IdeaCategory[] = [
  "geheimtipp", "warnung_abzocke", "erwartung_vs_realitaet", "food_tipp",
  "stimmungsbild", "kultureller_fauxpas", "praktischer_tipp", "sonstige",
];

export default function IdeaLinkModal({
  sourceIds, onClose, onSaved,
}: { sourceIds: string[]; onClose: () => void; onSaved: () => void }) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("geheimtipp");
  const [summary, setSummary] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/locations?flat=true").then((r) => r.json()).then(setLocations);
    fetch("/api/ideas").then((r) => r.json()).then(setIdeas);
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

    const res = await fetch("/api/sources/bulk-link-idea", {
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
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#FDFAF6", borderRadius: 10, padding: "24px 28px", width: 480,
        maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>
            Link {sourceIds.length} source{sourceIds.length !== 1 ? "s" : ""} to an Idea
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A6E61", fontSize: 18 }}>×</button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 18, border: "1px solid #D8CFBF", borderRadius: 6, overflow: "hidden" }}>
          {(["new", "existing"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "7px 0", fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer",
                background: mode === m ? "#C8892E" : "transparent",
                color: mode === m ? "#fff" : "#7A6E61",
              }}>
              {m === "new" ? "Create new Idea" : "Existing Idea"}
            </button>
          ))}
        </div>

        {mode === "new" && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Title / Angle</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hidden beach on Koh Lanta"
                style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Category</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{
                      padding: "3px 9px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700,
                      border: "1px solid",
                      ...(category === c
                        ? { background: "#C8892E", color: "#fff", borderColor: "#C8892E" }
                        : { background: "transparent", color: "#7A6E61", borderColor: "#D8CFBF" }),
                    }}>
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Summary</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                rows={3} placeholder="Your own description of the topic ..."
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Topic Area</label>
              <LocationPicker locations={locations as never} value={locationId} onChange={setLocationId} />
            </div>
          </>
        )}

        {mode === "existing" && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Select Idea</label>
            <select value={selectedIdeaId} onChange={(e) => setSelectedIdeaId(e.target.value)} style={inputStyle}>
              <option value="">Choose idea...</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>{idea.title}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div style={{ background: "#FDECEA", color: "#C0392B", padding: "8px 12px",
            borderRadius: 5, fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Link"}</Button>
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
