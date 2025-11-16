-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  class_level TEXT,
  streak INT DEFAULT 0,
  total_days INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  milestone_value INT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create motivation_scores table
CREATE TABLE IF NOT EXISTS public.motivation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  risk INT CHECK (risk >= 1 AND risk <= 10),
  diligence INT CHECK (diligence >= 1 AND diligence <= 10),
  responsibility INT CHECK (responsibility >= 1 AND responsibility <= 10),
  collaboration INT CHECK (collaboration >= 1 AND collaboration <= 10),
  perseverance INT CHECK (perseverance >= 1 AND perseverance <= 10),
  planning INT CHECK (planning >= 1 AND planning <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for posts
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for motivation_scores
CREATE POLICY "Users can view own motivation scores" ON public.motivation_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own motivation scores" ON public.motivation_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view friendships they're part of" ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create friendship requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendships they're part of" ON public.friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert initial achievements
INSERT INTO public.achievements (title, description, icon, milestone_value, category) VALUES
  ('First Steps', 'Posted your first learning share!', 'Star', 1, 'posts'),
  ('Getting Started', 'Posted 10 times!', 'Award', 10, 'posts'),
  ('Prolific Learner', 'Posted 20 times!', 'Trophy', 20, 'posts'),
  ('Knowledge Master', 'Posted 50 times!', 'Crown', 50, 'posts'),
  
  ('3-Day Streak', 'Maintained a 3-day learning streak!', 'Flame', 3, 'streak'),
  ('Week Warrior', 'Maintained a 7-day learning streak!', 'Zap', 7, 'streak'),
  ('Two Week Champion', 'Maintained a 14-day learning streak!', 'Target', 14, 'streak'),
  ('Monthly Master', 'Maintained a 30-day learning streak!', 'Medal', 30, 'streak'),
  
  ('Risk Taker', 'Mastered risk-taking dimension!', 'Rocket', 8, 'motivation_risk'),
  ('Diligent Student', 'Mastered diligence dimension!', 'CheckCircle', 8, 'motivation_diligence'),
  ('Responsible Leader', 'Mastered responsibility dimension!', 'Shield', 8, 'motivation_responsibility'),
  ('Team Player', 'Mastered collaboration dimension!', 'Users', 8, 'motivation_collaboration'),
  ('Never Give Up', 'Mastered perseverance dimension!', 'Mountain', 8, 'motivation_perseverance'),
  ('Strategic Planner', 'Mastered planning dimension!', 'Calendar', 8, 'motivation_planning')
ON CONFLICT DO NOTHING;