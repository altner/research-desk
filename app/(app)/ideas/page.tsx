"use client";

import { useEffect, useState, useCallback } from "react";
import { CategoryBadge, LocationCrumb, CredibilityBadge, Button } from "@/components/ui";
import type { Idea, IdeaStatus, IdeaCategory, Location } from "@/lib/types";
import { IDEA_STATUS_LABELS, IDEA_STATUS_COLUMNS } from "@/lib/types";
import Link from "next/link";
import NewIdeaModal from "@/components/NewIdeaModal";

const STATUS_COLORS: Record<IdeaStatus, string> = {
  idea: "#A89C8E",
  in_recherche: "#1E5C8A",
  im_entwurf: "#7B5EA7",
  review: "#C8892E",
  veroeffentlicht: "#2D7A77",
  verworfen: "#C0392B",
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/ideas");
    const data = await res.json();
    setIdeas(data.filter((i: Idea) => i.status !== "verworfen"));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const moveIdea = async (id: string, status: IdeaStatus) => {
    setIdeas((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    await fetch(`/api/ideas/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDrop = (status: IdeaStatus) => {
    if (dragId) moveIdea(dragId, status);
    setDragId(null);
  };

  const columns = IDEA_STATUS_COLUMNS.map((status) => ({
    status,
    ideas: ideas.filter((i) => i.status === status),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Ideas</h1>
        <span style={{
          background: "#C8892E", color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "1px 7px", borderRadius: 99,
        }}>{ideas.length}</span>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setShowNew(true)}>+ New Idea</Button>
      </div>

      {/* Kanban */}
      <div style={{
        flex: 1, overflow: "auto",
        display: "flex", gap: 0, padding: "16px",
        alignItems: "flex-start",
      }}>
        {loading ? (
          <div style={{ padding: 32, color: "#A89C8E" }}>Loading...</div>
        ) : (
          columns.map(({ status, ideas: colIdeas }) => (
            <KanbanColumn
              key={status}
              status={status}
              ideas={colIdeas}
              color={STATUS_COLORS[status]}
              onDrop={() => onDrop(status)}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>

      {showNew && (
        <NewIdeaModal onClose={() => setShowNew(false)} onSaved={() => { load(); setShowNew(false); }} />
      )}
    </div>
  );
}

function KanbanColumn({
  status, ideas, color, onDrop, onDragStart,
}: {
  status: IdeaStatus;
  ideas: Idea[];
  color: string;
  onDrop: () => void;
  onDragStart: (id: string) => void;
}) {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(); }}
      style={{
        flex: "0 0 220px", marginRight: 12,
        background: over ? "#E0D9CC" : "transparent",
        borderRadius: 8, transition: "background 0.15s",
        minHeight: 200,
      }}
    >
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px 10px 4px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#7A6E61", letterSpacing: "0.07em", textTransform: "uppercase" }}>
          {IDEA_STATUS_LABELS[status]}
        </span>
        <span style={{ fontSize: 11, color: "#A89C8E" }}>{ideas.length}</span>
        <div style={{ flex: 1 }} />
        <button style={{
          background: "none", border: "none", cursor: "pointer", color: "#A89C8E",
          fontSize: 16, lineHeight: 1, padding: "0 2px",
        }} title="Add idea to this column">+</button>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onDragStart={onDragStart} />
        ))}
        <div style={{
          padding: "8px 10px", textAlign: "center", fontSize: 12, color: "#C0B8AC",
          border: "1px dashed #D8CFBF", borderRadius: 6, cursor: "pointer",
        }}>
          + add
        </div>
      </div>
    </div>
  );
}

function IdeaCard({ idea, onDragStart }: { idea: Idea; onDragStart: (id: string) => void }) {
  const firstArticle = idea.articles?.[0];

  return (
    <Link href={firstArticle ? `/articles/${firstArticle.id}` : `/ideas/${idea.id}`}
      style={{ textDecoration: "none" }}>
      <div
        draggable
        onDragStart={() => onDragStart(idea.id)}
        style={{
          background: "#FDFAF6", border: "1px solid #E5DDD0", borderRadius: 7,
          padding: "12px 12px 10px 12px", cursor: "grab",
          transition: "box-shadow 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1F1A13", lineHeight: 1.4, marginBottom: 6 }}>
          {idea.title}
        </div>
        {idea.location && (
          <div style={{ marginBottom: 6 }}>
            <LocationCrumb location={idea.location as Location} />
          </div>
        )}
        <div style={{ marginBottom: 8 }}>
          <CategoryBadge category={idea.category as IdeaCategory} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#A89C8E" }}>
            {idea.confirmationCount} source{idea.confirmationCount !== 1 ? "s" : ""}
          </span>
          <CredibilityBadge credibility={idea.credibility as import("@/lib/types").Credibility} />
        </div>
      </div>
    </Link>
  );
}
