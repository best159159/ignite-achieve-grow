import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  goal_type: string;
  status: string;
  current_value: number | null;
  target_value: number | null;
  deadline: string | null;
}

interface GoalsOverviewProps {
  onGoalsChange: () => void;
}

export function GoalsOverview({ onGoalsChange }: GoalsOverviewProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filter !== 'all') {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      fetchGoals();
      onGoalsChange();
      toast({ title: "ลบเป้าหมายแล้ว" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq("id", goalId);

      if (error) throw error;

      fetchGoals();
      onGoalsChange();
      toast({ title: "🎉 สำเร็จแล้ว!" });
    } catch (error) {
      console.error("Error completing goal:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'smart_goal': return '🎯 SMART Goal';
      case 'weekly_mission': return '📅 Weekly Mission';
      case 'habit_stack': return '⛓️ Habit Stack';
      default: return type;
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.target_value) return 0;
    return Math.min(100, ((goal.current_value || 0) / goal.target_value) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          ทั้งหมด
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          กำลังดำเนินการ
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          สำเร็จแล้ว
        </Button>
      </div>

      <div className="space-y-3">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              ยังไม่มีเป้าหมาย ลองสร้างใหม่ได้เลย!
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{getTypeLabel(goal.goal_type)}</Badge>
                        {goal.status === 'completed' && (
                          <Badge className="bg-success">สำเร็จแล้ว ✓</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold">{goal.title}</h3>
                      {goal.deadline && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ⏰ ภายใน: {new Date(goal.deadline).toLocaleDateString('th-TH')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {goal.status === 'active' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => completeGoal(goal.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {goal.target_value && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ความคืบหน้า</span>
                        <span>{goal.current_value || 0} / {goal.target_value}</span>
                      </div>
                      <Progress value={calculateProgress(goal)} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}