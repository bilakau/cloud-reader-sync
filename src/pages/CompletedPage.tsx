import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchLibrary } from "@/services/comicApi";
import { ComicCard, ComicCardSkeleton } from "@/components/ComicCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CompletedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading } = useQuery({
    queryKey: ["library", page],
    queryFn: () => fetchLibrary(page),
  });

  const komikList = data?.komikList || [];
  const pagination = data?.pagination;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">Daftar Komik</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <ComicCardSkeleton key={i} />)
          : komikList.map((item) => <ComicCard key={item.slug} comic={item} />)}
      </div>

      {pagination && (
        <div className="mt-10 flex justify-center items-center gap-4">
          {page > 1 && (
            <button onClick={() => setSearchParams({ page: String(page - 1) })} className="glass px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
          )}
          <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-extrabold shadow-lg">{page}</span>
          {pagination.hasNextPage && (
            <button onClick={() => setSearchParams({ page: String(page + 1) })} className="glass px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
