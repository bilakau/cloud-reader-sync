import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchChapter, fetchDetail } from "@/services/comicApi";
import { useHistory } from "@/hooks/useHistory";
import { ArrowLeft, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

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
  const comicSlug = comicInfo?.title ? undefined : undefined; // we'll get from komikInfo

  // Fetch parent comic slug from komikInfo
  const parentSlug = chapter?.komikInfo?.chapters?.[0]?.slug?.replace(/-chapter-.*$/, "") || "";

  // Save history
  useEffect(() => {
    if (chapter && slug && comicInfo) {
      const title = comicInfo.title?.replace(/^Komik\s*/i, "").trim() || "Komik";
      const img = chapter.thumbnail?.url || "";
      saveHistory(parentSlug, title, img, slug, slug);
    }
  }, [chapter, slug, comicInfo, parentSlug, saveHistory]);

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
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!chapter) {
    return <div className="text-center py-32 text-destructive">Chapter tidak ditemukan.</div>;
  }

  return (
    <div className="-mx-4 -mt-20 min-h-screen bg-background relative">
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
              {comicInfo?.title?.replace(/^Komik\s*/i, "").trim() || "Chapter"}
            </h2>
          </div>
        </div>
        <button onClick={toggleFullScreen} className="w-10 h-10 flex items-center justify-center bg-background/60 backdrop-blur-md border border-border/30 rounded-full hover:bg-secondary transition">
          <Expand className="w-4 h-4" />
        </button>
      </div>

      {/* Images */}
      <div ref={containerRef} onClick={toggleUI} className="flex flex-col items-center min-h-screen w-full max-w-3xl mx-auto bg-card/50">
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

      {/* Bottom Navigation */}
      <div className={`fixed bottom-6 left-0 w-full z-[60] px-4 flex justify-center transition-all duration-300 ${uiVisible ? "" : "translate-y-full opacity-0"}`}>
        <div className="glass p-2 rounded-2xl flex gap-1 items-center shadow-2xl border border-border/30 bg-background/80 backdrop-blur-xl">
          <button
            onClick={() => nav?.prev && navigate(`/read/${nav.prev}`)}
            disabled={!nav?.prev}
            className={`w-10 h-10 flex items-center justify-center rounded-xl ${!nav?.prev ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground transition"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {comicInfo?.chapters && comicInfo.chapters.length > 0 && (
            <select
              value={slug}
              onChange={(e) => navigate(`/read/${e.target.value}`)}
              className="appearance-none bg-background/50 backdrop-blur border border-border/30 rounded-xl text-xs py-2.5 pl-3 pr-8 focus:outline-none focus:border-primary cursor-pointer hover:bg-secondary transition w-40 truncate"
            >
              {comicInfo.chapters.map((ch) => (
                <option key={ch.slug} value={ch.slug}>{ch.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => nav?.next && navigate(`/read/${nav.next}`)}
            disabled={!nav?.next}
            className={`w-10 h-10 flex items-center justify-center rounded-xl ${!nav?.next ? "opacity-30 cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg"}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
