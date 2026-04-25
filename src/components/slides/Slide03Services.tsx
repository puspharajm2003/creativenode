import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";
import { Instagram, Megaphone, PartyPopper, Layers, ArrowUpRight } from "lucide-react";

const services = [
  { icon: Instagram, title: "Social Media Posters", desc: "Daily content that stops the scroll. Curated aesthetic tailored exactly for your brand." },
  { icon: Megaphone, title: "Business Promotions", desc: "High-conversion sales, launches & lead-gen creatives built to drive action." },
  { icon: PartyPopper, title: "Festival Designs", desc: "Premium thematic designs for Diwali, Eid, Christmas, and major sale events." },
  { icon: Layers, title: "Branding Systems", desc: "Identity, cohesive visual themes, logos, and comprehensive brand collateral." },
];

export const Slide03Services = () => (
  <SlideLayout pageNumber={3}>
    {/* Animated BG Orbs for Premium Feel */}
    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

    <div className="absolute inset-0 px-24 pt-24 pb-16 flex flex-col justify-center relative z-10">
      <div className="flex items-end justify-between mb-16 border-b border-gold/10 pb-8">
        <div>
          <SlideEyebrow>What We Offer</SlideEyebrow>
          <h2 className="font-display font-black text-[120px] leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-cream via-cream to-cream/50 mt-4">
            <span className="gold-text italic block">Premium</span> Services.
          </h2>
        </div>
        <div className="text-right max-w-[400px]">
          <p className="font-serif-elegant italic text-cream/60 text-[24px] leading-relaxed">
            Four core offerings engineered to elevate your digital presence and scale your brand.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {services.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="group relative p-10 rounded-3xl bg-ink-soft/40 border border-gold/15 hover:border-gold/50 backdrop-blur-md overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_hsl(var(--gold)/0.15)] flex flex-col justify-between"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gold/5 group-hover:bg-gold/20 blur-3xl transition-colors duration-700" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-8 h-8 text-gold" strokeWidth={1.5} />
              </div>
              <span className="font-display font-bold text-gold/20 text-[60px] leading-none group-hover:text-gold/40 transition-colors">
                0{i + 1}
              </span>
            </div>

            <div className="relative z-10 mt-8">
              <h3 className="font-display font-bold text-cream text-[36px] mb-3 group-hover:text-gold transition-colors">{title}</h3>
              <p className="font-serif-elegant text-cream/60 text-[20px] leading-relaxed max-w-[90%]">{desc}</p>
            </div>

            <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-ink">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);
