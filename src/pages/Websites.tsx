import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDown, ArrowUpRight, Download, Loader2, Instagram } from "lucide-react";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

interface Client {
  id: string; name: string; slug: string; tagline: string | null; accent: string | null;
  instagram_url: string | null;
  custom_link_url: string | null;
  custom_link_text: string | null;
}
interface Poster { id: string; client_id: string; title: string | null; image_path: string; sort_order: number; }

const PUBLIC_URL = (path: string) =>
  supabase.storage.from("client-posters").getPublicUrl(path).data.publicUrl;

const Websites = () => {
  const root = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("clients").select("*").order("sort_order");
      const { data: p } = await supabase
        .from("client_posters")
        .select("*")
        .eq("approved", true)
        .order("sort_order");
      setClients(c ?? []);
      setPosters(p ?? []);
      setReady(true);
    })();
  }, []);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // Cover
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.setTextColor(212, 175, 55);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(36);
      pdf.text("CREATIVENODE", pageW / 2, pageH / 2 - 30, { align: "center" });
      pdf.setFontSize(12);
      pdf.setTextColor(230, 220, 200);
      pdf.text("Client Poster Showcase", pageW / 2, pageH / 2, { align: "center" });
      pdf.setFontSize(9);
      pdf.text(new Date().toLocaleDateString(), pageW / 2, pageH / 2 + 20, { align: "center" });

      const loadImg = (url: string) =>
        new Promise<HTMLImageElement>((res, rej) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = url;
        });

      for (const client of clients) {
        const list = posters.filter((p) => p.client_id === client.id);
        if (!list.length) continue;
        // Client divider page
        pdf.addPage();
        pdf.setFillColor(10, 10, 10);
        pdf.rect(0, 0, pageW, pageH, "F");
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(28);
        pdf.text(client.name, 40, pageH / 2);
        if (client.tagline) {
          pdf.setTextColor(200, 195, 180);
          pdf.setFontSize(12);
          pdf.text(client.tagline, 40, pageH / 2 + 22);
        }

        for (const poster of list) {
          try {
            const img = await loadImg(PUBLIC_URL(poster.image_path));
            pdf.addPage();
            pdf.setFillColor(10, 10, 10);
            pdf.rect(0, 0, pageW, pageH, "F");
            const maxW = pageW - 80;
            const maxH = pageH - 100;
            const ratio = Math.min(maxW / img.width, maxH / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            pdf.addImage(img, "JPEG", (pageW - w) / 2, 40, w, h);
            pdf.setTextColor(212, 175, 55);
            pdf.setFontSize(10);
            pdf.text(`${client.name} — ${poster.title ?? ""}`, pageW / 2, pageH - 25, { align: "center" });
          } catch {
            // skip failed image
          }
        }
      }

      // Add Pricing Page
      pdf.addPage();
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageW, pageH, "F");
      
      pdf.setTextColor(212, 175, 55); // Gold
      pdf.setFontSize(12);
      pdf.text("INVESTMENT", 40, 60);
      
      pdf.setFontSize(36);
      pdf.text("Simple, transparent rates.", 40, 100);
      
      pdf.setFillColor(20, 20, 20);
      pdf.rect(40, 140, pageW - 80, 240, "F"); // Card background
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(1);
      pdf.rect(40, 140, pageW - 80, 240, "S"); // Gold border
      
      pdf.setTextColor(230, 220, 200);
      pdf.setFontSize(24);
      pdf.text("Monthly Plan (24 Posters)", 70, 200);
      
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(32);
      pdf.text("₹3,999", 70, 250);
      pdf.setFontSize(14);
      pdf.setTextColor(150, 150, 150);
      pdf.text("/ month", 170, 250);
      
      pdf.setTextColor(230, 220, 200);
      pdf.setFontSize(14);
      pdf.text("• Custom Layout & High Quality Design", 70, 300);
      pdf.text("• Up to 2 Revisions per design", 70, 325);
      pdf.text("• + INCLUDES FREE FESTIVAL POSTER", 70, 350);

      // Add Contact Page
      pdf.addPage();
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageW, pageH, "F");

      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(12);
      pdf.text("LET'S WORK TOGETHER", pageW / 2, 80, { align: "center" });

      pdf.setFontSize(48);
      pdf.text("Start Today.", pageW / 2, 150, { align: "center" });
      
      pdf.setTextColor(200, 195, 180);
      pdf.setFontSize(16);
      pdf.text("Your next great design is one message away.", pageW / 2, 190, { align: "center" });

      pdf.setFillColor(20, 20, 20);
      pdf.setDrawColor(212, 175, 55);
      pdf.rect(pageW / 2 - 200, 250, 400, 150, "FD");

      pdf.setTextColor(230, 220, 200);
      pdf.setFontSize(14);
      pdf.text("Direct WhatsApp Contact:", pageW / 2, 290, { align: "center" });
      
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(24);
      pdf.text("+91 6369278905", pageW / 2, 330, { align: "center" });

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(12);
      pdf.text("hello@creativenode.in  |  @creativenode.in", pageW / 2, 370, { align: "center" });

      pdf.save(`creativenode-showcase-${Date.now()}.pdf`);
      toast.success("Gallery exported");
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline();
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(".hero-title .word", { y: 120, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.08 }, "-=0.4")
        .from(".hero-sub", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .from(".hero-meta > *", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }, "-=0.4");

      // Pinned hero parallax
      gsap.to(".hero-bg-orb", {
        yPercent: 40, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-title", {
        yPercent: -30, opacity: 0.2, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Marquee
      const marquees = gsap.utils.toArray<HTMLElement>(".marquee-row");
      marquees.forEach((el, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.to(el, {
          xPercent: dir * 50, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });

      // Per-client horizontal reels
      const reels = gsap.utils.toArray<HTMLElement>(".reel");
      reels.forEach((reel) => {
        const track = reel.querySelector<HTMLElement>(".reel-track");
        if (!track) return;
        const distance = () => track.scrollWidth - reel.clientWidth + 80;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: reel,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        // Parallax inside cards (uses the horizontal tween as containerAnimation)
        gsap.utils.toArray<HTMLElement>(".reel-card", reel).forEach((card) => {
          const img = card.querySelector<HTMLElement>("img");
          if (img) {
            gsap.fromTo(img,
              { yPercent: 6 },
              {
                yPercent: -6, ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: tween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              }
            );
          }
        });
        gsap.from(reel.querySelectorAll(".reel-card"), {
          opacity: 0, y: 60, duration: 0.8, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: reel, start: "top 80%" },
        });
      });

      // Section titles
      gsap.utils.toArray<HTMLElement>(".section-title").forEach((el) => {
        gsap.from(el, {
          y: 60, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <div ref={root} className="bg-ink text-cream no-scrollbar overflow-x-hidden">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-ink/40 border-b border-gold/10">
        <div className="flex items-center justify-between px-8 py-5 max-w-[1800px] mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.4em] text-gold text-xs">CREATIVENODE</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-display tracking-[0.3em] text-cream/70">
            <Link to="/" className="hover:text-gold transition">HOME</Link>
            <Link to="/portfolio" className="hover:text-gold transition">PORTFOLIO</Link>
            <div className="relative group py-2">
              <span className="cursor-pointer text-gold flex items-center gap-1">WORK <ArrowDown className="w-3 h-3" /></span>
              <div className="absolute top-full left-0 mt-0 w-48 py-2 bg-ink/95 backdrop-blur-xl border border-gold/20 rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col">
                <Link to="/clients" className="px-5 py-3 text-cream/70 hover:bg-gold/10 hover:text-gold transition tracking-[0.2em] font-display text-xs">POSTERS</Link>
                <div className="h-px bg-gold/10" />
                <Link to="/websites" className="px-5 py-3 text-gold tracking-[0.2em] font-display text-xs">WEBSITES</Link>
              </div>
            </div>
            <button
              onClick={exportPDF}
              disabled={exporting || posters.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gold/40 hover:border-gold hover:text-gold rounded disabled:opacity-40 transition"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              EXPORT GALLERY
            </button>
            <Link to="/login" className="hover:text-gold transition">ADMIN</Link>
          </div>
        </div>
      </nav>

      {/* HERO — pinned with parallax */}
      <section className="hero relative h-screen overflow-hidden flex items-center justify-center">
        <div className="hero-bg-orb absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full bg-gold/10 blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="hero-bg-orb absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-gold/5 blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="grain" />

        <div className="relative z-10 text-center px-6 max-w-6xl w-full">
          <div className="hero-eyebrow inline-flex items-center gap-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
            <span className="font-display tracking-[0.6em] text-gold text-sm uppercase">Selected Archives</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
          </div>
          
          <h1 className="hero-title font-display font-black leading-[0.8] text-[clamp(80px,14vw,240px)] tracking-tighter">
            <span className="word inline-block text-transparent bg-clip-text bg-gradient-to-br from-cream to-cream/60">Brands</span>{" "}
            <span className="word inline-block italic font-serif-elegant gold-text relative">
              we
              <div className="absolute -bottom-4 left-0 w-full h-2 bg-gold/30 blur-sm rounded-full" />
            </span>{" "}
            <span className="word inline-block text-transparent bg-clip-text bg-gradient-to-bl from-cream to-cream/60">build.</span>
          </h1>
          
          <p className="hero-sub font-serif-elegant italic text-cream/60 text-2xl md:text-3xl mt-12 max-w-3xl mx-auto leading-relaxed">
            An exclusive gallery of high-conversion websites, landing pages, and digital experiences crafted with precision.
          </p>
          
          <div className="hero-meta flex items-center justify-center gap-12 mt-16 text-xs font-display tracking-[0.4em] text-cream/50">
            <div className="flex flex-col gap-2">
              <span className="text-gold text-2xl font-bold">{clients.length}</span>
              <span>PARTNERS</span>
            </div>
            <div className="w-px h-12 bg-gold/20" />
            <div className="flex flex-col gap-2">
              <span className="text-gold text-2xl font-bold">{posters.length}</span>
              <span>CREATIVES</span>
            </div>
            <div className="w-px h-12 bg-gold/20" />
            <div className="flex flex-col gap-2 opacity-50">
              <ArrowDown className="w-6 h-6 text-gold animate-bounce mx-auto" />
              <span>EXPLORE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-16 overflow-hidden border-y border-gold/10">
        <div className="marquee-row flex gap-16 whitespace-nowrap">
          {[...clients, ...clients].map((c, i) => (
            <span key={i} className="marquee-text text-[clamp(48px,8vw,140px)] text-cream/10 hover:text-gold/40 transition-colors">
              {c.name} <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* Per-client reels */}
      {clients.map((client, idx) => {
        const list = posters.filter((p) => p.client_id === client.id);
        return (
          <section key={client.id} className="reel relative h-screen overflow-hidden" id={`reel-${client.slug}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink-soft/40 to-ink" />
            <div className="grain" />

            {/* Side index */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
              <div className="font-display tracking-[0.5em] text-gold/80 text-xs writing-mode-vertical [writing-mode:vertical-rl] rotate-180">
                CLIENT · {String(idx + 1).padStart(2, "0")}
              </div>
            </div>

            <div className="relative z-10 h-full flex items-center pl-24 pr-12">
              {/* Title block */}
              <div className="section-title shrink-0 w-[440px] pr-12 border-r border-gold/15 flex flex-col justify-center">
                <div className="text-xs font-display tracking-[0.4em] text-gold mb-4">FEATURED WORK</div>
                <h2 className="font-display font-black leading-[0.9] text-[clamp(48px,5.5vw,84px)]" style={{ color: client.accent ?? undefined }}>
                  {client.name}
                </h2>
                <p className="font-serif-elegant italic text-cream/70 text-xl mt-4">{client.tagline}</p>
                <div className="hairline mt-8 w-32" />
                <div className="mt-6 text-xs font-display tracking-[0.3em] text-cream/50 mb-8">
                  {list.length} {list.length === 1 ? "WORK" : "WORKS"}
                </div>

                {/* Social / Custom Links */}
                {(client.instagram_url || (list.length > 2 && client.custom_link_url)) && (
                  <div className="flex flex-col gap-3">
                    {client.instagram_url && (
                      <a href={client.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 border border-gold/30 text-cream/80 text-xs font-display tracking-widest hover:border-gold hover:text-gold rounded transition w-fit">
                        <Instagram className="w-3.5 h-3.5" /> FOLLOW ON INSTAGRAM
                      </a>
                    )}
                    {(list.length > 2 && client.custom_link_url && client.custom_link_text) && (
                      <a href={client.custom_link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-bold text-xs font-display tracking-widest rounded hover:opacity-90 transition w-fit">
                        {client.custom_link_text.toUpperCase()} <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Horizontal reel */}
              <div className="reel-track flex items-center gap-8 pl-12 pr-32 will-change-transform">
                {list.length === 0 ? (
                  <div className="reel-card w-[600px] aspect-video poster-card flex items-center justify-center">
                    <span className="font-serif-elegant italic text-cream/40">Coming soon</span>
                  </div>
                ) : (
                  list.map((p, i) => (
                    <div key={p.id} className="reel-card relative shrink-0 w-[600px] aspect-video rounded-2xl overflow-hidden group border border-gold/10 hover:border-gold/40 transition-colors duration-500 shadow-2xl hover:shadow-[0_20px_50px_-10px_hsl(42_65%_50%_/_0.3)]">
                      <img
                        src={PUBLIC_URL(p.image_path)}
                        alt={p.title ?? client.name}
                        className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-1000 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      
                      <div className="absolute top-5 left-5 z-10 px-4 py-2 bg-ink/40 backdrop-blur-md border border-gold/20 rounded-full">
                        <span className="font-display tracking-[0.3em] text-gold text-[10px] font-bold">{String(i + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 text-xs font-display tracking-[0.4em] text-gold/90">
                          <span className="px-3 py-1 bg-gold/10 border border-gold/30 rounded-full">WEBSITE</span>
                          <span className="opacity-50">·</span>
                          <span className="opacity-80">{client.name.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* End card */}
                <div className="reel-card shrink-0 w-[400px] aspect-[4/5] flex flex-col items-center justify-center border border-dashed border-gold/30 rounded p-6 text-center">
                  <span className="font-serif-elegant italic text-cream/50 mb-3">End of reel</span>
                  <div className="font-display tracking-[0.4em] text-gold text-xs mb-6">{client.name.toUpperCase()}</div>
                  {list.length > 2 && client.custom_link_url && client.custom_link_text && (
                    <a href={client.custom_link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gold/10 border border-gold text-gold font-bold text-[10px] font-display tracking-widest rounded hover:bg-gold hover:text-ink transition">
                      {client.custom_link_text.toUpperCase()} <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Footer CTA */}
      <section className="relative py-32 px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(42_65%_30%/0.2)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-xs font-display tracking-[0.5em] text-gold mb-6">LET'S BUILD</div>
          <h2 className="font-display font-black text-[clamp(48px,7vw,96px)] leading-[0.95]">
            Your brand, <span className="italic font-serif-elegant gold-text">next.</span>
          </h2>
          <p className="font-serif-elegant italic text-cream/70 text-xl mt-6">
            Become the next name on this wall.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://wa.me/916369278905"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.3em] text-sm font-bold rounded hover:opacity-90 transition"
            >
              START YOUR DESIGN <ArrowUpRight className="w-4 h-4" />
            </a>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 border border-gold/40 text-cream font-display tracking-[0.3em] text-sm hover:border-gold hover:text-gold transition">
              VIEW PORTFOLIO
            </Link>
          </div>
        </div>
        <div className="mt-20 text-xs font-display tracking-[0.4em] text-cream/40">
          © CREATIVENODE · @creativenode.in · +91 6369278905
        </div>
      </section>
    </div>
  );
};

export default Websites;
