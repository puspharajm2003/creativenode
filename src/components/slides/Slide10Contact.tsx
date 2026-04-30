import { useState } from "react";
import { SlideLayout } from "./SlideLayout";
import { GoldCorner } from "./decor";
import { ArrowRight, Loader2, CheckCircle2, Download, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Plan options for editable confirm step ── */
const PLAN_OPTIONS = [
  { plan: "Frame Poster", posters: "1 Poster", price: "₹149" },
  { plan: "Basic Poster", posters: "5 Posters / Week", price: "₹1,999" },
  { plan: "Standard Poster", posters: "24 Posters / Month", price: "₹9,999" },
];

export const Slide10Contact = () => {
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [posterSize, setPosterSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [lastSummary, setLastSummary] = useState<any>(null);

  /* confirm-step state */
  const [confirming, setConfirming] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editPosters, setEditPosters] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const whatsappNumber = "916369278905";

  const recommend = (ps: string) => {
    const lower = ps.toLowerCase();
    if (lower.includes("single") || lower.includes("1") || lower.includes("one")) {
      return { plan: "Frame Poster", posters: "1 Poster", price: "₹149" };
    } else if (lower.includes("week") || lower.includes("5") || lower.includes("few")) {
      return { plan: "Basic Poster", posters: "5 Posters / Week", price: "₹1,999" };
    }
    return { plan: "Standard Poster", posters: "24 Posters / Month", price: "₹9,999" };
  };

  /* Step 1 — validate, show confirm step */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = recommend(posterSize);
    setEditPlan(rec.plan);
    setEditPosters(rec.posters);
    setEditPrice(rec.price);
    setConfirming(true);
  };

  /* Step 2 — save CRM + open WhatsApp */
  const handleConfirm = async () => {
    setLoading(true);

    /* Build the EXACT WhatsApp delivery text */
    const waPlain = `Hi Creativenode! I'm ${name} (${businessType}).\nPoster need: ${posterSize}\nSelected Plan: ${editPlan}\nPosters: ${editPosters}\nTotal: ${editPrice}`;

    /* CRM record with full WhatsApp text for auditing */
    const crmMessage = [
      `Business Type: ${businessType}`,
      `Poster Size: ${posterSize}`,
      ``,
      `Selected Plan: ${editPlan}`,
      `Posters: ${editPosters}`,
      `Total Price: ${editPrice}`,
      ``,
      `── WhatsApp Delivery Text ──`,
      waPlain,
    ].join("\n");

    const { error } = await supabase.from("contact_messages").insert([
      { name, email: "whatsapp-lead@creativenode.in", message: crmMessage }
    ]);
    
    setLoading(false);

    if (error) {
      toast.error("Could not send to CRM.");
      return;
    }

    const waText = encodeURIComponent(waPlain);
    window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, "_blank");

    setLastSummary({ recommendedPlan: editPlan, postersCount: editPosters, totalPrice: editPrice });
    setDone(true);
    setConfirming(false);
  };

  return (
    <SlideLayout pageNumber={10} showFooter={false}>
      <GoldCorner position="tl" />
      <GoldCorner position="tr" />
      <GoldCorner position="bl" />
      <GoldCorner position="br" />

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 60%, hsl(42 65% 50% / 0.4), transparent 60%)" }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-px bg-gold" />
            <span className="font-display tracking-[0.4em] text-gold text-lg">LET'S WORK TOGETHER</span>
            <div className="w-16 h-px bg-gold" />
          </div>

          <h2 className="font-display font-black text-[100px] leading-[0.9] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cream via-cream to-cream/50">
            Start <span className="italic font-serif-elegant gold-text">Today.</span>
          </h2>
          <p className="font-serif-elegant italic text-cream/60 text-2xl mb-8">
            Fill in the quick details below. We'll add you to our CRM and open WhatsApp instantly.
          </p>

          <button 
            onClick={() => window.print()}
            className="mb-12 px-8 py-3 bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-ink rounded shadow-[0_0_15px_hsl(var(--gold)/0.2)] hover:shadow-[0_0_25px_hsl(var(--gold)/0.4)] transition no-print font-display tracking-widest text-sm flex items-center gap-2"
          >
            DOWNLOAD LATEST PITCH DECK (PDF)
          </button>

          {done ? (
             <div className="flex flex-col items-center p-12 bg-ink/60 border border-gold/30 rounded-2xl backdrop-blur-md w-full">
               <CheckCircle2 className="w-16 h-16 text-gold mb-6" />
               <h3 className="font-display text-3xl font-bold text-cream mb-2">Request Sent!</h3>
               <p className="text-cream/70 font-serif-elegant italic text-xl mb-8">
                 Your details are in our CRM and we've opened WhatsApp.
               </p>

               {lastSummary && (
                 <div className="bg-ink border border-gold/20 rounded-xl p-6 w-full max-w-md mb-8 relative overflow-hidden text-left">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl pointer-events-none" />
                   <h4 className="font-display text-gold text-sm tracking-widest mb-4 uppercase flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4" /> Selected Plan
                   </h4>
                   <div className="flex justify-between items-end mb-2 relative z-10">
                     <div className="text-cream font-bold text-4xl">{lastSummary.totalPrice}</div>
                     <div className="text-cream/50 text-xs uppercase font-display tracking-wider bg-gold/10 px-3 py-1.5 rounded border border-gold/20">{lastSummary.postersCount}</div>
                   </div>
                   <div className="text-cream font-display mt-2 relative z-10">{lastSummary.recommendedPlan}</div>
                 </div>
               )}

               {/* Pitch deck PDF download link */}
               <button
                 onClick={() => window.print()}
                 className="inline-flex items-center gap-2 mb-6 px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 rounded font-display tracking-widest text-sm transition"
               >
                 <Download className="w-4 h-4" /> DOWNLOAD PITCH DECK (PDF)
               </button>

               <p className="text-cream/50 text-sm">
                 If WhatsApp didn't open automatically, <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="text-gold underline">click here</a>.
               </p>
             </div>

          ) : confirming ? (
            /* ── Confirm / Edit step ── */
            <div className="w-full p-10 bg-ink-soft/40 border border-gold/15 rounded-3xl backdrop-blur-md shadow-2xl text-left">
              <h3 className="font-display text-2xl font-bold text-cream mb-1 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-gold" /> Review & Confirm
              </h3>
              <p className="font-serif-elegant italic text-cream/50 text-lg mb-8">
                Adjust the plan below before we send it via WhatsApp.
              </p>

              {/* Summary */}
              <div className="space-y-3 mb-6 text-base">
                <div className="flex justify-between text-cream/70">
                  <span className="font-display tracking-widest text-xs text-cream/40 uppercase">Name</span>
                  <span>{name}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span className="font-display tracking-widest text-xs text-cream/40 uppercase">Business</span>
                  <span>{businessType}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span className="font-display tracking-widest text-xs text-cream/40 uppercase">Poster Need</span>
                  <span>{posterSize}</span>
                </div>
              </div>

              {/* Editable plan */}
              <div className="bg-ink border border-gold/20 rounded-xl p-6 mb-8 space-y-5">
                <h4 className="font-display text-gold text-sm tracking-widest uppercase">Selected Plan</h4>
                <div className="flex gap-3 flex-wrap">
                  {PLAN_OPTIONS.map((opt) => (
                    <button
                      key={opt.plan}
                      type="button"
                      onClick={() => { setEditPlan(opt.plan); setEditPosters(opt.posters); setEditPrice(opt.price); }}
                      className={`px-4 py-3 rounded-lg text-sm font-display tracking-wider border transition ${
                        editPlan === opt.plan
                          ? "border-gold bg-gold/15 text-gold shadow-[0_0_12px_hsl(var(--gold)/0.2)]"
                          : "border-gold/15 text-cream/50 hover:border-gold/40 hover:text-cream"
                      }`}
                    >
                      {opt.plan} · {opt.price}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-cream font-bold text-5xl">{editPrice}</div>
                  <div className="text-cream/50 text-xs uppercase font-display tracking-wider bg-gold/10 px-3 py-1.5 rounded border border-gold/20">{editPosters}</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setConfirming(false)}
                  className="px-6 py-4 font-display tracking-widest text-sm text-cream/60 border border-gold/20 rounded-xl hover:text-cream hover:bg-white/5 transition"
                >
                  BACK
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="group relative flex-1 px-10 py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display font-bold text-xl tracking-[0.2em] rounded-xl shadow-[0_15px_40px_-10px_hsl(42_65%_50%_/_0.5)] hover:shadow-[0_20px_50px_-10px_hsl(42_65%_50%_/_0.7)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {loading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> SAVING...</>
                  ) : (
                    <>CONFIRM & OPEN WHATSAPP <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>

          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-6 text-left p-10 bg-ink-soft/40 border border-gold/15 rounded-3xl backdrop-blur-md shadow-2xl">
              <div className="space-y-2">
                <label className="text-xs font-display tracking-widest text-cream/50 uppercase">Your Name</label>
                <input 
                  value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-ink/60 border border-gold/20 rounded-lg px-5 py-4 text-cream focus:border-gold outline-none transition"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-display tracking-widest text-cream/50 uppercase">Business Type</label>
                  <input 
                    value={businessType} onChange={(e) => setBusinessType(e.target.value)} required
                    className="w-full bg-ink/60 border border-gold/20 rounded-lg px-5 py-4 text-cream focus:border-gold outline-none transition"
                    placeholder="e.g. Fitness Studio"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-display tracking-widest text-cream/50 uppercase">Poster Size</label>
                  <select 
                    value={posterSize} onChange={(e) => setPosterSize(e.target.value)} required
                    className="w-full bg-ink/60 border border-gold/20 rounded-lg px-5 py-4 text-cream focus:border-gold outline-none transition appearance-none"
                  >
                    <option value="" disabled className="text-ink">Select size...</option>
                    <option value="A4 / Standard" className="text-ink">A4 / Standard</option>
                    <option value="Instagram Square (1:1)" className="text-ink">Instagram Square (1:1)</option>
                    <option value="Story / Reel (9:16)" className="text-ink">Story / Reel (9:16)</option>
                    <option value="Large Banner" className="text-ink">Large Banner</option>
                  </select>
                </div>
              </div>

              {/* Prominent CTA */}
              <button 
                type="submit"
                className="group relative w-full mt-6 px-10 py-6 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display font-black text-2xl tracking-[0.2em] rounded-xl shadow-[0_15px_40px_-10px_hsl(42_65%_50%_/_0.5)] hover:shadow-[0_20px_50px_-10px_hsl(42_65%_50%_/_0.7)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                REVIEW YOUR PLAN <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>
    </SlideLayout>
  );
};
