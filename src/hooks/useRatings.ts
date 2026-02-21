import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

interface RatingData {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
}

export function useRatings(comicSlug: string) {
  const { user } = useAuth();
  const [data, setData] = useState<RatingData>({ averageRating: 0, totalRatings: 0, userRating: null });
  const [loading, setLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    const { data: ratings } = await supabase
      .from("comic_ratings")
      .select("rating, user_id")
      .eq("comic_slug", comicSlug);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const userR = user ? ratings.find((r) => r.user_id === user.id)?.rating ?? null : null;
      setData({ averageRating: Math.round(avg * 10) / 10, totalRatings: ratings.length, userRating: userR });
    } else {
      setData({ averageRating: 0, totalRatings: 0, userRating: null });
    }
    setLoading(false);
  }, [comicSlug, user]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const setRating = useCallback(async (rating: number) => {
    if (!user) return;
    await supabase.from("comic_ratings").upsert(
      { user_id: user.id, comic_slug: comicSlug, rating },
      { onConflict: "user_id,comic_slug" }
    );
    fetchRatings();
  }, [user, comicSlug, fetchRatings]);

  return { ...data, loading, setRating };
}
