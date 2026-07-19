import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hash, Send, ImagePlus, Trash2, Users, TrendingUp, MessageSquare, ExternalLink, Radio } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SetupFeed } from "@/components/community/SetupFeed";

// 🔗 Link do grupo/perfil do Telegram:
const TELEGRAM_URL = "https://t.me/PenseRico";

interface Message {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: { username: string | null; avatar_url: string | null };
}

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
function displayName(u: any): string {
  return u?.user_metadata?.username || u?.user_metadata?.full_name || u?.email?.split("@")[0] || "Trader";
}

type Channel = "mesa" | "setups";

export default function CommunityPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [active, setActive] = useState<Channel>("mesa");
  const [online, setOnline] = useState<{ id: string; name: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mensagens em tempo real
  useEffect(() => {
    fetchMessages();
    const ch = supabase
      .channel("community-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        fetchSingleMessage(payload.new.id as string);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Presença: quem está online agora
  useEffect(() => {
    if (!user) return;
    const name = displayName(user);
    const pres = supabase.channel("community-presence", { config: { presence: { key: user.id } } });
    pres
      .on("presence", { event: "sync" }, () => {
        const state = pres.presenceState() as Record<string, { name?: string }[]>;
        const list = Object.entries(state).map(([id, arr]) => ({ id, name: arr[0]?.name || "Trader" }));
        setOnline(list);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await pres.track({ name });
      });
    return () => { supabase.removeChannel(pres); };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, active]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(username, avatar_url)")
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as unknown as Message[]);
  }
  async function fetchSingleMessage(id: string) {
    const { data } = await supabase.from("messages").select("*, profiles(username, avatar_url)").eq("id", id).single();
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

  const totalMembers = new Set(messages.map((m) => m.user_id)).size;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-90px)] px-1 md:px-3">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[210px_1fr_210px] gap-3">

          {/* ── Canais (esquerda) ── */}
          <aside className="hidden lg:flex flex-col glass-card rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-[11px] font-black text-black">CR</div>
              <span className="font-display font-black text-sm tracking-tight text-white">Comunidade</span>
            </div>
            <div className="flex-1 p-2 space-y-0.5">
              <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">Canais</div>
              <ChannelBtn icon={<MessageSquare className="h-3.5 w-3.5" />} label="mesa-de-operações" activeState={active === "mesa"} onClick={() => setActive("mesa")} />
              <ChannelBtn icon={<TrendingUp className="h-3.5 w-3.5" />} label="setups" activeState={active === "setups"} onClick={() => setActive("setups")} />
              <div className="px-2 pt-4 pb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">Externo</div>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-white/[0.04] hover:text-white transition-colors group">
                <Radio className="h-3.5 w-3.5 text-sky-400" />
                <span className="flex-1">Grupo Telegram</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60" />
              </a>
            </div>
            <div className="p-2 border-t border-white/5">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.03]">
                <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-[9px] font-black ${colorFor(user?.id || "me")}`}>
                  {getInitials(displayName(user))}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{displayName(user)}</div>
                  <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> online</div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Centro (conversa ou setups) ── */}
          <main className="glass-card rounded-xl flex flex-col overflow-hidden border border-white/[0.06] bg-black/50 min-h-0">
            {/* header do canal */}
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-black/30 shrink-0">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-black text-white">{active === "mesa" ? "mesa-de-operações" : "setups"}</span>
                <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground/50 border-l border-white/10 pl-2 ml-1">
                  {active === "mesa" ? "chat ao vivo dos membros" : "setups compartilhados"}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ao vivo
              </span>
            </div>

            {/* seletor mobile de canal */}
            <div className="flex lg:hidden gap-1 p-2 border-b border-white/5 bg-black/20 shrink-0">
              <MobileChip label="Mesa" on={active === "mesa"} onClick={() => setActive("mesa")} />
              <MobileChip label="Setups" on={active === "setups"} onClick={() => setActive("setups")} />
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-sky-300 bg-sky-500/10 border border-sky-400/20 flex items-center gap-1">
                <Radio className="h-3 w-3" /> Telegram
              </a>
            </div>

            {active === "setups" ? (
              <ScrollArea className="flex-1 p-4"><SetupFeed /></ScrollArea>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-0.5">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground/70">Nenhuma mensagem ainda.</p>
                        <p className="text-[11px] text-muted-foreground/40">Seja o primeiro a abrir a conversa na mesa. 👋</p>
                      </div>
                    )}
                    {messages.map((msg, i) => {
                      const isOwn = msg.user_id === user?.id;
                      const username = isOwn ? displayName(user) : (msg.profiles?.username || "Trader");
                      const c = colorFor(msg.user_id || username);
                      const textColor = c.split(" ").find((x) => x.startsWith("text-")) || "text-primary";
                      const prev = messages[i - 1];
                      const grouped = prev && prev.user_id === msg.user_id;
                      return (
                        <div key={msg.id} className={`group flex gap-3 px-2 -mx-2 rounded-lg hover:bg-white/[0.025] ${grouped ? "py-0.5" : "pt-3 pb-0.5 mt-1"}`}>
                          <div className="w-9 shrink-0 flex justify-center">
                            {!grouped ? (
                              <div className={`h-9 w-9 rounded-full border flex items-center justify-center text-[10px] font-black ${c}`}>{getInitials(username)}</div>
                            ) : (
                              <span className="text-[9px] font-mono text-muted-foreground/0 group-hover:text-muted-foreground/40 self-center">
                                {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {!grouped && (
                              <div className="flex items-baseline gap-2">
                                <span className={`text-[13px] font-bold ${textColor}`}>{username}</span>
                                <span className="text-[9px] font-mono text-muted-foreground/50">
                                  {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {isOwn && <span className="text-[8px] font-mono uppercase tracking-wider text-primary/60">você</span>}
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <div className="text-sm leading-relaxed text-white/90 break-words">
                                {msg.content}
                                {msg.image_url && (
                                  <img src={msg.image_url} alt="anexo" className="mt-1.5 rounded-lg max-h-72 max-w-full object-cover border border-white/10" loading="lazy" />
                                )}
                              </div>
                              {isOwn && (
                                <button onClick={() => handleDelete(msg.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-rose-400 transition-all shrink-0 mt-0.5">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* input */}
                {user ? (
                  <form onSubmit={handleSend} className="p-3 border-t border-white/5 flex gap-2 bg-black/30 shrink-0">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-primary/10 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="h-4 w-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mensagem para #mesa-de-operações"
                      className="bg-white/[0.03] border-white/10 rounded-full h-9 text-sm focus-visible:ring-primary/30"
                    />
                    <Button type="submit" size="icon" className="shrink-0 rounded-full h-9 w-9" disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="p-4 border-t border-white/5 bg-black/30 text-center shrink-0">
                    <p className="text-[11px] text-muted-foreground/70">Entre na sua conta para participar do chat.</p>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ── Membros (direita) ── */}
          <aside className="hidden lg:flex flex-col glass-card rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90">Online</span>
              <span className="text-[10px] font-mono text-emerald-400">— {online.length}</span>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-0.5">
                {online.length === 0 && <p className="text-[11px] text-muted-foreground/40 px-2 py-2">Ninguém online agora.</p>}
                {online.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
                    <div className="relative shrink-0">
                      <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-[9px] font-black ${colorFor(m.id)}`}>{getInitials(m.name)}</div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                    </div>
                    <span className="text-[12px] text-white/85 truncate">{m.name}{m.id === user?.id ? " (você)" : ""}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-white/5 text-[9px] font-mono text-muted-foreground/40 text-center">
              {totalMembers} {totalMembers === 1 ? "membro" : "membros"} no total
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ChannelBtn({ icon, label, activeState, onClick }: { icon: React.ReactNode; label: string; activeState: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${activeState ? "bg-primary/15 text-white font-semibold" : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"}`}>
      <span className={activeState ? "text-primary" : "text-muted-foreground/60"}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function MobileChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${on ? "bg-primary/15 text-white border border-primary/25" : "text-muted-foreground bg-white/[0.03] border border-white/5"}`}>
      {label}
    </button>
  );
}
