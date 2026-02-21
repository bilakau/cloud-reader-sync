import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/hooks/useReviews";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

export function ReviewSection({ comicSlug }: { comicSlug: string }) {
  const { user } = useAuth();
  const { reviews, addReview, deleteReview, userReview } = useReviews(comicSlug);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Login untuk menulis review"); return; }
    if (!content.trim()) return;
    setSubmitting(true);
    await addReview(content.trim());
    setContent("");
    setSubmitting(false);
    toast.success("Review berhasil!");
  };

  return (
    <div className="bg-secondary/50 rounded-2xl p-5 border border-border/30">
      <h3 className="font-bold text-sm mb-4 text-primary uppercase tracking-wide flex items-center gap-2">
        <MessageSquare className="w-4 h-4" /> Review ({reviews.length})
      </h3>

      {/* Write review */}
      {user && !userReview && (
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis review kamu..."
            className="w-full bg-background/50 border border-border/30 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-primary transition"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90 transition disabled:opacity-50"
          >
            <Send className="w-3 h-3" /> Kirim
          </button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Belum ada review.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-background/30 rounded-xl p-3 border border-border/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-primary">{r.username}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </span>
                  {r.user_id === user?.id && (
                    <button onClick={() => deleteReview()} className="text-destructive hover:opacity-70 transition">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
