import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, ImagePlus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SetupFeed } from "@/components/community/SetupFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: { username: string | null; avatar_url: string | null };
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("community-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        fetchSingleMessage(payload.new.id as string);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(username, avatar_url)")
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as unknown as Message[]);
  }

  async function fetchSingleMessage(id: string) {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(username, avatar_url)")
      .eq("id", id)
      .single();
    if (data) setMessages((prev) => {
      if (prev.find(m => m.id === data.id)) return prev;
      return [...prev, data as unknown as Message];
    });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ user_id: user.id, content: newMessage.trim() });
    if (error) toast.error("Erro ao enviar mensagem");
    setNewMessage("");
    setSending(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("chat-images").upload(path, file);
    if (uploadError) { toast.error("Erro no upload"); return; }
    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(path);
    await supabase.from("messages").insert({ user_id: user.id, content: "📷 Imagem", image_url: urlData.publicUrl });
  }

  async function handleDelete(id: string) {
    await supabase.from("messages").delete().eq("id", id);
  }

  const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || "??";

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Comunidade</h1>
            <p className="text-sm text-muted-foreground">Hub de interação e compartilhamento de setups</p>
          </div>
        </div>

        <Tabs defaultValue="chat" className="lg:hidden">
          <TabsList className="grid w-full grid-cols-2 bg-muted/20">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="setups">Setups</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="h-[calc(100vh-250px)]">
            <div className="glass-card rounded-lg flex flex-col h-full overflow-hidden border border-border/30">
              <ChatContent messages={messages} user={user} getInitials={getInitials} handleDelete={handleDelete} scrollRef={scrollRef} />
              <ChatForm handleSend={handleSend} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} newMessage={newMessage} setNewMessage={setNewMessage} sending={sending} />
            </div>
          </TabsContent>
          <TabsContent value="setups" className="h-[calc(100vh-250px)]">
            <ScrollArea className="h-full pr-4">
              <SetupFeed />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-6 h-[calc(100vh-140px)]">
          {/* Chat Column */}
          <div className="glass-card rounded-lg flex flex-col overflow-hidden border border-border/30">
            <div className="p-3 border-b border-border/10 flex items-center justify-between bg-muted/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chat Global</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Online</span>
              </div>
            </div>
            <ChatContent messages={messages} user={user} getInitials={getInitials} handleDelete={handleDelete} scrollRef={scrollRef} />
            <ChatForm handleSend={handleSend} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} newMessage={newMessage} setNewMessage={setNewMessage} sending={sending} />
          </div>

          {/* Setup Feed Column */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            <div className="glass-card rounded-lg p-4 border border-border/30 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wide">Setups em Destaque</span>
              </div>
            </div>
            <ScrollArea className="flex-1 pr-2">
              <SetupFeed />
            </ScrollArea>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ChatContent({ messages, user, getInitials, handleDelete, scrollRef }: any) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm italic">
            Nenhuma mensagem ainda... comece a conversa!
          </div>
        )}
        {messages.map((msg: any) => {
          const isOwn = msg.user_id === user?.id;
          const username = msg.profiles?.username || "Trader";
          return (
            <div key={msg.id} className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                {getInitials(username)}
              </div>
              <div className={`max-w-[80%] ${isOwn ? "items-end" : ""}`}>
                <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <span className="text-[10px] font-bold text-primary/70 tracking-tight">{username}</span>
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isOwn && (
                    <button onClick={() => handleDelete(msg.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className={`rounded-xl px-3 py-2 text-sm shadow-sm ${isOwn ? "bg-primary/20 border border-primary/20 rounded-tr-none text-right" : "bg-muted/40 border border-border/30 rounded-tl-none"}`}>
                  {msg.content}
                  {msg.image_url && (
                    <img src={msg.image_url} alt="shared" className="mt-2 rounded-lg max-h-60 w-full object-cover" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}

function ChatForm({ handleSend, fileInputRef, handleImageUpload, newMessage, setNewMessage, sending }: any) {
  return (
    <form onSubmit={handleSend} className="p-3 border-t border-border/30 flex gap-2 bg-muted/5">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-primary/10" onClick={() => fileInputRef.current?.click()}>
        <ImagePlus className="h-4 w-4" />
      </Button>
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Mande um sinal ou mensagem..."
        className="bg-muted/20 border-border/30 rounded-full h-9 text-xs focus-visible:ring-primary/30"
      />
      <Button type="submit" size="icon" className="shrink-0 rounded-full h-9 w-9" disabled={sending || !newMessage.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
