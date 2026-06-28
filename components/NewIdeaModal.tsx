"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import type { Location } from "@/lib/types";
import LocationPicker from "@/components/LocationPicker";
import { useApiFetch } from "@/lib/use-api-fetch";
import { useCategories } from "@/lib/use-categories";

export default function NewIdeaModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const apiFetch = useApiFetch();
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/locations?flat=true").then((r) => r.json()).then(setLocations);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !category) setCategory(categories[0].key);
  }, [categories, category]);

  const save = async () => {
    if (!title || !locationId) { setError("Title and topic area are required"); return; }
    setSaving(true);
    const res = await apiFetch("/api/ideas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, summary, locationId }),
    });
    if (!res.ok) { setError("Error saving"); setSaving(false); return; }
    onSaved();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#FDFAF6", borderRadius: 10, padding: "24px 28px", width: 480,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>New Idea</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A6E61", fontSize: 18 }}>×</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Title / Angle *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hidden beach on Koh Lanta" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Category</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
            {categories.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)} style={{
                padding: "3px 9px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700,
                border: "1px solid",
                ...(category === c.key
                  ? { background: "#C8892E", color: "#fff", borderColor: "#C8892E" }
                  : { background: "transparent", color: "#7A6E61", borderColor: "#D8CFBF" }),
              }}>
                {c.labelDe}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Topic Area *</label>
          <LocationPicker locations={locations as never} value={locationId} onChange={setLocationId} required />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
            rows={3} placeholder="Brief description of the topic ..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {error && (
          <div style={{ background: "#FDECEA", color: "#C0392B", padding: "8px 12px",
            borderRadius: 5, fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Creating…" : "Create Idea"}</Button>
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
