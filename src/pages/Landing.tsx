import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/integrations/supabase/client";
import { AuthNavButton } from "@/components/AuthNavButton";
import {
  ArrowDown, ArrowUpRight, Sparkles, Layers, Zap, Award,
  Instagram, Mail, Phone, MapPin,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Chatbot } from "@/components/Chatbot";

gsap.registerPlugin(ScrollTrigger);

interface Client { id: string; name: string; slug: string; tagline: string | null; accent: string | null; }
interface Poster { id: string; client_id: string; image_path: string; title: string | null; }

const PUBLIC_URL = (path: string) =>
  supabase.storage.from("client-posters").getPublicUrl(path).data.publicUrl;

const SERVICES = [
  { icon: Sparkles, title: "Poster Design", desc: "Single & series posters that stop the scroll." },
  { icon: Layers, title: "Brand Identity", desc: "Logos, palettes, type — full visual systems." },
  { icon: Zap, title: "Social Media Kits", desc: "Instagram grids, reels covers, story templates." },
  { icon: Award, title: "Premium Campaigns", desc: "End-to-end art direction for hero launches." },
];

const STATS = [
  { value: "50+", label: "Projects" },
  { value: "2+", label: "Years Studio" },
  { value: "24h", label: "Avg Reply" },
];

const Landing = () => {
  const root = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [ready, setReady] = useState(false);
  const [pricingTab, setPricingTab] = useState<'posters' | 'websites'>('posters');
  const [posterFreq, setPosterFreq] = useState<'single' | 'weekly' | 'monthly'>('single');
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out"
        });
      }
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("clients").select("*").order("sort_order");
      const { data: p } = await supabase
        .from("client_posters")
        .select("*")
        .eq("approved", true)
        .order("sort_order")
        .limit(12);
      setClients(c ?? []);
      setPosters(p ?? []);
      setReady(true);
    })();
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline();
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" })
        .from(".hero-line", { y: 100, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.12 }, "-=0.3")
        .from(".hero-sub", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
        .from(".hero-cta > *", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.3")
        .from(".hero-stat", { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.2");

      // Floating orbs parallax
      gsap.to(".orb", {
        yPercent: 30, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Section reveals
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Service cards stagger
      gsap.from(".service-card", {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".services-grid", start: "top 80%" },
      });

      // Poster grid parallax
      gsap.utils.toArray<HTMLElement>(".poster-tile").forEach((el, i) => {
        gsap.from(el, {
          y: 60 + (i % 3) * 30, opacity: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
        gsap.to(el.querySelector("img"), {
          yPercent: -8, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <div ref={root} className="bg-ink text-cream no-scrollbar overflow-x-hidden relative">
      {/* Custom Glowing Cursor */}
      <div 
        ref={cursorRef} 
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] -ml-[200px] -mt-[200px] rounded-full bg-gold/15 blur-[100px] z-0 mix-blend-screen hidden md:block" 
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-ink/50 border-b border-gold/10">
        <div className="flex items-center justify-between px-8 py-5 max-w-[1800px] mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.4em] text-gold text-xs">CREATIVENODE</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-display tracking-[0.3em] text-cream/70">
            <a href="#services" className="hover:text-gold transition">SERVICES</a>
            <a href="#work" className="hover:text-gold transition">WORK</a>
            <a href="#pricing" className="hover:text-gold transition">PRICING</a>
            <a href="#contact" className="hover:text-gold transition">CONTACT</a>
            <div className="relative group py-2 -my-2">
              <span className="cursor-pointer hover:text-gold transition inline-flex items-center gap-1">WORK <ArrowDown className="w-3 h-3" /></span>
              <div className="absolute top-full left-0 mt-0 w-48 py-2 bg-ink/95 backdrop-blur-xl border border-gold/20 rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col">
                <Link to="/clients" className="px-5 py-3 hover:bg-gold/10 hover:text-gold transition tracking-[0.2em]">POSTERS</Link>
                <div className="h-px bg-gold/10" />
                <Link to="/websites" className="px-5 py-3 hover:bg-gold/10 hover:text-gold transition tracking-[0.2em]">WEBSITES</Link>
              </div>
            </div>
            <AuthNavButton className="px-3 py-1.5 border border-gold/40 hover:border-gold hover:text-gold rounded" />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <div className="orb absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gold/15 blur-3xl" />
        <div className="orb absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-gold/10 blur-3xl" />
        <div className="grain" />

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <div className="hero-eyebrow inline-flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-gold" />
            <span className="font-display tracking-[0.5em] text-gold text-xs">CREATIVE STUDIO · EST. 2022</span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h1 className="font-display font-black leading-[0.85] text-[clamp(56px,11vw,180px)] tracking-tight">
            <div className="hero-line overflow-hidden"><div>Design.</div></div>
            <div className="hero-line overflow-hidden"><div className="italic font-serif-elegant gold-text">Build.</div></div>
            <div className="hero-line overflow-hidden"><div>Innovate.</div></div>
          </h1>
          <p className="hero-sub font-serif-elegant italic text-cream/70 text-xl md:text-2xl mt-8 max-w-2xl mx-auto">
            Premium poster &amp; brand design that helps your business attract attention and close clients.
          </p>
          <div className="hero-cta mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.3em] text-sm font-bold rounded hover:opacity-90 transition">
              START A PROJECT <ArrowUpRight className="w-4 h-4" />
            </a>
            <Link to="/clients" className="inline-flex items-center gap-2 px-8 py-4 border border-gold/40 text-cream font-display tracking-[0.3em] text-sm hover:border-gold hover:text-gold transition">
              VIEW SHOWCASE
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat text-center">
                <div className="font-display font-black text-4xl gold-text">{s.value}</div>
                <div className="text-xs font-display tracking-[0.3em] text-cream/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/70 animate-bounce">
          <ArrowDown className="w-5 h-5" />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative py-32 px-8 border-t border-gold/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="reveal mb-20 max-w-3xl">
            <div className="text-xs font-display tracking-[0.5em] text-gold mb-4">WHAT WE DO</div>
            <h2 className="font-display font-black text-[clamp(40px,6vw,80px)] leading-[0.95]">
              Crafted for brands that <span className="italic font-serif-elegant gold-text">refuse</span> the ordinary.
            </h2>
          </div>
          <div className="services-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="service-card group p-8 border border-gold/15 rounded-lg bg-ink-soft/40 hover:border-gold/50 hover:bg-ink-soft/70 transition-all">
                <s.icon className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-display font-bold text-xl mb-3">{s.title}</h3>
                <p className="font-serif-elegant italic text-cream/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK PREVIEW */}
      <section id="work" className="relative py-32 px-8 border-t border-gold/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="reveal flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="text-xs font-display tracking-[0.5em] text-gold mb-4">SELECTED WORK</div>
              <h2 className="font-display font-black text-[clamp(40px,6vw,72px)] leading-[0.95]">
                Recent <span className="italic font-serif-elegant gold-text">posters</span>.
              </h2>
            </div>
            <Link to="/clients" className="inline-flex items-center gap-2 text-cream hover:text-gold font-display tracking-[0.3em] text-sm group">
              FULL SHOWCASE
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </Link>
          </div>

          {posters.length === 0 ? (
            <div className="reveal border border-dashed border-gold/30 rounded-lg p-20 text-center">
              <p className="font-serif-elegant italic text-cream/60">Approved posters appear here. Add some from the admin CRM.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {posters.slice(0, 8).map((p) => (
                <Link to="/clients" key={p.id} className="poster-tile poster-card aspect-[4/5] block overflow-hidden group">
                  <img
                    src={PUBLIC_URL(p.image_path)}
                    alt={p.title ?? "Poster"}
                    className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CLIENTS BAR */}
      <section className="relative py-20 px-8 border-t border-gold/10 overflow-hidden">
        <div className="reveal text-center mb-10">
          <div className="text-xs font-display tracking-[0.5em] text-gold">TRUSTED BY</div>
        </div>
        <div className="flex items-center justify-center gap-12 flex-wrap max-w-5xl mx-auto">
          {clients.map((c) => (
            <Link key={c.id} to="/clients" className="reveal font-display font-bold text-2xl md:text-3xl text-cream/40 hover:text-gold transition">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-32 px-8 border-t border-gold/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(42_65%_15%/0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="reveal text-center mb-12">
            <div className="text-xs font-display tracking-[0.5em] text-gold mb-4">INVESTMENT</div>
            <h2 className="font-display font-black text-[clamp(40px,6vw,72px)] leading-[0.95]">
              Simple, <span className="italic font-serif-elegant gold-text">transparent</span> rates.
            </h2>
          </div>

          {/* Pricing Tabs */}
          <div className="reveal flex justify-center mb-16">
            <div className="inline-flex items-center p-1.5 bg-ink-soft/40 backdrop-blur-md border border-gold/20 rounded-full">
              <button
                onClick={() => setPricingTab('posters')}
                className={`px-8 py-3 rounded-full font-display tracking-[0.2em] text-sm transition-all duration-300 ${
                  pricingTab === 'posters' ? 'bg-gold text-ink font-bold shadow-[0_0_20px_hsl(var(--gold)/0.4)]' : 'text-cream/60 hover:text-gold'
                }`}
              >
                POSTER DESIGN
              </button>
              <button
                onClick={() => setPricingTab('websites')}
                className={`px-8 py-3 rounded-full font-display tracking-[0.2em] text-sm transition-all duration-300 ${
                  pricingTab === 'websites' ? 'bg-gold text-ink font-bold shadow-[0_0_20px_hsl(var(--gold)/0.4)]' : 'text-cream/60 hover:text-gold'
                }`}
              >
                WEBSITE DESIGN
              </button>
            </div>
          </div>

          {pricingTab === 'posters' && (
            <div className="reveal animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center mb-12">
                <div className="inline-flex items-center p-1 bg-ink-soft/30 border border-gold/15 rounded-lg">
                  {[
                    { id: 'single', label: 'Single Poster' },
                    { id: 'weekly', label: 'Weekly Plan (5)' },
                    { id: 'monthly', label: 'Monthly Plan (24)' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setPosterFreq(freq.id as any)}
                      className={`px-6 py-2 rounded-md font-display tracking-[0.1em] text-xs transition-all ${
                        posterFreq === freq.id ? 'bg-gold/20 text-gold border border-gold/40' : 'text-cream/50 hover:text-cream/90'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
                {posterFreq === 'monthly' && (
                  <div className="mt-4 text-xs font-display tracking-[0.2em] text-gold-bright animate-pulse">
                    + INCLUDES FREE FESTIVAL POSTER
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    name: "Frame Poster",
                    prices: { single: "₹149", weekly: "₹749", monthly: "₹2,999" },
                    features: ["Basic Layout", "Standard Quality", "1 Revision"],
                  },
                  {
                    name: "Basic Poster",
                    prices: { single: "₹199", weekly: "₹1,999", monthly: "₹3,999" },
                    features: ["Custom Layout", "High Quality", "2 Revisions"],
                    featured: true,
                  },
                  {
                    name: "Standard Poster",
                    prices: { single: "₹499", weekly: "₹2,499", monthly: "₹9,999" },
                    features: ["Premium Layout", "Ultra HD Quality", "Unlimited Revisions", "Source File"],
                  },
                ].map((p) => (
                  <div key={p.name} className={`relative p-10 rounded-2xl border transition-all duration-500 ${
                    p.featured 
                      ? "border-gold bg-gradient-to-b from-gold/10 to-ink-soft/40 shadow-[0_20px_60px_-20px_hsl(var(--gold)/0.4)] transform hover:-translate-y-2" 
                      : "border-gold/20 bg-ink-soft/40 hover:border-gold/50"
                  }`}>
                    {p.featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gold text-ink text-[10px] font-display font-bold tracking-[0.3em] rounded-full">POPULAR</div>}
                    <h3 className="font-display font-bold text-2xl text-cream">{p.name}</h3>
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="font-display font-black text-5xl gold-text">{p.prices[posterFreq as keyof typeof p.prices]}</span>
                      <span className="text-cream/40 font-serif-elegant italic">
                        {posterFreq === 'single' ? '/ poster' : posterFreq === 'weekly' ? '/ week' : '/ month'}
                      </span>
                    </div>
                    <ul className="mt-8 space-y-4">
                      {p.features.map((pt) => (
                         <li key={pt} className="flex items-center gap-3 text-cream/80 text-sm">
                           <div className="w-1.5 h-1.5 rotate-45 bg-gold shrink-0" />{pt}
                         </li>
                      ))}
                    </ul>
                    <Link to="/pricing" className={`mt-10 block w-full py-3 text-center font-display tracking-[0.2em] text-xs rounded transition-all ${
                      p.featured ? "bg-gold text-ink font-bold hover:bg-gold-bright" : "border border-gold/40 text-cream hover:border-gold hover:text-gold"
                    }`}>
                      SELECT PLAN
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pricingTab === 'websites' && (
            <div className="reveal animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "STARTER",
                    sub: "Basic Website",
                    price: "₹1,999",
                    range: "– ₹2,999",
                    best: "Small businesses / local shops",
                    features: ["1 Page Website (Landing)", "Mobile Responsive Design", "Basic UI Design", "Contact Form / WhatsApp", "Fast Delivery"],
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
                    range: "– ₹14,999+",
                    best: "Serious brands / agencies",
                    features: ["5–10 Pages Website", "Advanced UI/UX Design", "Animations & Effects", "SEO & Speed Optimization", "Lead Generation Forms", "Blog / Portfolio Section"],
                  },
                  {
                    name: "HIGH-END",
                    sub: "Advanced / Custom",
                    price: "₹19,999+",
                    range: "",
                    best: "Startups / business scaling",
                    features: ["Fully custom design", "Admin panel / CMS", "API integrations", "Advanced animations", "Custom features"],
                  },
                ].map((p) => (
                  <div key={p.name} className={`flex flex-col relative p-8 rounded-2xl border transition-all duration-500 ${
                    p.featured 
                      ? "border-gold bg-gradient-to-b from-gold/10 to-ink-soft/40 shadow-[0_20px_60px_-20px_hsl(var(--gold)/0.4)] transform hover:-translate-y-2" 
                      : "border-gold/20 bg-ink-soft/40 hover:border-gold/50"
                  }`}>
                    {p.featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gold text-ink text-[10px] font-display font-bold tracking-[0.3em] rounded-full">RECOMMENDED</div>}
                    <div className="text-[10px] font-display tracking-[0.4em] text-gold mb-1">{p.name}</div>
                    <h3 className="font-serif-elegant text-xl text-cream mb-4">{p.sub}</h3>
                    <div className="mb-2">
                      <span className="font-display font-black text-3xl gold-text">{p.price}</span>
                      {p.range && <span className="font-display text-lg gold-text opacity-70 ml-1">{p.range}</span>}
                    </div>
                    <div className="text-[11px] font-display tracking-widest text-cream/50 mb-6 uppercase">Best for: {p.best}</div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      {p.features.map((pt) => (
                         <li key={pt} className="flex items-start gap-3 text-cream/80 text-sm leading-snug">
                           <div className="w-1.5 h-1.5 mt-1.5 rotate-45 bg-gold shrink-0" />{pt}
                         </li>
                      ))}
                    </ul>
                    <Link to="/pricing" className={`mt-auto block w-full py-3 text-center font-display tracking-[0.2em] text-xs rounded transition-all ${
                      p.featured ? "bg-gold text-ink font-bold hover:bg-gold-bright" : "border border-gold/40 text-cream hover:border-gold hover:text-gold"
                    }`}>
                      GET A QUOTE
                    </Link>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              <div className="mt-16 p-8 rounded-2xl border border-gold/20 bg-ink-soft/60">
                <div className="text-center mb-8">
                  <h4 className="font-display font-bold text-xl text-cream">Website Add-ons</h4>
                  <p className="font-serif-elegant italic text-cream/60 mt-1">Essential upgrades for extra performance</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Domain & Hosting", price: "₹1,500 – ₹3,000", icon: "🌐" },
                    { name: "Website Maintenance", price: "₹999 / month", icon: "🛠️" },
                    { name: "SEO Monthly", price: "₹2,999+", icon: "📈" },
                    { name: "Landing Page (Extra)", price: "₹1,999", icon: "📄" },
                  ].map((addon) => (
                    <div key={addon.name} className="flex flex-col items-center text-center p-4 rounded-xl border border-gold/10 bg-ink">
                      <div className="text-2xl mb-2">{addon.icon}</div>
                      <div className="font-display text-sm text-cream mb-1">{addon.name}</div>
                      <div className="font-display font-bold text-gold text-sm">{addon.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-32 px-8 border-t border-gold/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(42_65%_30%/0.18)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <div className="reveal">
            <div className="text-xs font-display tracking-[0.5em] text-gold mb-4">LET'S TALK</div>
            <h2 className="font-display font-black text-[clamp(40px,6vw,80px)] leading-[0.95]">
              Got a brief? <span className="italic font-serif-elegant gold-text">Send it.</span>
            </h2>
            <p className="font-serif-elegant italic text-cream/70 text-xl mt-6 max-w-md">
              Tell us about your project and we'll reply with a quote within 24 hours.
            </p>
            <div className="mt-10 space-y-4 text-cream/80">
              <a href="mailto:hello@creativenode.in" className="flex items-center gap-3 hover:text-gold transition">
                <Mail className="w-4 h-4 text-gold" /> hello@creativenode.in
              </a>
              <a href="https://wa.me/916369278905" className="flex items-center gap-3 hover:text-gold transition">
                <Phone className="w-4 h-4 text-gold" /> +91 6369278905
              </a>
              <a href="https://instagram.com/creativenode.in" className="flex items-center gap-3 hover:text-gold transition">
                <Instagram className="w-4 h-4 text-gold" /> @creativenode.in
              </a>
              <div className="flex items-center gap-3 text-cream/60">
                <MapPin className="w-4 h-4 text-gold" /> Tamil Nadu, India
              </div>
            </div>
          </div>

          <div className="reveal">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gold/15 py-10 px-8 text-center">
        <div className="text-xs font-display tracking-[0.4em] text-cream/40">
          © {new Date().getFullYear()} CREATIVENODE · DESIGN. BUILD. INNOVATE.
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};

export default Landing;
