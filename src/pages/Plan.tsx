import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Crown, Zap, Sparkles, X, ShieldCheck } from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Plan = () => {
  const [pricingTab, setPricingTab] = useState<'posters' | 'websites'>('posters');
  const [posterFreq, setPosterFreq] = useState<'single' | 'weekly' | 'monthly'>('single');

  // Payment Panel State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, priceText: string, numericPrice: number} | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleCheckout = (planName: string, priceText: string) => {
    // Extract numeric price (e.g. "₹1,999" -> 1999)
    const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
    if (!numericPrice) {
      // If it's a completely custom/unpriced plan
      window.dispatchEvent(new CustomEvent('open-chat'));
      return;
    }
    setSelectedPlan({ name: planName, priceText, numericPrice });
    setPromoCode("");
    setDiscountPercent(0);
    setPaymentModalOpen(true);
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a promo code");
      return;
    }

    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      setDiscountPercent(0);
      toast.error("Invalid or expired Promo Code");
    } else {
      setDiscountPercent(data.discount_percent);
      toast.success(`Promo code applied! ${data.discount_percent}% OFF.`);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load payment gateway. Please try again.");
      return;
    }

    const finalPrice = Math.round(selectedPlan.numericPrice * (1 - discountPercent / 100));

    const options = {
      key: "rzp_live_SkvWhIjdLWKBkI", // Razorpay Live API Key
      amount: finalPrice * 100, // Amount in paise
      currency: "INR",
      name: "CreativeNode",
      description: `Purchase: ${selectedPlan.name}`,
      image: "/favicon.jpg",
      handler: async function (response: any) {
        toast.success(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
        setPaymentModalOpen(false);
        
        // Record payment in Supabase
        await supabase.from("payments").insert({
          payment_id: response.razorpay_payment_id,
          amount_received: finalPrice,
          currency: "INR",
          promo_code_used: discountPercent > 0 ? promoCode.toUpperCase() : null,
          plan_name: selectedPlan.name,
          status: "success"
        });
        
        // Dispatch event for chat or success route if needed
      },
      theme: {
        color: "#D4AF37" // Luxury Gold theme
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any){
        toast.error("Payment failed. " + response.error.description);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-ink text-cream relative overflow-hidden flex flex-col pt-24 pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(42_65%_15%/0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="grain" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-ink/50 border-b border-gold/10">
        <div className="flex items-center justify-between px-8 py-5 max-w-[1800px] mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.4em] text-gold text-xs">CREATIVENODE</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-display tracking-[0.3em] text-cream/70">
            <Link to="/" className="hover:text-gold transition">HOME</Link>
            <Link to="/clients" className="hover:text-gold transition">WORK</Link>
            <AuthNavButton className="px-3 py-1.5 border border-gold/40 hover:border-gold hover:text-gold rounded" />
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto relative z-10 px-6 md:px-12 w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold/50" />
            <span className="font-display tracking-[0.5em] text-gold text-xs">INVESTMENT PLANS</span>
            <div className="h-px w-12 bg-gold/50" />
          </div>
          <h1 className="font-display font-black text-[clamp(48px,8vw,96px)] leading-[0.9] tracking-tight">
            Design that <span className="italic font-serif-elegant gold-text">Scales.</span>
          </h1>
          <p className="font-serif-elegant italic text-cream/60 text-xl mt-6 max-w-2xl mx-auto">
            Choose a plan that fits your business needs. Simple, transparent, and built for growth.
          </p>
        </div>

        {/* Pricing Tabs */}
        <div className="flex justify-center mb-16 animate-in fade-in duration-1000 delay-200">
          <div className="inline-flex items-center p-1.5 bg-ink-soft/60 backdrop-blur-xl border border-gold/20 rounded-full shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.15)]">
            <button
              onClick={() => setPricingTab('posters')}
              className={`flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-full font-display tracking-[0.2em] text-[10px] md:text-sm transition-all duration-300 ${
                pricingTab === 'posters' ? 'bg-gold text-ink font-bold shadow-[0_0_20px_hsl(var(--gold)/0.4)]' : 'text-cream/60 hover:text-gold'
              }`}
            >
              <Sparkles className="w-4 h-4" /> POSTER DESIGN
            </button>
            <button
              onClick={() => setPricingTab('websites')}
              className={`flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-full font-display tracking-[0.2em] text-[10px] md:text-sm transition-all duration-300 ${
                pricingTab === 'websites' ? 'bg-gold text-ink font-bold shadow-[0_0_20px_hsl(var(--gold)/0.4)]' : 'text-cream/60 hover:text-gold'
              }`}
            >
              <Zap className="w-4 h-4" /> WEBSITE DESIGN
            </button>
          </div>
        </div>

        {pricingTab === 'posters' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center mb-16">
              <div className="inline-flex items-center p-1.5 bg-ink-soft/40 border border-gold/15 rounded-xl backdrop-blur-md">
                {[
                  { id: 'single', label: 'Single Poster' },
                  { id: 'weekly', label: 'Weekly (5/wk)' },
                  { id: 'monthly', label: 'Monthly (24/mo)' },
                ].map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setPosterFreq(freq.id as any)}
                    className={`px-6 md:px-8 py-3 rounded-lg font-display tracking-[0.1em] text-xs transition-all duration-300 ${
                      posterFreq === freq.id ? 'bg-gold text-ink font-bold shadow-lg scale-105' : 'text-cream/50 hover:text-cream'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
              {posterFreq === 'monthly' && (
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-xs font-display tracking-[0.2em] text-gold-bright animate-pulse">
                  <Crown className="w-4 h-4" /> INCLUDES FREE FESTIVAL POSTERS
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Frame Poster",
                  prices: { single: "₹149", weekly: "₹749", monthly: "₹2,999" },
                  desc: "Perfect for basic announcements.",
                  features: ["Basic Layout Design", "Standard HD Quality", "1 Round of Revision", "Standard Delivery (48h)"],
                },
                {
                  name: "Basic Poster",
                  prices: { single: "₹199", weekly: "₹1,999", monthly: "₹3,999" },
                  desc: "Our most popular offering for brands.",
                  features: ["Custom Layout Design", "High Quality Assets", "2 Rounds of Revisions", "Priority Delivery (24h)", "Brand Color Matching"],
                  featured: true,
                },
                {
                  name: "Premium Poster",
                  prices: { single: "₹499", weekly: "₹2,499", monthly: "₹9,999" },
                  desc: "Complete custom artwork & 3D elements.",
                  features: ["Premium Complex Layout", "Ultra 4K Quality", "Unlimited Revisions", "Source File (.PSD)", "Same Day Delivery"],
                },
              ].map((p) => (
                <div key={p.name} className={`relative flex flex-col p-10 rounded-3xl border transition-all duration-500 ${
                  p.featured 
                    ? "border-gold bg-gradient-to-b from-gold/15 to-ink shadow-[0_20px_80px_-20px_hsl(var(--gold)/0.3)] transform lg:-translate-y-4" 
                    : "border-gold/20 bg-ink-soft/30 hover:border-gold/40 hover:bg-ink-soft/50"
                }`}>
                  {p.featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 bg-gold text-ink text-[10px] font-display font-bold tracking-[0.3em] rounded-full shadow-lg">POPULAR CHOICE</div>}
                  
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-3xl text-cream mb-2">{p.name}</h3>
                    <p className="font-serif-elegant italic text-cream/50">{p.desc}</p>
                  </div>
                  
                  <div className="mb-10 flex items-baseline gap-2">
                    <span className="font-display font-black text-6xl text-gold">{p.prices[posterFreq as keyof typeof p.prices]}</span>
                    <span className="text-cream/40 font-serif-elegant italic text-lg">
                      {posterFreq === 'single' ? '/ poster' : posterFreq === 'weekly' ? '/ week' : '/ month'}
                    </span>
                  </div>

                  <ul className="space-y-5 flex-1 mb-10">
                    {p.features.map((pt) => (
                       <li key={pt} className="flex items-start gap-4 text-cream/80 text-sm">
                         <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                         <span>{pt}</span>
                       </li>
                    ))}
                  </ul>

                  <button onClick={() => handleCheckout(p.name, p.prices[posterFreq as keyof typeof p.prices])} className={`mt-auto w-full py-4 text-center font-display tracking-[0.3em] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    p.featured ? "bg-gold text-ink hover:bg-gold-bright hover:shadow-[0_0_20px_hsl(var(--gold)/0.5)]" : "border border-gold/40 text-cream hover:border-gold hover:bg-gold/10 hover:text-gold"
                  }`}>
                    GET STARTED <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pricingTab === 'websites' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "STARTER",
                  sub: "Basic Landing",
                  price: "₹1,999",
                  range: "– ₹2,999",
                  best: "Small businesses / local shops",
                  features: ["1 Page Website (Landing)", "Mobile Responsive Design", "Basic UI Design", "Contact Form / WhatsApp", "Fast Delivery (3 days)"],
                },
                {
                  name: "BUSINESS",
                  sub: "Standard Website",
                  price: "₹4,999",
                  range: "– ₹9,999",
                  best: "Growing businesses",
                  features: ["3–5 Pages", "Modern UI/UX Design", "Mobile + Tablet Responsive", "Basic SEO Setup", "Contact + WhatsApp", "Google Map Integration"],
                  featured: true,
                },
                {
                  name: "PROFESSIONAL",
                  sub: "Premium Website",
                  price: "₹9,999",
                  range: "– ₹14,999",
                  best: "Serious brands / agencies",
                  features: ["5–10 Pages Website", "Advanced UI/UX Design", "Animations & Effects", "SEO & Speed Optimization", "Lead Generation Forms", "Blog Section"],
                },
                {
                  name: "CUSTOM",
                  sub: "High-End App",
                  price: "₹19,999+",
                  range: "",
                  best: "Startups / Enterprises",
                  features: ["Fully custom design", "Admin panel / CMS", "API integrations", "Advanced WebGL animations", "Custom database features", "Authentication"],
                },
              ].map((p) => (
                <div key={p.name} className={`flex flex-col relative p-8 rounded-3xl border transition-all duration-500 ${
                  p.featured 
                    ? "border-gold bg-gradient-to-b from-gold/15 to-ink-soft/60 shadow-[0_20px_80px_-20px_hsl(var(--gold)/0.3)] transform hover:-translate-y-2" 
                    : "border-gold/20 bg-ink-soft/40 hover:border-gold/50 hover:bg-ink-soft/60"
                }`}>
                  {p.featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-gold text-ink text-[9px] font-display font-bold tracking-[0.3em] rounded-full shadow-lg">RECOMMENDED</div>}
                  
                  <div className="mb-6">
                    <div className="text-[10px] font-display tracking-[0.4em] text-gold mb-2">{p.name}</div>
                    <h3 className="font-serif-elegant text-2xl text-cream">{p.sub}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="font-display font-black text-4xl gold-text">{p.price}</span>
                    {p.range && <div className="font-display text-lg gold-text opacity-60 mt-1">{p.range}</div>}
                  </div>

                  <div className="text-[10px] font-display tracking-widest text-cream/40 mb-8 uppercase px-3 py-1.5 bg-ink rounded-md inline-block">
                    Best for: {p.best}
                  </div>
                  
                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map((pt) => (
                       <li key={pt} className="flex items-start gap-3 text-cream/80 text-sm leading-snug">
                         <CheckCircle2 className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                         <span>{pt}</span>
                       </li>
                    ))}
                  </ul>

                  <button onClick={() => handleCheckout(p.name, p.price)} className={`mt-auto w-full py-3.5 text-center font-display tracking-[0.2em] text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    p.featured ? "bg-gold text-ink hover:bg-gold-bright" : "border border-gold/40 text-cream hover:border-gold hover:text-gold hover:bg-gold/10"
                  }`}>
                    REQUEST QUOTE <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add-ons */}
            <div className="mt-16 p-10 rounded-3xl border border-gold/20 bg-gradient-to-r from-ink-soft/40 via-gold/5 to-ink-soft/40 backdrop-blur-xl">
              <div className="text-center mb-10">
                <h4 className="font-display font-bold text-2xl text-cream">Powerful Add-ons</h4>
                <p className="font-serif-elegant italic text-cream/60 mt-2 text-lg">Enhance your website with extra features.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "Domain & Hosting", price: "₹1,500 – ₹3,000", icon: "🌐" },
                  { name: "Website Maintenance", price: "₹999 / month", icon: "🛠️" },
                  { name: "SEO Monthly", price: "₹2,999+", icon: "📈" },
                  { name: "Extra Landing Page", price: "₹1,999", icon: "📄" },
                ].map((addon) => (
                  <div key={addon.name} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gold/10 bg-ink hover:border-gold/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl mb-4 grayscale contrast-125 opacity-80">{addon.icon}</div>
                    <div className="font-display text-sm text-cream mb-2">{addon.name}</div>
                    <div className="font-display font-bold text-gold text-sm tracking-wider">{addon.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/90 backdrop-blur-md" onClick={() => setPaymentModalOpen(false)} />
          <div className="relative bg-ink-soft border border-gold/30 rounded-3xl w-full max-w-md p-8 shadow-[0_30px_100px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300">
            <button onClick={() => setPaymentModalOpen(false)} className="absolute top-6 right-6 text-cream/50 hover:text-gold transition">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span className="font-display tracking-widest text-emerald-400 text-sm">SECURE CHECKOUT</span>
            </div>

            <h3 className="font-serif-elegant text-2xl text-cream mb-2">{selectedPlan.name}</h3>
            <div className="font-display text-4xl text-gold mb-6">
              {discountPercent > 0 ? (
                <div className="flex items-end gap-3">
                  <span className="text-xl text-cream/30 line-through">₹{selectedPlan.numericPrice}</span>
                  <span>₹{Math.round(selectedPlan.numericPrice * (1 - discountPercent / 100))}</span>
                </div>
              ) : (
                <span>₹{selectedPlan.numericPrice}</span>
              )}
            </div>

            <div className="mb-6 space-y-3">
              <label className="text-xs font-display tracking-widest text-cream/60 uppercase">Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. LUXURY20"
                  className="flex-1 bg-ink border border-gold/20 rounded-lg px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors"
                />
                <button onClick={handleApplyPromo} className="px-6 py-3 bg-gold/10 text-gold border border-gold/30 rounded-lg text-xs font-display font-bold hover:bg-gold hover:text-ink transition">
                  APPLY
                </button>
              </div>
              {discountPercent > 0 && (
                <p className="text-xs text-emerald-400">Promo code applied successfully.</p>
              )}
            </div>

            <div className="h-px w-full bg-gold/10 mb-6" />

            <button onClick={handlePayment} className="w-full py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display font-bold tracking-widest rounded-xl shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.4)] transition hover:-translate-y-1">
              PAY SECURELY VIA RAZORPAY
            </button>
            
            <p className="text-center text-[10px] text-cream/40 mt-4 flex items-center justify-center gap-1">
              Payments are 100% encrypted & secure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plan;
