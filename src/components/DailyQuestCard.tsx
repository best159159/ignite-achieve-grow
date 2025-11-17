import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle } from "lucide-react";

interface DailyQuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    xp_reward: number;
    target_value: number;
  };
  userQuest?: {
    id: string;
    progress: number;
    status: string;
  };
  onUpdate: () => void;
}

const difficultyConfig = {
  easy: { stars: "⭐", color: "text-green-500", bg: "bg-green-500/10" },
  medium: { stars: "⭐⭐", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  hard: { stars: "⭐⭐⭐", color: "text-red-500", bg: "bg-red-500/10" },
};

const DailyQuestCard = ({ quest, userQuest, onUpdate }: DailyQuestCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const config = difficultyConfig[quest.difficulty];
  const progress = userQuest ? (userQuest.progress / quest.target_value) * 100 : 0;
  const isCompleted = userQuest?.status === 'completed';

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (userQuest) {
        // Update progress
        const newProgress = Math.min(userQuest.progress + 1, quest.target_value);
        const newStatus = newProgress >= quest.target_value ? 'completed' : 'active';

        await supabase
          .from("user_quests")
          .update({ 
            progress: newProgress,
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null
          })
          .eq("id", userQuest.id);

        if (newStatus === 'completed') {
          // Award XP
          const { data: profile } = await supabase
            .from("profiles")
            .select("xp, quest_streak, last_quest_date")
            .eq("id", user.id)
            .single();

          const today = new Date().toISOString().split('T')[0];
          const lastQuestDate = profile?.last_quest_date;
          const newStreak = lastQuestDate === today ? profile.quest_streak : (profile?.quest_streak || 0) + 1;

          await supabase
            .from("profiles")
            .update({ 
              xp: (profile?.xp || 0) + quest.xp_reward,
              quest_streak: newStreak,
              last_quest_date: today
            })
            .eq("id", user.id);

          toast({
            title: "เยี่ยมมาก! 🎉",
            description: `คุณทำภารกิจสำเร็จและได้ +${quest.xp_reward} XP`,
          });
        }
      } else {
        // Create new user quest
        await supabase
          .from("user_quests")
          .insert({
            user_id: user.id,
            quest_id: quest.id,
            progress: 1,
            assigned_date: new Date().toISOString().split('T')[0],
            status: 1 >= quest.target_value ? 'completed' : 'active',
            completed_at: 1 >= quest.target_value ? new Date().toISOString() : null
          });
      }

      onUpdate();
    } catch (error) {
      console.error("Error completing quest:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทภารกิจได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`${config.bg} border-0 shadow-card hover-scale transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <h3 className="font-semibold">{quest.title}</h3>
          </div>
          <span className={`text-sm ${config.color}`}>{config.stars}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress: {userQuest?.progress || 0}/{quest.target_value}
            </span>
            <span className="font-bold text-primary">+{quest.xp_reward} XP</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {!isCompleted && (
            <Button 
              onClick={handleComplete} 
              disabled={loading}
              className="w-full bg-gradient-primary"
              size="sm"
            >
              {loading ? "กำลังบันทึก..." : "ทำภารกิจ +1"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuestCard;