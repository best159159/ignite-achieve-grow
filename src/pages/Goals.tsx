import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, Repeat } from "lucide-react";
import { SmartGoalBuilder } from "@/components/goals/SmartGoalBuilder";
import { WeeklyMissionBoard } from "@/components/goals/WeeklyMissionBoard";
import { HabitStackBuilder } from "@/components/goals/HabitStackBuilder";
import { GoalsOverview } from "@/components/goals/GoalsOverview";
import { supabase } from "@/integrations/supabase/client";

export default function Goals() {
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);

  useEffect(() => {
    fetchActiveGoals();
  }, []);

  const fetchActiveGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("goals")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .eq("status", "active");

    setActiveGoalsCount(count || 0);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            🎯 Goal Setting
          </h1>
          <p className="text-muted-foreground mt-2">
            ตั้งเป้าหมาย วางแผน และติดตามความก้าวหน้าของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeGoalsCount}</p>
                  <p className="text-sm text-muted-foreground">เป้าหมายที่กำลังดำเนินการ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="smart">
              <Target className="w-4 h-4 mr-2" />
              SMART Goals
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <Calendar className="w-4 h-4 mr-2" />
              Weekly Missions
            </TabsTrigger>
            <TabsTrigger value="habits">
              <Repeat className="w-4 h-4 mr-2" />
              Habit Stacks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <GoalsOverview onGoalsChange={fetchActiveGoals} />
          </TabsContent>

          <TabsContent value="smart">
            <SmartGoalBuilder onGoalCreated={fetchActiveGoals} />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyMissionBoard onMissionChange={fetchActiveGoals} />
          </TabsContent>

          <TabsContent value="habits">
            <HabitStackBuilder onHabitCreated={fetchActiveGoals} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}