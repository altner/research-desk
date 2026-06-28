"use client";

import { useState } from "react";
import { Button, PlatformBadge } from "@/components/ui";
import type { Source, Platform } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";
import { useApiFetch } from "@/lib/use-api-fetch";

export default function MergeModal({
  sources,
  onClose,
  onMerged,
}: {
  sources: Source[];
  onClose: () => void;
  onMerged: () => void;
}) {
  const apiFetch = useApiFetch();
  const [mainId, setMainId] = useState<string>(sources[0]?.id ?? "");
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");

  const doMerge = async () => {
    setMerging(true);
    setError("");
    const res = await apiFetch("/api/sources/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceIds: sources.map((s) => s.id), mainSourceId: mainId }),
    });
    setMerging(false);
    if (res.ok) {
      onMerged();
    } else {
      const d = await res.json();
      setError(d.error ?? "Merge failed");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "#FDFAF6", borderRadius: 10, padding: 28, width: 520, maxWidth: "90vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1F1A13", marginBottom: 6 }}>
          Merge Sources
        </h2>
        <p style={{ fontSize: 13, color: "#7A6E61", marginBottom: 20 }}>
          Select which source becomes the main entry. The text of all others will be appended to it. Idea links are transferred to the main source.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {sources.map((s) => {
            const isMain = s.id === mainId;
            return (
              <label key={s.id} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 12px", borderRadius: 7, cursor: "pointer",
                border: isMain ? "2px solid #C8892E" : "1px solid #D8CFBF",
                background: isMain ? "#FDF3E3" : "#F4EFE6",
                transition: "border 0.1s, background 0.1s",
              }}>
                <input
                  type="radio"
                  name="mainSource"
                  value={s.id}
                  checked={isMain}
                  onChange={() => setMainId(s.id)}
                  style={{ marginTop: 2, accentColor: "#C8892E", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <PlatformBadge platform={s.platform as Platform} />
                    <span style={{ fontSize: 11, color: "#A89C8E" }}>
                      {PLATFORM_LABELS[s.platform as Platform]}
                    </span>
                    {isMain && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: "#C8892E",
                        border: "1px solid #C8892E", borderRadius: 3,
                        padding: "1px 5px", letterSpacing: "0.06em",
                      }}>MAIN</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12, color: "#1F1A13", lineHeight: 1.5,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  } as React.CSSProperties}>
                    {s.rawText?.slice(0, 120) || s.url.slice(0, 80)}
                    {(s.rawText?.length ?? 0) > 120 && "…"}
                  </div>
                  <div style={{ fontSize: 11, color: "#A89C8E", marginTop: 4 }}>
                    {s.url.slice(0, 60)}{s.url.length > 60 && "…"}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#B0301A", background: "#FDE8E4",
            border: "1px solid #F0B8B0", borderRadius: 5, padding: "6px 10px", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={doMerge} disabled={merging}>
            {merging ? "Merging…" : `Merge ${sources.length} Sources`}
          </Button>
        </div>
      </div>
    </div>
  );
}
