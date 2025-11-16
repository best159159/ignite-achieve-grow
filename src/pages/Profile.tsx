import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import StreakDisplay from "@/components/StreakDisplay";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Award, TrendingUp, Edit } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  class_level: string | null;
  streak: number;
  total_days: number;
}

interface Achievement {
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setName(profileData.name || "");
      setClassLevel(profileData.class_level || "");
    }

    const { data: achievementsData } = await supabase
      .from("user_achievements")
      .select("achievements(*)")
      .eq("user_id", user.id);

    if (achievementsData) {
      setAchievements(achievementsData as Achievement[]);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        class_level: classLevel
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profile updated! ✓",
        description: "Your changes have been saved."
      });
      setIsEditing(false);
      fetchProfile();
    }
  };

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-glow">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary font-bold text-4xl">
              {profile.name?.[0] || "?"}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <p className="text-white/90">{profile.email}</p>
              {profile.class_level && (
                <p className="text-white/80 mt-1">Class: {profile.class_level}</p>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class Level</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full bg-gradient-primary">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StreakDisplay
            streak={profile.streak}
            totalDays={profile.total_days}
            size="lg"
          />

          <Card className="shadow-card">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-success rounded-lg flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold">{achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              Your Achievements ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No achievements yet. Keep learning to unlock badges!
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.achievements.id}
                    title={achievement.achievements.title}
                    description={achievement.achievements.description}
                    icon={achievement.achievements.icon}
                    unlocked={true}
                    size="md"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.streak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-secondary">{profile.total_days}</div>
                <div className="text-sm text-muted-foreground">Total Active Days</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-success">{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
