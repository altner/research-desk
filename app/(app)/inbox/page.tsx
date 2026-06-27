"use client";

import { useEffect, useState, useCallback } from "react";
import { PlatformBadge, StatusBadge, LocationCrumb, Button, CategoryBadge } from "@/components/ui";
import type { Source, Location, IdeaCategory, Platform } from "@/lib/types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/lib/types";
import CaptureModal from "@/components/CaptureModal";
import IdeaLinkModal from "@/components/IdeaLinkModal";

const PLATFORMS: Platform[] = ["reddit", "tiktok", "instagram", "facebook", "youtube", "forum", "other"];

export default function InboxPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [showLinkIdea, setShowLinkIdea] = useState(false);
  const [linkTargetIds, setLinkTargetIds] = useState<string[]>([]);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("new");
  const [filterSearch, setFilterSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterStatus) params.set("status", filterStatus);
    else params.set("includeMerged", "false");
    if (filterSearch) params.set("q", filterSearch);
    const res = await fetch(`/api/sources?${params}`);
    const data = await res.json();
    setSources(data);
    setLoading(false);
  }, [filterPlatform, filterStatus, filterSearch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!activeId) { setActiveSource(null); return; }
    fetch(`/api/sources/${activeId}`)
      .then((r) => r.json())
      .then(setActiveSource);
  }, [activeId]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === sources.length) setSelected(new Set());
    else setSelected(new Set(sources.map((s) => s.id)));
  };

  const discard = async (ids: string[]) => {
    await fetch("/api/sources/bulk-discard", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceIds: ids }),
    });
    setSelected(new Set());
    if (ids.includes(activeId ?? "")) setActiveId(null);
    load();
  };

  const openLinkIdea = (ids: string[]) => {
    setLinkTargetIds(ids);
    setShowLinkIdea(true);
  };

  const doMerge = async () => {
    if (selected.size < 2) return;
    const ids = Array.from(selected);
    await fetch("/api/sources/merge", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceIds: ids, mainSourceId: ids[0] }),
    });
    setSelected(new Set());
    load();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1F1A13" }}>Inbox</h1>
        <span style={{
          background: "#C8892E", color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "1px 7px", borderRadius: 99,
        }}>{sources.length}</span>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#A89C8E" }}
            width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search sources..."
            style={{
              paddingLeft: 28, paddingRight: 10, height: 32, fontSize: 13,
              border: "1px solid #D8CFBF", borderRadius: 6, background: "#FDFAF6",
              outline: "none", width: 200,
            }}
          />
        </div>

        {/* Filters */}
        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}
          style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">Platform</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="linked_to_idea">Linked to idea</option>
          <option value="discarded">Discarded</option>
          <option value="merged">Merged</option>
        </select>

        <Button onClick={() => setShowCapture(true)}>+ New Source</Button>
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div style={{
          padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
          background: "#F4EFE6", borderBottom: "1px solid #D8CFBF", flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1F1A13", marginRight: 4 }}>
            {selected.size} selected
          </span>
          <Button onClick={() => openLinkIdea(Array.from(selected))}>Create Idea</Button>
          <Button variant="secondary" onClick={() => openLinkIdea(Array.from(selected))}>Add to Idea</Button>
          {selected.size >= 2 && (
            <Button variant="secondary" onClick={doMerge}>Merge</Button>
          )}
          <Button variant="danger" onClick={() => discard(Array.from(selected))}>Discard</Button>
        </div>
      )}

      {/* Body: list + detail */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* List */}
        <div style={{
          width: 380, flexShrink: 0, overflow: "auto",
          borderRight: "1px solid #D8CFBF",
        }}>
          {/* Select-all row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px", borderBottom: "1px solid #D8CFBF",
            color: "#7A6E61", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={selected.size === sources.length && sources.length > 0}
                onChange={selectAll} style={{ width: 14, height: 14, accentColor: "#C8892E" }} />
              Select all
            </label>
            <span>{sources.length} entries</span>
          </div>

          {loading && (
            <div style={{ padding: 20, color: "#A89C8E", fontSize: 13 }}>Loading...</div>
          )}

          {!loading && sources.map((s) => (
            <SourceRow
              key={s.id}
              source={s}
              active={s.id === activeId}
              checked={selected.has(s.id)}
              onCheck={() => toggleSelect(s.id)}
              onClick={() => setActiveId(s.id === activeId ? null : s.id)}
            />
          ))}

          {!loading && sources.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#A89C8E", fontSize: 13 }}>
              No sources found
            </div>
          )}
        </div>

        {/* Detail */}
        <div style={{ flex: 1, overflow: "auto", background: "#FDFAF6" }}>
          {activeSource ? (
            <SourceDetail
              source={activeSource}
              onDiscard={() => discard([activeSource.id])}
              onLinkIdea={() => openLinkIdea([activeSource.id])}
              onRefresh={() => {
                load();
                fetch(`/api/sources/${activeSource.id}`).then((r) => r.json()).then(setActiveSource);
              }}
            />
          ) : (
            <div style={{
              height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#A89C8E", fontSize: 14,
            }}>
              Select a source to view
            </div>
          )}
        </div>
      </div>

      {showCapture && (
        <CaptureModal onClose={() => setShowCapture(false)} onSaved={() => { load(); setShowCapture(false); }} />
      )}
      {showLinkIdea && (
        <IdeaLinkModal
          sourceIds={linkTargetIds}
          onClose={() => setShowLinkIdea(false)}
          onSaved={() => { load(); setShowLinkIdea(false); setSelected(new Set()); }}
        />
      )}
    </div>
  );
}

function SourceRow({
  source, active, checked, onCheck, onClick,
}: {
  source: Source; active: boolean; checked: boolean; onCheck: () => void; onClick: () => void;
}) {
  const date = new Date(source.capturedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "flex-start", gap: 8,
        padding: "10px 14px",
        background: active ? "#EDE6D8" : "transparent",
        borderBottom: "1px solid #E8E0D0",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      <div onClick={(e) => { e.stopPropagation(); onCheck(); }} style={{ paddingTop: 2 }}>
        <input type="checkbox" checked={checked} onChange={onCheck}
          style={{ width: 14, height: 14, accentColor: "#C8892E", cursor: "pointer" }}
          onClick={(e) => e.stopPropagation()} />
      </div>
      <PlatformBadge platform={source.platform as Platform} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1F1A13", lineHeight: 1.4, marginBottom: 3 }}>
          {source.rawText?.slice(0, 80) || source.url.slice(0, 60)}
          {(source.rawText?.length ?? 0) > 80 && "…"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {source.location && <LocationCrumb location={source.location as Location} />}
          <span style={{ fontSize: 11, color: "#A89C8E" }}>{date}</span>
          <StatusBadge status={source.status as import("@/lib/types").SourceStatus} />
          {(source as Source & { _hasDuplicate?: boolean })._hasDuplicate && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 2,
              color: "#C8892E", border: "1px solid #C8892E", letterSpacing: "0.05em",
            }}>≈ DUPLICATE</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceDetail({
  source, onDiscard, onLinkIdea, onRefresh,
}: {
  source: Source; onDiscard: () => void; onLinkIdea: () => void; onRefresh: () => void;
}) {
  const updateStatus = async (status: string) => {
    await fetch(`/api/sources/${source.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onRefresh();
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PlatformBadge platform={source.platform as Platform} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7A6E61", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {PLATFORM_LABELS[source.platform as Platform]}
            </div>
            <div style={{ fontSize: 12, color: "#A89C8E" }}>
              {new Date(source.capturedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <StatusBadge status={source.status as import("@/lib/types").SourceStatus} />
      </div>

      {/* Topic area */}
      {source.location && (
        <div style={{ marginBottom: 12 }}>
          <LocationCrumb location={source.location as Location} />
        </div>
      )}

      {/* Note text */}
      {source.rawText && (
        <div style={{
          background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 6,
          padding: "12px 14px", fontSize: 14, lineHeight: 1.65, color: "#1F1A13",
          marginBottom: 12, whiteSpace: "pre-wrap",
        }}>
          {source.rawText}
        </div>
      )}

      {/* URL */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 6,
        padding: "8px 12px", marginBottom: 16,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M5.5 7.5a3.5 3.5 0 005 0l1-1a3.536 3.536 0 10-5-5l-.5.5"
            stroke="#C8892E" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M8.5 6.5a3.5 3.5 0 00-5 0l-1 1a3.536 3.536 0 105 5l.5-.5"
            stroke="#C8892E" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <a href={source.url} target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: "#C8892E", wordBreak: "break-all" }}>
          {source.url}
        </a>
      </div>

      {/* Research trail */}
      {(source.originSource || (source.derivedSources?.length ?? 0) > 0) && (
        <div style={{
          background: "#F9F5EE", border: "1px solid #E0D8C8", borderRadius: 6,
          padding: "12px 14px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#A89C8E",
            textTransform: "uppercase", marginBottom: 10 }}>
            Research Trail
          </div>
          {source.originSource && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#7A6E61", marginBottom: 4 }}>● Current source</div>
              <div style={{ paddingLeft: 14, fontSize: 12, color: "#A89C8E" }}>
                Derived from: {source.originSource.platform.toUpperCase()} ·{" "}
                {new Date(source.originSource.capturedAt).toLocaleDateString("en-US")}
              </div>
            </div>
          )}
          {(source.derivedSources?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "#A89C8E", marginTop: 4 }}>
                Led to {source.derivedSources!.length} more source{source.derivedSources!.length !== 1 ? "s" : ""}
              </div>
              {source.derivedSources!.map((d) => (
                <div key={d.id} style={{ paddingLeft: 14, fontSize: 12, color: "#A89C8E" }}>
                  ◦ Source: {d.platform.toUpperCase()} ·{" "}
                  {new Date(d.capturedAt).toLocaleDateString("en-US")}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Linked ideas */}
      {(source.ideaSources?.length ?? 0) > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: 8 }}>Linked Ideas</div>
          {source.ideaSources!.map(({ idea }) => (
            <div key={idea.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px", background: "#F4EFE6", borderRadius: 5,
              marginBottom: 4, fontSize: 13,
            }}>
              <CategoryBadge category={idea.category as IdeaCategory} />
              <span style={{ fontWeight: 500 }}>{idea.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={onLinkIdea}>+ Add to Idea</Button>
        <Button variant="secondary" onClick={() => updateStatus("reviewed")}>Mark as reviewed</Button>
        <Button variant="danger" onClick={onDiscard}>Discard</Button>
      </div>
    </div>
  );
}
