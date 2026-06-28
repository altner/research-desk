"use client";

import { useEffect, useState, useCallback } from "react";
import { PlatformBadge, StatusBadge, LocationCrumb, Button, CategoryBadge } from "@/components/ui";
import type { Source, Location, IdeaCategory, Platform } from "@/lib/types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/lib/types";
import CaptureModal from "@/components/CaptureModal";
import IdeaLinkModal from "@/components/IdeaLinkModal";
import EditSourceModal from "@/components/EditSourceModal";
import MergeModal from "@/components/MergeModal";
import { useApiFetch } from "@/lib/use-api-fetch";

const PLATFORMS: Platform[] = ["reddit", "tiktok", "instagram", "facebook", "youtube", "forum", "other"];

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: (Folder & { _count: { sources: number } })[];
  _count: { sources: number };
}

export default function InboxPage() {
  const apiFetch = useApiFetch();
  const [sources, setSources] = useState<Source[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string>("none"); // "none" = unfiled
  const [showCapture, setShowCapture] = useState(false);
  const [showLinkIdea, setShowLinkIdea] = useState(false);
  const [showEditSource, setShowEditSource] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [linkTargetIds, setLinkTargetIds] = useState<string[]>([]);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("new");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const loadFolders = useCallback(async () => {
    const res = await apiFetch("/api/folders");
    const data = await res.json();
    setFolders(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterStatus) params.set("status", filterStatus);
    else params.set("includeMerged", "true");
    if (filterSearch) params.set("q", filterSearch);
    if (filterTag) params.set("tagId", filterTag);
    params.set("folderId", activeFolderId);
    const res = await apiFetch(`/api/sources?${params}`);
    const data = await res.json();
    setSources(data);
    setActiveId((prev) => (prev && data.some((s: Source) => s.id === prev) ? prev : null));
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPlatform, filterStatus, filterSearch, filterTag, activeFolderId]);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    apiFetch("/api/tags").then((r) => r.json()).then(setAllTags);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) { setActiveSource(null); return; }
    apiFetch(`/api/sources/${activeId}`)
      .then((r) => r.json())
      .then(setActiveSource);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    await apiFetch("/api/sources/bulk-discard", {
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

  const doMerge = () => {
    if (selected.size < 2) return;
    setShowMerge(true);
  };

  const moveToFolder = async (sourceIds: string[], folderId: string | null) => {
    await Promise.all(sourceIds.map((id) =>
      apiFetch(`/api/sources/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      })
    ));
    setSelected(new Set());
    if (sourceIds.includes(activeId ?? "")) setActiveId(null);
    load();
    loadFolders();
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await apiFetch("/api/folders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    setNewFolderName("");
    setAddingFolder(false);
    loadFolders();
  };

  const renameFolder = async (id: string) => {
    if (!renameName.trim()) return;
    await apiFetch(`/api/folders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameName.trim() }),
    });
    setRenamingId(null);
    loadFolders();
  };

  const deleteFolder = async (id: string) => {
    await apiFetch(`/api/folders/${id}`, { method: "DELETE" });
    if (activeFolderId === id) setActiveFolderId("none");
    loadFolders();
    load();
  };

  const totalUnfiled = sources.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1F1A13" }}>Sources</h1>
        <div style={{ flex: 1 }} />

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

        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}
          style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">Platform</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">All</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="linked_to_idea">Linked to idea</option>
          <option value="discarded">Discarded</option>
          <option value="merged">Merged</option>
        </select>

        {allTags.length > 0 && (
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
            style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
              background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
            <option value="">All Tags</option>
            {allTags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}

        <Button onClick={() => setShowCapture(true)}>+ New Source</Button>
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div style={{
          padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
          background: "#F4EFE6", borderBottom: "1px solid #D8CFBF", flexShrink: 0, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1F1A13", marginRight: 4 }}>
            {selected.size} selected
          </span>
          <Button onClick={() => openLinkIdea(Array.from(selected))}>Create Idea</Button>
          <Button variant="secondary" onClick={() => openLinkIdea(Array.from(selected))}>Add to Idea</Button>
          {selected.size >= 2 && (
            <Button variant="secondary" onClick={doMerge}>Merge</Button>
          )}
          {/* Move to folder */}
          <select
            onChange={(e) => { if (e.target.value) moveToFolder(Array.from(selected), e.target.value === "none" ? null : e.target.value); e.target.value = ""; }}
            style={{ height: 30, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
              background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}
            defaultValue="">
            <option value="" disabled>Move to folder…</option>
            <option value="none">— Inbox</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            {folders.flatMap((f) => f.children.map((c) => (
              <option key={c.id} value={c.id}>  {f.name} / {c.name}</option>
            )))}
          </select>
          <Button variant="danger" onClick={() => discard(Array.from(selected))}>Discard</Button>
        </div>
      )}

      {/* 3-column body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Column 1: Folders */}
        <div style={{
          width: 200, flexShrink: 0, overflow: "auto",
          borderRight: "1px solid #D8CFBF", background: "#F4EFE6",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "10px 10px 6px", fontSize: 10, fontWeight: 700,
            color: "#A89C8E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Folders
          </div>

          {/* All / Unfiled */}
          <FolderRow
            label="Inbox"
            active={activeFolderId === "none"}
            onClick={() => setActiveFolderId("none")}
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 3.5h12M1 7h8M1 10.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            }
          />

          {folders.map((folder) => (
            <div key={folder.id}>
              <FolderRow
                label={renamingId === folder.id ? "" : folder.name}
                count={folder._count.sources}
                active={activeFolderId === folder.id}
                onClick={() => { if (renamingId !== folder.id) setActiveFolderId(folder.id); }}
                onRename={() => { setRenamingId(folder.id); setRenameName(folder.name); }}
                onDelete={() => deleteFolder(folder.id)}
                renaming={renamingId === folder.id}
                renameName={renameName}
                onRenameChange={setRenameName}
                onRenameSubmit={() => renameFolder(folder.id)}
                onRenameCancel={() => setRenamingId(null)}
              />
              {folder.children.map((child) => (
                <FolderRow
                  key={child.id}
                  label={renamingId === child.id ? "" : child.name}
                  count={child._count.sources}
                  active={activeFolderId === child.id}
                  indent
                  onClick={() => { if (renamingId !== child.id) setActiveFolderId(child.id); }}
                  onRename={() => { setRenamingId(child.id); setRenameName(child.name); }}
                  onDelete={() => deleteFolder(child.id)}
                  renaming={renamingId === child.id}
                  renameName={renameName}
                  onRenameChange={setRenameName}
                  onRenameSubmit={() => renameFolder(child.id)}
                  onRenameCancel={() => setRenamingId(null)}
                />
              ))}
            </div>
          ))}

          {/* New folder */}
          <div style={{ padding: "6px 8px", marginTop: 4 }}>
            {addingFolder ? (
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setAddingFolder(false); }}
                  placeholder="Folder name…"
                  style={{ flex: 1, fontSize: 12, padding: "4px 6px", border: "1px solid #D8CFBF",
                    borderRadius: 4, background: "#FDFAF6", outline: "none" }}
                />
                <button onClick={createFolder} style={{ fontSize: 12, padding: "4px 6px",
                  background: "#C8892E", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  +
                </button>
              </div>
            ) : (
              <button onClick={() => setAddingFolder(true)}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none",
                  cursor: "pointer", fontSize: 12, color: "#A89C8E", padding: "4px 2px",
                  display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New Folder
              </button>
            )}
          </div>
        </div>

        {/* Column 2: Source list */}
        <div style={{ width: 360, flexShrink: 0, overflow: "auto", borderRight: "1px solid #D8CFBF" }}>
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

          {loading && <div style={{ padding: 20, color: "#A89C8E", fontSize: 13 }}>Loading...</div>}

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

        {/* Column 3: Detail */}
        <div style={{ flex: 1, overflow: "auto", background: "#FDFAF6" }}>
          {activeSource ? (
            <SourceDetail
              source={activeSource}
              folders={folders}
              allTags={allTags}
              onDiscard={() => discard([activeSource.id])}
              onLinkIdea={() => openLinkIdea([activeSource.id])}
              onEdit={() => setShowEditSource(true)}
              onMoveToFolder={(folderId) => moveToFolder([activeSource.id], folderId)}
              onOpenSource={(id) => setActiveId(id)}
              onRefresh={() => {
                load();
                loadFolders();
                apiFetch(`/api/sources/${activeSource.id}`).then((r) => r.json()).then(setActiveSource);
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
      {showMerge && (
        <MergeModal
          sources={sources.filter((s) => selected.has(s.id))}
          onClose={() => setShowMerge(false)}
          onMerged={() => { setShowMerge(false); setSelected(new Set()); load(); }}
        />
      )}
      {showEditSource && activeSource && (
        <EditSourceModal
          source={activeSource}
          onClose={() => setShowEditSource(false)}
          onSaved={() => {
            setShowEditSource(false);
            load();
            loadFolders();
            apiFetch(`/api/sources/${activeSource.id}`).then((r) => r.json()).then(setActiveSource);
          }}
        />
      )}
    </div>
  );
}

function FolderRow({
  label, count, active, indent, onClick, onRename, onDelete, icon,
  renaming, renameName, onRenameChange, onRenameSubmit, onRenameCancel,
}: {
  label: string; count?: number; active: boolean; indent?: boolean;
  onClick: () => void; onRename?: () => void; onDelete?: () => void;
  icon?: React.ReactNode;
  renaming?: boolean; renameName?: string;
  onRenameChange?: (v: string) => void;
  onRenameSubmit?: () => void;
  onRenameCancel?: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: `5px 8px 5px ${indent ? 20 : 8}px`,
        background: active ? "#EDE6D8" : hover ? "#EBE5D9" : "transparent",
        cursor: "pointer", borderRadius: 5, margin: "1px 4px",
        fontSize: 13,
      }}
      onClick={onClick}
    >
      {icon || (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M1 3.5a1 1 0 011-1h3.5l1 1.5H12a1 1 0 011 1V11a1 1 0 01-1 1H2a1 1 0 01-1-1V3.5z"
            stroke={active ? "#C8892E" : "#A89C8E"} strokeWidth="1.3"/>
        </svg>
      )}

      {renaming ? (
        <input
          autoFocus
          value={renameName}
          onChange={(e) => onRenameChange?.(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onRenameSubmit?.(); if (e.key === "Escape") onRenameCancel?.(); }}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, fontSize: 12, padding: "2px 4px", border: "1px solid #C8892E",
            borderRadius: 3, background: "#FDFAF6", outline: "none" }}
        />
      ) : (
        <span style={{ flex: 1, color: active ? "#1F1A13" : "#3D3530", fontWeight: active ? 600 : 400,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
      )}

      {count !== undefined && !renaming && (
        <span style={{ fontSize: 10, color: "#A89C8E", flexShrink: 0 }}>{count}</span>
      )}

      {hover && !renaming && onRename && (
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={onRename} title="Rename"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#A89C8E",
              padding: "1px 3px", borderRadius: 3, fontSize: 11 }}>✎</button>
          <button onClick={onDelete} title="Delete"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#C0392B",
              padding: "1px 3px", borderRadius: 3, fontSize: 11 }}>×</button>
        </div>
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
        borderLeft: active ? "3px solid #C8892E" : "3px solid transparent",
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
          {(source as Source & { title?: string | null }).title
            || source.rawText?.slice(0, 80)
            || source.url.slice(0, 60)}
          {!(source as Source & { title?: string | null }).title && (source.rawText?.length ?? 0) > 80 && "…"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {source.location && <LocationCrumb location={source.location as Location} />}
          {(source as Source & { sourceTags?: { tag: { id: string; name: string; color: string } }[] }).sourceTags?.map(({ tag }) => (
            <span key={tag.id} style={{
              fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 20,
              color: tag.color, background: tag.color + "22", border: `1px solid ${tag.color}44`,
            }}>{tag.name}</span>
          ))}
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
  source, folders, allTags, onDiscard, onLinkIdea, onEdit, onMoveToFolder, onOpenSource, onRefresh,
}: {
  source: Source; folders: Folder[];
  allTags: { id: string; name: string; color: string }[];
  onDiscard: () => void; onLinkIdea: () => void; onEdit: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  onOpenSource: (id: string) => void;
  onRefresh: () => void;
}) {
  const apiFetch = useApiFetch();

  const updateStatus = async (status: string) => {
    await fetch(`/api/sources/${source.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onRefresh();
  };

  const sourceTags = (source as Source & { sourceTags?: { tag: { id: string; name: string; color: string } }[] }).sourceTags ?? [];
  const currentTagIds = new Set(sourceTags.map((st) => st.tag.id));

  const toggleTag = async (tagId: string) => {
    const next = new Set(currentTagIds);
    if (next.has(tagId)) next.delete(tagId); else next.add(tagId);
    await apiFetch(`/api/sources/${source.id}/tags`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds: Array.from(next) }),
    });
    onRefresh();
  };

  const sourceWithFolder = source as Source & { folderId?: string | null; mergedInto?: { id: string; url: string; platform: string } | null };

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

      {sourceWithFolder.mergedInto && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          padding: "8px 12px", borderRadius: 6,
          background: "#F4EFE6", border: "1px solid #E0D8C8",
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M3 7h8M7 3l4 4-4 4" stroke="#A89C8E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, color: "#7A6E61" }}>Merged into</span>
          <PlatformBadge platform={sourceWithFolder.mergedInto.platform as Platform} />
          <button
            onClick={() => onOpenSource(sourceWithFolder.mergedInto!.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "#C8892E", padding: 0, textAlign: "left", wordBreak: "break-all",
            }}
          >
            {sourceWithFolder.mergedInto.url.slice(0, 60)}{sourceWithFolder.mergedInto.url.length > 60 && "…"}
          </button>
        </div>
      )}

      {/* Folder indicator */}
      {sourceWithFolder.folderId && (
        <div style={{ marginBottom: 10 }}>
          {(() => {
            const allFolders = [...folders, ...folders.flatMap((f) => f.children)];
            const f = allFolders.find((f) => f.id === sourceWithFolder.folderId);
            return f ? (
              <span style={{ fontSize: 11, color: "#7A6E61", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3.5a1 1 0 011-1h3.5l1 1.5H12a1 1 0 011 1V11a1 1 0 01-1 1H2a1 1 0 01-1-1V3.5z"
                    stroke="#A89C8E" strokeWidth="1.3"/>
                </svg>
                {f.name}
              </span>
            ) : null;
          })()}
        </div>
      )}

      {(source as Source & { title?: string | null }).title && (
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1F1A13", marginBottom: 12 }}>
          {(source as Source & { title?: string | null }).title}
        </div>
      )}

      {source.location && (
        <div style={{ marginBottom: 12 }}>
          <LocationCrumb location={source.location as Location} />
        </div>
      )}

      {source.rawText && (
        <div style={{
          background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 6,
          padding: "12px 14px", fontSize: 14, lineHeight: 1.65, color: "#1F1A13",
          marginBottom: 12, whiteSpace: "pre-wrap",
        }}>
          {source.rawText}
        </div>
      )}

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

      {((source as Source & { mergedFrom?: { id: string; url: string; platform: string }[] }).mergedFrom?.length ?? 0) > 0 && (
        <div style={{
          background: "#F9F5EE", border: "1px solid #E0D8C8", borderRadius: 6,
          padding: "12px 14px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#A89C8E",
            textTransform: "uppercase", marginBottom: 10 }}>Merged Sources</div>
          {(source as Source & { mergedFrom?: { id: string; url: string; platform: string }[] }).mergedFrom!.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <PlatformBadge platform={m.platform as Platform} />
              <a href={m.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: "#C8892E", wordBreak: "break-all" }}>
                {m.url.slice(0, 70)}{m.url.length > 70 && "…"}
              </a>
            </div>
          ))}
        </div>
      )}

      {(source.originSource || (source.derivedSources?.length ?? 0) > 0) && (
        <div style={{
          background: "#F9F5EE", border: "1px solid #E0D8C8", borderRadius: 6,
          padding: "12px 14px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#A89C8E",
            textTransform: "uppercase", marginBottom: 10 }}>Research Trail</div>
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
                  ◦ {d.platform.toUpperCase()} · {new Date(d.capturedAt).toLocaleDateString("en-US")}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(source.ideaSources?.length ?? 0) > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: 8 }}>Linked Ideas</div>
          {source.ideaSources!.map(({ idea }) => {
            const ideaWithArticles = idea as typeof idea & { articles?: { id: string; title: string; publishStatus: string }[] };
            const article = ideaWithArticles.articles?.[0];
            return (
              <div key={idea.id} style={{
                background: "#F4EFE6", borderRadius: 5, marginBottom: 4,
                border: "1px solid #E0D8C8", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 13 }}>
                  <CategoryBadge category={idea.category as IdeaCategory} />
                  <span style={{ fontWeight: 500, flex: 1 }}>{idea.title}</span>
                </div>
                {article && (
                  <a href={`/articles/${article.id}`} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px 6px 10px", fontSize: 11, color: "#C8892E",
                    textDecoration: "none", borderTop: "1px solid #E0D8C8",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {article.title.slice(0, 60)}{article.title.length > 60 ? "…" : ""}
                    <span style={{ marginLeft: "auto", color: "#A89C8E", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>
                      {article.publishStatus}
                    </span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: 8 }}>Tags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTags.map((tag) => {
              const active = currentTagIds.has(tag.id);
              return (
                <button key={tag.id} onClick={() => toggleTag(tag.id)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${active ? tag.color : "#D8CFBF"}`,
                  background: active ? tag.color + "22" : "transparent",
                  color: active ? tag.color : "#7A6E61",
                  cursor: "pointer", transition: "all 0.1s",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: tag.color,
                    display: "inline-block", flexShrink: 0 }} />
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Button onClick={onLinkIdea}>+ Add to Idea</Button>
        <Button variant="secondary" onClick={onEdit}>Edit</Button>
        <Button variant="secondary" onClick={() => updateStatus("reviewed")}>Mark as reviewed</Button>
        <select
          value={sourceWithFolder.folderId ?? ""}
          onChange={(e) => onMoveToFolder(e.target.value || null)}
          style={{ height: 30, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#F4EFE6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">— Inbox</option>
          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          {folders.flatMap((f) => f.children.map((c) => (
            <option key={c.id} value={c.id}>{f.name} / {c.name}</option>
          )))}
        </select>
        <Button variant="danger" onClick={onDiscard}>Discard</Button>
      </div>
    </div>
  );
}
