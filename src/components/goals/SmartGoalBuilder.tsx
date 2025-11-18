import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface SmartGoalBuilderProps {
  onGoalCreated: () => void;
}

export function SmartGoalBuilder({ onGoalCreated }: SmartGoalBuilderProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [subGoals, setSubGoals] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const categories = [
    "การเรียน",
    "สุขภาพ",
    "ทักษะใหม่",
    "ความสัมพันธ์",
    "การเงิน",
    "อื่นๆ"
  ];

  const calculateAchievability = () => {
    let score = 50;
    if (category) score += 10;
    if (title.length > 10) score += 10;
    if (description.length > 20) score += 10;
    if (targetValue) score += 10;
    if (deadline) score += 10;
    return Math.min(score, 100);
  };

  const handleSaveGoal = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        goal_type: "smart_goal",
        category,
        title,
        description,
        target_value: parseFloat(targetValue) || 100,
        deadline,
        sub_goals: subGoals.filter(sg => sg.trim()),
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "สำเร็จ! 🎉",
        description: "สร้าง SMART Goal เรียบร้อยแล้ว",
      });

      // Reset form
      setStep(1);
      setCategory("");
      setTitle("");
      setDescription("");
      setTargetValue("");
      setDeadline("");
      setSubGoals([""]);
      onGoalCreated();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกเป้าหมายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          SMART Goal Builder
        </CardTitle>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">ขั้นตอน {step} จาก {totalSteps}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>เลือกหมวดหมู่</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>ระบุเป้าหมายของคุณ</Label>
              <Input
                placeholder="เช่น: ได้คะแนนคณิตศาสตร์ 80+ ในสอบกลางภาค"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>รายละเอียด (optional)</Label>
              <Textarea
                placeholder="อธิบายเพิ่มเติมเกี่ยวกับเป้าหมาย..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>ตัวชี้วัดความสำเร็จ (ตัวเลข)</Label>
              <Input
                type="number"
                placeholder="เช่น: 80 (คะแนน), 10 (ครั้ง), 5 (ชั่วโมง)"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                ระบุเป็นตัวเลขเพื่อวัดความก้าวหน้า
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>กำหนดระยะเวลา</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label>แบ่งเป็น Sub-goals (ขั้นตอนย่อย)</Label>
              {subGoals.map((subGoal, idx) => (
                <div key={idx} className="flex gap-2 mt-2">
                  <Input
                    placeholder={`ขั้นตอนที่ ${idx + 1}`}
                    value={subGoal}
                    onChange={(e) => {
                      const newSubGoals = [...subGoals];
                      newSubGoals[idx] = e.target.value;
                      setSubGoals(newSubGoals);
                    }}
                  />
                  {idx === subGoals.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSubGoals([...subGoals, ""])}
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Card className="bg-success/10 border-success">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Achievability Score</p>
                    <p className="text-sm text-muted-foreground">ความเป็นไปได้ที่จะบรรลุเป้าหมาย</p>
                  </div>
                  <div className="text-3xl font-bold text-success">
                    {calculateAchievability()}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            ย้อนกลับ
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(Math.min(totalSteps, step + 1))}
              disabled={
                (step === 1 && !category) ||
                (step === 2 && !title) ||
                (step === 3 && !targetValue) ||
                (step === 4 && !deadline)
              }
            >
              ถัดไป
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSaveGoal} disabled={loading}>
              <Check className="w-4 h-4 mr-2" />
              {loading ? "กำลังบันทึก..." : "บันทึกเป้าหมาย"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}