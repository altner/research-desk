"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { useProject } from "@/lib/project-context";

function AppGuard({ children }: { children: React.ReactNode }) {
  const { projectId, hydrated } = useProject();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !projectId) {
      router.replace("/");
    }
  }, [hydrated, projectId, router]);

  if (!hydrated || !projectId) return null;
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#EBE5D9" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <GlobalHeader />
        <AppGuard>{children}</AppGuard>
      </main>
    </div>
  );
}
