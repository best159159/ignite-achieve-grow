import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch user data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: recentMotivation } = await supabase
      .from("motivation_scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(7);

    const { data: recentEmotions } = await supabase
      .from("emotion_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(7);

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(5);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "morning_briefing") {
      // Calculate motivation averages
      const motivationAvg = recentMotivation?.length ? {
        risk: (recentMotivation.reduce((sum: number, m: any) => sum + (m.risk || 0), 0) / recentMotivation.length).toFixed(1),
        diligence: (recentMotivation.reduce((sum: number, m: any) => sum + (m.diligence || 0), 0) / recentMotivation.length).toFixed(1),
        responsibility: (recentMotivation.reduce((sum: number, m: any) => sum + (m.responsibility || 0), 0) / recentMotivation.length).toFixed(1),
        collaboration: (recentMotivation.reduce((sum: number, m: any) => sum + (m.collaboration || 0), 0) / recentMotivation.length).toFixed(1),
        perseverance: (recentMotivation.reduce((sum: number, m: any) => sum + (m.perseverance || 0), 0) / recentMotivation.length).toFixed(1),
        planning: (recentMotivation.reduce((sum: number, m: any) => sum + (m.planning || 0), 0) / recentMotivation.length).toFixed(1),
      } : null;

      systemPrompt = `คุณคือ AI Learning Coach ที่เป็นมิตร ให้กำลังใจ และให้คำแนะนำส่วนตัวแก่นักเรียนมัธยม
        พูดภาษาไทยที่เป็นกันเอง ใช้ emoji เล็กน้อย และเน้นสร้างแรงบันดาลใจ
        วิเคราะห์ข้อมูลแล้วให้คำแนะนำที่ชัดเจนและ actionable`;

      userPrompt = `สร้าง morning briefing สำหรับนักเรียน:
        
        ข้อมูลนักเรียน:
        - ชื่อ: ${profile?.name || "นักเรียน"}
        - Streak: ${profile?.streak || 0} วัน
        - Level: ${profile?.level || 1}
        - XP: ${profile?.xp || 0}
        
        ${motivationAvg ? `Motivation Scores (ค่าเฉลี่ย 7 วันล่าสุด):
        - Risk-taking: ${motivationAvg.risk}/10
        - Diligence: ${motivationAvg.diligence}/10
        - Responsibility: ${motivationAvg.responsibility}/10
        - Collaboration: ${motivationAvg.collaboration}/10
        - Perseverance: ${motivationAvg.perseverance}/10
        - Planning: ${motivationAvg.planning}/10` : ""}
        
        ${recentEmotions?.length ? `Emotion Trend (7 วันล่าสุด):
        ${recentEmotions.map((e: any) => `- ${e.emotion} (Energy: ${e.energy_level}/5)`).join("\n")}` : ""}
        
        ${goals?.length ? `เป้าหมายที่กำลังดำเนินการ:
        ${goals.map((g: any) => `- ${g.title} (${((g.current_value / g.target_value) * 100).toFixed(0)}%)`).join("\n")}` : ""}
        
        สร้างข้อความสั้นๆ (150-200 คำ) ที่มี:
        1. ทักทายและชื่นชมความพยายาม
        2. highlight ข้อมูลสำคัญ (streak, emotions, progress)
        3. ชี้ให้เห็นมิติ motivation ที่ต่ำและต้องพัฒนา
        4. แนะนำกิจกรรม 2-3 อย่างที่ทำได้วันนี้เพื่อพัฒนา
        5. ให้กำลังใจปิดท้าย`;

    } else if (type === "chat") {
      const body = await req.json();
      const { message: userMessage, conversationHistory } = body;
      
      systemPrompt = `คุณคือ AI Learning Coach ที่เป็นมิตร ให้คำแนะนำเกี่ยวกับการเรียนรู้ แรงจูงใจ และการพัฒนาตนเอง
        ตอบเป็นภาษาไทยที่เข้าใจง่าย ใช้ emoji บ้าง และให้คำตอบที่เป็นประโยชน์จริง`;
      
      const aiMessages = [
        { role: "system", content: systemPrompt },
        ...(conversationHistory || []),
        { role: "user", content: userMessage || "สวัสดี" }
      ];

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("AI gateway error:", aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ 
            error: "ใช้งาน AI มากเกินไป กรุณารอสักครู่แล้วลองใหม่" 
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ 
            error: "ระบบ AI ไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ" 
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const chatMessage = aiData.choices[0].message.content;

      return new Response(JSON.stringify({ message: chatMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "ใช้งาน AI มากเกินไป กรุณารอสักครู่แล้วลองใหม่" 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: "ระบบ AI ไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ" 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-coach function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});