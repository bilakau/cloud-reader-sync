import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RatingStarsProps {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
  onRate: (rating: number) => void;
  compact?: boolean;
}

export function RatingStars({ averageRating, totalRatings, userRating, onRate, compact }: RatingStarsProps) {
  const { user } = useAuth();

  const handleRate = (rating: number) => {
    if (!user) {
      toast.error("Login untuk memberikan rating");
      return;
    }
    onRate(rating);
    toast.success(`Rating ${rating} bintang diberikan!`);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
        <span className="text-xs font-bold text-primary">{averageRating || "—"}</span>
        <span className="text-[10px] text-muted-foreground">({totalRatings})</span>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 rounded-2xl p-5 border border-border/30">
      <h3 className="font-bold text-sm mb-3 text-primary uppercase tracking-wide">Rating</h3>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-4xl font-extrabold text-primary">{averageRating || "—"}</span>
        <div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(averageRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{totalRatings} rating</p>
        </div>
      </div>

      <div className="border-t border-border/30 pt-3">
        <p className="text-xs text-muted-foreground mb-2">
          {userRating ? `Rating kamu: ${userRating}★` : "Beri rating:"}
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => handleRate(s)}
              className="group p-1 hover:scale-125 transition"
            >
              <Star className={`w-6 h-6 transition ${s <= (userRating || 0) ? "fill-primary text-primary" : "text-muted-foreground/40 group-hover:text-primary"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
