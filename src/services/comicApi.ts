import { supabase } from "@/integrations/supabase/client";
import type {
  LatestResponse,
  SearchResponse,
  LibraryResponse,
  DetailResponse,
  ChapterResponse,
} from "@/types/comic";

async function proxyFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/comic-proxy?endpoint=${encodeURIComponent(endpoint)}`,
      {
        headers: {
          'apikey': anonKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch (e) {
    console.error("API Error:", e);
    return null;
  }
}

export async function fetchLatest(page: number = 1): Promise<LatestResponse | null> {
  return proxyFetch<LatestResponse>(`latest/${page}`);
}

export async function fetchSearch(query: string, page: number = 1): Promise<SearchResponse | null> {
  return proxyFetch<SearchResponse>(`search/${encodeURIComponent(query)}/${page}`);
}

export async function fetchLibrary(page: number = 1): Promise<LibraryResponse | null> {
  return proxyFetch<LibraryResponse>(`library?page=${page}`);
}

export async function fetchDetail(slug: string): Promise<DetailResponse | null> {
  return proxyFetch<DetailResponse>(`detail/${slug}`);
}

export async function fetchChapter(slug: string): Promise<ChapterResponse | null> {
  return proxyFetch<ChapterResponse>(`chapter/${slug}`);
}
