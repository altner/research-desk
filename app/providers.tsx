"use client";

import { ProjectProvider } from "@/lib/project-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
