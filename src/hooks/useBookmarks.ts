import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import type { BookmarkItem } from "@/types/comic";

const LOCAL_KEY = "fmc_bookmarks";

function getLocal(): BookmarkItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocal(items: BookmarkItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks(getLocal());
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("comic_slug, title, image")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      const items = data.map((d) => ({ slug: d.comic_slug, title: d.title, image: d.image || "" }));
      setBookmarks(items);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Merge local bookmarks to cloud on first login
  useEffect(() => {
    if (!user) return;
    const local = getLocal();
    if (local.length === 0) return;

    (async () => {
      for (const b of local) {
        await supabase.from("bookmarks").upsert(
          { user_id: user.id, comic_slug: b.slug, title: b.title, image: b.image },
          { onConflict: "user_id,comic_slug" }
        );
      }
      localStorage.removeItem(LOCAL_KEY);
      fetchBookmarks();
    })();
  }, [user, fetchBookmarks]);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (slug: string, title: string, image?: string) => {
      if (!user) {
        const local = getLocal();
        const idx = local.findIndex((b) => b.slug === slug);
        if (idx > -1) local.splice(idx, 1);
        else local.push({ slug, title, image });
        setLocal(local);
        setBookmarks([...local]);
        return;
      }
      const exists = isBookmarked(slug);
      if (exists) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("comic_slug", slug);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, comic_slug: slug, title, image });
      }
      fetchBookmarks();
    },
    [user, isBookmarked, fetchBookmarks]
  );

  return { bookmarks, loading, isBookmarked, toggleBookmark };
}
