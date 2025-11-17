-- Create enum types
CREATE TYPE quest_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE quest_status AS ENUM ('active', 'completed', 'expired');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'failed', 'paused');
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
CREATE TYPE reward_type AS ENUM ('xp', 'badge', 'cosmetic', 'privilege');
CREATE TYPE box_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Goals table (SMART goals, weekly missions, habit stacks)
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'smart', 'weekly_mission', 'habit_stack'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  status goal_status DEFAULT 'active',
  deadline TIMESTAMP WITH TIME ZONE,
  sub_goals JSONB, -- Array of sub-goals
  metadata JSONB, -- Extra data like achievability_score, habit_stack_formula
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Daily quests
CREATE TABLE public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty quest_difficulty NOT NULL,
  xp_reward INTEGER NOT NULL,
  quest_type TEXT NOT NULL, -- 'learning', 'skill', 'social', 'wellness'
  target_value INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quest progress
CREATE TABLE public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  status quest_status DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  assigned_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id, assigned_date)
);

-- Mystery boxes
CREATE TABLE public.mystery_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rarity box_rarity NOT NULL,
  is_opened BOOLEAN DEFAULT FALSE,
  reward_type reward_type,
  reward_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE
);

-- User inventory (cosmetics, privileges, etc)
CREATE TABLE public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_data JSONB,
  is_equipped BOOLEAN DEFAULT FALSE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Kudos/Recognition
CREATE TABLE public.kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'great_work', 'helpful_friend', 'inspirational', 'problem_solver'
  message TEXT,
  xp_awarded INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP Multiplier Events
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  multiplier DECIMAL(3,2) NOT NULL, -- 1.5, 2.0, 3.0 etc
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL, -- 'quick_win', 'challenge_overcome', 'lesson_learned', 'gratitude'
  content TEXT NOT NULL,
  mood TEXT, -- emoji
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotion logs
CREATE TABLE public.emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL, -- 'happy', 'neutral', 'sad', 'angry', 'stressed'
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  activity TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborative challenges
CREATE TABLE public.collaborative_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  reward_xp INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.collaborative_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Extend achievements with tiers
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS tier badge_tier DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS rarity_percentage INTEGER DEFAULT 100;

-- Add XP and level to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_quest_date DATE;

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Goals
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Daily quests (viewable by all)
CREATE POLICY "Quests viewable by everyone" ON public.daily_quests FOR SELECT USING (true);

-- User quests
CREATE POLICY "Users can view own quest progress" ON public.user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quest progress" ON public.user_quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quest progress" ON public.user_quests FOR UPDATE USING (auth.uid() = user_id);

-- Mystery boxes
CREATE POLICY "Users can view own boxes" ON public.mystery_boxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own boxes" ON public.mystery_boxes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boxes" ON public.mystery_boxes FOR UPDATE USING (auth.uid() = user_id);

-- Inventory
CREATE POLICY "Users can view own inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inventory items" ON public.user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON public.user_inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory items" ON public.user_inventory FOR DELETE USING (auth.uid() = user_id);

-- Kudos
CREATE POLICY "Users can view kudos they sent or received" ON public.kudos FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send kudos" ON public.kudos FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- XP Events
CREATE POLICY "Events viewable by everyone" ON public.xp_events FOR SELECT USING (true);

-- Journal
CREATE POLICY "Users can view own journal" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Emotion logs
CREATE POLICY "Users can view own emotions" ON public.emotion_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can log own emotions" ON public.emotion_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Collaborative challenges
CREATE POLICY "Challenges viewable by everyone" ON public.collaborative_challenges FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON public.collaborative_challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update challenges" ON public.collaborative_challenges FOR UPDATE USING (auth.uid() = creator_id);

-- Challenge participants
CREATE POLICY "Participants viewable by everyone" ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Insert initial daily quests
INSERT INTO public.daily_quests (title, description, difficulty, xp_reward, quest_type, target_value) VALUES
  ('อ่านบทความ 1 เรื่อง', 'อ่านบทความด้านการศึกษาหรือความรู้ใหม่ๆ', 'easy', 50, 'learning', 1),
  ('ทำแบบทดสอบ 10 ข้อ', 'ทำข้อสอบหรือแบบฝึกหัดสั้นๆ', 'easy', 50, 'skill', 10),
  ('ช่วยเพื่อน 1 คน', 'ให้ความช่วยเหลือหรือคำแนะนำเพื่อน', 'easy', 50, 'social', 1),
  ('ฝึกสมาธิ 10 นาที', 'นั่งสมาธิหรือฝึกหายใจเพื่อความสงบใจ', 'easy', 50, 'wellness', 1),
  ('ทำโจทย์ 20 ข้อ', 'ทำแบบฝึกหัดหรือโจทย์ที่ได้รับมอบหมาย', 'medium', 100, 'skill', 20),
  ('เขียน journal entry', 'บันทึกความคิดและการเรียนรู้ของวันนี้', 'medium', 100, 'learning', 1),
  ('สอนเพื่อน 1 เรื่อง', 'อธิบายความรู้หรือแนวคิดให้เพื่อนฟัง', 'medium', 100, 'social', 1),
  ('อ่านหนังสือ 30 นาที', 'อ่านหนังสือเพื่อพัฒนาความรู้', 'medium', 100, 'learning', 1),
  ('ทำโจทย์ยาก 50 ข้อ', 'ท้าทายตัวเองกับโจทย์ระดับยาก', 'hard', 200, 'skill', 50),
  ('สร้าง study group', 'รวบรวมเพื่อนมาเรียนรู้ร่วมกัน', 'hard', 200, 'social', 1),
  ('ทำโปรเจ็กต์เล็กๆ', 'สร้างงานหรือโปรเจ็กต์ใหม่', 'hard', 200, 'learning', 1),
  ('วิเคราะห์จุดอ่อนและปรับปรุง', 'ประเมินตนเองและวางแผนพัฒนา', 'hard', 200, 'wellness', 1);

-- Update existing achievements with tiers
UPDATE public.achievements SET tier = 'bronze', rarity_percentage = 80 WHERE milestone_value <= 7;
UPDATE public.achievements SET tier = 'silver', rarity_percentage = 50 WHERE milestone_value > 7 AND milestone_value <= 30;
UPDATE public.achievements SET tier = 'gold', rarity_percentage = 20 WHERE milestone_value > 30 AND milestone_value <= 100;
UPDATE public.achievements SET tier = 'platinum', rarity_percentage = 5 WHERE milestone_value > 100;