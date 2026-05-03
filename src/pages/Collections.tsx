import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Layout, Layers, Box, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Poster {
  id: string;
  image_path: string;
  title: string | null;
  client_id: string;
}

const PUBLIC_URL = (path: string) =>
  supabase.storage.from("client-posters").getPublicUrl(path).data.publicUrl;

const Collections = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("client_posters")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(10);
      
      setPosters(data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading && posters.length > 0) {
      const cards = gsap.utils.toArray(".collection-card");
      
      gsap.from(cards, {
        x: 100,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out"
      });

      // Subtle parallax on background text
      gsap.to(".bg-text", {
        xPercent: -10,
        scrollTrigger: {
          trigger: ".bg-text",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }, [loading, posters]);

  return (
    <div className="min-h-screen bg-[#111] text-cream overflow-hidden relative">
      <div className="grain opacity-20 pointer-events-none" />
      
      {/* Background Large Text */}
      <div className="absolute top-20 left-10 opacity-[0.03] select-none pointer-events-none">
        <h1 className="bg-text text-[25vw] font-black leading-none tracking-tighter">
          Collections
        </h1>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/5">
        <div className="flex items-center justify-between px-8 py-4">
          <Link to="/" className="flex items-center gap-2 text-xs font-display tracking-[0.3em] text-cream/70 hover:text-gold transition">
            <ArrowLeft className="w-4 h-4" /> BACK TO HOME
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.4em] text-gold text-[10px]">CREATIVENODE · LABS</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 px-8 pb-20">
        <div className="max-w-[1800px] mx-auto">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] font-display tracking-widest text-gold mb-6 animate-pulse">
              <Sparkles className="w-3 h-3" /> EXPERIMENTAL VIEW
            </div>
            <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.9] mb-4">
              Curated <br /> <span className="gold-text italic font-serif-elegant">Poster Stacks.</span>
            </h2>
            <p className="font-serif-elegant italic text-xl text-cream/50 max-w-xl">
              An interactive exploration of our latest design works. Use your scroll wheel to navigate the stacks.
            </p>
          </header>

          {/* Horizontal Scroll Stacks */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto no-scrollbar py-20 px-4 -mx-4 cursor-grab active:cursor-grabbing"
          >
            {/* Feature Card */}
            <div className="collection-card flex-shrink-0 w-[400px] aspect-[4/5] relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl border border-white/10 group-hover:border-gold/30 transition-all duration-500 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="p-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-4xl font-display font-black leading-none mb-6">
                      Fresh From <br /> the Almanac
                    </h3>
                    <p className="font-serif-elegant italic text-cream/40 text-lg">
                      Properties, selectors, <br /> rules, and functions!
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-display tracking-[0.3em] text-gold">
                    EXPLORE COLLECTION <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Poster Stacks */}
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[400px] aspect-[4/5] rounded-3xl bg-white/5 animate-pulse shrink-0" />
               ))
            ) : (
              posters.map((poster, idx) => (
                <div 
                  key={poster.id}
                  className="collection-card flex-shrink-0 w-[400px] aspect-[4/5] relative group"
                  style={{ zIndex: posters.length - idx }}
                >
                  {/* Card Stack Effect (Lighter Layers behind) */}
                  <div className="absolute inset-0 -translate-x-4 translate-y-4 bg-white/5 rounded-3xl border border-white/5 blur-[2px] transition-transform duration-500 group-hover:-translate-x-8 group-hover:translate-y-8" />
                  <div className="absolute inset-0 -translate-x-2 translate-y-2 bg-white/10 rounded-3xl border border-white/5 blur-[1px] transition-transform duration-500 group-hover:-translate-x-4 group-hover:translate-y-4" />
                  
                  {/* Main Card */}
                  <div className="absolute inset-0 bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-gold/40 group-hover:-translate-y-4 group-hover:scale-[1.02]">
                    <img 
                      src={PUBLIC_URL(poster.image_path)}
                      alt={poster.title || "Poster"}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-[9px] font-display tracking-[0.4em] text-gold mb-2">COLLECTION ITEM {idx + 1}</div>
                      <h4 className="text-2xl font-display font-bold leading-tight">{poster.title || "Untitled Masterpiece"}</h4>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Empty State */}
            {!loading && posters.length === 0 && (
              <div className="flex-shrink-0 w-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl p-20">
                <Layers className="w-12 h-12 text-white/10 mb-4" />
                <p className="font-serif-elegant italic text-cream/40 text-center">No posters found to display in the stack.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Interaction Hint */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] font-display tracking-[0.4em] text-cream/30">
        <div className="w-20 h-px bg-white/10" />
        SCROLL HORIZONTALLY TO EXPLORE
        <div className="w-20 h-px bg-white/10" />
      </div>
    </div>
  );
};

export default Collections;
