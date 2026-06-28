"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useProject } from "@/lib/project-context";

interface Project {
  id: string;
  name: string;
  description: string | null;
  _count?: { sources: number; ideas: number; articles: number };
}

export default function GlobalHeader() {
  const { projectId, projectName, setProject, clearProject } = useProject();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchProject = (p: Project) => {
    setProject(p.id, p.name);
    setOpen(false);
  };

  const handleNewProject = () => {
    clearProject();
    setOpen(false);
    router.push("/");
  };

  return (
    <div style={{
      height: 44, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px",
      background: "#EBE5D9",
      borderBottom: "1px solid #D8CFBF",
    }}>
      {/* Project dropdown */}
      <div ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.07em", textTransform: "uppercase" }}>Project</span>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 6, cursor: "pointer",
            background: open ? "#DDD6C8" : "rgba(0,0,0,0.05)",
            border: "1px solid #D8CFBF",
            color: "#1F1A13", fontSize: 13, fontWeight: 600,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="6" height="5" rx="1" stroke="#C8892E" strokeWidth="1.5"/>
            <rect x="9" y="2" width="6" height="5" rx="1" stroke="#C8892E" strokeWidth="1.5"/>
            <rect x="1" y="9" width="6" height="5" rx="1" stroke="#C8892E" strokeWidth="1.5"/>
            <rect x="9" y="9" width="6" height="5" rx="1" stroke="#C8892E" strokeWidth="1.5"/>
          </svg>
          {projectName || "No project"}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
            <path d="M2 4l4 4 4-4" stroke="#7A6E61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div style={{
            position: "absolute", left: 0, top: "calc(100% + 6px)",
            background: "#FDFAF6", border: "1px solid #D8CFBF", borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)", minWidth: 220, zIndex: 100,
            overflow: "hidden",
          }}>
            <div style={{ padding: "6px 12px 4px", fontSize: 10, fontWeight: 700,
              color: "#A89C8E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Projects
            </div>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => switchProject(p)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "8px 12px", border: "none", cursor: "pointer",
                  background: p.id === projectId ? "#F0E9DC" : "transparent",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (p.id !== projectId) e.currentTarget.style.background = "#F4EFE6"; }}
                onMouseLeave={(e) => { if (p.id !== projectId) e.currentTarget.style.background = "transparent"; }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1F1A13" }}>{p.name}</div>
                  {p._count && (
                    <div style={{ fontSize: 11, color: "#A89C8E", marginTop: 1 }}>
                      {p._count.sources} sources · {p._count.ideas} ideas · {p._count.articles} articles
                    </div>
                  )}
                </div>
                {p.id === projectId && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="#C8892E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
            <div style={{ borderTop: "1px solid #E8E0D0", padding: "4px 6px" }}>
              <button
                onClick={handleNewProject}
                style={{
                  width: "100%", padding: "7px 8px", border: "none", cursor: "pointer",
                  background: "transparent", textAlign: "left",
                  fontSize: 12, color: "#7A6E61", borderRadius: 5,
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4EFE6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New / Switch Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings link */}
      <Link href="/settings" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: 6, marginLeft: 8,
        color: pathname === "/settings" ? "#C8892E" : "#7A6E61",
        background: pathname === "/settings" ? "rgba(200,137,46,0.1)" : "transparent",
        textDecoration: "none",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
      </Link>
    </div>
  );
}
