import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchChapter, fetchDetail } from "@/services/comicApi";
import { useHistory } from "@/hooks/useHistory";
import { ArrowLeft, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CommentSection } from "@/components/CommentSection";

function proxyImageUrl(url: string): string {
  if (!url) return url;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return `https://${projectId}.supabase.co/functions/v1/comic-proxy?image=${encodeURIComponent(url)}&apikey=${anonKey}`;
}

export default function ReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { saveHistory } = useHistory();
  const [uiVisible, setUiVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["chapter", slug],
    queryFn: () => fetchChapter(slug!),
    enabled: !!slug,
  });

  const chapter = data?.data;
  const images = chapter?.images || [];
  const nav = chapter?.navigation;
  const comicInfo = chapter?.komikInfo;

  // Derive parent slug from current chapter slug
  const parentSlug = useMemo(() => {
    if (!slug) return "";
    // Remove chapter portion: "comic-name-chapter-123" -> "comic-name"
    return slug.replace(/-chapter-.*$/, "");
  }, [slug]);

  // Fetch the parent comic detail to get the full chapter list
  const { data: detailData } = useQuery({
    queryKey: ["detail", parentSlug],
    queryFn: () => fetchDetail(parentSlug),
    enabled: !!parentSlug,
  });

  const allChapters = detailData?.data?.chapters || comicInfo?.chapters || [];

  // Find the current chapter in the list
  const currentChapterIndex = useMemo(() => {
    if (!slug || allChapters.length === 0) return -1;
    const idx = allChapters.findIndex((ch) => ch.slug === slug);
    if (idx !== -1) return idx;
    // Partial match fallback
    return allChapters.findIndex((ch) => slug.includes(ch.slug) || ch.slug.includes(slug));
  }, [slug, allChapters]);

  // Compute prev/next from the chapter list (chapters are typically newest-first)
  const prevChapter = currentChapterIndex >= 0 && currentChapterIndex < allChapters.length - 1
    ? allChapters[currentChapterIndex + 1]?.slug
    : nav?.prev;
  const nextChapter = currentChapterIndex > 0
    ? allChapters[currentChapterIndex - 1]?.slug
    : nav?.next;

  // Save history
  useEffect(() => {
    if (chapter && slug) {
      const title = comicInfo?.title?.replace(/^Komik\s*/i, "").trim() || detailData?.data?.title?.replace(/^Komik\s*/i, "").trim() || "Komik";
      const img = chapter.thumbnail?.url || detailData?.data?.image || "";
      const chapterTitle = allChapters.find((ch) => ch.slug === slug)?.title || slug;
      saveHistory(parentSlug, title, img, slug, chapterTitle);
    }
  }, [chapter, slug, comicInfo, parentSlug, saveHistory, detailData, allChapters]);

  // Scroll to top on chapter change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) return;
      setProgress((scrollTop / scrollHeight) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleUI = useCallback(() => setUiVisible((v) => !v), []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-32 min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!chapter) {
    return <div className="text-center py-32 text-destructive min-h-screen bg-background">Chapter tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 h-[3px] z-[100] bg-gradient-to-r from-primary to-yellow-300 transition-all duration-150" style={{ width: `${progress}%` }} />

      {/* Top UI */}
      <div className={`fixed top-0 w-full bg-gradient-to-b from-background/90 to-transparent z-[60] p-4 flex justify-between items-center transition-all duration-300 ${uiVisible ? "" : "-translate-y-full opacity-0"}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => parentSlug ? navigate(`/detail/${parentSlug}`) : navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-background/60 backdrop-blur-md border border-border/30 rounded-full hover:bg-primary hover:text-primary-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <span className="text-[9px] text-primary uppercase tracking-widest font-bold">Reading</span>
            <h2 className="text-xs font-bold max-w-[250px] truncate">
              {comicInfo?.title?.replace(/^Komik\s*/i, "").trim() || detailData?.data?.title?.replace(/^Komik\s*/i, "").trim() || "Chapter"}
            </h2>
          </div>
        </div>
        <button onClick={toggleFullScreen} className="w-10 h-10 flex items-center justify-center bg-background/60 backdrop-blur-md border border-border/30 rounded-full hover:bg-secondary transition">
          <Expand className="w-4 h-4" />
        </button>
      </div>

      {/* Images */}
      <div ref={containerRef} onClick={toggleUI} className="flex flex-col items-center min-h-screen w-full max-w-3xl mx-auto bg-card/50 pt-16 pb-24">
        {images.map((img) => (
          <div key={img.id} className="w-full relative">
            <img
              src={img.url}
              alt={`Page ${img.id}`}
              className="comic-page"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const errDiv = document.createElement("div");
                errDiv.className = "flex items-center justify-center py-8 text-muted-foreground text-xs";
                errDiv.textContent = "Gagal memuat gambar";
                target.parentElement?.appendChild(errDiv);
              }}
            />
          </div>
        ))}
      </div>

      {/* Comments Section */}
      {slug && (
        <div className="px-4 pb-24">
          <CommentSection chapterSlug={slug} />
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={`fixed bottom-6 left-0 w-full z-[60] px-4 flex justify-center transition-all duration-300 ${uiVisible ? "" : "translate-y-full opacity-0"}`}>
        <div className="glass p-2 rounded-2xl flex gap-1 items-center shadow-2xl border border-border/30 bg-background/80 backdrop-blur-xl">
          <button
            onClick={() => prevChapter && navigate(`/read/${prevChapter}`)}
            disabled={!prevChapter}
            className={`w-10 h-10 flex items-center justify-center rounded-xl ${!prevChapter ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground transition"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {allChapters.length > 0 && (
            <select
              value={slug}
              onChange={(e) => navigate(`/read/${e.target.value}`)}
              className="appearance-none bg-background/50 backdrop-blur border border-border/30 rounded-xl text-xs py-2.5 pl-3 pr-8 focus:outline-none focus:border-primary cursor-pointer hover:bg-secondary transition w-40 truncate"
            >
              {allChapters.map((ch) => (
                <option key={ch.slug} value={ch.slug}>{ch.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => nextChapter && navigate(`/read/${nextChapter}`)}
            disabled={!nextChapter}
            className={`w-10 h-10 flex items-center justify-center rounded-xl ${!nextChapter ? "opacity-30 cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg"}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
