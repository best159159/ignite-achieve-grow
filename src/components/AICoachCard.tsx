import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AICoachCard = () => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMorningBriefing();
  }, []);

  const fetchMorningBriefing = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { type: 'morning_briefing', userId: user.id }
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error: any) {
      console.error("Error fetching AI coach:", error);
      
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        setMessage("😅 ใช้งาน AI บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่นะ");
      } else if (error.message?.includes('402') || error.message?.includes('payment')) {
        setMessage("⚠️ ระบบ AI ไม่สามารถใช้งานได้ชั่วคราว กรุณาติดต่อผู้ดูแลระบบ");
      } else {
        setMessage("สวัสดีตอนเช้า! 🌅 พร้อมเริ่มต้นวันใหม่กับการเรียนรู้หรือยัง? มาไฟต์กันเถอะ! 💪");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          AI Learning Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {message || "กำลังโหลด..."}
            </div>
            <Button 
              onClick={fetchMorningBriefing} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              รีเฟรช
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICoachCard;