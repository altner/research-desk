"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui";
import type { PromptTemplate, LocationType } from "@/lib/types";
import { LOCATION_TYPE_LABELS } from "@/lib/types";

// ─── Shared styles ───────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid #D8CFBF", borderRadius: 5, background: "#F4EFE6",
  outline: "none", color: "#1F1A13",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#7A6E61",
  letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5,
};

// ─── Template variable docs ───────────────────────────────────────────────────

const VARIABLE_DOCS = [
  { v: "{{title}}", desc: "Idea title" },
  { v: "{{category}}", desc: "Category label" },
  { v: "{{area}}", desc: "Topic area / location path" },
  { v: "{{sourceCount}}", desc: "Number of linked sources" },
  { v: "{{credibility}}", desc: "Credibility level" },
  { v: "{{summary}}", desc: "Topic summary" },
  { v: "{{researchNotes}}", desc: "Research notes (empty if none)" },
  { v: "{{date}}", desc: "Current month + year" },
];

// ─── Location flat type ───────────────────────────────────────────────────────

interface LocationFlat {
  id: string;
  type: string;
  parentId: string | null;
  nameDe: string;
  nameEn: string;
  nameTh: string | null;
  slug: string;
  parent?: { nameDe: string; slug: string; type: string } | null;
}

// ─── Settings page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "locations">("templates");
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const loadTemplates = useCallback(() =>
    fetch("/api/templates").then((r) => r.json()).then(setTemplates), []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const startNew = () => setEditingId("new");
  const cancel = () => setEditingId(null);

  const save = async (data: Partial<PromptTemplate> & { id?: string }) => {
    if (data.id) {
      await fetch(`/api/templates/${data.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/templates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    await loadTemplates();
    setEditingId(null);
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/templates/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await loadTemplates();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    await loadTemplates();
  };

  const TABS: { key: "templates" | "locations"; label: string }[] = [
    { key: "templates", label: "Prompt Templates" },
    { key: "locations", label: "Topic Areas" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Settings</h1>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, marginLeft: 16 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setEditingId(null); }}
              style={{
                padding: "0 16px", height: 40, fontSize: 13, fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                color: activeTab === tab.key ? "#C8892E" : "#7A6E61",
                borderBottom: activeTab === tab.key ? "2px solid #C8892E" : "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        {activeTab === "templates" && (
          <Button onClick={startNew} disabled={editingId !== null}>+ New Template</Button>
        )}
      </div>

      {/* Templates tab */}
      {activeTab === "templates" && (
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Variable reference */}
          <div style={{
            background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 8,
            padding: "12px 16px", marginBottom: 24, maxWidth: 860,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 10 }}>Available Template Variables</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px" }}>
              {VARIABLE_DOCS.map(({ v, desc }) => (
                <div key={v} style={{ fontSize: 12, color: "#1F1A13" }}>
                  <code style={{ background: "#E8E0D0", padding: "1px 5px", borderRadius: 3,
                    fontSize: 11, fontFamily: "monospace", color: "#C8892E" }}>{v}</code>
                  {" "}<span style={{ color: "#7A6E61" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New template form */}
          {editingId === "new" && (
            <TemplateForm onSave={(data) => save(data)} onCancel={cancel} />
          )}

          {/* Template list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
            {templates.map((t) =>
              editingId === t.id ? (
                <TemplateForm
                  key={t.id}
                  initial={t}
                  onSave={(data) => save({ ...data, id: t.id })}
                  onCancel={cancel}
                />
              ) : (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={() => setEditingId(t.id)}
                  onSetDefault={() => setDefault(t.id)}
                  onDelete={() => del(t.id)}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Topic Areas tab */}
      {activeTab === "locations" && (
        <LocationsTab templates={templates} onTemplatesChange={loadTemplates} />
      )}
    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onEdit, onSetDefault, onDelete }: {
  template: PromptTemplate;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#FDFAF6", border: `1px solid ${template.isDefault ? "#C8892E" : "#E5DDD0"}`,
      borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1F1A13" }}>{template.name}</span>
              {template.isDefault && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3,
                  background: "#C8892E", color: "#fff", letterSpacing: "0.06em",
                }}>DEFAULT</span>
              )}
              {template.location && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 3,
                  background: "rgba(200,137,46,0.12)", color: "#C8892E", border: "1px solid rgba(200,137,46,0.3)",
                }}>
                  📍 {template.location.nameEn || template.location.nameDe}
                </span>
              )}
            </div>
            {template.description && (
              <div style={{ fontSize: 13, color: "#7A6E61" }}>{template.description}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {!template.isDefault && (
              <Button variant="ghost" size="sm" onClick={onSetDefault}>Set default</Button>
            )}
            <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
            <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: 10, fontSize: 12, color: "#A89C8E", background: "none",
            border: "none", cursor: "pointer", padding: 0, textDecoration: "underline",
          }}
        >
          {expanded ? "Hide prompt ▲" : "Show prompt ▼"}
        </button>
      </div>

      {expanded && (
        <pre style={{
          margin: 0, padding: "12px 16px",
          background: "#F4EFE6", borderTop: "1px solid #E0D8C8",
          fontSize: 12, lineHeight: 1.65, color: "#1F1A13",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "auto",
        }}>
          {template.template}
        </pre>
      )}
    </div>
  );
}

// ─── Template form ────────────────────────────────────────────────────────────

function TemplateForm({ initial, onSave, onCancel }: {
  initial?: PromptTemplate;
  onSave: (data: { name: string; description: string; template: string; isDefault: boolean }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [template, setTemplate] = useState(initial?.template ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim() || !template.trim()) { setError("Name and template are required"); return; }
    onSave({ name, description, template, isDefault });
  };

  return (
    <div style={{
      background: "#FDFAF6", border: "2px solid #C8892E", borderRadius: 8, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#1F1A13" }}>
        {initial ? "Edit Template" : "New Template"}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
          placeholder="e.g. Thailand Reise-Artikel (Deutsch)" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle}
          placeholder="Short description of when to use this template" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Prompt Template *</label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={18}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.65 }}
          placeholder="Write your prompt here. Use {{title}}, {{category}}, {{area}}, {{sourceCount}}, {{credibility}}, {{summary}}, {{researchNotes}}, {{date}} as placeholders."
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)}
            style={{ width: 14, height: 14, accentColor: "#C8892E" }} />
          <span>Set as default template</span>
        </label>
      </div>

      {error && (
        <div style={{ background: "#FDECEA", color: "#C0392B", padding: "8px 12px",
          borderRadius: 5, fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={submit}>Save</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Topic Areas tab ──────────────────────────────────────────────────────────

function LocationsTab({ templates, onTemplatesChange }: {
  templates: PromptTemplate[];
  onTemplatesChange: () => Promise<void>;
}) {
  const [locations, setLocations] = useState<LocationFlat[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});

  const loadLocations = useCallback(async () => {
    const data = await fetch("/api/locations?flat=true").then((r) => r.json());
    setLocations(data);
    // Auto-expand countries on first load
    if (expanded.size === 0) {
      const countries = (data as LocationFlat[]).filter((l) => l.type === "country");
      setExpanded(new Set(countries.map((c) => c.id)));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const childrenMap = new Map<string | null, LocationFlat[]>();
  for (const loc of locations) {
    const key = loc.parentId ?? null;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(loc);
  }

  // Map locationId → template for quick lookup
  const templateByLocation = new Map<string, PromptTemplate>();
  for (const t of templates) {
    if (t.locationId) templateByLocation.set(t.locationId, t);
  }

  const assignTemplate = async (locId: string, templateId: string | "") => {
    // Remove old assignment for this location if any
    const prev = templateByLocation.get(locId);
    if (prev) {
      await fetch(`/api/templates/${prev.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: null }),
      });
    }
    // Set new assignment
    if (templateId) {
      await fetch(`/api/templates/${templateId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: locId }),
      });
    }
    await onTemplatesChange();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    setDeleteError((e) => { const n = { ...e }; delete n[id]; return n; });
    const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setDeleteError((e) => ({ ...e, [id]: data.error ?? "Delete failed" }));
      return;
    }
    await loadLocations();
  };

  const handleSave = async (data: {
    nameEn: string; nameDe: string; nameTh: string;
    type: string; slug: string; parentId: string | null;
    id?: string;
  }) => {
    if (data.id) {
      await fetch(`/api/locations/${data.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameDe: data.nameDe, nameEn: data.nameEn, nameTh: data.nameTh }),
      });
    } else {
      const res = await fetch("/api/locations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type, nameDe: data.nameDe, nameEn: data.nameEn,
          nameTh: data.nameTh || null, slug: data.slug, parentId: data.parentId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return err.error ?? "Save failed";
      }
      // Expand parent so new node is visible
      if (data.parentId) setExpanded((prev) => new Set([...prev, data.parentId!]));
    }
    await loadLocations();
    setEditingId(null);
    setEditingParentId(null);
    return null;
  };

  const renderNode = (loc: LocationFlat, depth: number): React.ReactNode => {
    const children = childrenMap.get(loc.id) ?? [];
    const isExpanded = expanded.has(loc.id);
    const linkedTemplate = templateByLocation.get(loc.id);
    const isEditing = editingId === loc.id;

    return (
      <div key={loc.id}>
        {isEditing ? (
          <div style={{ marginLeft: depth * 20 }}>
            <LocationForm
              initial={loc}
              onSave={(data) => handleSave({ ...data, id: loc.id, parentId: loc.parentId ?? null })}
              onCancel={() => setEditingId(null)}
            />
          </div>
        ) : (
          <div style={{ marginLeft: depth * 20 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
              background: "#FDFAF6", border: "1px solid #E5DDD0", borderRadius: 6,
              marginBottom: 4,
            }}>
              {/* Expand toggle */}
              <button
                onClick={() => toggle(loc.id)}
                style={{
                  width: 18, height: 18, display: "flex", alignItems: "center",
                  justifyContent: "center", background: "none", border: "none",
                  cursor: children.length > 0 ? "pointer" : "default",
                  color: children.length > 0 ? "#7A6E61" : "transparent",
                  fontSize: 9, flexShrink: 0,
                }}
              >
                {children.length > 0 ? (isExpanded ? "▼" : "▶") : "·"}
              </button>

              {/* Type badge */}
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                background: "#EBE5D9", color: "#7A6E61", letterSpacing: "0.05em",
                textTransform: "uppercase", flexShrink: 0,
              }}>
                {LOCATION_TYPE_LABELS[loc.type as LocationType] ?? loc.type}
              </span>

              {/* Name */}
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1F1A13", flex: 1, minWidth: 0 }}>
                {loc.nameEn}
                {loc.nameEn !== loc.nameDe && (
                  <span style={{ color: "#A89C8E", fontWeight: 400, marginLeft: 5 }}>({loc.nameDe})</span>
                )}
              </span>

              {/* Template assignment */}
              <select
                value={linkedTemplate?.id ?? ""}
                onChange={(e) => assignTemplate(loc.id, e.target.value)}
                title="Assign prompt template to this location"
                style={{
                  fontSize: 11, border: "1px solid #D8CFBF", borderRadius: 4,
                  background: linkedTemplate ? "rgba(200,137,46,0.08)" : "#F4EFE6",
                  color: linkedTemplate ? "#C8892E" : "#A89C8E",
                  padding: "2px 6px", maxWidth: 160,
                }}
              >
                <option value="">— no template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {/* Actions */}
              <Button variant="ghost" size="sm" onClick={() => {
                setEditingId("new");
                setEditingParentId(loc.id);
                setExpanded((prev) => new Set([...prev, loc.id]));
              }}>+ Child</Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingId(loc.id)}>Edit</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(loc.id)}>Delete</Button>
            </div>

            {deleteError[loc.id] && (
              <div style={{
                marginLeft: 28, marginBottom: 4, fontSize: 11, color: "#B0301A",
                background: "#FDE8E4", border: "1px solid #F0B8B0", borderRadius: 4,
                padding: "3px 8px",
              }}>
                {deleteError[loc.id]}
              </div>
            )}

            {/* Inline "add child" form */}
            {editingId === "new" && editingParentId === loc.id && (
              <div style={{ marginLeft: 20 }}>
                <LocationForm
                  parentId={loc.id}
                  parentName={loc.nameEn}
                  onSave={(data) => handleSave({ ...data, parentId: loc.id })}
                  onCancel={() => { setEditingId(null); setEditingParentId(null); }}
                />
              </div>
            )}
          </div>
        )}

        {/* Render children if expanded */}
        {isExpanded && children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const roots = childrenMap.get(null) ?? [];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
      {/* Top-level add button */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, maxWidth: 900 }}>
        <Button
          onClick={() => { setEditingId("new"); setEditingParentId(null); }}
          disabled={editingId !== null}
        >
          + Add Top-Level Area
        </Button>
        <span style={{ fontSize: 12, color: "#A89C8E" }}>
          {locations.length} location{locations.length !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Top-level create form */}
      {editingId === "new" && editingParentId === null && (
        <div style={{ marginBottom: 12, maxWidth: 900 }}>
          <LocationForm
            onSave={(data) => handleSave({ ...data, parentId: null })}
            onCancel={() => { setEditingId(null); setEditingParentId(null); }}
          />
        </div>
      )}

      {/* Location tree */}
      <div style={{ maxWidth: 900 }}>
        {roots.map((root) => renderNode(root, 0))}
      </div>
    </div>
  );
}

// ─── Location form ────────────────────────────────────────────────────────────

const ALL_LOCATION_TYPES: LocationType[] = [
  "country", "region", "province", "district", "place",
  "hotel", "restaurant", "shop", "attraction", "other_poi",
];

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function LocationForm({ initial, parentId, parentName, onSave, onCancel }: {
  initial?: LocationFlat;
  parentId?: string | null;
  parentName?: string;
  onSave: (data: { nameEn: string; nameDe: string; nameTh: string; type: string; slug: string }) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [nameDe, setNameDe] = useState(initial?.nameDe ?? "");
  const [nameTh, setNameTh] = useState(initial?.nameTh ?? "");
  const [type, setType] = useState<string>(initial?.type ?? "place");
  const [error, setError] = useState("");

  const autoSlug = initial ? initial.slug : slugify(nameEn || nameDe);

  const submit = async () => {
    if (!nameEn.trim() || !nameDe.trim()) { setError("English and German names are required"); return; }
    if (!type) { setError("Type is required"); return; }
    const result = await onSave({ nameEn, nameDe, nameTh, type, slug: autoSlug });
    if (result) setError(result);
  };

  return (
    <div style={{
      background: "#FDFAF6", border: "2px solid #C8892E", borderRadius: 8,
      padding: "16px 18px", marginBottom: 8,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#1F1A13" }}>
        {initial ? "Edit Location" : `New Location${parentName ? ` under "${parentName}"` : ""}`}
      </div>

      {parentName && !initial && (
        <div style={{ fontSize: 12, color: "#7A6E61", marginBottom: 12 }}>
          Parent: <strong>{parentName}</strong>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>English Name *</label>
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>German Name *</label>
          <input value={nameDe} onChange={(e) => setNameDe(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Thai Name</label>
          <input value={nameTh} onChange={(e) => setNameTh(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Type *</label>
          {initial ? (
            <div style={{ ...inputStyle, color: "#A89C8E", background: "#EBE5D9" }}>
              {LOCATION_TYPE_LABELS[initial.type as LocationType] ?? initial.type}
              <span style={{ fontSize: 11, marginLeft: 6 }}>(not editable)</span>
            </div>
          ) : (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {ALL_LOCATION_TYPES.map((t) => (
                <option key={t} value={t}>{LOCATION_TYPE_LABELS[t]}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!initial && (
        <div style={{ marginBottom: 10, fontSize: 12, color: "#A89C8E" }}>
          Slug:{" "}
          <code style={{ background: "#EBE5D9", padding: "1px 5px", borderRadius: 3, color: "#7A6E61" }}>
            {autoSlug || "—"}
          </code>
        </div>
      )}
      {initial && (
        <div style={{ marginBottom: 10, fontSize: 12, color: "#A89C8E" }}>
          Slug:{" "}
          <code style={{ background: "#EBE5D9", padding: "1px 5px", borderRadius: 3, color: "#7A6E61" }}>
            {initial.slug}
          </code>
          {" "}(not editable)
        </div>
      )}

      {error && (
        <div style={{ background: "#FDECEA", color: "#C0392B", padding: "8px 12px",
          borderRadius: 5, fontSize: 13, marginBottom: 10 }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={submit}>Save</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
