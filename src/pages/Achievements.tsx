import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  milestone_value: number;
  category: string;
}

interface UserAchievement {
  achievement_id: string;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all achievements
    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("*")
      .order("milestone_value", { ascending: true });

    // Fetch user's unlocked achievements
    const { data: userAchs } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user.id);

    if (allAchievements) setAchievements(allAchievements);
    if (userAchs) setUserAchievements(userAchs.map((a: UserAchievement) => a.achievement_id));
    setLoading(false);
  };

  const categories = [
    { key: "posts", label: "Posting Achievements", icon: "Share2" },
    { key: "streak", label: "Streak Achievements", icon: "Flame" },
    { key: "motivation_risk", label: "Risk-taking", icon: "Rocket" },
    { key: "motivation_diligence", label: "Diligence", icon: "CheckCircle" },
    { key: "motivation_responsibility", label: "Responsibility", icon: "Shield" },
    { key: "motivation_collaboration", label: "Collaboration", icon: "Users" },
    { key: "motivation_perseverance", label: "Perseverance", icon: "Mountain" },
    { key: "motivation_planning", label: "Planning", icon: "Calendar" },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-success rounded-2xl p-8 text-white shadow-glow">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Achievements</h1>
          <p className="text-white/90 text-lg">
            {userAchievements.length} of {achievements.length} badges unlocked
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Award className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((userAchievements.length / achievements.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-gradient-success h-4 rounded-full transition-all duration-500"
                style={{ width: `${(userAchievements.length / achievements.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Achievements by Category */}
        {categories.map((category) => {
          const categoryAchievements = achievements.filter(
            (a) => a.category === category.key || a.category.startsWith(category.key)
          );

          if (categoryAchievements.length === 0) return null;

          return (
            <Card key={category.key} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {category.label}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({categoryAchievements.filter(a => userAchievements.includes(a.id)).length}/{categoryAchievements.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      title={achievement.title}
                      description={achievement.description}
                      icon={achievement.icon}
                      unlocked={userAchievements.includes(achievement.id)}
                      size="md"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
};

export default Achievements;
