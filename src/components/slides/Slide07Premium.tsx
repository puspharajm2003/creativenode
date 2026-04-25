import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";
import p1 from "@/assets/poster-premium-1.jpg";
import p2 from "@/assets/poster-premium-2.jpg";
import p3 from "@/assets/poster-premium-3.jpg";

export const Slide07Premium = () => (
  <SlideLayout pageNumber={7}>
    <div className="absolute inset-0 px-32 pt-28">
      <div className="flex items-end justify-between mb-12">
        <div>
          <SlideEyebrow>Premium Works</SlideEyebrow>
          <h2 className="font-display font-bold text-[96px] leading-none">
            <span className="shimmer">Signature Collection</span>
          </h2>
          <p className="font-serif-elegant italic text-cream/60 text-[26px] mt-4">
            Where craft meets brand. Designs clients trust.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {/* Featured large */}
        <div className="col-span-2 relative aspect-[16/10] overflow-hidden gold-border bg-ink-soft group">
          <img src={p1} alt="Ramadan premium poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div>
              <span className="font-display tracking-[0.4em] text-gold text-[18px]">FEATURED</span>
              <h3 className="font-display font-bold text-cream text-[52px] leading-none mt-2">Ramadan Kareem</h3>
            </div>
            <span className="font-serif-elegant italic text-cream/70 text-[24px]">Festive · Luxury</span>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {[{ src: p2, name: "Gold Luxury" }, { src: p3, name: "Portfolio Showcase" }].map((it) => (
            <div key={it.name} className="relative flex-1 overflow-hidden gold-border bg-ink-soft group">
              <img src={it.src} alt={it.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="font-display font-semibold text-cream text-[28px]">{it.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SlideLayout>
);
