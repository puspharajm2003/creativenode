import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, Sparkles, User, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ArticleDetail {
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  content: JSX.Element;
}

const ARTICLE_DETAILS: Record<string, ArticleDetail> = {
  "psychology-of-scroll-stopping-poster-design": {
    title: "The Psychology of Scroll-Stopping Poster Design: How Visual Hierarchy Influences Action",
    category: "Design",
    readTime: "5 min read",
    date: "May 18, 2026",
    author: "Vimal Raj",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
    content: (
      <>
        <p className="lead font-serif-elegant italic text-xl md:text-2xl text-gold-bright mb-8 leading-relaxed">
          In an era characterized by infinite scroll grids and sub-second human attention spans, visual design has shifted from a tool of aesthetic ornamentation to a rigorous science of cognitive capture.
        </p>

        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          To design a poster that stops a user mid-scroll requires a deep alignment with human neurobiology and visual ergonomics. Visual hierarchy is the active blueprint of this discipline. It is the practice of organizing graphical and textual elements in an exact sequence of cognitive processing, guiding the human eye from the initial emotional hook to the final high-intent call to action (CTA). Without a rigorous hierarchy, even the most beautiful artwork degrades into visual noise, causing the viewer's brain to quickly disengage and scroll away.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          1. The 250-Millisecond Threshold &amp; Focal Anchors
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          The human brain is optimized to parse complex visual fields in under a quarter of a second. Within this split-second threshold, the eye does not read; it scans for a singular **Focal Anchor**. A focal anchor is the dominant visual weight on your layout—typically a high-contrast image, a heavy graphical mark, or an oversized typographic glyph. 
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          In premium poster design, this anchor must occupy the highest tier of the hierarchy. If your layout features multiple elements competing for equal attention (for instance, a large logo, an oversized headline, and a vibrant background simultaneously), the brain registers cognitive overload. The result? Immediate disinterest. A singular, distinct focal anchor creates a smooth entry point for the eyes, initiating the reading journey.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          2. The F-Pattern and Gutenberg Diagram Pathways
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Once the focal anchor has hooked the viewer, the designer must guide their gaze along a highly intentional path. Eye-tracking research shows that users scanning digital displays follow predictable movement vectors. The most prominent are the **F-Pattern** (prevalent in text-heavy screens, scanning horizontally across the top, down slightly, horizontally again, and down) and the **Gutenberg Diagram** (dividing the canvas into four quadrants: primary optical area, strong fall-off, weak fall-off, and terminal terminal area).
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          By aligning layout structures with these natural visual pathways, we ensure that critical details are read in order. The header element belongs in the upper-left or top-center (the initial entry zone), the secondary body text flows through the center-scan area, and the crucial transaction hook is anchored at the bottom-right terminal quadrant. Designing against this flow forces cognitive strain, drastically lowering retention.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          3. Typography as an Emotional Voice
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Typography is not merely the vehicle for textual copy—it is the visual tone of your brand's voice. Selecting a typeface is an exercise in subconscious communication. A serif elegant typeface like *Cormorant Garamond* carries historical gravitas, high-end sophistication, and luxury editorial weight. Conversely, a clean sans-serif like *Inter* signals modern efficiency, technological precision, and accessibility.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Scroll-stopping posters create authority by pairing these typographic styles in strict contrast. Oversized, heavy headers are paired with light, widely tracked sans-serif sub-headers. This scale contrast (e.g., matching a 72px serif title with a 12px widely-spaced tracking subtitle) generates visual interest, dividing information into digestible semantic layers that allow the reader's brain to quickly parse and absorb the message.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          4. The Science of Chromatic Contrast: Ink &amp; Luxury Gold
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Color is a primary driver of emotional arousal. In premium visual design, generic, high-saturation colors (like plain primary red or basic blue) often look unsophisticated. Modern luxury branding heavily utilizes curated, HSL-balanced palettes that create a distinct psychological atmosphere.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Consider the harmony of deep ink black (`#0a0a0a`) paired with refined, metallic gold accents (`#d4af37`). The ink background establishes depth, authority, and infinite space, while the gold highlights act as visual scalpels—cutting through the darkness to guide the eye directly to focal anchors, critical stats, and key CTAs. The sheer contrast ratio ensures clean legibility, while the gold tones trigger subconscious associations with premium craftsmanship, luxury value, and meticulous execution.
        </p>
      </>
    )
  },
  "building-premium-brand-identity-2026": {
    title: "Building a Premium Brand Identity in 2026: Why Minimalism is Still King",
    category: "Branding",
    readTime: "6 min read",
    date: "May 22, 2026",
    author: "Vimal Raj",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    content: (
      <>
        <p className="lead font-serif-elegant italic text-xl md:text-2xl text-gold-bright mb-8 leading-relaxed">
          In an over-stimulated digital landscape saturated by flashing graphics, bold emojis, and cluttered grids, the ultimate statement of luxury is quiet authority.
        </p>

        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          A premium brand identity in 2026 is defined not by how much design we can cram onto a canvas, but by how much non-essential elements we can strip away. Minimalism remains the uncontested king of visual luxury. By shedding visual clutter, a brand shifts its message from desperate attention-seeking to confident authority. This design methodology communicates that the brand's product or service is so refined it requires no loud banners—the craft speaks entirely for itself.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          1. Negative Space: The Ultimate Brand Luxury
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          In premium design, negative space (often called whitespace) is not "empty" or "wasted" space. It is a highly active layout element. Whitespace provides cognitive breathing room, instantly elevating whatever asset is placed within it. 
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          When we surround a single typography glyph, a fine line, or a logo with generous negative space, we elevate its visual weight. It signals that this specific asset is extremely valuable and deserves exclusive, undivided focus. Premium brands like Apple, Rolex, and Leica do not pack their screens; they frame their product designs in sprawling landscapes of clean, uncompromised space. Whitespace acts as a luxury frame, elevating visual content from simple catalog graphics to premium gallery artwork.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          2. The Rigid Typographic Scale
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Visual consistency is the absolute foundation of brand trust. Cluttered identities often suffer from font proliferation, utilizing too many sizes, weights, and type families across their platforms. A premium brand system enforces a highly disciplined, mathematical **Typographic Scale**.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          A typographer's grid typically restricts itself to a single serif family (e.g., Cormorant Garamond for titles and editorial headers) and a single, highly legible geometric sans-serif family (e.g., Inter for UI controls and long-form paragraphs). By limiting the scale to just four or five precise font configurations (such as: Hero Display, Section Header, Card Title, Body Text, and Label), we establish immediate visual harmony across websites, print materials, packaging, and mobile grids.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          3. Curating the Harmonized Palette
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Color registers in the human mind faster than shape or text. Selecting a brand color palette is the single most critical emotional touchpoint of brand identity. Premium branding rejects standard, high-saturation colors (which often look cheap) and instead relies on HSL-balanced, sophisticated tones.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Instead of generic black and yellow, a luxury brand will combine deep ink black, matte charcoal, warm vanilla, and hand-finished brushed gold tones. These colors don't scream for attention; they create an atmosphere of quiet prestige, sophistication, and meticulous care. When these colors are balanced consistently—using the classic 60-30-10 ratio (60% background ink, 30% soft body text/secondary structures, and 10% premium gold accents)—the resulting interface feels unified and premium.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          4. Complete Asset Scalability
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          A brand identity does not exist in a vacuum; it must perform seamlessly across infinite physical and digital screens. An identity that is too complex will degrade at small scales, turning into a blurred smudge on a mobile tab or a favicon.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Minimalist logo design ensures perfect **Scalability**. By reducing visual marks to core geometry, the asset maintains extreme clarity whether displayed on a massive billboard or as a tiny 16x16 pixel icon in a browser's navigation bar. This scalability guarantees a consistent, uncompromised brand signature on every channel, reinforcing credibility and visual authority at every touchpoint.
        </p>
      </>
    )
  },
  "high-performance-modern-web-development": {
    title: "High-Performance Modern Web Development: Blending Luxury Aesthetics with Lightning Speed",
    category: "Engineering",
    readTime: "7 min read",
    date: "May 25, 2026",
    author: "Vimal Raj",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    content: (
      <>
        <p className="lead font-serif-elegant italic text-xl md:text-2xl text-gold-bright mb-8 leading-relaxed">
          The central paradox of modern luxury web design is simple: how do we deliver highly engaging, animation-rich visual experiences without violating critical search engine speed benchmarks?
        </p>

        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          A luxury web experience demands high-fidelity assets, immersive scroll triggers, custom typography scales, and fluid animations. Yet, search engines and users demand instant loading times. If your gorgeous, GSAP-driven site takes five seconds to compile and render, search index crawlers will rank it low, and half your high-value visitors will bounce before seeing the first slide. Modern front-end engineering is the key to solving this, allowing us to build premium interfaces that load under a second.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          1. GSAP ScrollTrigger and Frame-Rate Optimization
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          GSAP (GreenSock Animation Platform) is the industry standard for high-end web motion design. However, poorly optimized animation loops can cause "jank"—dropped frames that make premium sites look stuttered and unpolished.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          To maintain a smooth 60fps (or 120fps on modern displays), developers must avoid layout thrashing. Animations should target hardware-accelerated CSS properties only: `transform` (translating `x` and `y`, rotating, and scaling) and `opacity`. Animating properties like `width`, `height`, `top`, or `margin` forces the browser's rendering engine to recalculate the entire page layout on every frame, drastically reducing CPU performance. By restricting animation scopes and using `will-change: transform`, we ensure movements feel like pure silk.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          2. Achieving Perfect Core Web Vitals
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Google's Core Web Vitals evaluate real-world user experience based on three metrics: Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS). Luxury sites are highly prone to failing these metrics due to heavy media assets.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          We master these metrics by employing a rigorous optimization workflow:
        </p>
        <ul className="list-disc pl-6 mb-6 text-cream/80 space-y-2 text-base">
          <li><strong>Image Compression:</strong> Converting all assets to WebP or AVIF formats, serving responsive resolutions based on client viewports, and adding explicit width/height tags to prevent layout shifts.</li>
          <li><strong>Asset Lazy-Loading:</strong> Deferring non-hero graphics using the native `loading="lazy"` attribute, ensuring they only compile as the user approaches.</li>
          <li><strong>Asynchronous Script Deferral:</strong> Deferring external integrations—including AdSense loaders and analytics trackers—until after the primary UI thread compiles, achieving a near-instant LCP.</li>
        </ul>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          3. Technical SEO and Semantic Page Architecture
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          A premium digital experience is worthless if search engine crawlers cannot index its contents. High-quality code is search-friendly code. The base architecture must employ semantic HTML5 tags—such as &lt;header&gt;, &lt;main&gt;, &lt;article&gt;, &lt;section&gt;, and &lt;footer&gt;—to construct a clean content outline for search index algorithms.
        </p>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Furthermore, semantic guidelines dictate that each page must contain a single, highly descriptive &lt;h1&gt; title element that matches the URL meta details. Headings must follow a rigid hierarchy (&lt;h2&gt; down to &lt;h6&gt;) to provide a clear content map. Enforcing these technical structures ensures crawlers easily read the site's authority, boosting rankings and bringing high-intent organic visitors to our premium blog.
        </p>

        <h3 className="font-display font-bold text-2xl text-gold mt-10 mb-4 tracking-wide">
          4. The Developer-Designer Bridge
        </h3>
        <p className="mb-6 text-cream/80 leading-relaxed text-base md:text-lg">
          Finally, the ultimate driver of high-performance luxury design is a unified development pipeline. Using modern frameworks like React and Vite combined with clean Tailwind CSS variables ensures design fidelity is translated into code without bloat. By designing reusable component structures and keeping the codebase dry, the final bundle is incredibly lightweight, loading instantly on any device worldwide.
        </p>
      </>
    )
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Scroll Progress handler
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize AdSense dynamically inside all slots when the page mounts or slug changes
  useEffect(() => {
    try {
      const ads = document.querySelectorAll(".adsbygoogle");
      ads.forEach(() => {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      });
    } catch (e) {
      console.warn("Dynamic AdSense push deferred:", e);
    }
  }, [slug]);

  const article = slug ? ARTICLE_DETAILS[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-ink text-cream flex flex-col items-center justify-center p-6 pt-24">
        <div className="text-center max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 text-gold text-2xl font-display font-black">
            !
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Article Not Found</h1>
          <p className="font-serif-elegant italic text-cream/60 text-lg leading-relaxed">
            The editorial article you are looking for has either been moved or is archived.
          </p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 border border-gold/40 text-cream hover:text-gold hover:border-gold font-display tracking-widest text-xs rounded transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETURN TO BLOG
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-cream relative overflow-hidden flex flex-col pt-24 pb-32">
      {/* Dynamic Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-gold-deep via-gold to-gold-bright z-[100] transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Background ambient gold glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(42_65%_15%/0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="grain" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-ink/50 border-b border-gold/10">
        <div className="flex items-center justify-between px-8 py-5 max-w-[1800px] mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <span className="font-display tracking-[0.4em] text-gold text-xs">CREATIVENODE</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-display tracking-[0.3em] text-cream/70">
            <Link to="/" className="hover:text-gold transition">HOME</Link>
            <Link to="/clients" className="hover:text-gold transition">WORK</Link>
            <Link to="/websites" className="hover:text-gold transition">WEBSITES</Link>
            <Link to="/plan" className="hover:text-gold transition">PLAN</Link>
            <Link to="/blog" className="text-gold tracking-[0.3em]">BLOG</Link>
          </div>
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="max-w-[1440px] mx-auto relative z-10 px-6 md:px-12 w-full flex-1 lg:grid lg:grid-cols-[160px_1fr_160px] lg:gap-8 items-start">
        
        {/* Left Skyscraper Sidebar */}
        <aside className="hidden lg:block sticky top-28 self-start w-[160px] h-[600px] border border-gold/15 bg-ink-soft/40 backdrop-blur-sm rounded-2xl overflow-hidden p-2 flex items-center justify-center">
          <div className="text-[10px] font-display text-gold/30 tracking-widest absolute top-2 uppercase">Advertisement</div>
          <ins className="adsbygoogle"
               style={{ display: "inline-block", width: "160px", height: "600px" }}
               data-ad-client="ca-pub-3940256099942544"
               data-ad-slot="1122334455"
               data-ad-format="vertical"
               data-full-width-responsive="false"></ins>
        </aside>

        {/* Center Main Content */}
        <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto">
          {/* Navigation back and share tools */}
          <div className="flex items-center justify-between mb-12">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-xs font-display tracking-[0.2em] text-cream/50 hover:text-gold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              BACK TO ARTICLES
            </Link>

            <button 
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gold/10 hover:border-gold/30 hover:text-gold rounded-lg text-xs font-display tracking-wider text-cream/50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "COPIED" : "SHARE"}
            </button>
          </div>

          {/* Article Outline */}
          <article className="w-full flex-1">
            {/* Header metadata */}
            <header className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/5 border border-gold/20 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="font-display text-[9px] text-gold tracking-widest uppercase font-bold">{article.category}</span>
              </div>
              
              <h1 className="font-display font-black text-[clamp(32px,5.5vw,60px)] leading-[1.05] tracking-tight mb-8">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-xs font-display tracking-widest text-cream/50 border-y border-gold/10 py-5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gold/60" />
                  BY <span className="text-cream font-bold">{article.author.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block text-gold/20">|</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold/60" />
                  {article.date}
                </div>
                <div className="hidden sm:block text-gold/20">|</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold/60" />
                  {article.readTime}
                </div>
              </div>
            </header>

            {/* Hero Artwork */}
            <div className="aspect-[16/9] w-full rounded-2xl border border-gold/15 overflow-hidden mb-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Body Content */}
            <section className="prose prose-invert max-w-none font-serif-elegant text-cream/80 text-lg md:text-xl space-y-6 leading-relaxed selection:bg-gold/20 select-text animate-in fade-in duration-1000">
              {article.content}
            </section>

            {/* Semantic, Policy-Compliant Ad Unit in Content Body */}
            <div className="my-16 p-8 border border-gold/10 bg-ink-soft/40 backdrop-blur-sm rounded-2xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(42_65%_40%/0.04)_0%,transparent_70%)] pointer-events-none" />
              <div className="text-[9px] font-display tracking-[0.4em] text-gold/30 mb-4 uppercase">Advertisement</div>
              
              {/* The AdSense ins target */}
              <ins 
                className="adsbygoogle"
                style={{ display: "block", textAlign: "center" }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-1350053040032417"
                data-ad-slot="8872019904" 
              />
            </div>

            {/* Post Footer / CTA */}
            <footer className="mt-16 border-t border-gold/15 pt-12">
              <div className="p-8 md:p-12 rounded-3xl border border-gold/20 bg-gradient-to-b from-gold/10 to-ink-soft/20 text-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(42_65%_30%/0.1)_0%,transparent_80%)] pointer-events-none" />
                <div className="font-display text-gold tracking-widest text-xs font-bold uppercase">Ready to scale your business?</div>
                <h3 className="font-display font-black text-3xl md:text-4xl text-cream leading-tight">
                  Let's build your brand, <span className="italic font-serif-elegant gold-text">next.</span>
                </h3>
                <p className="font-serif-elegant italic text-cream/70 text-base max-w-lg mx-auto">
                  Bring your design aesthetic and performance specifications to reality. Direct consultation and project quoting.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <Link to="/plan" className="px-6 py-3 bg-gold text-ink font-display tracking-widest text-xs font-bold rounded-lg hover:bg-gold-bright transition">
                    CHOOSE A PLAN
                  </Link>
                  <a href="https://wa.me/916369278905" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-gold/40 text-cream hover:border-gold hover:text-gold hover:bg-gold/10 font-display tracking-widest text-xs font-bold rounded-lg transition flex items-center gap-2">
                    START CONSULTATION <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </footer>
          </article>
        </div>

        {/* Right Skyscraper Sidebar */}
        <aside className="hidden lg:block sticky top-28 self-start w-[160px] h-[600px] border border-gold/15 bg-ink-soft/40 backdrop-blur-sm rounded-2xl overflow-hidden p-2 flex items-center justify-center">
          <div className="text-[10px] font-display text-gold/30 tracking-widest absolute top-2 uppercase">Advertisement</div>
          <ins className="adsbygoogle"
               style={{ display: "inline-block", width: "160px", height: "600px" }}
               data-ad-client="ca-pub-3940256099942544"
               data-ad-slot="5544332211"
               data-ad-format="vertical"
               data-full-width-responsive="false"></ins>
        </aside>

      </div>

      {/* Footer */}
      <footer className="border-t border-gold/15 mt-32 pt-10 text-center relative z-10">
        <div className="text-xs font-display tracking-[0.4em] text-cream/40">
          © {new Date().getFullYear()} CREATIVENODE · DIGITAL PUBLISHERS
        </div>
        <div className="mt-4 flex items-center justify-center gap-5 text-[10px] font-display tracking-[0.2em] text-cream/50">
          <Link to="/privacy-policy" className="hover:text-gold transition">PRIVACY POLICY</Link>
          <Link to="/editorial-policy" className="hover:text-gold transition">EDITORIAL POLICY</Link>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
