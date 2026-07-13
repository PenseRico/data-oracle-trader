import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, ImagePlus, Trash2, Zap, Users } from "lucide-react";
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

// cor determinística por membro (avatar + nome)
const AVATAR_COLORS = [
  "bg-teal-500/20 border-teal-400/40 text-teal-300",
  "bg-violet-500/20 border-violet-400/40 text-violet-300",
  "bg-amber-500/20 border-amber-400/40 text-amber-300",
  "bg-rose-500/20 border-rose-400/40 text-rose-300",
  "bg-sky-500/20 border-sky-400/40 text-sky-300",
  "bg-emerald-500/20 border-emerald-400/40 text-emerald-300",
  "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300",
];
function colorFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
const getInitials = (name: string) => (name?.trim()?.slice(0, 2).toUpperCase() || "TR");

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
    if (data) setMessages((prev) => (prev.find((m) => m.id === data.id) ? prev : [...prev, data as unknown as Message]));
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

  const memberCount = new Set(messages.map((m) => m.user_id)).size;

  const header = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-glow">
        <MessageSquare className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="font-display font-black text-2xl tracking-tight text-white">Mesa de Operações</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Chat ao vivo · todos os membros Matrix</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-4 px-2 md:px-4 pb-6">
        {header}

        {/* Mobile: abas */}
        <Tabs defaultValue="chat" className="lg:hidden">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/5">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="setups">Setups</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="h-[calc(100vh-240px)]">
            <ChatPanel {...{ messages, user, handleDelete, scrollRef, memberCount }}>
              <ChatForm {...{ handleSend, fileInputRef, handleImageUpload, newMessage, setNewMessage, sending, user }} />
            </ChatPanel>
          </TabsContent>
          <TabsContent value="setups" className="h-[calc(100vh-240px)]">
            <ScrollArea className="h-full pr-3"><SetupFeed /></ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Desktop: chat + setups */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_360px] gap-5 h-[calc(100vh-160px)]">
          <ChatPanel {...{ messages, user, handleDelete, scrollRef, memberCount }}>
            <ChatForm {...{ handleSend, fileInputRef, handleImageUpload, newMessage, setNewMessage, sending, user }} />
          </ChatPanel>

          <div className="flex flex-col gap-3 overflow-hidden">
            <div className="glass-card rounded-xl px-4 py-3 border border-primary/15 bg-primary/[0.04] flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Setups em Destaque</span>
            </div>
            <ScrollArea className="flex-1 pr-2"><SetupFeed /></ScrollArea>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ChatPanel({ messages, user, handleDelete, scrollRef, memberCount, children }: any) {
  return (
    <div className="glass-card rounded-xl flex flex-col overflow-hidden border border-white/[0.06] bg-black/50">
      {/* header */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-black/30">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Chat Global</span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/60">
            <Users className="h-3 w-3" /> {memberCount || 0} {memberCount === 1 ? "membro" : "membros"}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ao vivo
        </span>
      </div>
      <ChatContent messages={messages} user={user} handleDelete={handleDelete} scrollRef={scrollRef} />
      {children}
    </div>
  );
}

function ChatContent({ messages, user, handleDelete, scrollRef }: any) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/70">Nenhuma mensagem ainda.</p>
            <p className="text-[11px] text-muted-foreground/40">Seja o primeiro a abrir a conversa na mesa. 👋</p>
          </div>
        )}
        {messages.map((msg: Message, i: number) => {
          const isOwn = msg.user_id === user?.id;
          const username = msg.profiles?.username || "Trader";
          const c = colorFor(msg.user_id || username);
          const prev = messages[i - 1];
          const grouped = prev && prev.user_id === msg.user_id;
          return (
            <div key={msg.id} className={`flex gap-2.5 group ${isOwn ? "flex-row-reverse" : ""} ${grouped ? "mt-1" : "mt-3"}`}>
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-black ${c} ${grouped ? "invisible" : ""}`}>
                {getInitials(username)}
              </div>
              <div className={`max-w-[78%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {!grouped && (
                  <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className={`text-[10px] font-black tracking-tight ${c.split(" ").find((x) => x.startsWith("text-")) || "text-primary"}`}>
                      {isOwn ? "Você" : username}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/50">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 group">
                  {isOwn && (
                    <button onClick={() => handleDelete(msg.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-rose-400 transition-all">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words ${isOwn ? "bg-primary/15 border border-primary/25 rounded-tr-sm text-white" : "bg-white/[0.04] border border-white/[0.06] rounded-tl-sm text-white/90"}`}>
                    {msg.content}
                    {msg.image_url && (
                      <img src={msg.image_url} alt="anexo" className="mt-2 rounded-lg max-h-64 w-full object-cover border border-white/10" loading="lazy" />
                    )}
                  </div>
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

function ChatForm({ handleSend, fileInputRef, handleImageUpload, newMessage, setNewMessage, sending, user }: any) {
  if (!user) {
    return (
      <div className="p-4 border-t border-white/5 bg-black/30 text-center">
        <p className="text-[11px] text-muted-foreground/70">Entre na sua conta para participar do chat dos membros.</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSend} className="p-3 border-t border-white/5 flex gap-2 bg-black/30">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-primary/10 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
        <ImagePlus className="h-4 w-4" />
      </Button>
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Mande um sinal ou mensagem pros membros..."
        className="bg-white/[0.03] border-white/10 rounded-full h-9 text-xs focus-visible:ring-primary/30"
      />
      <Button type="submit" size="icon" className="shrink-0 rounded-full h-9 w-9" disabled={sending || !newMessage.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
