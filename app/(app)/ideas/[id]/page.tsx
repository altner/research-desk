"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { CategoryBadge, LocationCrumb, CredibilityBadge, PlatformBadge, Button } from "@/components/ui";
import type { Idea, IdeaCategory, Location, Platform, Credibility, IdeaStatus, Article } from "@/lib/types";
import { CREDIBILITY_LABELS, IDEA_STATUS_LABELS } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCategories } from "@/lib/use-categories";

const CREDIBILITIES: Credibility[] = ["niedrig", "mittel", "hoch", "bestaetigt"];

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { labelFor, colorFor } = useCategories();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [edit, setEdit] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creatingBlank, setCreatingBlank] = useState(false);
  const [genError, setGenError] = useState("");
  const [templates, setTemplates] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);
  const [templateId, setTemplateId] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((ts) => {
      setTemplates(ts);
      const def = ts.find((t: { isDefault: boolean }) => t.isDefault);
      if (def) setTemplateId(def.id);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/ideas/${id}`).then((r) => r.json()).then(setIdea);
  }, [id]);

  const save = async (updates: Partial<Idea>) => {
    const res = await fetch(`/api/ideas/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setIdea((prev) => ({ ...prev!, ...updated }));
    setEdit(false);
  };

  const generateDraft = async () => {
    setGenerating(true);
    setGenError("");
    const res = await fetch(`/api/ideas/${id}/generate-draft`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: templateId || undefined }),
    });
    const data = await res.json();
    setGenerating(false);
    if (data.article?.id) {
      router.push(`/articles/${data.article.id}`);
    } else {
      setGenError(data.error ?? "Unknown error during generation");
    }
  };

  if (!idea) return <div style={{ padding: 32, color: "#A89C8E" }}>Loading...</div>;

  return (
    <div style={{ padding: 28, maxWidth: 720, overflow: "auto", height: "100%" }}>
      <button onClick={() => window.history.back()} style={{
        background: "none", border: "none", cursor: "pointer", color: "#7A6E61",
        display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 6px",
        borderRadius: 5, marginBottom: 16,
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#DDD6C8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <CategoryBadge category={idea.category} label={labelFor(idea.category)} color={colorFor(idea.category)} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1F1A13", lineHeight: 1.3 }}>{idea.title}</h1>
          {idea.location && (
            <div style={{ marginTop: 8 }}>
              <LocationCrumb location={idea.location as Location} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button variant="secondary" onClick={() => setEdit(!edit)}>Edit</Button>
            {templates.length > 0 && (
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                style={{
                  height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 5,
                  background: "#F4EFE6", padding: "0 8px", color: "#1F1A13", maxWidth: 200,
                }}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            {(idea as Idea & { articles?: Article[] }).articles?.[0]?.id ? (
              <>
                <Button variant="secondary" onClick={() => router.push(`/articles/${(idea as Idea & { articles?: Article[] }).articles![0].id}`)}>
                  Open Article
                </Button>
                <Button onClick={generateDraft} disabled={generating}>
                  {generating ? "Generating…" : "Generate new AI Draft"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={generateDraft} disabled={generating}>
                  {generating ? "Generating…" : "Generate AI Draft"}
                </Button>
                <Button variant="secondary" disabled={creatingBlank} onClick={async () => {
                  setCreatingBlank(true);
                  const res = await fetch(`/api/ideas/${id}/create-article`, { method: "POST" });
                  const data = await res.json();
                  setCreatingBlank(false);
                  if (data.article?.id) router.push(`/articles/${data.article.id}`);
                }}>
                  {creatingBlank ? "Creating…" : "Create blank Article"}
                </Button>
              </>
            )}
          </div>
          {genError && (
            <div style={{ fontSize: 11, color: "#B0301A", background: "#FDE8E4",
              border: "1px solid #F0B8B0", borderRadius: 4, padding: "4px 8px", maxWidth: 280, textAlign: "right" }}>
              {genError}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#F4EFE6", borderRadius: 6, padding: "8px 14px", fontSize: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em",
            textTransform: "uppercase", marginBottom: 4 }}>Status</div>
          <span style={{ fontWeight: 600 }}>{IDEA_STATUS_LABELS[idea.status as IdeaStatus]}</span>
        </div>
        <div style={{ background: "#F4EFE6", borderRadius: 6, padding: "8px 14px", fontSize: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em",
            textTransform: "uppercase", marginBottom: 4 }}>Sources</div>
          <span style={{ fontWeight: 600 }}>{idea.confirmationCount}</span>
        </div>
        <div style={{ background: "#F4EFE6", borderRadius: 6, padding: "8px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em",
            textTransform: "uppercase", marginBottom: 4 }}>Credibility</div>
          <CredibilityBadge credibility={idea.credibility as Credibility} />
        </div>
      </div>

      {/* Edit form */}
      {edit && (
        <EditIdeaForm idea={idea} onSave={save} onCancel={() => setEdit(false)} />
      )}

      {/* Summary */}
      {!edit && (
        <>
          {idea.summary && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em",
                textTransform: "uppercase", marginBottom: 8 }}>Summary</div>
              <div style={{ background: "#F4EFE6", borderRadius: 6, padding: "12px 14px",
                fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {idea.summary}
              </div>
            </div>
          )}
          {idea.researchNotes && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em",
                textTransform: "uppercase", marginBottom: 8 }}>Research Notes</div>
              <div style={{ background: "#F4EFE6", borderRadius: 6, padding: "12px 14px",
                fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {idea.researchNotes}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sources (read-only, for inspiration) */}
      {(idea.ideaSources?.length ?? 0) > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em",
            textTransform: "uppercase", marginBottom: 10 }}>
            Linked Sources ({idea.ideaSources!.length})
          </div>
          {idea.ideaSources!.map(({ source }) => (
            <div key={source.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 6, marginBottom: 6,
            }}>
              <PlatformBadge platform={source.platform as Platform} />
              <a href={source.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: "#C8892E", wordBreak: "break-all" }}>
                {source.url.slice(0, 80)}{source.url.length > 80 && "…"}
              </a>
              <span style={{ fontSize: 11, color: "#A89C8E", marginLeft: "auto", flexShrink: 0 }}>
                {new Date(source.capturedAt).toLocaleDateString("en-US")}
              </span>
              <button
                onClick={async () => {
                  await fetch(`/api/ideas/${id}/sources/${source.id}`, { method: "DELETE" });
                  setIdea((prev) => prev ? {
                    ...prev,
                    ideaSources: prev.ideaSources!.filter((s) => s.source.id !== source.id),
                  } : prev);
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer", color: "#A89C8E",
                  padding: "2px 4px", borderRadius: 4, flexShrink: 0, lineHeight: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#B0301A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A89C8E")}
                title="Remove source"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditIdeaForm({ idea, onSave, onCancel }: {
  idea: Idea; onSave: (updates: Partial<Idea>) => Promise<void>; onCancel: () => void;
}) {
  const { categories } = useCategories();
  const [title, setTitle] = useState(idea.title);
  const [summary, setSummary] = useState(idea.summary);
  const [researchNotes, setResearchNotes] = useState(idea.researchNotes ?? "");
  const [category, setCategory] = useState<string>(idea.category);
  const [credibility, setCredibility] = useState<Credibility>(idea.credibility as Credibility);

  return (
    <div style={{ background: "#F4EFE6", border: "1px solid #D8CFBF", borderRadius: 8,
      padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
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
                : { background: "#FDFAF6", color: "#7A6E61", borderColor: "#D8CFBF" }),
            }}>
              {c.labelDe}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Credibility</label>
        <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
          {CREDIBILITIES.map((c) => (
            <button key={c} onClick={() => setCredibility(c)} style={{
              padding: "3px 9px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700,
              border: "1px solid",
              ...(credibility === c
                ? { background: "#C8892E", color: "#fff", borderColor: "#C8892E" }
                : { background: "#FDFAF6", color: "#7A6E61", borderColor: "#D8CFBF" }),
            }}>
              {CREDIBILITY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
          rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Research Notes</label>
        <textarea value={researchNotes} onChange={(e) => setResearchNotes(e.target.value)}
          rows={4} style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Your own notes for AI generation (no original verbatim text) ..." />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={() => onSave({ title, summary, category: category as IdeaCategory, credibility, researchNotes: researchNotes || null })}>
          Save
        </Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid #D8CFBF", borderRadius: 5, background: "#FDFAF6",
  outline: "none", color: "#1F1A13",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#7A6E61",
  letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5,
};
