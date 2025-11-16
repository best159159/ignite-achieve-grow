import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MotivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmit?: () => void;
}

const dimensions = [
  { key: "risk", label: "Risk-taking", description: "Willingness to try new challenges" },
  { key: "diligence", label: "Diligence", description: "Careful and persistent work" },
  { key: "responsibility", label: "Responsibility", description: "Taking ownership of tasks" },
  { key: "collaboration", label: "Collaboration", description: "Working well with others" },
  { key: "perseverance", label: "Perseverance", description: "Continuing despite difficulties" },
  { key: "planning", label: "Planning", description: "Organizing and preparing ahead" },
];

const MotivationDialog = ({ open, onOpenChange, userId, onSubmit }: MotivationDialogProps) => {
  const [scores, setScores] = useState<Record<string, number>>({
    risk: 5,
    diligence: 5,
    responsibility: 5,
    collaboration: 5,
    perseverance: 5,
    planning: 5,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from("motivation_scores").insert({
      user_id: userId,
      ...scores,
    });

    if (error) {
      toast({
        title: "Error saving scores",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Motivation scores saved! 🎯",
        description: "Your daily assessment is complete.",
      });
      onOpenChange(false);
      onSubmit?.();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Daily Motivation Check-in</DialogTitle>
          <DialogDescription>
            Rate yourself on these 6 dimensions (1-10). Be honest - this helps track your growth!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {dimensions.map((dim) => (
            <div key={dim.key} className="space-y-3">
              <div>
                <Label className="text-base font-semibold">{dim.label}</Label>
                <p className="text-sm text-muted-foreground">{dim.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-8">1</span>
                <Slider
                  value={[scores[dim.key]]}
                  onValueChange={(value) => setScores({ ...scores, [dim.key]: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-8">10</span>
                <span className="text-lg font-bold text-primary w-8">{scores[dim.key]}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-primary">
            {loading ? "Saving..." : "Submit Assessment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MotivationDialog;
