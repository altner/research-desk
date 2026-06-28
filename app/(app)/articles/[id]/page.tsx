"use client";

import { use, useEffect, useState, useRef } from "react";
import MarkdownPreview from "@/components/MarkdownPreview";
import { LocationCrumb, CredibilityBadge, Button, PlatformBadge } from "@/components/ui";
import type { Article, Location, Credibility, Platform } from "@/lib/types";

type PublishStatus = "draft" | "in_review" | "published";

const STATUS_TABS: { value: PublishStatus; label: string }[] = [
  { value: "draft", label: "DRAFT" },
  { value: "in_review", label: "IN REVIEW" },
  { value: "published", label: "PUBLISHED" },
];

export default function ArtikelEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((a) => { setArticle(a); setBody(a.bodyMarkdown); });
  }, [id]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/articles/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodyMarkdown: body }),
    });
    setSaving(false);
    setDirty(false);
  };

  const setStatus = async (status: PublishStatus) => {
    const res = await fetch(`/api/articles/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishStatus: status }),
    });
    const updated = await res.json();
    setArticle((prev) => prev ? { ...prev, publishStatus: updated.publishStatus } : prev);
  };

  const doExport = async () => {
    setExporting(true);
    setExportMsg("");
    const res = await fetch(`/api/articles/${id}/export`, { method: "POST" });
    const d = await res.json();
    setExporting(false);
    if (res.ok) setExportMsg(`✓ Exported as ${d.slug}.json`);
    else setExportMsg(`Error: ${d.error}`);
  };

  const insertFormat = (before: string, after = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    setDirty(true);
    setTimeout(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = end + before.length;
      ta.focus();
    }, 0);
  };

  if (!article) return <div style={{ padding: 32, color: "#A89C8E" }}>Loading...</div>;

  const isAiDraft = article.generationSource === "ai_draft_human_edited"
    && article.publishStatus === "draft";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 16px", height: 52, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <button onClick={() => window.history.back()} style={{
          background: "none", border: "none", cursor: "pointer", color: "#7A6E61",
          display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 6px",
          borderRadius: 5, flexShrink: 0,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#DDD6C8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1F1A13", truncate: true } as React.CSSProperties}>
            {article.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#A89C8E" }}>
            {article.location && <LocationCrumb location={article.location as Location} />}
            <span>·</span>
            <span>{(article as Article & { idea?: { _count?: { ideaSources: number } } }).idea?._count?.ideaSources ?? 0} sources</span>
            <span>·</span>
            <span>Last edited {new Date(article.updatedAt).toLocaleDateString("en-US")}</span>
            {(article as Article & { idea?: { id: string } }).idea?.id && (
              <>
                <span>·</span>
                <a
                  href={`/ideas/${(article as Article & { idea?: { id: string } }).idea!.id}`}
                  style={{ color: "#C8892E", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  Open Idea
                </a>
              </>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", border: "1px solid #D8CFBF", borderRadius: 6, overflow: "hidden" }}>
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setStatus(tab.value)}
              style={{
                padding: "5px 12px", border: "none", cursor: "pointer",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                background: article.publishStatus === tab.value ? "#1F1A13" : "transparent",
                color: article.publishStatus === tab.value ? "#fff" : "#7A6E61",
                borderRight: tab.value !== "published" ? "1px solid #D8CFBF" : "none",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {article.publishStatus === "published" && (
          <Button variant="secondary" size="sm" onClick={doExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export ↗"}
          </Button>
        )}
      </div>

      {/* KI-Entwurf Warning */}
      {isAiDraft && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 16px", background: "#FFF3DC", borderBottom: "1px solid #F0D8A0",
        }}>
          <span style={{ fontSize: 12, color: "#7A5C1E" }}>
            <strong>AI DRAFT</strong> — Verify all information before publishing. Do not treat as final.
          </span>
          <button onClick={() => setArticle((a) => a ? { ...a, generationSource: "human" } : a)}
            style={{ fontSize: 11, color: "#7A5C1E", background: "none", border: "none", cursor: "pointer",
              textDecoration: "underline" }}>
            Got it
          </button>
        </div>
      )}

      {exportMsg && (
        <div style={{
          padding: "8px 16px", background: "#E8F5F4", borderBottom: "1px solid #B8E0DC",
          fontSize: 12, color: "#1E5C4A",
        }}>{exportMsg}</div>
      )}

      {/* Editor + Preview */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #D8CFBF" }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 2, padding: "6px 12px",
            borderBottom: "1px solid #E5DDD0", background: "#F9F5EE", flexShrink: 0,
          }}>
            {[
              { label: "B", action: () => insertFormat("**", "**"), title: "Bold" },
              { label: "I", action: () => insertFormat("*", "*"), title: "Italic" },
              { label: "H1", action: () => insertFormat("# "), title: "Heading 1" },
              { label: "H2", action: () => insertFormat("## "), title: "Heading 2" },
              { label: "H3", action: () => insertFormat("### "), title: "Heading 3" },
            ].map((t) => (
              <button key={t.label} onClick={t.action} title={t.title}
                style={{
                  padding: "3px 7px", fontSize: t.label.startsWith("H") ? 10 : 12,
                  fontWeight: 700, border: "none", background: "none", cursor: "pointer",
                  color: "#7A6E61", borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#E5DDD0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                {t.label}
              </button>
            ))}
            <div style={{ width: 1, height: 18, background: "#D8CFBF", margin: "0 4px" }} />
            <button onClick={() => insertFormat("[", "](url)")} title="Insert link"
              style={{ padding: "3px 7px", border: "none", background: "none", cursor: "pointer",
                color: "#7A6E61", borderRadius: 4, fontSize: 12 }}>
              🔗
            </button>
            <button onClick={() => insertFormat("\n- ")} title="List"
              style={{ padding: "3px 7px", border: "none", background: "none", cursor: "pointer",
                color: "#7A6E61", borderRadius: 4, fontSize: 12 }}>
              ☰
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: "#A89C8E", marginRight: 4 }}>Markdown</span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => { setBody(e.target.value); setDirty(true); }}
            style={{
              flex: 1, padding: "16px 16px", fontSize: 13, lineHeight: 1.7,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              border: "none", outline: "none", resize: "none",
              background: "#F9F5EE", color: "#1F1A13",
            }}
          />

          {/* Save bar */}
          {dirty && (
            <div style={{
              padding: "8px 12px", display: "flex", gap: 8, alignItems: "center",
              background: "#F4EFE6", borderTop: "1px solid #D8CFBF", flexShrink: 0,
            }}>
              <Button onClick={save} disabled={saving} size="sm">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setBody(article.bodyMarkdown);
                setDirty(false);
              }}>Discard</Button>
            </div>
          )}
        </div>

        {/* Preview + Sources */}
        <div style={{ flex: 1, overflow: "auto", background: "#FDFAF6" }}>
          <div style={{ padding: "16px 24px 32px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
              Preview
            </div>
            <MarkdownPreview markdown={body} />

            {/* Linked Sources */}
            {(() => {
              const sources = (article as Article & {
                idea?: { ideaSources?: { source: { id: string; platform: string; url: string; rawText: string | null; capturedAt: string } }[] }
              }).idea?.ideaSources;
              if (!sources?.length) return null;
              return (
                <div style={{ marginTop: 32, borderTop: "1px solid #E0D8C8", paddingTop: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: 12 }}>
                    Linked Sources ({sources.length})
                  </div>
                  {sources.map(({ source }) => (
                    <div key={source.id} style={{
                      background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 6,
                      padding: "10px 12px", marginBottom: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: source.rawText ? 6 : 0 }}>
                        <PlatformBadge platform={source.platform as Platform} />
                        <a href={source.url} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: "#C8892E", wordBreak: "break-all", flex: 1 }}>
                          {source.url.slice(0, 80)}{source.url.length > 80 ? "…" : ""}
                        </a>
                        <span style={{ fontSize: 11, color: "#A89C8E", flexShrink: 0 }}>
                          {new Date(source.capturedAt).toLocaleDateString("en-US")}
                        </span>
                      </div>
                      {source.rawText && (
                        <div style={{ fontSize: 12, color: "#7A6E61", lineHeight: 1.5,
                          paddingLeft: 4, borderLeft: "2px solid #D8CFBF", marginLeft: 2 }}>
                          {source.rawText.slice(0, 200)}{source.rawText.length > 200 ? "…" : ""}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
