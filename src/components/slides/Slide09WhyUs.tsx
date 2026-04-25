import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";
import { Rocket, Brush, Wallet, Layers3, Target } from "lucide-react";

const reasons = [
  { icon: Rocket, title: "Fast Delivery", desc: "Turnaround in 24–48 hrs." },
  { icon: Brush, title: "Custom Designs", desc: "Made for your brand only." },
  { icon: Wallet, title: "Affordable Pricing", desc: "Plans for every budget." },
  { icon: Layers3, title: "Multi-Style Options", desc: "Basic, standard, premium." },
  { icon: Target, title: "Business-Focused", desc: "Designs that drive results." },
];

export const Slide09WhyUs = () => (
  <SlideLayout pageNumber={9}>
    <div className="absolute inset-0 px-32 pt-28 grid grid-cols-5 gap-16">
      <div className="col-span-2">
        <SlideEyebrow>Why Choose Us</SlideEyebrow>
        <h2 className="font-display font-bold text-[88px] leading-[0.95] mb-10">
          Five reasons brands <span className="gold-text italic">stay with us.</span>
        </h2>
        <div className="hairline w-32 mb-10" />
        <p className="font-serif-elegant text-cream/70 text-[28px] leading-relaxed italic">
          We don't just design posters — we design business outcomes. Every pixel earns its place.
        </p>
      </div>

      <div className="col-span-3 flex flex-col justify-center gap-6">
        {reasons.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="flex items-center gap-8 p-7 bg-ink-soft/60 gold-border hover:bg-ink-soft transition-colors"
          >
            <span className="font-display text-gold/40 text-[44px] w-14">0{i + 1}</span>
            <div className="w-16 h-16 rounded-full bg-gold/10 gold-border flex items-center justify-center shrink-0">
              <Icon className="w-8 h-8 text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-cream text-[32px]">{title}</h3>
              <p className="font-serif-elegant text-cream/60 text-[22px]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);
