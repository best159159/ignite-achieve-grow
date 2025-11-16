import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const AchievementBadge = ({
  title,
  description,
  icon,
  unlocked,
  size = "md",
  animated = true
}: AchievementBadgeProps) => {
  const IconComponent = (Icons as any)[icon] as LucideIcon || Icons.Award;
  
  const sizes = {
    sm: { container: "w-20", icon: "w-8 h-8", text: "text-xs", badge: "w-16 h-16" },
    md: { container: "w-28", icon: "w-12 h-12", text: "text-sm", badge: "w-24 h-24" },
    lg: { container: "w-40", icon: "w-16 h-16", text: "text-base", badge: "w-32 h-32" }
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 transition-all",
      sizes[size].container,
      unlocked && animated && "hover:scale-110"
    )}>
      <div className={cn(
        "rounded-full flex items-center justify-center shadow-lg transition-all",
        sizes[size].badge,
        unlocked
          ? "bg-gradient-secondary shadow-glow animate-scale-in"
          : "bg-muted opacity-40"
      )}>
        <IconComponent className={cn(
          sizes[size].icon,
          unlocked ? "text-white" : "text-muted-foreground"
        )} />
      </div>
      <div className="text-center">
        <div className={cn(
          "font-semibold",
          sizes[size].text,
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {title}
        </div>
        <div className={cn(
          "text-muted-foreground",
          size === "sm" ? "text-[10px]" : "text-xs",
          "line-clamp-2"
        )}>
          {description}
        </div>
      </div>
      {unlocked && (
        <div className="text-xs text-success font-medium">Unlocked! ✓</div>
      )}
    </div>
  );
};

export default AchievementBadge;
