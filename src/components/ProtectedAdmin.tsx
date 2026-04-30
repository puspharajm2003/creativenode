import { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth, SUPER_ADMIN_EMAIL } from "@/hooks/useAuth";
import { Loader2, ShieldX } from "lucide-react";

export const ProtectedAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </div>
    );
  }

  /* Not logged in → send to login */
  if (!user) return <Navigate to="/login" replace />;

  /* Logged in but NOT the super-admin → access denied */
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-destructive/40 flex items-center justify-center bg-destructive/10">
            <ShieldX className="w-9 h-9 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">
            Access Denied
          </h1>
          <p className="font-serif-elegant italic text-cream/60 text-lg leading-relaxed">
            The CRM panel is restricted to the super-admin account only.
            <br />
            <span className="text-gold text-sm font-mono">{SUPER_ADMIN_EMAIL}</span>
          </p>
          <p className="text-cream/40 text-sm">
            You are currently signed in as{" "}
            <span className="text-cream/70 font-mono">{user.email}</span>
          </p>
          <div className="flex gap-4 justify-center pt-2">
            <Link
              to="/"
              className="px-5 py-2.5 border border-gold/30 rounded text-cream/80 hover:text-gold font-display tracking-widest text-xs transition"
            >
              GO HOME
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-widest text-xs font-bold rounded hover:opacity-90 transition"
            >
              SWITCH ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
