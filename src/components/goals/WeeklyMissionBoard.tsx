import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  status: string;
  metadata: any;
}

interface WeeklyMissionBoardProps {
  onMissionChange: () => void;
}

export function WeeklyMissionBoard({ onMissionChange }: WeeklyMissionBoardProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("goal_type", "weekly_mission")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  const addMission = async () => {
    if (!newMission.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        goal_type: "weekly_mission",
        category: "weekly",
        title: newMission,
        status: "active",
        metadata: { column: "todo" },
      });

      if (error) throw error;

      setNewMission("");
      fetchMissions();
      onMissionChange();
      
      toast({
        title: "เพิ่ม Mission สำเร็จ! 🎯",
      });
    } catch (error) {
      console.error("Error adding mission:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMissionColumn = async (missionId: string, column: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ 
          metadata: { column },
          status: column === 'completed' ? 'completed' : 'active',
          completed_at: column === 'completed' ? new Date().toISOString() : null
        })
        .eq("id", missionId);

      if (error) throw error;

      fetchMissions();
      onMissionChange();
    } catch (error) {
      console.error("Error updating mission:", error);
    }
  };

  const columns = [
    { id: 'todo', title: '📝 To Do', color: 'bg-muted' },
    { id: 'inprogress', title: '⚡ In Progress', color: 'bg-primary/10' },
    { id: 'completed', title: '✅ Completed', color: 'bg-success/10' },
  ];

  const getMissionsByColumn = (columnId: string) => {
    return missions.filter((m) => (m.metadata?.column || 'todo') === columnId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่ม Mission ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="เช่น: ทำการบ้านคณิตศาสตร์"
              value={newMission}
              onChange={(e) => setNewMission(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMission()}
            />
            <Button onClick={addMission} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <Card key={column.id} className={column.color}>
            <CardHeader>
              <CardTitle className="text-lg">{column.title}</CardTitle>
              <Badge variant="outline">{getMissionsByColumn(column.id).length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {getMissionsByColumn(column.id).map((mission) => (
                <Card key={mission.id} className="cursor-move hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm">{mission.title}</p>
                        <div className="flex gap-1 mt-2">
                          {column.id !== 'todo' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateMissionColumn(mission.id, 'todo')}
                            >
                              ← Todo
                            </Button>
                          )}
                          {column.id !== 'inprogress' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateMissionColumn(mission.id, 'inprogress')}
                            >
                              {column.id === 'todo' ? 'Start →' : '← Progress'}
                            </Button>
                          )}
                          {column.id !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateMissionColumn(mission.id, 'completed')}
                            >
                              ✓ Done
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-primary text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {getMissionsByColumn('completed').length} / {missions.length}
            </p>
            <p className="text-sm opacity-90">Missions ที่เสร็จสมบูรณ์ในสัปดาห์นี้</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}