import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { BrandName } from "@/components/BrandName";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Ao chegar pelo link do e-mail, o Supabase cria uma sessão de recuperação.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha alterada! Você já pode entrar. 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar a senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center mb-8">
          <span className="font-display font-black text-2xl"><BrandName /></span>
        </div>

        <div className="glass-card rounded-xl p-8 space-y-6 border border-border/50">
          <div className="text-center space-y-1">
            <h1 className="font-display font-bold text-xl">Nova senha</h1>
            <p className="text-sm text-muted-foreground">Defina sua nova senha de acesso.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-muted/30 border-border/50"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading ? "Salvando..." : ready ? "Salvar nova senha" : "Abra pelo link do e-mail"}
            </Button>
          </form>

          {!ready && (
            <p className="text-[11px] text-center text-muted-foreground/70 leading-relaxed">
              Esta página só funciona ao ser aberta pelo link de recuperação que enviamos no seu e-mail.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
