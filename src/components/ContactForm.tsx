import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2, Download, Pencil } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  businessType: z.string().trim().min(1, "Business type required").max(120),
  posterSize: z.string().trim().min(1, "Poster size/frequency required").max(120),
  message: z.string().trim().min(1, "Message required").max(4000),
});

/* ── Plan options for the editable confirm step ── */
const PLAN_OPTIONS = [
  { plan: "Frame Poster", posters: "1 Poster", price: "₹149" },
  { plan: "Basic Poster", posters: "5 Posters / Week", price: "₹1,999" },
  { plan: "Standard Poster", posters: "24 Posters / Month", price: "₹9,999" },
];

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

  /* confirm-step state */
  const [confirming, setConfirming] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editPosters, setEditPosters] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [parsedData, setParsedData] = useState<z.infer<typeof schema> | null>(null);

  const [lastName, setLastName] = useState("");
  const [lastSummary, setLastSummary] = useState<any>(null);

  /* ── Determine recommended plan from poster-size text ── */
  const recommend = (ps: string) => {
    const lower = ps.toLowerCase();
    if (lower.includes("single") || lower.includes("1") || lower.includes("one")) {
      return { plan: "Frame Poster", posters: "1 Poster", price: "₹149" };
    } else if (lower.includes("week") || lower.includes("5") || lower.includes("few")) {
      return { plan: "Basic Poster", posters: "5 Posters / Week", price: "₹1,999" };
    }
    return { plan: "Standard Poster", posters: "24 Posters / Month", price: "₹9,999" };
  };

  /* Step 1 — validate, open confirm step */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, businessType, posterSize, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const rec = recommend(parsed.data.posterSize);
    setEditPlan(rec.plan);
    setEditPosters(rec.posters);
    setEditPrice(rec.price);
    setParsedData(parsed.data);
    setConfirming(true);
  };

  /* Step 2 — save to CRM + open WhatsApp */
  const onConfirm = async () => {
    if (!parsedData) return;
    setLoading(true);
    const { name: n, email: em, businessType: bt, posterSize: ps, message: m } = parsedData;

    /* Build the EXACT WhatsApp delivery text */
    const waPlain = `Hi Creativenode! I'm ${n} (${bt}).\nEmail: ${em}\nPoster need: ${ps}\nSelected Plan: ${editPlan}\nPosters: ${editPosters}\nTotal: ${editPrice}\n\nMessage: ${m}`;

    /* CRM record — includes the full WhatsApp text for auditing */
    const crmMessage = [
      `Business Type: ${bt}`,
      `Poster Size/Freq: ${ps}`,
      ``,
      `Selected Plan: ${editPlan}`,
      `Posters: ${editPosters}`,
      `Total Price: ${editPrice}`,
      ``,
      `Message: ${m}`,
      ``,
      `── WhatsApp Delivery Text ──`,
      waPlain,
    ].join("\n");

    const { error } = await supabase.from("contact_messages").insert([{ name: n, email: em, message: crmMessage }]);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }

    const event = new CustomEvent("nova-recommendation", {
      detail: { name: n, businessType: bt, posterSize: ps, recommendedPlan: editPlan, postersCount: editPosters, totalPrice: editPrice }
    });
    window.dispatchEvent(event);

    const waText = encodeURIComponent(waPlain);
    window.open(`https://wa.me/916369278905?text=${waText}`, "_blank");

    setLastName(n);
    setLastSummary({ recommendedPlan: editPlan, postersCount: editPosters, totalPrice: editPrice });
    setDone(true);
    setConfirming(false);
    setName(""); setEmail(""); setBusinessType(""); setPosterSize(""); setMessage("");
    toast.success("Redirected to WhatsApp!");
  };

  const inputBase =
    variant === "dark"
      ? "w-full bg-ink/60 border border-gold/25 focus:border-gold rounded px-4 py-3 outline-none text-cream placeholder:text-cream/40 transition"
      : "w-full bg-white/90 border border-gold/40 focus:border-gold rounded px-4 py-3 outline-none text-ink placeholder:text-ink/40 transition";

  /* ── Done state ── */
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
              <CheckCircle2 className="w-3 h-3" /> Selected Plan
            </h4>
            <div className="flex justify-between items-end mb-2 relative z-10">
              <div className="text-cream font-bold text-2xl">{lastSummary.totalPrice}</div>
              <div className="text-cream/50 text-[10px] uppercase font-display tracking-wider bg-gold/10 px-2 py-1 rounded border border-gold/20">{lastSummary.postersCount}</div>
            </div>
            <div className="text-cream font-display text-sm mt-3 relative z-10">{lastSummary.recommendedPlan}</div>
          </div>
        )}

        {/* Pitch deck download link */}
        <a
          href="/portfolio"
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("download-pitch-deck"));
            /* Also navigate so they can grab it from the portfolio page */
            window.open("/clients", "_blank");
          }}
          className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 border border-gold/40 text-gold hover:bg-gold/10 rounded font-display tracking-widest text-xs transition"
        >
          <Download className="w-3.5 h-3.5" /> DOWNLOAD PITCH DECK (PDF)
        </a>

        <button
          onClick={() => setDone(false)}
          className="mt-2 text-xs font-display tracking-[0.3em] text-gold hover:text-gold-bright"
        >
          SEND ANOTHER →
        </button>
      </div>
    );
  }

  /* ── Confirm / Edit step ── */
  if (confirming && parsedData) {
    return (
      <div className={`flex flex-col py-8 px-6 border border-gold/30 rounded bg-ink/40 backdrop-blur-sm ${className}`}>
        <h3 className="font-display text-xl font-bold text-cream mb-1 flex items-center gap-2">
          <Pencil className="w-4 h-4 text-gold" /> Review & Confirm
        </h3>
        <p className="font-serif-elegant italic text-cream/50 text-sm mb-6">
          Edit the plan below before we send it via WhatsApp.
        </p>

        {/* Summary */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between text-cream/70">
            <span className="font-display tracking-widest text-[10px] text-cream/40 uppercase">Name</span>
            <span>{parsedData.name}</span>
          </div>
          <div className="flex justify-between text-cream/70">
            <span className="font-display tracking-widest text-[10px] text-cream/40 uppercase">Email</span>
            <span>{parsedData.email}</span>
          </div>
          <div className="flex justify-between text-cream/70">
            <span className="font-display tracking-widest text-[10px] text-cream/40 uppercase">Business</span>
            <span>{parsedData.businessType}</span>
          </div>
        </div>

        {/* Editable plan */}
        <div className="bg-ink border border-gold/20 rounded-lg p-5 mb-6 space-y-4">
          <h4 className="font-display text-gold text-xs tracking-widest uppercase">Selected Plan</h4>

          {/* Plan selector */}
          <div className="flex gap-2 flex-wrap">
            {PLAN_OPTIONS.map((opt) => (
              <button
                key={opt.plan}
                type="button"
                onClick={() => { setEditPlan(opt.plan); setEditPosters(opt.posters); setEditPrice(opt.price); }}
                className={`px-3 py-2 rounded text-xs font-display tracking-wider border transition ${
                  editPlan === opt.plan
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-gold/15 text-cream/50 hover:border-gold/40 hover:text-cream"
                }`}
              >
                {opt.plan} · {opt.price}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <div className="text-cream font-bold text-3xl">{editPrice}</div>
            <div className="text-cream/50 text-[10px] uppercase font-display tracking-wider bg-gold/10 px-2 py-1 rounded border border-gold/20">{editPosters}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-3 text-center font-display tracking-widest text-xs text-cream/60 border border-gold/20 rounded hover:text-cream hover:bg-white/5 transition"
          >
            BACK
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-[2] py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-xs font-bold rounded hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> SAVING & OPENING WHATSAPP...</>
            ) : (
              <><Send className="w-4 h-4" /> CONFIRM & OPEN WHATSAPP</>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
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
        <Send className="w-4 h-4" /> REVIEW & SEND
      </button>
    </form>
  );
};
