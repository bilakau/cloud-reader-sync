import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface Comment {
  id: string;
  user_id: string;
  chapter_slug: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  username?: string;
  replies?: Comment[];
}

export function useComments(chapterSlug: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("chapter_comments")
      .select("*")
      .eq("chapter_slug", chapterSlug)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.username]) || []);
      const allComments = data.map((c) => ({ ...c, username: profileMap.get(c.user_id) || "Anonim", replies: [] as Comment[] }));
      
      // Build tree
      const roots: Comment[] = [];
      const map = new Map<string, Comment>();
      allComments.forEach((c) => map.set(c.id, c));
      allComments.forEach((c) => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(c);
        } else {
          roots.push(c);
        }
      });
      setComments(roots);
    }
    setLoading(false);
  }, [chapterSlug]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${chapterSlug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chapter_comments", filter: `chapter_slug=eq.${chapterSlug}` }, () => {
        fetchComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chapterSlug, fetchComments]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!user) return;
    await supabase.from("chapter_comments").insert({
      user_id: user.id,
      chapter_slug: chapterSlug,
      content,
      parent_id: parentId || null,
    });
  }, [user, chapterSlug]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;
    await supabase.from("chapter_comments").delete().eq("id", commentId).eq("user_id", user.id);
  }, [user]);

  return { comments, loading, addComment, deleteComment };
}
