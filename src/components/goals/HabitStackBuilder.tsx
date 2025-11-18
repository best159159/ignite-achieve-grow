import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Link as LinkIcon, Flame } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  sub_goals: any;
  metadata: any;
}

interface HabitStackBuilderProps {
  onHabitCreated: () => void;
}

export function HabitStackBuilder({ onHabitCreated }: HabitStackBuilderProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [habitChain, setHabitChain] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("goal_type", "habit_stack")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const addToChain = () => {
    if (!newHabit.trim()) return;
    setHabitChain([...habitChain, newHabit]);
    setNewHabit("");
  };

  const saveHabitStack = async () => {
    if (habitChain.length === 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        goal_type: "habit_stack",
        category: "habits",
        title: `Habit Stack: ${habitChain[0]} → ... (${habitChain.length} habits)`,
        sub_goals: habitChain,
        status: "active",
        metadata: { streak: 0, strength: 0 },
      });

      if (error) throw error;

      setHabitChain([]);
      fetchHabits();
      onHabitCreated();
      
      toast({
        title: "สร้าง Habit Stack สำเร็จ! ⛓️",
        description: "เริ่มต้น check-in รายวันได้เลย",
      });
    } catch (error) {
      console.error("Error saving habit stack:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkInHabit = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const newStreak = (habit.metadata?.streak || 0) + 1;
      const newStrength = Math.min(100, (habit.metadata?.strength || 0) + 5);

      const { error } = await supabase
        .from("goals")
        .update({
          metadata: { streak: newStreak, strength: newStrength }
        })
        .eq("id", habitId);

      if (error) throw error;

      fetchHabits();
      toast({
        title: `🔥 Streak ${newStreak} วัน!`,
        description: `Habit Strength: ${newStrength}%`,
      });
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>สร้าง Habit Stack ใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="เช่น: ตื่นนอน → ดื่มน้ำ → ออกกำลังกาย"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addToChain()}
            />
            <Button onClick={addToChain}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม
            </Button>
          </div>

          {habitChain.length > 0 && (
            <>
              <div className="space-y-2">
                {habitChain.map((habit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-lg">
                      {idx + 1}. {habit}
                    </div>
                    {idx < habitChain.length - 1 && (
                      <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setHabitChain([])}>
                  ล้าง
                </Button>
                <Button onClick={saveHabitStack} disabled={loading} className="flex-1">
                  บันทึก Habit Stack ({habitChain.length} habits)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Habit Stacks ของคุณ</h3>
        {habits.map((habit) => (
          <Card key={habit.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{habit.title}</h4>
                  <div className="space-y-1">
                    {(habit.sub_goals || []).map((step, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        {idx > 0 && <span className="text-xs">↓</span>}
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-5 h-5" />
                    <span className="text-2xl font-bold">{habit.metadata?.streak || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">วันติดต่อกัน</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Habit Strength</span>
                  <span className="font-semibold">{habit.metadata?.strength || 0}%</span>
                </div>
                <Progress value={habit.metadata?.strength || 0} className="h-2" />
              </div>

              <Button onClick={() => checkInHabit(habit.id)} className="w-full">
                ✓ Daily Check-in
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}