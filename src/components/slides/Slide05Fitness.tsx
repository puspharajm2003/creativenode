import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";
import f1 from "@/assets/poster-fitness-1.jpg";
import f2 from "@/assets/poster-fitness-2.jpg";
import f3 from "@/assets/poster-fitness-3.jpg";

const items = [
  { src: f1, label: "Informational Poster", tag: "JP Fitness" },
  { src: f2, label: "Awareness Poster", tag: "Motivation" },
  { src: f3, label: "Tips Design", tag: "Infographic" },
];

export const Slide05Fitness = () => (
  <SlideLayout pageNumber={5}>
    <div className="absolute inset-0 px-32 pt-28">
      <div className="flex items-end justify-between mb-12">
        <div>
          <SlideEyebrow>Sample Works · 01</SlideEyebrow>
          <h2 className="font-display font-bold text-[88px] leading-none">
            Fitness <span className="gold-text italic">& Informational</span>
          </h2>
        </div>
        <span className="font-serif-elegant italic text-cream/50 text-[24px]">Selected projects</span>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {items.map((it, i) => (
          <div key={it.label} className="group">
            <div className="relative aspect-[3/4] overflow-hidden gold-border bg-ink-soft">
              <img
                src={it.src}
                alt={it.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-5 left-5 px-4 py-2 bg-ink/80 backdrop-blur-sm">
                <span className="font-display tracking-[0.3em] text-gold text-[16px]">0{i + 1}</span>
              </div>
            </div>
            <div className="pt-6 flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-cream text-[28px]">{it.label}</h3>
              <span className="font-serif-elegant italic text-gold text-[22px]">{it.tag}</span>
            </div>
            <div className="hairline mt-4" />
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);
