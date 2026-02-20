import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || "Login gagal");
      } else {
        toast.success("Login berhasil!");
        navigate("/");
      }
    } else {
      if (password.length < 6) {
        toast.error("Password minimal 6 karakter");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message || "Register gagal");
      } else {
        toast.success("Akun berhasil dibuat!");
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md glass rounded-2xl p-8 border border-border/30 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <img src="/icon-512.png" alt="FmcComic" className="w-12 h-12 rounded-xl border border-primary/50" />
        </div>

        <h2 className="text-2xl font-extrabold text-center mb-2">
          {isLogin ? "Masuk" : "Daftar"}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {isLogin ? "Login untuk sync data bookmark & riwayat" : "Buat akun baru untuk mulai"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 mt-1 text-sm focus:outline-none focus:border-primary transition"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 mt-1 text-sm focus:outline-none focus:border-primary transition"
              placeholder="Min. 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? "Loading..." : isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
            {isLogin ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </div>
  );
}
