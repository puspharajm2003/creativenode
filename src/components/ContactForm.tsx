import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  businessType: z.string().trim().min(1, "Business type required").max(120),
  posterSize: z.string().trim().min(1, "Poster size/frequency required").max(120),
  message: z.string().trim().min(1, "Message required").max(4000),
});

interface Props {
  variant?: "dark" | "light";
  className?: string;
}

export const ContactForm = ({ variant = "dark", className = "" }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [posterSize, setPosterSize] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [lastName, setLastName] = useState("");
  const [lastSummary, setLastSummary] = useState<any>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, businessType, posterSize, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { name: n, email: em, businessType: bt, posterSize: ps, message: m } = parsed.data;

    let recommendedPlan = "Standard Poster";
    let postersCount = "24 Posters / Month";
    let totalPrice = "₹9,999";

    const lowerSize = ps.toLowerCase();
    if (lowerSize.includes("single") || lowerSize.includes("1") || lowerSize.includes("one")) {
      recommendedPlan = "Frame Poster";
      postersCount = "1 Poster";
      totalPrice = "₹149";
    } else if (lowerSize.includes("week") || lowerSize.includes("5") || lowerSize.includes("few")) {
      recommendedPlan = "Basic Poster";
      postersCount = "5 Posters / Week";
      totalPrice = "₹1,999";
    }

    const crmMessage = `Business Type: ${bt}\nPoster Size/Freq: ${ps}\n\nRecommended Plan: ${recommendedPlan}\nPosters: ${postersCount}\nTotal Price: ${totalPrice}\n\nMessage: ${m}`;

    const { error } = await supabase.from("contact_messages").insert([{ name: n, email: em, message: crmMessage }]);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }

    const event = new CustomEvent("nova-recommendation", {
      detail: { name: n, businessType: bt, posterSize: ps, recommendedPlan, postersCount, totalPrice }
    });
    window.dispatchEvent(event);

    const waText = encodeURIComponent(`Hi Creativenode! I'm ${n} (${bt}). I'm looking for ${ps} and saw the ${recommendedPlan} (${totalPrice}).`);
    window.open(`https://wa.me/916369278905?text=${waText}`, "_blank");

    setLastName(n);
    setLastSummary({ recommendedPlan, postersCount, totalPrice });
    setDone(true);
    setName(""); setEmail(""); setBusinessType(""); setPosterSize(""); setMessage("");
    toast.success("Redirected to WhatsApp!");
  };

  const inputBase =
    variant === "dark"
      ? "w-full bg-ink/60 border border-gold/25 focus:border-gold rounded px-4 py-3 outline-none text-cream placeholder:text-cream/40 transition"
      : "w-full bg-white/90 border border-gold/40 focus:border-gold rounded px-4 py-3 outline-none text-ink placeholder:text-ink/40 transition";

  if (done) {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-10 px-6 border border-gold/30 rounded bg-ink/40 backdrop-blur-sm ${className}`}>
        <CheckCircle2 className="w-12 h-12 text-gold mb-4" />
        <h3 className="font-display text-2xl font-bold text-cream">Request Sent!</h3>
        <p className="font-serif-elegant italic text-cream/70 mt-2 mb-6">
          Thanks {lastName ? `${lastName}, ` : ""}we've opened WhatsApp with your details.
        </p>

        {lastSummary && (
          <div className="bg-ink border border-gold/20 rounded-lg p-5 w-full text-left max-w-sm mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-2xl pointer-events-none" />
            <h4 className="font-display text-gold text-xs tracking-widest mb-3 uppercase flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" /> Recommended Plan
            </h4>
            <div className="flex justify-between items-end mb-2 relative z-10">
              <div className="text-cream font-bold text-2xl">{lastSummary.totalPrice}</div>
              <div className="text-cream/50 text-[10px] uppercase font-display tracking-wider bg-gold/10 px-2 py-1 rounded border border-gold/20">{lastSummary.postersCount}</div>
            </div>
            <div className="text-cream font-display text-sm mt-3 relative z-10">{lastSummary.recommendedPlan}</div>
          </div>
        )}

        <button
          onClick={() => setDone(false)}
          className="mt-2 text-xs font-display tracking-[0.3em] text-gold hover:text-gold-bright"
        >
          SEND ANOTHER →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          className={inputBase}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
        />
        <input
          className={inputBase}
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          required
        />
        <input
          className={inputBase}
          placeholder="Business type (e.g. Gym, Agency)"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          maxLength={120}
          required
        />
        <input
          className={inputBase}
          placeholder="Poster need (e.g. 5/week, single)"
          value={posterSize}
          onChange={(e) => setPosterSize(e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <textarea
        className={`${inputBase} min-h-[140px] resize-y`}
        placeholder="Tell us about your project — type of design, deadline, brand vibe..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={4000}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-xs font-bold rounded hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> SAVED TO CRM & OPENING WHATSAPP...</>
        ) : (
          <><Send className="w-4 h-4" /> SEND MESSAGE</>
        )}
      </button>
    </form>
  );
};
