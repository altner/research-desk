import { useProject } from "@/lib/project-context";

export function useApiFetch() {
  const { projectId } = useProject();
  return (url: string, init?: RequestInit): Promise<Response> =>
    fetch(url, {
      ...init,
      headers: {
        ...(init?.headers as Record<string, string> | undefined),
        ...(projectId ? { "x-project-id": projectId } : {}),
      },
    });
}
