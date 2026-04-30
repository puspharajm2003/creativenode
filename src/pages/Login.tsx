import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { signIn, user, isSuperAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isSuperAdmin) nav("/admin", { replace: true });
  }, [user, isSuperAdmin, loading, nav]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error("Invalid credentials");
    else toast.success("Welcome back");
  };

  return (
    <div className="min-h-screen bg-ink text-cream relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(0_0%_12%)_0%,hsl(0_0%_4%)_70%)]" />
      <div className="grain" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.5em] text-gold text-xs">CREATIVENODE</span>
            <div className="w-2 h-2 rotate-45 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold gold-text mb-2">Admin Access</h1>
          <p className="font-serif-elegant italic text-cream/60">Sign in to manage your client gallery</p>
        </div>

        <form onSubmit={onSubmit} className="bg-ink-soft/60 backdrop-blur-xl border border-gold/20 rounded-lg p-8 space-y-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          <div>
            <label className="block text-xs font-display tracking-[0.3em] text-gold/80 mb-2">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-ink border border-gold/20 focus:border-gold rounded-md pl-10 pr-3 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-display tracking-[0.3em] text-gold/80 mb-2">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-ink border border-gold/20 focus:border-gold rounded-md pl-10 pr-3 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.3em] text-sm font-bold rounded-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} SIGN IN
          </button>
          <p className="text-center text-xs font-serif-elegant italic text-cream/40 pt-2">
            Access is by invitation only.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
