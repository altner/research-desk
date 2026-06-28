"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ProjectContextValue {
  projectId: string;
  projectName: string;
  setProject: (id: string, name: string) => void;
  clearProject: () => void;
  hydrated: boolean;
}

const ProjectContext = createContext<ProjectContextValue>({
  projectId: "",
  projectName: "",
  setProject: () => {},
  clearProject: () => {},
  hydrated: false,
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("activeProjectId") ?? "";
    const name = localStorage.getItem("activeProjectName") ?? "";
    setProjectId(id);
    setProjectName(name);
    setHydrated(true);
  }, []);

  const setProject = useCallback((id: string, name: string) => {
    localStorage.setItem("activeProjectId", id);
    localStorage.setItem("activeProjectName", name);
    setProjectId(id);
    setProjectName(name);
  }, []);

  const clearProject = useCallback(() => {
    localStorage.removeItem("activeProjectId");
    localStorage.removeItem("activeProjectName");
    setProjectId("");
    setProjectName("");
  }, []);

  return (
    <ProjectContext.Provider value={{ projectId, projectName, setProject, clearProject, hydrated }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
