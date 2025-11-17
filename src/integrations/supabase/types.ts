export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          milestone_value: number
          rarity_percentage: number | null
          tier: Database["public"]["Enums"]["badge_tier"] | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          milestone_value: number
          rarity_percentage?: number | null
          tier?: Database["public"]["Enums"]["badge_tier"] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          milestone_value?: number
          rarity_percentage?: number | null
          tier?: Database["public"]["Enums"]["badge_tier"] | null
          title?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          contribution: number | null
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          contribution?: number | null
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          contribution?: number | null
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "collaborative_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_challenges: {
        Row: {
          created_at: string | null
          creator_id: string
          current_value: number | null
          deadline: string
          description: string | null
          goal_type: string
          id: string
          is_completed: boolean | null
          reward_xp: number
          target_value: number
          title: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          current_value?: number | null
          deadline: string
          description?: string | null
          goal_type: string
          id?: string
          is_completed?: boolean | null
          reward_xp: number
          target_value: number
          title: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          current_value?: number | null
          deadline?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean | null
          reward_xp?: number
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          created_at: string | null
          description: string
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          id: string
          quest_type: string
          target_value: number | null
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          id?: string
          quest_type: string
          target_value?: number | null
          title: string
          xp_reward: number
        }
        Update: {
          created_at?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          id?: string
          quest_type?: string
          target_value?: number | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      emotion_logs: {
        Row: {
          activity: string | null
          created_at: string | null
          emotion: string
          energy_level: number | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          activity?: string | null
          created_at?: string | null
          emotion: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          activity?: string | null
          created_at?: string | null
          emotion?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          requester_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["goal_status"] | null
          sub_goals: Json | null
          target_value: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          sub_goals?: Json | null
          target_value?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          sub_goals?: Json | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          entry_type: string
          id: string
          mood: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          entry_type: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          entry_type?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          category: string
          created_at: string | null
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
          xp_awarded: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
          xp_awarded?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
          xp_awarded?: number | null
        }
        Relationships: []
      }
      motivation_scores: {
        Row: {
          collaboration: number | null
          created_at: string | null
          diligence: number | null
          id: string
          perseverance: number | null
          planning: number | null
          responsibility: number | null
          risk: number | null
          user_id: string
        }
        Insert: {
          collaboration?: number | null
          created_at?: string | null
          diligence?: number | null
          id?: string
          perseverance?: number | null
          planning?: number | null
          responsibility?: number | null
          risk?: number | null
          user_id: string
        }
        Update: {
          collaboration?: number | null
          created_at?: string | null
          diligence?: number | null
          id?: string
          perseverance?: number | null
          planning?: number | null
          responsibility?: number | null
          risk?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "motivation_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_boxes: {
        Row: {
          created_at: string | null
          id: string
          is_opened: boolean | null
          opened_at: string | null
          rarity: Database["public"]["Enums"]["box_rarity"]
          reward_data: Json | null
          reward_type: Database["public"]["Enums"]["reward_type"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_opened?: boolean | null
          opened_at?: string | null
          rarity: Database["public"]["Enums"]["box_rarity"]
          reward_data?: Json | null
          reward_type?: Database["public"]["Enums"]["reward_type"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_opened?: boolean | null
          opened_at?: string | null
          rarity?: Database["public"]["Enums"]["box_rarity"]
          reward_data?: Json | null
          reward_type?: Database["public"]["Enums"]["reward_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_level: string | null
          created_at: string | null
          email: string | null
          id: string
          last_activity_date: string | null
          last_quest_date: string | null
          level: number | null
          name: string | null
          quest_streak: number | null
          streak: number | null
          total_days: number | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          class_level?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_activity_date?: string | null
          last_quest_date?: string | null
          level?: number | null
          name?: string | null
          quest_streak?: number | null
          streak?: number | null
          total_days?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          class_level?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_activity_date?: string | null
          last_quest_date?: string | null
          level?: number | null
          name?: string | null
          quest_streak?: number | null
          streak?: number | null
          total_days?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          acquired_at: string | null
          id: string
          is_equipped: boolean | null
          item_data: Json | null
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          is_equipped?: boolean | null
          item_data?: Json | null
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          id?: string
          is_equipped?: boolean | null
          item_data?: Json | null
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          assigned_date: string
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          quest_id: string
          status: Database["public"]["Enums"]["quest_status"] | null
          user_id: string
        }
        Insert: {
          assigned_date: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          quest_id: string
          status?: Database["public"]["Enums"]["quest_status"] | null
          user_id: string
        }
        Update: {
          assigned_date?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          quest_id?: string
          status?: Database["public"]["Enums"]["quest_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "daily_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_active: boolean | null
          multiplier: number
          name: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          multiplier: number
          name: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          multiplier?: number
          name?: string
          start_time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      badge_tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
      box_rarity: "common" | "rare" | "epic" | "legendary"
      goal_status: "active" | "completed" | "failed" | "paused"
      quest_difficulty: "easy" | "medium" | "hard"
      quest_status: "active" | "completed" | "expired"
      reward_type: "xp" | "badge" | "cosmetic" | "privilege"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      badge_tier: ["bronze", "silver", "gold", "platinum", "diamond"],
      box_rarity: ["common", "rare", "epic", "legendary"],
      goal_status: ["active", "completed", "failed", "paused"],
      quest_difficulty: ["easy", "medium", "hard"],
      quest_status: ["active", "completed", "expired"],
      reward_type: ["xp", "badge", "cosmetic", "privilege"],
    },
  },
} as const
