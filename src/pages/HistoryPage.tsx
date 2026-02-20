import { useHistory } from "@/hooks/useHistory";
import { Link } from "react-router-dom";
import { Clock, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const { history } = useHistory();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <Clock className="w-12 h-12 opacity-50" />
        <p>Belum ada riwayat baca</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">Riwayat Baca</h2>
      <div className="space-y-3">
        {history.map((item) => (
          <Link
            key={item.slug}
            to={item.lastChapterSlug ? `/read/${item.lastChapterSlug}` : `/detail/${item.slug}`}
            className="flex gap-4 bg-card p-3 rounded-xl border border-border/30 hover:border-primary/50 transition animate-fade-in"
          >
            <img src={item.image || "/placeholder.svg"} className="w-16 h-20 rounded-lg object-cover shadow-lg" loading="lazy" />
            <div className="flex-1 flex flex-col justify-center overflow-hidden">
              <h3 className="font-bold text-sm truncate mb-1">{item.title}</h3>
              {item.lastChapterTitle && (
                <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded w-fit">
                  {item.lastChapterTitle}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
