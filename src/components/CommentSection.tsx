import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useComments, Comment } from "@/hooks/useComments";
import { MessageCircle, Send, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";

function CommentItem({ comment, onReply, onDelete, userId }: { comment: Comment; onReply: (id: string) => void; onDelete: (id: string) => void; userId?: string }) {
  return (
    <div className="group">
      <div className="bg-background/30 rounded-xl p-3 border border-border/20">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-primary">{comment.username}</span>
          <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString("id-ID")}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => onReply(comment.id)} className="text-[10px] text-muted-foreground hover:text-primary transition flex items-center gap-1">
            <Reply className="w-3 h-3" /> Balas
          </button>
          {comment.user_id === userId && (
            <button onClick={() => onDelete(comment.id)} className="text-[10px] text-destructive hover:opacity-70 transition flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-border/20 pl-3">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} onReply={onReply} onDelete={onDelete} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ chapterSlug }: { chapterSlug: string }) {
  const { user } = useAuth();
  const { comments, addComment, deleteComment } = useComments(chapterSlug);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Login untuk berkomentar"); return; }
    if (!content.trim()) return;
    setSubmitting(true);
    await addComment(content.trim(), replyTo || undefined);
    setContent("");
    setReplyTo(null);
    setSubmitting(false);
  };

  const handleReply = (id: string) => {
    setReplyTo(id);
  };

  return (
    <div className="bg-card/50 rounded-2xl p-5 border border-border/30 max-w-3xl mx-auto mt-4">
      <h3 className="font-bold text-sm mb-4 text-primary uppercase tracking-wide flex items-center gap-2">
        <MessageCircle className="w-4 h-4" /> Komentar ({comments.length})
      </h3>

      {/* Input */}
      <div className="mb-4">
        {replyTo && (
          <div className="text-[10px] text-primary mb-1 flex items-center gap-1">
            <Reply className="w-3 h-3" /> Membalas komentar
            <button onClick={() => setReplyTo(null)} className="text-destructive ml-2">Batal</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={user ? "Tulis komentar..." : "Login untuk berkomentar"}
            disabled={!user}
            className="flex-1 bg-background/50 border border-border/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary transition disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim() || !user}
            className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">Belum ada komentar. Jadilah yang pertama!</p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} onReply={handleReply} onDelete={deleteComment} userId={user?.id} />
          ))
        )}
      </div>
    </div>
  );
}
