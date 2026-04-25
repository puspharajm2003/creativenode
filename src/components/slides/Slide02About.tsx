import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";
import { Zap, Palette, Sparkles } from "lucide-react";

export const Slide02About = () => (
  <SlideLayout pageNumber={2}>
    <div className="absolute inset-0 px-32 pt-32 grid grid-cols-2 gap-20">
      {/* Left */}
      <div>
        <SlideEyebrow>About Us</SlideEyebrow>
        <h2 className="font-display font-bold text-[96px] leading-[0.95] mb-12">
          A studio built for <span className="gold-text italic">brands that lead.</span>
        </h2>
        <div className="hairline w-48 mb-10" />
        <p className="font-serif-elegant text-cream/80 text-[30px] leading-relaxed mb-6">
          Creativenode is a creative design studio focused on building impactful visuals for businesses.
        </p>
        <p className="font-serif-elegant text-cream/70 text-[28px] leading-relaxed italic">
          We help brands attract attention, communicate clearly, and grow through effective design.
        </p>
      </div>

      {/* Right cards */}
      <div className="flex flex-col justify-center gap-8">
        {[
          { icon: Zap, title: "Fast Delivery", desc: "Concepts in hours, finals in days." },
          { icon: Palette, title: "Custom Designs", desc: "Tailored to your brand voice & audience." },
          { icon: Sparkles, title: "Affordable to Premium", desc: "Tiered pricing for every business stage." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group flex items-start gap-8 p-10 bg-ink-soft/60 gold-border hover:bg-ink-soft transition-colors">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gold/10 gold-border shrink-0">
              <Icon className="w-10 h-10 text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-cream text-[36px] mb-2">{title}</h3>
              <p className="font-serif-elegant text-cream/60 text-[24px]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);
