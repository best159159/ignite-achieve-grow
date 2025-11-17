import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Sparkles } from "lucide-react";

interface MysteryBoxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  box: {
    id: string;
    rarity: string;
    reward_type: string | null;
    reward_data: any;
    is_opened: boolean;
  } | null;
  onOpened: () => void;
}

const rarityConfig: Record<string, { glow: string; text: string; emoji: string }> = {
  common: { glow: "shadow-md", text: "Common", emoji: "📦" },
  rare: { glow: "shadow-lg shadow-blue-500/50", text: "Rare", emoji: "🎁" },
  epic: { glow: "shadow-xl shadow-purple-500/50", text: "Epic", emoji: "✨" },
  legendary: { glow: "shadow-2xl shadow-yellow-500/50", text: "Legendary", emoji: "🌟" },
};

const MysteryBoxDialog = ({ open, onOpenChange, box, onOpened }: MysteryBoxDialogProps) => {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const { toast } = useToast();

  const handleOpen = async () => {
    if (!box || box.is_opened) return;
    
    setOpening(true);
    
    // Simulate opening animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Generate reward
      const random = Math.random() * 100;
      let rewardType: string;
      let rewardData: any;

      if (random < 60) {
        // XP Boost
        const xpAmount = box.rarity === 'legendary' ? 1000 : 
                        box.rarity === 'epic' ? 500 : 
                        box.rarity === 'rare' ? 200 : 75;
        rewardType = 'xp';
        rewardData = { amount: xpAmount };
      } else if (random < 75) {
        // Badge
        rewardType = 'badge';
        rewardData = { name: "Mystery Badge", description: "Unlocked from Mystery Box" };
      } else if (random < 90) {
        // Cosmetic
        rewardType = 'cosmetic';
        rewardData = { type: "avatar_frame", name: "Cosmic Frame" };
      } else {
        // Privilege
        rewardType = 'privilege';
        rewardData = { type: "2x_xp_boost", duration: 24 };
      }

      // Update box
      await supabase
        .from("mystery_boxes")
        .update({
          is_opened: true,
          reward_type: rewardType as 'xp' | 'badge' | 'cosmetic' | 'privilege',
          reward_data: rewardData,
          opened_at: new Date().toISOString()
        })
        .eq("id", box.id);

      // Award reward
      const { data: { user } } = await supabase.auth.getUser();
      if (user && rewardType === 'xp') {
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp")
          .eq("id", user.id)
          .single();

        await supabase
          .from("profiles")
          .update({ xp: (profile?.xp || 0) + rewardData.amount })
          .eq("id", user.id);
      }

      setReward({ type: rewardType, data: rewardData });
      
      toast({
        title: "ยินดีด้วย! 🎉",
        description: `คุณได้รับรางวัล${rewardType === 'xp' ? ` ${rewardData.amount} XP` : ''}`,
      });

      onOpened();
    } catch (error) {
      console.error("Error opening box:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปิดกล่องได้",
        variant: "destructive",
      });
    } finally {
      setOpening(false);
    }
  };

  if (!box) return null;

  const config = rarityConfig[box.rarity] || rarityConfig.common;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {reward ? "รางวัลของคุณ! 🎊" : "Mystery Box"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {reward ? config.text + " Reward" : "แตะเพื่อเปิดกล่องลึกลับ"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {!reward ? (
            <div 
              className={`w-40 h-40 rounded-3xl bg-gradient-secondary flex items-center justify-center cursor-pointer transform transition-all hover:scale-110 ${config.glow} ${opening ? 'animate-bounce' : ''}`}
              onClick={!opening ? handleOpen : undefined}
            >
              <div className="text-6xl animate-pulse">{config.emoji}</div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center ${config.glow}`}>
                {reward.type === 'xp' && <Sparkles className="w-16 h-16 text-white" />}
                {reward.type === 'badge' && <Gift className="w-16 h-16 text-white" />}
                {reward.type === 'cosmetic' && <span className="text-6xl">🎨</span>}
                {reward.type === 'privilege' && <span className="text-6xl">⚡</span>}
              </div>

              <div>
                <div className="text-xl font-bold mb-2">
                  {reward.type === 'xp' && `${reward.data.amount} XP Boost`}
                  {reward.type === 'badge' && reward.data.name}
                  {reward.type === 'cosmetic' && reward.data.name}
                  {reward.type === 'privilege' && '2x XP Boost (24 ชม.)'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rarity: {config.text}
                </div>
              </div>
            </div>
          )}
        </div>

        {reward && (
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-primary">
            เยี่ยมเลย!
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MysteryBoxDialog;