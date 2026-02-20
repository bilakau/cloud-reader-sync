import { useQuery } from "@tanstack/react-query";
import { fetchLatest } from "@/services/comicApi";
import { ComicCard, ComicCardSkeleton } from "@/components/ComicCard";
import { Link } from "react-router-dom";
import type { PopularComic } from "@/types/comic";
import { Flame, Clock } from "lucide-react";

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["latest", 1],
    queryFn: () => fetchLatest(1),
  });

  const komikList = data?.komikList || [];
  const populer = data?.komikPopuler || [];

  return (
    <div className="space-y-10">
      {/* Popular Section - Horizontal Scroll */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
          <Flame className="w-5 h-5 text-primary" /> Populer
        </h2>
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: "none" }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[150px] md:min-w-[180px] h-64 skeleton-shimmer rounded-2xl" />
              ))
            : populer.map((item: PopularComic) => (
                <Link
                  to={`/detail/${item.slug}`}
                  key={item.slug}
                  className="min-w-[150px] md:min-w-[180px] relative rounded-2xl overflow-hidden group border border-border/30 hover:border-primary/50 transition"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
                  <img src={item.image || "/placeholder.svg"} className="h-64 w-full object-cover group-hover:scale-110 transition duration-500" loading="lazy" />
                  <div className="absolute bottom-0 left-0 p-3 z-20 w-full">
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">#{item.rank}</span>
                    <h3 className="text-sm font-bold truncate text-foreground mt-1">{item.title}</h3>
                    {item.rating && <p className="text-primary text-xs font-semibold mt-0.5">★ {item.rating}</p>}
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Latest Releases */}
      <section>
        <h2 className="text-xl font-bold mb-5 border-l-4 border-primary pl-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Rilis Terbaru
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 15 }).map((_, i) => <ComicCardSkeleton key={i} />)
            : komikList.slice(0, 30).map((item) => <ComicCard key={item.slug} comic={item} />)}
        </div>
      </section>
    </div>
  );
}
