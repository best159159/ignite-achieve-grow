import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakDisplayProps {
  streak: number;
  totalDays: number;
  size?: "sm" | "md" | "lg";
}

const StreakDisplay = ({ streak, totalDays, size = "md" }: StreakDisplayProps) => {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-xl", label: "text-xs" },
    md: { icon: "w-10 h-10", text: "text-3xl", label: "text-sm" },
    lg: { icon: "w-16 h-16", text: "text-5xl", label: "text-base" }
  };

  return (
    <Card className="bg-gradient-secondary border-0 shadow-glow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Flame className={`${sizes[size].icon} text-white animate-pulse`} />
          </div>
          <div>
            <div className={`${sizes[size].text} font-bold text-white`}>{streak}</div>
            <div className={`${sizes[size].label} text-white/90`}>Day Streak</div>
          </div>
        </div>
        <div className={`mt-3 ${sizes[size].label} text-white/80`}>
          {totalDays} total active days
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
