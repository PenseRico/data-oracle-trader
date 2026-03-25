import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <div className="max-w-[1000px] mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-glow">Comunidade</h1>
            <p className="text-xs text-muted-foreground">Chat em tempo real</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        <div className="glass-card rounded-lg flex-1 flex flex-col overflow-hidden border border-border/30">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Nenhuma mensagem ainda. Seja o primeiro a falar! 🚀
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = msg.user_id === user?.id;
                const username = msg.profiles?.username || "Anônimo";
                return (
                  <div key={msg.id} className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {getInitials(username)}
                    </div>
                    <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                      <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-medium text-primary/80">{username}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isOwn && (
                          <button onClick={() => handleDelete(msg.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className={`rounded-lg px-3 py-2 text-sm ${isOwn ? "bg-primary/15 border border-primary/20" : "bg-muted/30 border border-border/30"}`}>
                        {msg.content}
                        {msg.image_url && (
                          <img src={msg.image_url} alt="shared" className="mt-2 rounded-md max-h-60 object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="p-3 border-t border-border/30 flex gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escreva uma mensagem..."
              className="bg-muted/20 border-border/30"
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
