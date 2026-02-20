import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import type { HistoryItem } from "@/types/comic";

const LOCAL_KEY = "fmc_history";

function getLocal(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocal(items: HistoryItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory(getLocal());
      return;
    }
    const { data } = await supabase
      .from("reading_history")
      .select("comic_slug, title, image, last_chapter_slug, last_chapter_title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) {
      setHistory(
        data.map((d) => ({
          slug: d.comic_slug,
          title: d.title,
          image: d.image || "",
          lastChapterSlug: d.last_chapter_slug || undefined,
          lastChapterTitle: d.last_chapter_title || undefined,
          timestamp: new Date(d.updated_at).getTime(),
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Merge local to cloud
  useEffect(() => {
    if (!user) return;
    const local = getLocal();
    if (local.length === 0) return;

    (async () => {
      for (const h of local) {
        await supabase.from("reading_history").upsert(
          {
            user_id: user.id,
            comic_slug: h.slug,
            title: h.title,
            image: h.image,
            last_chapter_slug: h.lastChapterSlug,
            last_chapter_title: h.lastChapterTitle,
            updated_at: new Date(h.timestamp || Date.now()).toISOString(),
          },
          { onConflict: "user_id,comic_slug" }
        );
      }
      localStorage.removeItem(LOCAL_KEY);
      fetchHistory();
    })();
  }, [user, fetchHistory]);

  const saveHistory = useCallback(
    async (slug: string, title: string, image?: string, chSlug?: string, chTitle?: string) => {
      if (!user) {
        const local = getLocal();
        const item: HistoryItem = {
          slug,
          title,
          image,
          lastChapterSlug: chSlug,
          lastChapterTitle: chTitle,
          timestamp: Date.now(),
        };
        const filtered = local.filter((h) => h.slug !== slug);
        filtered.unshift(item);
        if (filtered.length > 50) filtered.pop();
        setLocal(filtered);
        setHistory([...filtered]);
        return;
      }
      await supabase.from("reading_history").upsert(
        {
          user_id: user.id,
          comic_slug: slug,
          title,
          image,
          last_chapter_slug: chSlug,
          last_chapter_title: chTitle,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,comic_slug" }
      );
      fetchHistory();
    },
    [user, fetchHistory]
  );

  const getLastRead = useCallback(
    (slug: string) => {
      const item = history.find((h) => h.slug === slug);
      return item?.lastChapterSlug || null;
    },
    [history]
  );

  return { history, saveHistory, getLastRead, fetchHistory };
}
