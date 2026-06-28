"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";
import type { Project } from "@/lib/types";

const cardStyle: React.CSSProperties = {
  background: "#F4EFE6",
  border: "1px solid #D8CFBF",
  borderRadius: 10,
  padding: "20px 24px",
  cursor: "pointer",
  transition: "box-shadow 0.15s",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  border: "1px solid #D8CFBF",
  borderRadius: 5,
  background: "#fff",
  outline: "none",
  color: "#1F1A13",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#7A6E61",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: 5,
};

export default function ProjectsPage() {
  const { projectId: activeProjectId, setProject } = useProject();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (p: Project) => {
    setProject(p.id, p.name);
    router.push("/dashboard");
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Error creating project");
      setSaving(false);
      return;
    }
    const created: Project = await res.json();
    setProject(created.id, created.name);
    router.push("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EBE5D9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 52, height: 52, background: "#C8892E", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
            <path d="M11 3l1.5 5h5l-4 3 1.5 5L11 13l-4 3 1.5-5-4-3h5z" fill="white"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1F1A13", margin: 0 }}>Research Desk</h1>
        <p style={{ fontSize: 14, color: "#7A6E61", marginTop: 6 }}>Select a project to continue</p>
      </div>

      {/* Project cards */}
      <div style={{ width: "100%", maxWidth: 560 }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#A89C8E", fontSize: 14 }}>Loading…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {projects.map((p) => {
              const isActive = p.id === activeProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  style={{
                    ...cardStyle,
                    border: isActive ? "2px solid #C8892E" : "1px solid #D8CFBF",
                    boxShadow: isActive ? "0 0 0 2px rgba(200,137,46,0.15)" : undefined,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = isActive ? "0 0 0 2px rgba(200,137,46,0.15)" : "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#1F1A13" }}>{p.name}</span>
                        {isActive && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                            textTransform: "uppercase", color: "#C8892E",
                            background: "rgba(200,137,46,0.12)", padding: "2px 6px", borderRadius: 4,
                          }}>Active</span>
                        )}
                      </div>
                      {p.description && (
                        <div style={{ fontSize: 12, color: "#7A6E61", marginTop: 3 }}>{p.description}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexShrink: 0, marginLeft: 16 }}>
                      {[
                        { label: "Sources", count: p._count?.sources ?? 0 },
                        { label: "Ideas", count: p._count?.ideas ?? 0 },
                        { label: "Articles", count: p._count?.articles ?? 0 },
                      ].map(({ label, count }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#1F1A13" }}>{count}</div>
                          <div style={{ fontSize: 10, color: "#A89C8E", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New project form / button */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: "100%",
              padding: "12px",
              background: "transparent",
              border: "2px dashed #D8CFBF",
              borderRadius: 10,
              cursor: "pointer",
              color: "#A89C8E",
              fontSize: 13,
              fontWeight: 600,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8892E";
              (e.currentTarget as HTMLButtonElement).style.color = "#C8892E";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#D8CFBF";
              (e.currentTarget as HTMLButtonElement).style.color = "#A89C8E";
            }}
          >
            + New Project
          </button>
        ) : (
          <div style={{
            background: "#FDFAF6", border: "1px solid #D8CFBF", borderRadius: 10,
            padding: "20px 24px",
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>New Project</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Name <span style={{ color: "#C0392B" }}>*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Japan"
                style={inputStyle}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowForm(false); }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description <span style={{ color: "#A89C8E", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Japan travel research 2026"
                style={inputStyle}
              />
            </div>
            {error && (
              <div style={{ background: "#FDECEA", color: "#C0392B", padding: "8px 12px", borderRadius: 5, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowForm(false); setName(""); setDescription(""); setError(""); }}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid #D8CFBF", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#7A6E61" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                style={{ padding: "8px 16px", background: "#C8892E", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff" }}
              >
                {saving ? "Creating…" : "Create & Open"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
