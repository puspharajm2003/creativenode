import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Layout, Layers, Box, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Client {
  id: string;
  name: string;
}

interface Poster {
  id: string;
  image_path: string;
  title: string | null;
  client_id: string;
}

interface ClientWithPosters extends Client {
  posters: Poster[];
}

const PUBLIC_URL = (path: string) => {
  if (path.startsWith("fallback/")) {
    const id = path.split("/")[1];
    return `https://images.unsplash.com/photo-${id === '1' ? '1618005182384-a83a8bd57fbe' : id === '2' ? '1634017839464-5c339ebe3cb4' : id === '3' ? '1633167606207-d840b5070fc2' : id === '4' ? '1614850523296-e8c041db2396' : '1605721911519-3dfeb3be25e7'}?q=80&w=800&auto=format&fit=crop`;
  }
  return supabase.storage.from("client-posters").getPublicUrl(path).data.publicUrl;
};

const Collections = () => {
  const [collections, setCollections] = useState<ClientWithPosters[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: clientsData } = await supabase.from("clients").select("*").order("sort_order");
        const { data: postersData } = await supabase.from("client_posters").select("*").eq("approved", true).order("created_at", { ascending: false });

        if (clientsData && postersData && clientsData.length > 0) {
          const grouped = clientsData.map(client => ({
            ...client,
            posters: postersData.filter(p => p.client_id === client.id)
          })).filter(c => c.posters.length > 0);
          
          if (grouped.length > 0) {
            setCollections(grouped);
          } else {
            setCollections(FALLBACK_COLLECTIONS);
          }
        } else {
          setCollections(FALLBACK_COLLECTIONS);
        }
      } catch (err) {
        setCollections(FALLBACK_COLLECTIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

const FALLBACK_COLLECTIONS = [
  {
    id: "fallback-1",
    name: "Luxury Essentials",
    posters: [
      { id: "p1", image_path: "fallback/1", title: "Minimalist Geometry", client_id: "fallback-1" },
      { id: "p2", image_path: "fallback/2", title: "Golden Abstract", client_id: "fallback-1" },
      { id: "p3", image_path: "fallback/3", title: "Dark Elegance", client_id: "fallback-1" },
    ]
  },
  {
    id: "fallback-2",
    name: "Digital Frontiers",
    posters: [
      { id: "p4", image_path: "fallback/4", title: "Cyberpunk Grid", client_id: "fallback-1" },
      { id: "p5", image_path: "fallback/5", title: "Neon Flow", client_id: "fallback-1" },
    ]
  }
];

  useEffect(() => {
    if (!loading && collections.length > 0) {
      gsap.from(".collection-row", {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".collections-wrapper",
          start: "top 80%",
        }
      });
    }
  }, [loading, collections]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-cream overflow-x-hidden relative">
      <div className="grain opacity-20 pointer-events-none" />
      
      {/* Background Large Text */}
      <div className="fixed top-20 left-10 opacity-[0.02] select-none pointer-events-none z-0">
        <h1 className="bg-text text-[25vw] font-black leading-none tracking-tighter">
          Collections
        </h1>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5">
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

      <main className="relative z-10 pt-40 px-8 pb-32">
        <div className="max-w-[1800px] mx-auto">
          <header className="mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] font-display tracking-widest text-gold mb-6 animate-pulse">
              <Sparkles className="w-3 h-3" /> EXPERIMENTAL VIEW
            </div>
            <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.9] mb-4">
              Curated <br /> <span className="gold-text italic font-serif-elegant">Poster Stacks.</span>
            </h2>
            <p className="font-serif-elegant italic text-xl text-cream/50 max-w-xl">
              Discover designs grouped by brand identity. Use horizontal scroll to explore each collection.
            </p>
          </header>

          <div className="collections-wrapper space-y-32">
            {loading ? (
              <div className="space-y-20">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-8 overflow-hidden">
                    <div className="w-[400px] aspect-[4/5] rounded-3xl bg-white/5 animate-pulse shrink-0" />
                    <div className="w-[400px] aspect-[4/5] rounded-3xl bg-white/5 animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              collections.map((client) => (
                <section key={client.id} className="collection-row">
                  <div className="flex gap-8 overflow-x-auto no-scrollbar py-10 px-4 -mx-4">
                    {/* Brand Identity Card */}
                    <div className="flex-shrink-0 w-[400px] aspect-[4/5] relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl border border-white/10 group-hover:border-gold/30 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col justify-between p-10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div>
                          <div className="text-[10px] font-display tracking-[0.5em] text-gold mb-6 uppercase">BRAND COLLECTION</div>
                          <h3 className="text-4xl md:text-5xl font-display font-black leading-tight mb-4">
                            {client.name}
                          </h3>
                          <div className="w-12 h-1 bg-gold/30 group-hover:w-20 transition-all duration-500" />
                        </div>
                        <div>
                          <p className="font-serif-elegant italic text-cream/40 text-lg mb-8">
                            Selected visual works and poster designs crafted for {client.name}.
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-display tracking-[0.3em] text-gold">
                            EXPLORE {client.posters.length} ITEMS <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Posters in this Collection */}
                    {client.posters.map((poster, idx) => (
                      <div 
                        key={poster.id}
                        className="flex-shrink-0 w-[400px] aspect-[4/5] relative group"
                        style={{ zIndex: client.posters.length - idx }}
                      >
                        {/* Stack Shadows */}
                        <div className="absolute inset-0 -translate-x-4 translate-y-4 bg-black/40 rounded-3xl border border-white/5 blur-[4px] transition-all duration-500 group-hover:opacity-0" />
                        
                        {/* Main Poster Card */}
                        <div className="absolute inset-0 bg-[#111] rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-gold/50 group-hover:-translate-y-8 group-hover:scale-[1.05] group-hover:z-50">
                          <img 
                            src={PUBLIC_URL(poster.image_path)}
                            alt={poster.title || "Poster"}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="text-[9px] font-display tracking-[0.4em] text-gold mb-2">ITEM {idx + 1}</div>
                            <h4 className="text-2xl font-display font-bold leading-tight text-white shadow-sm">{poster.title || "Untitled Masterpiece"}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer Hint */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] font-display tracking-[0.4em] text-cream/20 pointer-events-none">
        <div className="w-20 h-px bg-white/10" />
        HORIZONTAL SCROLL TO DISCOVER
        <div className="w-20 h-px bg-white/10" />
      </div>
    </div>
  );
};

export default Collections;
