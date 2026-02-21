import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Bell, Check, BookOpen } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <Bell className="w-12 h-12 opacity-50" />
        <p>Login untuk melihat notifikasi</p>
        <Link to="/auth" className="text-primary font-bold hover:underline text-sm">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">Notifikasi</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
            <Check className="w-3 h-3" /> Tandai semua dibaca
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
          <Bell className="w-12 h-12 opacity-50" />
          <p>Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border transition cursor-pointer ${
                n.is_read ? "bg-card border-border/30 opacity-60" : "bg-primary/5 border-primary/30"
              }`}
            >
              <BookOpen className={`w-5 h-5 mt-0.5 shrink-0 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.comic_title}</p>
                {n.chapter_slug && (
                  <Link
                    to={`/read/${n.chapter_slug}`}
                    className="text-xs text-primary font-bold mt-1 inline-block hover:underline"
                  >
                    Baca →
                  </Link>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(n.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
