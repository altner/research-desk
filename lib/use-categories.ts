"use client";

import { useState, useEffect } from "react";
import { useApiFetch } from "@/lib/use-api-fetch";

export interface Category {
  id: string;
  key: string;
  labelDe: string;
  color: string;
}

export function useCategories() {
  const apiFetch = useApiFetch();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiFetch("/api/categories").then((r) => r.json()).then(setCategories);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labelFor = (key: string) =>
    categories.find((c) => c.key === key)?.labelDe ?? key;

  const colorFor = (key: string) =>
    categories.find((c) => c.key === key)?.color ?? "#7B5EA7";

  return { categories, labelFor, colorFor };
}
