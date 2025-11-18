import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AICoachCard = () => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'briefing' | 'chat'>('briefing');
  const { toast } = useToast();

  useEffect(() => {
    fetchMorningBriefing();
  }, []);

  const fetchMorningBriefing = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { type: 'morning_briefing', userId: user.id }
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error: any) {
      console.error("Error fetching AI coach:", error);
      
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        setMessage("😅 ใช้งาน AI บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่นะ");
      } else if (error.message?.includes('402') || error.message?.includes('payment')) {
        setMessage("⚠️ ระบบ AI ไม่สามารถใช้งานได้ชั่วคราว กรุณาติดต่อผู้ดูแลระบบ");
      } else {
        setMessage("สวัสดีตอนเช้า! 🌅 พร้อมเริ่มต้นวันใหม่กับการเรียนรู้หรือยัง? มาไฟต์กันเถอะ! 💪");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { 
          type: 'chat', 
          userId: user.id,
          message: inputMessage,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      const aiMessage: Message = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    "ช่วยวางแผนสัปดาห์นี้",
    "ทำไม risk-taking ถึงสำคัญ?",
    "มีเทคนิคจำได้ดีไหม?",
  ];

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          AI Learning Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'briefing' | 'chat')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="briefing">
              <Sparkles className="w-4 h-4 mr-2" />
              Morning Briefing
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="briefing" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {message || "กำลังโหลด..."}
                </div>
                <Button 
                  onClick={fetchMorningBriefing} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  รีเฟรช
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-4 space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    👋 สวัสดี! มีอะไรให้ช่วยไหม?
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputMessage(reply);
                      setTimeout(handleSendMessage, 100);
                    }}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="พิมพ์ข้อความ..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AICoachCard;