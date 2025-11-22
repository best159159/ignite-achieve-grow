import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, Image as ImageIcon } from "lucide-react";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

const Share = () => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to realtime posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(name, avatar_url)")
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data as Post[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something to share!",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check and update streak
    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      const lastActivity = profile.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = profile.streak;
      let newTotalDays = profile.total_days + 1;

      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }

      await supabase
        .from("profiles")
        .update({
          streak: newStreak,
          total_days: newTotalDays,
          last_activity_date: today
        })
        .eq("id", user.id);

      // Check for streak achievements
      checkAchievements(user.id, newStreak);
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      image_url: imageUrl.trim() || null
    });

    if (error) {
      toast({
        title: "Error posting",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Count total posts after inserting
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      if (count) {
        await checkPostAchievements(user.id, count);
      }

      toast({
        title: "Posted successfully! 🎉",
        description: "Your learning has been shared with classmates."
      });
      setContent("");
      setImageUrl("");
      fetchPosts();
    }
    setLoading(false);
  };

  const checkPostAchievements = async (userId: string, postCount: number) => {
    // Check for post milestones: 1, 10, 20, 50
    const postMilestones = [1, 10, 20, 50];
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .eq("category", "posts")
      .in("milestone_value", postMilestones);

    if (achievements) {
      for (const achievement of achievements) {
        if (postCount >= achievement.milestone_value) {
          // Check if user already has this achievement
          const { data: existing } = await supabase
            .from("user_achievements")
            .select("id")
            .eq("user_id", userId)
            .eq("achievement_id", achievement.id)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase
              .from("user_achievements")
              .insert({
                user_id: userId,
                achievement_id: achievement.id
              });

            if (!error) {
              toast({
                title: "Achievement Unlocked! 🏆",
                description: `${achievement.title} - ${achievement.description}`,
              });
            }
          }
        }
      }
    }
  };

  const checkAchievements = async (userId: string, streak: number) => {
    const streakMilestones = [3, 7, 14, 30];
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .eq("category", "streak")
      .in("milestone_value", streakMilestones);

    if (achievements) {
      for (const achievement of achievements) {
        if (streak >= achievement.milestone_value) {
          const { error } = await supabase
            .from("user_achievements")
            .insert({
              user_id: userId,
              achievement_id: achievement.id
            });

          if (!error) {
            toast({
              title: `Achievement Unlocked! 🏆`,
              description: `${achievement.title} - ${achievement.description}`
            });
          }
        }
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-glow">
          <h1 className="text-3xl font-bold mb-2">Share What You Learned</h1>
          <p className="text-white/90">Inspire your classmates with your learning journey!</p>
        </div>

        {/* Create Post */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Create a Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">What did you learn today?</Label>
                <Textarea
                  id="content"
                  placeholder="Share your insights, aha moments, or interesting facts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image URL (optional)
                </Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary">
                {loading ? "Posting..." : "Share with Classmates"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Class Feed</h2>
          {posts.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                No posts yet. Be the first to share!
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="shadow-card hover-scale">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {post.profiles.name?.[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{post.profiles.name}</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {new Date(post.created_at).toLocaleDateString()} at{" "}
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-foreground mb-3">{post.content}</p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Share;
