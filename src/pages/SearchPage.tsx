import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchSearch } from "@/services/comicApi";
import { ComicCard, ComicCardSkeleton } from "@/components/ComicCard";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, page],
    queryFn: () => fetchSearch(query, page),
    enabled: !!query,
  });

  const komikList = data?.komikList || [];

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <Search className="w-12 h-12 opacity-50" />
        <p>Ketik judul komik di search bar</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">
        Hasil: "{query}"
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <ComicCardSkeleton key={i} />)
          : komikList.length === 0
          ? <p className="col-span-full text-center text-muted-foreground py-20">Tidak ditemukan.</p>
          : komikList.map((item) => <ComicCard key={item.slug} comic={item} />)}
      </div>
    </div>
  );
}
