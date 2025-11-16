import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import StreakDisplay from "@/components/StreakDisplay";
import AchievementBadge from "@/components/AchievementBadge";
import MotivationDialog from "@/components/MotivationDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Award, Share2, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  streak: number;
  total_days: number;
  name: string;
  last_activity_date: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

const Dashboard = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [showMotivationDialog, setShowMotivationDialog] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Check if user needs daily motivation check-in
      const today = new Date().toISOString().split('T')[0];
      const { data: todayScore } = await supabase
        .from("motivation_scores")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", today)
        .single();

      if (!todayScore) {
        setTimeout(() => setShowMotivationDialog(true), 1000);
      }
    }

    // Fetch recent achievements
    const { data: achievements } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (achievements) {
      setRecentAchievements(achievements.map(a => a.achievements).filter(Boolean) as Achievement[]);
    }

    // Fetch recent posts from all users
    const { data: posts } = await supabase
      .from("posts")
      .select("id, content, created_at, profiles(name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (posts) {
      setRecentPosts(posts as Post[]);
    }
  };

  const handleMotivationSubmit = () => {
    fetchDashboardData();
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-glow">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {profile?.name || "Student"}! 🚀
          </h1>
          <p className="text-white/90 text-lg">
            Keep up the amazing work. Your learning journey continues!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StreakDisplay
            streak={profile?.streak || 0}
            totalDays={profile?.total_days || 0}
          />

          <Card className="shadow-card hover-scale cursor-pointer" onClick={() => navigate("/stats")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">View Stats</div>
                  <div className="text-sm text-muted-foreground">Track your motivation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover-scale cursor-pointer" onClick={() => navigate("/achievements")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{recentAchievements.length}</div>
                  <div className="text-sm text-muted-foreground">Recent badges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/share")} className="bg-gradient-primary">
              <Share2 className="w-4 h-4 mr-2" />
              Share Today's Learning
            </Button>
            <Button onClick={() => setShowMotivationDialog(true)} variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Daily Motivation Check-in
            </Button>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 overflow-x-auto pb-2">
                {recentAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    unlocked={true}
                    size="sm"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Posts Feed */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Recent Learning Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No posts yet. Be the first to share what you learned!
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                      {post.profiles.name?.[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{post.profiles.name}</div>
                      <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <MotivationDialog
        open={showMotivationDialog}
        onOpenChange={setShowMotivationDialog}
        userId={userId}
        onSubmit={handleMotivationSubmit}
      />
    </Layout>
  );
};

export default Dashboard;
