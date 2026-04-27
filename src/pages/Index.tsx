import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import { ScaledSlide } from "@/components/slides/ScaledSlide";
import { Slide01Cover } from "@/components/slides/Slide01Cover";
import { Slide02About } from "@/components/slides/Slide02About";
import { Slide03Services } from "@/components/slides/Slide03Services";
import { Slide04Styles } from "@/components/slides/Slide04Styles";
import { Slide05Fitness } from "@/components/slides/Slide05Fitness";
import { Slide06Fashion } from "@/components/slides/Slide06Fashion";
import { Slide07Premium } from "@/components/slides/Slide07Premium";
import { Slide08Pricing } from "@/components/slides/Slide08Pricing";
import { Slide09WhyUs } from "@/components/slides/Slide09WhyUs";
import { Slide10Contact } from "@/components/slides/Slide10Contact";
import { ChevronLeft, ChevronRight, Maximize2, LayoutGrid, X, ChevronDown, Download } from "lucide-react";
import gsap from "gsap";

const SLIDES = [
  { id: 1, title: "Cover", Component: Slide01Cover },
  { id: 2, title: "About Us", Component: Slide02About },
  { id: 3, title: "Services", Component: Slide03Services },
  { id: 4, title: "Design Styles", Component: Slide04Styles },
  { id: 5, title: "Fitness Works", Component: Slide05Fitness },
  { id: 6, title: "Fashion Works", Component: Slide06Fashion },
  { id: 7, title: "Premium Works", Component: Slide07Premium },
  { id: 8, title: "Pricing", Component: Slide08Pricing },
  { id: 9, title: "Why Choose Us", Component: Slide09WhyUs },
  { id: 10, title: "Contact", Component: Slide10Contact },
];

const Index = () => {
  const [active, setActive] = useState(0);
  const [gridOpen, setGridOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const ActiveSlide = useMemo(() => SLIDES[active].Component, [active]);

  const next = () => setActive((i) => Math.min(i + 1, SLIDES.length - 1));
  const prev = () => setActive((i) => Math.max(i - 1, 0));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "g" || e.key === "G") setGridOpen((o) => !o);
      else if (e.key === "Escape") setGridOpen(false);
      else if (e.key === "f" || e.key === "F") enterFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (gridOpen || isFullscreen) return; // Pause auto-slide when grid is open or in fullscreen
    const interval = setInterval(() => {
      setActive((current) => (current === SLIDES.length - 1 ? 0 : current + 1));
    }, 4500); // 4.5 seconds
    
    return () => clearInterval(interval);
  }, [gridOpen, isFullscreen]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // GSAP Slide Transition & Sidebar Auto-Scroll
  useLayoutEffect(() => {
    // Animate the main slide canvas
    if (slideContainerRef.current) {
      gsap.fromTo(
        ".slide-content-wrapper",
        { opacity: 0, scale: 0.98, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
    
    // Auto-scroll the sidebar to position the active slide at the top
    if (sidebarRef.current) {
      const activeThumb = document.getElementById(`thumb-${active}`);
      if (activeThumb) {
        // We subtract a little padding so it doesn't hug the very top edge
        const offset = activeThumb.offsetTop - 20;
        gsap.to(sidebarRef.current, {
          scrollTop: offset,
          duration: 0.8,
          ease: "power3.out"
        });
      }
    }
  }, [active]);

  // GSAP Grid Animation
  useLayoutEffect(() => {
    if (gridOpen) {
      gsap.fromTo(
        ".grid-item",
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)" }
      );
    }
  }, [gridOpen]);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="h-screen w-full bg-ink text-cream flex flex-col relative overflow-hidden">
      {/* Print Styles for PDF Export */}
      <style>{`
        @media print {
          @page { size: 1920px 1080px; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #000; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-gold/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      
      {/* Toolbar */}
      <header className="h-16 border-b border-gold/15 bg-ink/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-40 relative">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="CreativeNode Logo" className="w-8 h-8 rounded-full border border-gold/30 object-cover" />
          <span className="font-display tracking-[0.4em] text-gold text-sm font-bold">CREATIVENODE</span>
          <span className="text-cream/30 text-sm font-serif-elegant italic ml-2 border-l border-gold/20 pl-4 hidden sm:block">Portfolio Deck</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex relative group py-2">
            <span className="cursor-pointer hover:text-gold transition text-xs font-display tracking-widest text-cream/70 flex items-center gap-1">WORK <ChevronDown className="w-3 h-3" /></span>
            <div className="absolute top-full left-0 mt-0 w-48 py-2 bg-ink/95 backdrop-blur-xl border border-gold/20 rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col">
              <a href="/clients" className="px-5 py-3 hover:bg-gold/10 hover:text-gold transition tracking-[0.2em] font-display text-xs text-cream/70">POSTERS</a>
              <div className="h-px bg-gold/10" />
              <a href="/websites" className="px-5 py-3 hover:bg-gold/10 hover:text-gold transition tracking-[0.2em] font-display text-xs text-cream/70">WEBSITES</a>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-display tracking-widest text-cream/70 hover:text-gold transition-colors border border-transparent hover:border-gold/30 rounded no-print"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => setGridOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-display tracking-widest text-cream/70 hover:text-gold transition-colors border border-transparent hover:border-gold/30 rounded no-print"
          >
            <LayoutGrid className="w-4 h-4" /> GRID
          </button>
          <button
            onClick={enterFullscreen}
            className="flex items-center gap-2 px-5 py-2 text-xs font-display tracking-widest bg-gold/10 text-gold hover:bg-gold hover:text-ink border border-gold/40 transition-colors rounded shadow-[0_0_15px_hsl(var(--gold)/0.2)] hover:shadow-[0_0_25px_hsl(var(--gold)/0.4)] no-print"
          >
            <Maximize2 className="w-4 h-4" /> PRESENT
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative z-10 no-print">
        {/* Sidebar */}
        <aside ref={sidebarRef} className="w-72 border-r border-gold/10 bg-ink-soft/40 backdrop-blur-md overflow-y-auto shrink-0 gold-scroll z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] scroll-smooth">
          <div className="p-5 space-y-4">
            <div className="text-[10px] font-display tracking-[0.4em] text-gold/60 mb-2 pl-2">SLIDES ({SLIDES.length})</div>
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                id={`thumb-${i}`}
                onClick={() => setActive(i)}
                className={`group w-full text-left rounded-xl overflow-hidden border transition-all duration-300 ${
                  active === i
                    ? "border-gold shadow-[0_0_20px_hsl(var(--gold)/0.2)] bg-gold/5"
                    : "border-gold/10 hover:border-gold/40 hover:bg-gold/5"
                }`}
              >
                <div className="aspect-video bg-ink relative overflow-hidden">
                  <div className={`absolute inset-0 transition-opacity duration-300 ${active === i ? "opacity-0" : "opacity-40 group-hover:opacity-0 bg-ink"}`} />
                  <div className="absolute inset-0 scale-[0.115] origin-top-left pointer-events-none">
                    <div style={{ width: 1920, height: 1080 }}>
                      <s.Component />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between border-t border-gold/10">
                  <span className={`text-[10px] font-display tracking-widest transition-colors ${active === i ? "text-gold" : "text-cream/50"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-sm font-serif-elegant italic truncate ml-3 transition-colors ${active === i ? "text-cream" : "text-cream/60"}`}>
                    {s.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main canvas */}
        <main className="flex-1 relative bg-ink/40 p-4 sm:p-8 min-h-0 flex items-center justify-center">
          <div className="w-full h-full relative border border-gold/10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center" ref={slideContainerRef}>
            <div className="slide-content-wrapper w-full h-full">
              <ScaledSlide>
                <div className="slide-content">
                  <ActiveSlide />
                </div>
              </ScaledSlide>
            </div>
          </div>

          {/* Nav pills */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-3 py-2 bg-ink/80 backdrop-blur-xl border border-gold/30 rounded-full shadow-[0_10px_40px_hsl(var(--gold)/0.15)] z-30">
            <button
              onClick={prev}
              disabled={active === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
              <span className="font-display tracking-[0.3em] text-cream text-sm px-2">
                <span className="text-gold font-bold">{String(active + 1).padStart(2, "0")}</span> 
                <span className="opacity-40 mx-2">/</span> 
                <span className="opacity-70">{String(SLIDES.length).padStart(2, "0")}</span>
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            </div>
            <button
              onClick={next}
              disabled={active === SLIDES.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>

      {/* Hidden print container for PDF export */}
      <div className="hidden print-only fixed top-0 left-0 w-[1920px] bg-ink z-[9999]">
        {SLIDES.map(s => (
          <div key={s.id} className="w-[1920px] h-[1080px] relative overflow-hidden bg-ink" style={{ breakAfter: 'page', pageBreakAfter: 'always' }}>
            <s.Component />
          </div>
        ))}
      </div>

      {/* Grid overlay */}
      {gridOpen && (
        <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-2xl overflow-y-auto p-10 gold-scroll">
          <div className="flex items-center justify-between mb-12 max-w-7xl mx-auto border-b border-gold/10 pb-6">
            <div>
              <span className="font-display tracking-[0.5em] text-gold text-xs">PORTFOLIO OVERVIEW</span>
              <h2 className="font-display font-black text-cream text-5xl mt-2 tracking-tight">All Slides</h2>
            </div>
            <button
              onClick={() => setGridOpen(false)}
              className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition-all shadow-[0_0_20px_hsl(var(--gold)/0.2)] hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto pb-20">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setActive(i);
                  setGridOpen(false);
                }}
                className={`grid-item group rounded-2xl overflow-hidden border transition-all duration-500 shadow-xl ${
                  active === i ? "border-gold shadow-[0_0_30px_hsl(var(--gold)/0.3)] scale-105" : "border-gold/20 hover:border-gold/60 hover:-translate-y-2"
                }`}
              >
                <div className="aspect-video bg-ink relative overflow-hidden">
                  <div className={`absolute inset-0 transition-opacity duration-500 ${active === i ? "opacity-0" : "opacity-20 group-hover:opacity-0 bg-ink"}`} />
                  <div className="absolute inset-0 scale-[0.22] origin-top-left pointer-events-none">
                    <div style={{ width: 1920, height: 1080 }}>
                      <s.Component />
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between bg-ink-soft/90 border-t border-gold/10 backdrop-blur-md">
                  <span className="font-display font-bold tracking-widest text-gold text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif-elegant italic text-cream/90 text-lg group-hover:text-gold transition-colors">{s.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <ScaledSlide>
              <div className="slide-content">
                <ActiveSlide />
              </div>
            </ScaledSlide>
          </div>
          
          {/* Subtle controls when moving mouse in fullscreen (optional, implemented simple version) */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
            <div className="flex items-center gap-4">
              <button onClick={prev} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-black text-white backdrop-blur-md transition-colors"><ChevronLeft /></button>
              <button onClick={() => document.exitFullscreen()} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-black text-white backdrop-blur-md transition-colors"><X className="w-5 h-5" /></button>
              <button onClick={next} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-black text-white backdrop-blur-md transition-colors"><ChevronRight /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
