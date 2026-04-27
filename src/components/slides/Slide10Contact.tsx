import { useState } from "react";
import { SlideLayout } from "./SlideLayout";
import { GoldCorner } from "./decor";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Slide10Contact = () => {
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [posterSize, setPosterSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [lastSummary, setLastSummary] = useState<any>(null);

  const whatsappNumber = "916369278905";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let recommendedPlan = "Standard Poster";
    let postersCount = "24 Posters / Month";
    let totalPrice = "₹9,999";

    const lowerSize = posterSize.toLowerCase();
    if (lowerSize.includes("single") || lowerSize.includes("1") || lowerSize.includes("one")) {
      recommendedPlan = "Frame Poster";
      postersCount = "1 Poster";
      totalPrice = "₹149";
    } else if (lowerSize.includes("week") || lowerSize.includes("5") || lowerSize.includes("few")) {
      recommendedPlan = "Basic Poster";
      postersCount = "5 Posters / Week";
      totalPrice = "₹1,999";
    }

    const crmMessage = `Business Type: ${businessType}\nPoster Size: ${posterSize}\n\nRecommended Plan: ${recommendedPlan}\nPosters: ${postersCount}\nTotal Price: ${totalPrice}\n\nMessage: Hi Creativenode, I'm interested in your design services.`;

    const { error } = await supabase.from("contact_messages").insert([
      { name: name, email: "whatsapp-lead@creativenode.in", message: crmMessage }
    ]);
    
    setLoading(false);

    if (error) {
      toast.error("Could not send to CRM.");
      return;
    }

    const waText = encodeURIComponent(`Hi Creativenode! I'm ${name} (${businessType}). I'm looking for ${posterSize} and saw the ${recommendedPlan} (${totalPrice}).`);
    window.open(`https://wa.me/916369278905?text=${waText}`, "_blank");

    setLastSummary({ recommendedPlan, postersCount, totalPrice });
    setDone(true);
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
                     <CheckCircle2 className="w-4 h-4" /> Recommended Plan
                   </h4>
                   <div className="flex justify-between items-end mb-2 relative z-10">
                     <div className="text-cream font-bold text-4xl">{lastSummary.totalPrice}</div>
                     <div className="text-cream/50 text-xs uppercase font-display tracking-wider bg-gold/10 px-3 py-1.5 rounded border border-gold/20">{lastSummary.postersCount}</div>
                   </div>
                   <div className="text-cream font-display mt-2 relative z-10">{lastSummary.recommendedPlan}</div>
                 </div>
               )}

               <p className="text-cream/50 text-sm">
                 If WhatsApp didn't open automatically, <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="text-gold underline">click here</a>.
               </p>
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
                disabled={loading}
                className="group relative w-full mt-6 px-10 py-6 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display font-black text-2xl tracking-[0.2em] rounded-xl shadow-[0_15px_40px_-10px_hsl(42_65%_50%_/_0.5)] hover:shadow-[0_20px_50px_-10px_hsl(42_65%_50%_/_0.7)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {loading ? (
                  <><Loader2 className="w-8 h-8 animate-spin" /> SAVED TO CRM & OPENING WHATSAPP...</>
                ) : (
                  <>START YOUR DESIGN TODAY <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </SlideLayout>
  );
};
