import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, SUPER_ADMIN_EMAIL } from "@/hooks/useAuth";
import { Lock, Mail, Loader2, UserPlus, LogIn, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";

const Login = () => {
  const { signIn, signUp, user, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.email === SUPER_ADMIN_EMAIL) navigate("/admin", { replace: true });
      else navigate("/profile", { replace: true });
    }
  }, [user, loading, navigate]);

  const toggleAuthMode = () => {
    const tl = gsap.timeline();
    
    tl.to(formRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setIsLogin(!isLogin);
        setEmail("");
        setPassword("");
      }
    });
    
    tl.fromTo(formRef.current, 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
        toast.success("Welcome back!");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw new Error(error);
        toast.success("Account created! Please check your email.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-cream relative overflow-hidden flex items-center justify-center p-6 font-display">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/5 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="grain opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.6em] text-gold text-[10px] uppercase">CREATIVENODE</span>
            <div className="w-1.5 h-1.5 rotate-45 bg-gold" />
          </div>
          
          <h1 className="font-display text-5xl font-black mb-3 tracking-tight">
            {isLogin ? "Admin Access" : "Join the Node"}
          </h1>
          <p className="font-serif-elegant italic text-cream/40 text-lg">
            {isLogin ? "Sign in to manage your client gallery" : "Create an account to start your journey"}
          </p>
        </div>

        <div ref={formRef} className="group relative">
          {/* Decorative Border Glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 via-gold/20 to-blue-500/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-display tracking-[0.4em] text-gold/60 mb-3 ml-1 uppercase">EMAIL ADDRESS</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30 group-focus-within/input:text-gold transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-gold/50 rounded-xl pl-12 pr-4 py-4 text-cream placeholder:text-cream/20 outline-none transition-all duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display tracking-[0.4em] text-gold/60 mb-3 ml-1 uppercase">PASSWORD</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30 group-focus-within/input:text-gold transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-gold/50 rounded-xl pl-12 pr-4 py-4 text-cream placeholder:text-cream/20 outline-none transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full relative group/btn overflow-hidden rounded-xl h-14 bg-gradient-to-r from-blue-600 to-blue-400 font-display tracking-[0.3em] text-xs font-black text-white transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
                </span>
              </button>
            </form>

            <div className="mt-10 text-center">
              <button 
                onClick={toggleAuthMode}
                className="inline-flex items-center gap-2 text-[10px] font-display tracking-[0.3em] text-cream/30 hover:text-gold transition-colors group/link"
              >
                {isLogin ? "DON'T HAVE AN ACCOUNT?" : "ALREADY HAVE AN ACCOUNT?"}
                <span className="text-gold font-bold group-hover/link:translate-x-1 transition-transform">
                  {isLogin ? "SIGN UP" : "LOG IN"} <ArrowRight className="inline w-3 h-3 mb-0.5" />
                </span>
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-center text-[9px] font-display tracking-[0.4em] text-cream/20 uppercase">
                {isLogin ? "Access is by invitation only" : "Join the creative collective"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
