import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, THEMES } from "@/hooks/useTheme";
import { User, Mail, Lock, Loader2, LogOut, LayoutDashboard, Crown, Settings, Palette, MoreHorizontal, CheckCircle2, Image, Clock, ArrowUpRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const UserProfile = () => {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const { themeId, setThemeId, currentTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error); else toast.success("Welcome back!");
    } else {
      const { error } = await signUp(email, password);
      if (error) toast.error(error); else toast.success("Check your email for the confirmation link!");
    }
    setBusy(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-ink flex items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;
  }

  if (user) {
    return (
      <div className="min-h-screen bg-ink text-cream relative overflow-hidden flex flex-col md:flex-row pt-20 md:pt-24 pb-24 md:pb-0 transition-colors duration-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--ink-soft))_0%,hsl(var(--ink))_70%)]" />
        <div className="grain" />

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-ink/80 backdrop-blur-md border border-gold/20 rounded-full text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-xs font-display tracking-widest">
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>

        {/* Sidebar */}
        <div className="relative z-20 w-full md:w-64 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-gold/10 bg-ink-soft/40 backdrop-blur-md md:min-h-[calc(100vh-6rem)]">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-gold" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-display tracking-[0.2em] text-gold mb-1 truncate">WELCOME BACK</div>
                <div className="text-sm font-serif-elegant italic text-cream/80 truncate">{user.email}</div>
              </div>
            </div>

            <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {[
                { id: "details", label: "User Details", icon: LayoutDashboard },
                { id: "plan", label: "My Plan", icon: Crown },
                { id: "theme", label: "Appearance", icon: Palette },
                { id: "settings", label: "Security", icon: Settings },
                { id: "other", label: "Other", icon: MoreHorizontal },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-[0.1em] text-xs transition-all whitespace-nowrap md:whitespace-normal w-full text-left ${
                    activeTab === tab.id ? "bg-gold text-ink font-bold shadow-lg" : "text-cream/60 hover:text-gold hover:bg-gold/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:block absolute bottom-8 left-8 right-8">
              <button onClick={() => signOut()} className="w-full py-3 bg-red-900/20 border border-red-500/30 text-red-400 font-display tracking-[0.2em] text-xs font-bold rounded-lg hover:bg-red-900/40 transition flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> SIGN OUT
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto">

            {/* USER DETAILS */}
            {activeTab === "details" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="font-display font-black text-3xl md:text-5xl mb-2">Profile Overview</h2>
                  <p className="font-serif-elegant italic text-cream/50">Your account and project details.</p>
                </div>
                <div className="bg-ink-soft/40 border border-gold/15 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                  <div>
                    <label className="block text-[10px] font-display tracking-[0.3em] text-gold/80 mb-2">EMAIL ADDRESS</label>
                    <div className="px-4 py-3 bg-ink/50 border border-gold/10 rounded-lg text-cream/80">{user.email}</div>
                  </div>
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-4">
                  <div className="bg-ink-soft/40 border border-gold/20 rounded-2xl p-6 backdrop-blur-md text-center">
                    <Image className="w-6 h-6 text-gold mx-auto mb-3" />
                    <div className="font-display font-black text-3xl text-gold">0</div>
                    <div className="text-[10px] font-display tracking-[0.3em] text-cream/50 mt-1">POSTERS RECEIVED</div>
                  </div>
                  <div className="bg-ink-soft/40 border border-gold/20 rounded-2xl p-6 backdrop-blur-md text-center">
                    <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                    <div className="font-display font-bold text-xl text-cream">Free Tier</div>
                    <div className="text-[10px] font-display tracking-[0.3em] text-cream/50 mt-1">CURRENT PLAN</div>
                  </div>
                  <div className="bg-ink-soft/40 border border-gold/20 rounded-2xl p-6 backdrop-blur-md text-center">
                    <Clock className="w-6 h-6 text-gold mx-auto mb-3" />
                    <div className="font-display font-bold text-xl text-cream">No Active</div>
                    <div className="text-[10px] font-display tracking-[0.3em] text-cream/50 mt-1">PROJECT STATUS</div>
                  </div>
                </div>
              </div>
            )}

            {/* MY PLAN */}
            {activeTab === "plan" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="font-display font-black text-3xl md:text-5xl mb-2">Your Plan</h2>
                  <p className="font-serif-elegant italic text-cream/50">Poster allocation and project status.</p>
                </div>
                <div className="bg-gradient-to-br from-gold/15 to-ink-soft/40 border border-gold/30 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_-15px_hsl(var(--gold)/0.2)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold text-ink text-[10px] font-display font-bold tracking-[0.2em] rounded-full mb-6">
                    <Crown className="w-3 h-3" /> FREE TIER
                  </div>
                  <h3 className="font-display font-bold text-4xl text-cream mb-2">Explorer Plan</h3>
                  <p className="font-serif-elegant italic text-cream/60 mb-8">You&apos;re on the free tier. Upgrade for dedicated poster designs.</p>

                  <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-ink/40 border border-gold/10 rounded-xl p-5">
                      <div className="text-[10px] font-display tracking-[0.3em] text-gold/70 mb-2">POSTERS DELIVERED</div>
                      <div className="font-display font-black text-4xl text-cream">0 <span className="text-lg text-cream/40">/ 0</span></div>
                      <div className="mt-3 h-2 bg-ink rounded-full overflow-hidden"><div className="h-full bg-gold/30 rounded-full" style={{ width: "0%" }} /></div>
                    </div>
                    <div className="bg-ink/40 border border-gold/10 rounded-xl p-5">
                      <div className="text-[10px] font-display tracking-[0.3em] text-gold/70 mb-2">PROJECT STATUS</div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream/5 border border-cream/10 rounded-full text-cream/60 text-sm font-display mt-2">
                        <div className="w-2 h-2 rounded-full bg-cream/30" /> No Active Projects
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    {["Access to public showcase", "Basic account features", "Contact support via chat"].map((ft) => (
                      <div key={ft} className="flex items-center gap-3 text-sm text-cream/80">
                        <CheckCircle2 className="w-4 h-4 text-gold/50" /> {ft}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))} className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-ink font-display font-bold text-xs tracking-[0.2em] rounded-lg hover:bg-gold-bright transition-colors shadow-lg">
                    UPGRADE PLAN <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* THEME */}
            {activeTab === "theme" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="font-display font-black text-3xl md:text-5xl mb-2">Appearance</h2>
                  <p className="font-serif-elegant italic text-cream/50">Choose a color theme. Changes apply everywhere instantly.</p>
                </div>
                <div className="bg-ink-soft/40 border border-gold/15 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                  <label className="block text-[10px] font-display tracking-[0.3em] text-gold/80 mb-6">THEME PALETTE</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {THEMES.map((theme) => {
                      const isActive = themeId === theme.id;
                      return (
                        <button key={theme.id} onClick={() => setThemeId(theme.id)}
                          className={`relative text-center p-6 rounded-2xl border-2 transition-all duration-500 group overflow-hidden ${isActive ? "scale-[1.03] shadow-lg" : "hover:scale-[1.02]"}`}
                          style={{
                            borderColor: isActive ? `hsl(${theme.gold})` : `hsl(${theme.gold} / 0.2)`,
                            background: `hsl(${theme.ink})`,
                          }}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle, hsl(${theme.gold} / 0.15), transparent 70%)` }} />
                          <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full mx-auto mb-4 border-2 flex items-center justify-center transition-transform duration-500 group-hover:scale-110" style={{ borderColor: `hsl(${theme.gold})`, background: `hsl(${theme.gold} / 0.2)` }}>
                              {isActive && <CheckCircle2 className="w-5 h-5" style={{ color: `hsl(${theme.gold})` }} />}
                            </div>
                            <div className="font-display text-xs tracking-widest font-bold mb-1" style={{ color: `hsl(${theme.cream})` }}>{theme.name.toUpperCase()}</div>
                            <div className="flex justify-center gap-1.5 mt-3">
                              <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: `hsl(${theme.ink})` }} />
                              <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: `hsl(${theme.gold})` }} />
                              <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: `hsl(${theme.cream})` }} />
                            </div>
                            {isActive && <div className="text-[9px] font-display tracking-widest mt-3" style={{ color: `hsl(${theme.gold})` }}>ACTIVE</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Preview */}
                  <div className="mt-10 rounded-2xl overflow-hidden border border-gold/20 bg-ink transition-all duration-700">
                    <div className="p-6">
                      <div className="text-[10px] font-display tracking-[0.3em] text-gold mb-4">LIVE PREVIEW</div>
                      <div className="flex gap-3 mb-4">
                        <div className="px-4 py-2 rounded-lg text-xs font-display font-bold bg-gold text-ink">Primary</div>
                        <div className="px-4 py-2 rounded-lg text-xs font-display border border-gold/50 text-cream">Secondary</div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-gold/20">
                        <div className="h-full w-2/3 rounded-full bg-gold transition-all duration-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === "settings" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="font-display font-black text-3xl md:text-5xl mb-2">Security</h2>
                  <p className="font-serif-elegant italic text-cream/50">Manage your password and account security.</p>
                </div>
                <div className="bg-ink-soft/40 border border-gold/15 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
                  <div>
                    <label className="block text-[10px] font-display tracking-[0.3em] text-gold/80 mb-2">NEW PASSWORD</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
                      <input type="password" placeholder="••••••••" className="w-full bg-ink/50 border border-gold/20 focus:border-gold rounded-md pl-10 pr-3 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-display tracking-[0.3em] text-gold/80 mb-2">CONFIRM PASSWORD</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
                      <input type="password" placeholder="••••••••" className="w-full bg-ink/50 border border-gold/20 focus:border-gold rounded-md pl-10 pr-3 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors" />
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-cream/10 border border-cream/20 text-cream font-display font-bold text-xs tracking-[0.2em] rounded-lg hover:bg-gold hover:text-ink hover:border-gold transition-colors">UPDATE PASSWORD</button>
                </div>
              </div>
            )}

            {/* OTHER */}
            {activeTab === "other" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="font-display font-black text-3xl md:text-5xl mb-2">Advanced</h2>
                  <p className="font-serif-elegant italic text-cream/50">Data management and dangerous actions.</p>
                </div>
                <div className="bg-ink-soft/40 border border-red-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                  <h3 className="font-display font-bold text-xl text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-cream/50 mb-6">Once you delete your account, there is no going back.</p>
                  <button className="px-6 py-3 bg-red-900/30 border border-red-500/40 text-red-400 font-display font-bold text-xs tracking-[0.2em] rounded-lg hover:bg-red-500 hover:text-ink transition-colors">DELETE ACCOUNT</button>
                </div>
              </div>
            )}

            <div className="md:hidden mt-12 mb-8">
              <button onClick={() => signOut()} className="w-full py-3 bg-red-900/20 border border-red-500/30 text-red-400 font-display tracking-[0.2em] text-xs font-bold rounded-lg hover:bg-red-900/40 transition flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login / Signup
  return (
    <div className="min-h-screen bg-ink text-cream relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(0_0%_12%)_0%,hsl(0_0%_4%)_70%)]" />
      <div className="grain" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl" />

      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-ink/80 backdrop-blur-md border border-gold/20 rounded-full text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-xs font-display tracking-widest">
        <ArrowLeft className="w-4 h-4" /> BACK
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.5em] text-gold text-xs">CREATIVENODE</span>
            <div className="w-2 h-2 rotate-45 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold gold-text mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="font-serif-elegant italic text-cream/60">{isLogin ? "Sign in to manage your profile" : "Sign up for a new client account"}</p>
        </div>
        <form onSubmit={onSubmit} className="bg-ink-soft/60 backdrop-blur-xl border border-gold/20 rounded-lg p-8 space-y-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          <div>
            <label className="block text-xs font-display tracking-[0.3em] text-gold/80 mb-2">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-ink border border-gold/20 focus:border-gold rounded-md pl-10 pr-3 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-display tracking-[0.3em] text-gold/80 mb-2">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-ink border border-gold/20 focus:border-gold rounded-md pl-10 pr-3 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="w-full mt-2 py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.3em] text-sm font-bold rounded-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {isLogin ? "SIGN IN" : "SIGN UP"}
          </button>
          <div className="text-center pt-4">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs font-serif-elegant italic text-cream/60 hover:text-gold transition">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
