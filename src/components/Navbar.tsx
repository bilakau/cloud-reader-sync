import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Flame, CheckCircle, Clock, Search, Bookmark, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50 transition-transform duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/icon-512.png"
                alt="FmcComic"
                className="w-9 h-9 rounded-xl object-cover border border-primary/50 shadow-lg shadow-primary/20 group-hover:scale-105 transition"
              />
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">
                Fmc<span className="text-foreground">Comic</span>
              </h1>
            </Link>

            <div className="hidden md:flex gap-6 text-sm font-medium">
              <Link to="/" className={`hover:text-primary transition ${location.pathname === "/" ? "text-primary" : ""}`}>
                Beranda
              </Link>
              <Link to="/ongoing" className={`hover:text-primary transition ${location.pathname === "/ongoing" ? "text-primary" : ""}`}>
                Ongoing
              </Link>
              <Link to="/completed" className={`hover:text-primary transition ${location.pathname === "/completed" ? "text-primary font-bold" : ""}`}>
                Selesai
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={handleSearch}
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  placeholder="Cari komik..."
                  className="bg-secondary border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition w-48 md:w-64"
                />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-full transition">
                <Search className="w-5 h-5" />
              </button>
            )}
            <Link to="/bookmarks" className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-full transition">
              <Bookmark className="w-5 h-5" />
            </Link>
            {user ? (
              <button onClick={() => signOut()} className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-full transition" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link to="/auth" className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-full transition">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 w-full glass border-t border-border/50 flex justify-around p-3 md:hidden z-50 pb-safe">
        <Link to="/" className={`flex flex-col items-center gap-1 w-16 ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/ongoing" className={`flex flex-col items-center gap-1 w-16 ${location.pathname === "/ongoing" ? "text-primary" : "text-muted-foreground"}`}>
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-[10px]">Hot</span>
        </Link>
        <Link to="/completed" className={`flex flex-col items-center gap-1 w-16 ${location.pathname === "/completed" ? "text-primary" : "text-muted-foreground"}`}>
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-[10px]">Tamat</span>
        </Link>
        <Link to="/history" className={`flex flex-col items-center gap-1 w-16 ${location.pathname === "/history" ? "text-primary" : "text-muted-foreground"}`}>
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Riwayat</span>
        </Link>
      </div>
    </>
  );
}
