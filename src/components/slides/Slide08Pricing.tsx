import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";

export const Slide08Pricing = () => (
  <SlideLayout pageNumber={8}>
    <div className="absolute inset-0 px-20 pt-20">
      <SlideEyebrow>Investment</SlideEyebrow>
      <h2 className="font-display font-bold text-[80px] leading-none mb-10">
        Simple, <span className="gold-text italic">transparent rates.</span>
      </h2>

      <div className="flex gap-10">
        {/* POSTERS */}
        <div className="flex-1 bg-ink-soft/40 border border-gold/20 p-8 rounded-3xl">
          <h3 className="font-display font-bold text-cream text-[36px] mb-6 flex items-center gap-4">
            POSTER DESIGN <span className="text-[18px] font-serif-elegant italic text-gold font-normal">Per Package</span>
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "SINGLE POSTER",
                desc: "One-off designs",
                prices: "Frame: ₹149 | Basic: ₹199 | Std: ₹499",
              },
              {
                title: "WEEKLY PLAN (5)",
                desc: "Weekly social media packs",
                prices: "Frame: ₹749 | Basic: ₹1,999 | Std: ₹2,499",
                featured: true
              },
              {
                title: "MONTHLY PLAN (24)",
                desc: "+ Free Festival Poster",
                prices: "Frame: ₹2,999 | Basic: ₹3,999 | Std: ₹9,999",
              },
            ].map((p, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${p.featured ? 'border-gold bg-gold/5 shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.3)]' : 'border-gold/15 bg-ink-soft/30'}`}>
                <div className="flex justify-between items-end mb-1">
                  <div className="font-display font-bold text-[24px] tracking-wide text-cream">{p.title}</div>
                  <div className="font-serif-elegant italic text-[18px] text-cream/50">{p.desc}</div>
                </div>
                <div className="font-display text-[22px] gold-text font-black">{p.prices}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WEBSITES */}
        <div className="flex-1 bg-ink-soft/40 border border-gold/20 p-8 rounded-3xl">
          <h3 className="font-display font-bold text-cream text-[36px] mb-6 flex items-center gap-4">
            WEBSITE DESIGN <span className="text-[18px] font-serif-elegant italic text-gold font-normal">Per Project</span>
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "STARTER",
                desc: "1 Page / Local Shops",
                price: "₹1,999 – 2,999",
              },
              {
                title: "BUSINESS",
                desc: "3–5 Pages / Growing",
                price: "₹4,999 – 9,999",
                featured: true
              },
              {
                title: "PROFESSIONAL",
                desc: "5–10 Pages / SEO + FX",
                price: "₹9,999 – 14k+",
              },
              {
                title: "ADVANCED",
                desc: "Custom CMS / Startups",
                price: "₹19,999+",
              },
            ].map((p, i) => (
              <div key={i} className={`flex justify-between items-center p-5 rounded-2xl border ${p.featured ? 'border-gold bg-gold/5 shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.3)]' : 'border-gold/15 bg-ink-soft/30'}`}>
                <div>
                  <div className="font-display font-bold text-[24px] tracking-wide text-cream">{p.title}</div>
                  <div className="font-serif-elegant italic text-[18px] text-cream/50">{p.desc}</div>
                </div>
                <div className="font-display text-[32px] gold-text font-black">{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </SlideLayout>
);
