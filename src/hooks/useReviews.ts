import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface Review {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  username?: string;
}

export function useReviews(comicSlug: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("comic_reviews")
      .select("*")
      .eq("comic_slug", comicSlug)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch usernames
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.username]) || []);
      setReviews(data.map((r) => ({ ...r, username: profileMap.get(r.user_id) || "Anonim" })));
    }
    setLoading(false);
  }, [comicSlug]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const addReview = useCallback(async (content: string) => {
    if (!user) return;
    await supabase.from("comic_reviews").upsert(
      { user_id: user.id, comic_slug: comicSlug, content },
      { onConflict: "user_id,comic_slug" }
    );
    fetchReviews();
  }, [user, comicSlug, fetchReviews]);

  const deleteReview = useCallback(async () => {
    if (!user) return;
    await supabase.from("comic_reviews").delete().eq("user_id", user.id).eq("comic_slug", comicSlug);
    fetchReviews();
  }, [user, comicSlug, fetchReviews]);

  return { reviews, loading, addReview, deleteReview, userReview: reviews.find((r) => r.user_id === user?.id) };
}
