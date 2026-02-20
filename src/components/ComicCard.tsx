import { Link } from "react-router-dom";
import type { ComicListItem } from "@/types/comic";

function getTypeClass(type?: string) {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t.includes("manga")) return "type-manga";
  if (t.includes("manhwa")) return "type-manhwa";
  if (t.includes("manhua")) return "type-manhua";
  return "";
}

export function ComicCard({ comic }: { comic: ComicListItem }) {
  return (
    <Link
      to={`/detail/${comic.slug}`}
      className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition group animate-fade-in"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {comic.type && (
          <span className={`absolute top-2 left-2 z-20 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/30 uppercase tracking-wider ${getTypeClass(comic.type)}`}>
            {comic.type}
          </span>
        )}
        <img
          src={comic.image || "/placeholder.svg"}
          alt={comic.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
      </div>
      <div className="p-3 text-center">
        <h3 className="text-xs font-bold truncate group-hover:text-primary transition">{comic.title}</h3>
        {comic.chapters?.[0] && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">{comic.chapters[0].title}</span>
            {comic.chapters[0].date && <span className="text-[10px] text-muted-foreground">{comic.chapters[0].date}</span>}
          </div>
        )}
        {!comic.chapters?.[0] && comic.rating && (
          <p className="text-[10px] text-primary mt-1 font-medium">★ {comic.rating}</p>
        )}
      </div>
    </Link>
  );
}

export function ComicCardSkeleton() {
  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="aspect-[3/4] skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton-shimmer rounded w-3/4 mx-auto" />
        <div className="h-2 skeleton-shimmer rounded w-1/2 mx-auto" />
      </div>
    </div>
  );
}
