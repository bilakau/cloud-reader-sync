import { useBookmarks } from "@/hooks/useBookmarks";
import { ComicCard } from "@/components/ComicCard";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, loading } = useBookmarks();

  if (!loading && bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <Bookmark className="w-12 h-12 opacity-50" />
        <p>Belum ada komik tersimpan</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">Koleksi Favorit</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {bookmarks.map((item) => (
          <ComicCard key={item.slug} comic={{ slug: item.slug, title: item.title, image: item.image }} />
        ))}
      </div>
    </div>
  );
}
