import { SlideLayout } from "./SlideLayout";
import { SlideEyebrow } from "./decor";

const tiers = [
  {
    name: "Basic",
    price: "₹199",
    color: "from-emerald-500/30 to-emerald-700/10",
    accent: "text-emerald-400",
    border: "border-emerald-500/40",
    features: ["1 design concept", "JPG / PNG export", "24h delivery"],
  },
  {
    name: "Standard",
    price: "₹299",
    color: "from-sky-500/30 to-sky-700/10",
    accent: "text-sky-400",
    border: "border-sky-500/40",
    features: ["1 standard concept", "Single frame", "JPG / PNG · 24h"],
  },
  {
    name: "Premium",
    price: "₹499+",
    color: "from-gold/30 to-gold-deep/10",
    accent: "text-gold",
    border: "border-gold/60",
    features: ["3 poster set + reel", "Source files", "Priority support"],
    featured: true,
  },
];

export const Slide04Styles = () => (
  <SlideLayout pageNumber={4}>
    <div className="absolute inset-0 px-32 pt-28">
      <SlideEyebrow>Design Tiers</SlideEyebrow>
      <h2 className="font-display font-bold text-[88px] leading-none mb-4">
        Three styles, <span className="gold-text italic">one perfect fit.</span>
      </h2>
      <p className="font-serif-elegant text-cream/60 text-[26px] mb-16">
        Choose the tier that matches your brand ambition and budget.
      </p>

      <div className="grid grid-cols-3 gap-8">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative p-12 bg-gradient-to-br ${t.color} border ${t.border} ${
              t.featured ? "scale-[1.04] shadow-[0_30px_80px_-20px_hsl(42_65%_50%_/_0.4)]" : ""
            }`}
          >
            {t.featured && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gold text-ink font-display tracking-[0.3em] text-[16px]">
                MOST LOVED
              </div>
            )}
            <div className={`w-4 h-4 rotate-45 ${t.accent.replace("text-", "bg-")} mb-8`} />
            <h3 className="font-display font-bold text-cream text-[48px] mb-2">{t.name}</h3>
            <div className={`font-display font-black text-[100px] leading-none mb-2 ${t.accent}`}>
              {t.price}
            </div>
            <p className="font-serif-elegant italic text-cream/50 text-[22px] mb-10">
              per design
            </p>
            <div className="hairline mb-8" />
            <ul className="space-y-4">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-4 font-serif-elegant text-cream/85 text-[26px]">
                  <span className={`w-2 h-2 rotate-45 ${t.accent.replace("text-", "bg-")}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);
