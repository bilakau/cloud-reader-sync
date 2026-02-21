import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  const fetchSubs = useCallback(async () => {
    if (!user) { setSubscriptions([]); return; }
    const { data } = await supabase
      .from("comic_subscriptions")
      .select("comic_slug")
      .eq("user_id", user.id);
    setSubscriptions(data?.map((s) => s.comic_slug) || []);
  }, [user]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const isSubscribed = useCallback((slug: string) => subscriptions.includes(slug), [subscriptions]);

  const toggleSubscription = useCallback(async (slug: string, title: string, image?: string) => {
    if (!user) return;
    if (isSubscribed(slug)) {
      await supabase.from("comic_subscriptions").delete().eq("user_id", user.id).eq("comic_slug", slug);
    } else {
      await supabase.from("comic_subscriptions").insert({
        user_id: user.id, comic_slug: slug, comic_title: title, comic_image: image,
      });
    }
    fetchSubs();
  }, [user, isSubscribed, fetchSubs]);

  return { subscriptions, isSubscribed, toggleSubscription };
}
