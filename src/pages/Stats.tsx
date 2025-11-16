import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MotivationScore {
  risk: number;
  diligence: number;
  responsibility: number;
  collaboration: number;
  perseverance: number;
  planning: number;
  created_at: string;
}

const Stats = () => {
  const [motivationScores, setMotivationScores] = useState<MotivationScore[]>([]);
  const [latestScore, setLatestScore] = useState<MotivationScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: scores } = await supabase
      .from("motivation_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (scores && scores.length > 0) {
      setMotivationScores(scores.reverse());
      setLatestScore(scores[0]);
    }
    setLoading(false);
  };

  const radarData = latestScore ? [
    { dimension: "Risk", value: latestScore.risk, fullMark: 10 },
    { dimension: "Diligence", value: latestScore.diligence, fullMark: 10 },
    { dimension: "Responsibility", value: latestScore.responsibility, fullMark: 10 },
    { dimension: "Collaboration", value: latestScore.collaboration, fullMark: 10 },
    { dimension: "Perseverance", value: latestScore.perseverance, fullMark: 10 },
    { dimension: "Planning", value: latestScore.planning, fullMark: 10 },
  ] : [];

  const trendData = motivationScores.map((score, index) => ({
    date: new Date(score.created_at).toLocaleDateString(),
    risk: score.risk,
    diligence: score.diligence,
    responsibility: score.responsibility,
    collaboration: score.collaboration,
    perseverance: score.perseverance,
    planning: score.planning,
  }));

  const avgScores = latestScore ? [
    { name: "Risk", score: latestScore.risk },
    { name: "Diligence", score: latestScore.diligence },
    { name: "Responsibility", score: latestScore.responsibility },
    { name: "Collaboration", score: latestScore.collaboration },
    { name: "Perseverance", score: latestScore.perseverance },
    { name: "Planning", score: latestScore.planning },
  ] : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!latestScore) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-glow">
            <h1 className="text-3xl font-bold mb-2">Statistics</h1>
            <p className="text-white/90">Track your motivation and growth</p>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No data yet</h3>
              <p className="text-muted-foreground">
                Complete your daily motivation check-in to start seeing your stats!
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-glow">
          <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
          <p className="text-white/90">Track your motivation dimensions and growth over time</p>
        </div>

        {/* Current Scores Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {avgScores.map((item) => (
            <Card key={item.name} className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{item.score}</div>
                <div className="text-xs text-muted-foreground">{item.name}</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all"
                    style={{ width: `${(item.score / 10) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Radar Chart - Current Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Your Motivation Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--foreground))' }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Radar
                  name="Current Scores"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Latest Scores */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              Dimension Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))' }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="score" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Over Time */}
        {trendData.length > 1 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="risk" stroke="hsl(185 85% 45%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="diligence" stroke="hsl(14 90% 65%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="responsibility" stroke="hsl(142 76% 45%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="collaboration" stroke="hsl(270 70% 60%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="perseverance" stroke="hsl(30 90% 60%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="planning" stroke="hsl(220 70% 55%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Stats;
