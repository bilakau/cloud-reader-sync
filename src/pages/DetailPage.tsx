import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDetail } from "@/services/comicApi";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useHistory } from "@/hooks/useHistory";
import { Bookmark, BookOpen, Check, Star, ArrowLeft, Search } from "lucide-react";
import { useState, useEffect } from "react";

function getTypeClass(type?: string) {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t.includes("manga")) return "type-manga";
  if (t.includes("manhwa")) return "type-manhwa";
  if (t.includes("manhua")) return "type-manhua";
  return "";
}

export default function DetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getLastRead, saveHistory } = useHistory();
  const [chapterSearch, setChapterSearch] = useState("");
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["detail", slug],
    queryFn: () => fetchDetail(slug!),
    enabled: !!slug,
  });

  const comic = data?.data;
  const lastRead = slug ? getLastRead(slug) : null;

  useEffect(() => {
    if (comic && slug) {
      saveHistory(slug, comic.title.replace(/^Komik\s*/i, "").trim(), comic.image);
    }
  }, [comic, slug, saveHistory]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!comic) {
    return <div className="text-center py-32 text-destructive">Komik tidak ditemukan.</div>;
  }

  const title = comic.title.replace(/^Komik\s*/i, "").trim();
  const synopsis = comic.synopsis || "Sinopsis tidak tersedia.";
  const chapters = comic.chapters || [];
  const filteredChapters = chapters.filter((ch) =>
    ch.title.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1].slug : null;
  const startSlug = lastRead || firstChapter;
  const bookmarked = slug ? isBookmarked(slug) : false;

  return (
    <div className="animate-fade-in">
      {/* Backdrop */}
      <div className="fixed top-0 left-0 w-full h-[50vh] -z-10 pointer-events-none overflow-hidden">
        <img src={comic.image} className="w-full h-full object-cover blur-2xl opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 mt-4">
        {/* Cover */}
        <div className="md:w-[260px] flex-shrink-0 mx-auto md:mx-0 w-full max-w-[260px]">
          <div className="relative group">
            {comic.detail?.type && (
              <span className={`absolute top-3 left-3 z-20 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/30 uppercase tracking-wider ${getTypeClass(comic.detail.type)}`}>
                {comic.detail.type}
              </span>
            )}
            <img src={comic.image} className="w-full rounded-2xl shadow-2xl border border-border/30" />
          </div>

          <div className="flex flex-col gap-3 mt-5">
            <button
              onClick={() => startSlug && navigate(`/read/${startSlug}`)}
              disabled={!startSlug}
              className="bg-primary text-primary-foreground w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" /> {lastRead ? "Lanjut Baca" : "Mulai Baca"}
            </button>
            <button
              onClick={() => slug && toggleBookmark(slug, title, comic.image)}
              className={`w-full py-3 rounded-xl font-semibold border flex items-center justify-center gap-2 transition ${
                bookmarked ? "border-primary/50 bg-primary/10 text-primary" : "border-border glass hover:bg-secondary"
              }`}
            >
              {bookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {bookmarked ? "Tersimpan" : "Simpan"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {comic.rating && (
              <span className="glass px-3 py-1 rounded-lg text-xs font-bold text-primary border border-primary/20 flex items-center gap-1">
                <Star className="w-3 h-3" /> {comic.rating}
              </span>
            )}
            {comic.detail?.status && (
              <span className="glass px-3 py-1 rounded-lg text-xs font-bold text-green-400 border border-green-500/20">
                {comic.detail.status}
              </span>
            )}
            {comic.detail?.type && (
              <span className={`glass px-3 py-1 rounded-lg text-xs font-bold border border-border/20 ${getTypeClass(comic.detail.type)}`}>
                {comic.detail.type}
              </span>
            )}
          </div>

          {comic.genres && (
            <div className="flex flex-wrap gap-2 mb-5">
              {comic.genres.map((g) => (
                <span key={g.slug} className="text-muted-foreground text-xs px-3 py-1 rounded-full border border-border/30 bg-secondary/50">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="bg-secondary/50 rounded-2xl p-5 mb-6 border border-border/30">
            <h3 className="font-bold text-sm mb-2 text-primary uppercase tracking-wide">Sinopsis</h3>
            <p className={`text-muted-foreground text-sm leading-relaxed ${!synopsisExpanded && synopsis.length > 250 ? "line-clamp-4" : ""}`}>
              {synopsis}
            </p>
            {synopsis.length > 250 && (
              <button onClick={() => setSynopsisExpanded(!synopsisExpanded)} className="text-primary text-xs font-bold mt-2 hover:underline">
                {synopsisExpanded ? "Tutup" : "Baca Selengkapnya"}
              </button>
            )}
          </div>

          {/* Chapter List */}
          <div className="glass rounded-2xl border border-border/30 overflow-hidden">
            <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row justify-between items-center gap-3 bg-secondary/30">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Daftar Chapter
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{chapters.length}</span>
              </h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  type="text"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Cari Chapter..."
                  className="w-full sm:w-56 bg-background/50 border border-border/30 rounded-lg py-2 pl-8 pr-4 text-xs focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-2 bg-background/30">
              {filteredChapters.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Tidak ada chapter.</p>
              ) : (
                filteredChapters.map((ch) => {
                  const isLastRead = ch.slug === lastRead;
                  return (
                    <Link
                      key={ch.slug}
                      to={`/read/${ch.slug}`}
                      className={`group flex items-center justify-between p-3 mb-1 rounded-xl border transition-all duration-200 ${
                        isLastRead
                          ? "bg-primary/10 border-primary/30"
                          : "bg-secondary/30 border-transparent hover:bg-secondary hover:border-primary/30"
                      }`}
                    >
                      <span className={`text-sm font-medium truncate group-hover:text-primary transition ${isLastRead ? "text-primary" : "text-muted-foreground"}`}>
                        {ch.title}
                      </span>
                      <span className="text-[10px] bg-background/50 px-2 py-1 rounded group-hover:bg-primary group-hover:text-primary-foreground transition font-bold shrink-0">
                        Baca
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
