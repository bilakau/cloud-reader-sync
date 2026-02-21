import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, bio")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
      }
      setLoading(false);
    })();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ username, bio }).eq("user_id", user.id);
    setSaving(false);
    toast.success("Profil disimpan!");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Berhasil logout");
  };

  if (loading) {
    return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">Profil</h2>

      <div className="glass rounded-2xl p-6 border border-border/30 space-y-5">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-bold">{username || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl py-3 px-4 mt-1 text-sm focus:outline-none focus:border-primary transition"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl py-3 px-4 mt-1 text-sm focus:outline-none focus:border-primary transition resize-none h-24"
            placeholder="Ceritakan tentang dirimu..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl font-semibold border border-destructive/30 text-destructive flex items-center justify-center gap-2 hover:bg-destructive/10 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
