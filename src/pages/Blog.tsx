import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, Calendar, Clock, User } from "lucide-react";

export interface Article {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
}

export const ARTICLES: Article[] = [
  {
    title: "The Psychology of Scroll-Stopping Poster Design: How Visual Hierarchy Influences Action",
    slug: "psychology-of-scroll-stopping-poster-design",
    excerpt: "In an era of sub-second attention spans, discover the foundational principles of visual contrast, typography scaling, and emotional color science used to capture high-value clients instantly.",
    category: "Design",
    readTime: "5 min read",
    date: "May 18, 2026",
    author: "Vimal Raj",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Building a Premium Brand Identity in 2026: Why Minimalism is Still King",
    slug: "building-premium-brand-identity-2026",
    excerpt: "Explore why elite brands reject cluttered graphics in favor of intentional whitespace, precise typography scales, and balanced HSL color palettes to command premium industry rates.",
    category: "Branding",
    readTime: "6 min read",
    date: "May 22, 2026",
    author: "Vimal Raj",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "High-Performance Modern Web Development: Blending Luxury Aesthetics with Lightning Speed",
    slug: "high-performance-modern-web-development",
    excerpt: "A technical deep dive into combining highly engaging GSAP animations, luxury aesthetics, and lightning-fast loading speeds without compromising Core Web Vitals and SEO search indexes.",
    category: "Engineering",
    readTime: "7 min read",
    date: "May 25, 2026",
    author: "Vimal Raj",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  },
];

const Blog = () => {
  useEffect(() => {
    try {
      const ads = document.querySelectorAll(".adsbygoogle");
      ads.forEach(() => {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      });
    } catch (e) {
      console.warn("Dynamic AdSense push deferred:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-ink text-cream relative overflow-hidden flex flex-col pt-24 pb-32">
      {/* Background ambient gold glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(42_65%_15%/0.15)_0%,transparent_70%)] pointer-events-none" />
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
               data-ad-slot="1234567890"
               data-ad-format="vertical"
               data-full-width-responsive="false"></ins>
        </aside>

        {/* Center Main Content */}
        <div className="flex flex-col flex-1 w-full">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-display tracking-[0.2em] text-cream/50 hover:text-gold transition-colors mb-12 self-start group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO HOME
          </Link>

          {/* Header Block */}
          <header className="mb-20 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-3 mb-6">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="font-display tracking-[0.5em] text-gold text-xs uppercase">The Editorials</span>
            </div>
            <h1 className="font-display font-black text-[clamp(44px,7vw,84px)] leading-[0.9] tracking-tighter mb-6">
              Insights on <span className="italic font-serif-elegant gold-text">Aesthetics</span> &amp; Performance.
            </h1>
            <p className="font-serif-elegant italic text-cream/60 text-lg md:text-xl leading-relaxed">
              A dynamic archive written for designers, developers, and serious founders who refuse the ordinary. Explanations on high-end layout hierarchy, digital structure, and visual psychology.
            </p>
          </header>

          {/* Article Grid */}
          <main className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {ARTICLES.map((article, index) => (
              <article 
                key={article.slug} 
                className="flex flex-col h-full rounded-2xl border border-gold/15 bg-ink-soft/40 backdrop-blur-sm overflow-hidden hover:border-gold/40 hover:shadow-[0_15px_40px_-15px_hsl(var(--gold)/0.2)] transition-all duration-500 group animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Image Frame */}
                <Link to={`/blog/${article.slug}`} className="block aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ink/30 opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-ink/75 border border-gold/20 rounded-full">
                    <span className="font-display text-[9px] text-gold tracking-widest uppercase font-bold">{article.category}</span>
                  </div>
                </Link>

                {/* Text Block */}
                <div className="p-8 flex flex-col flex-1">
                  {/* Meta details */}
                  <div className="flex items-center gap-4 text-[10px] font-display tracking-widest text-cream/40 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold/60" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold/60" />
                      {article.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-bold text-xl text-cream group-hover:text-gold transition-colors mb-4 leading-snug line-clamp-2">
                    <Link to={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="font-serif-elegant italic text-cream/60 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Footer read link */}
                  <div className="h-px bg-gold/10 mb-5" />
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-cream/50">
                      <User className="w-3.5 h-3.5 text-gold/60" />
                      {article.author.toUpperCase()}
                    </div>
                    <Link 
                      to={`/blog/${article.slug}`} 
                      className="inline-flex items-center gap-1 text-[10px] font-display tracking-[0.2em] text-gold font-bold group-hover:translate-x-1 transition-transform"
                    >
                      READ ARTICLE <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </main>
        </div>

        {/* Right Skyscraper Sidebar */}
        <aside className="hidden lg:block sticky top-28 self-start w-[160px] h-[600px] border border-gold/15 bg-ink-soft/40 backdrop-blur-sm rounded-2xl overflow-hidden p-2 flex items-center justify-center">
          <div className="text-[10px] font-display text-gold/30 tracking-widest absolute top-2 uppercase">Advertisement</div>
          <ins className="adsbygoogle"
               style={{ display: "inline-block", width: "160px", height: "600px" }}
               data-ad-client="ca-pub-3940256099942544"
               data-ad-slot="0987654321"
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

export default Blog;
