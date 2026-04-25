import { SlideLayout } from "./SlideLayout";
import { GoldCorner } from "./decor";

export const Slide01Cover = () => (
  <SlideLayout showFooter={false}>
    <GoldCorner position="tl" />
    <GoldCorner position="tr" />
    <GoldCorner position="bl" />
    <GoldCorner position="br" />

    {/* Decorative radial */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, hsl(42 65% 50% / 0.25), transparent 55%)",
      }}
    />

    {/* Centered content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center px-32 text-center">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-32 h-px bg-gold" />
        <span className="font-display tracking-[0.6em] text-gold text-[22px]">PORTFOLIO 2025</span>
        <div className="w-32 h-px bg-gold" />
      </div>

      <h1 className="font-display font-black text-[180px] leading-none tracking-tight mb-6">
        <span className="shimmer">CREATIVENODE</span>
      </h1>

      <div className="flex items-center gap-8 mb-16">
        <span className="font-serif-elegant italic text-cream/80 text-[44px]">Design.</span>
        <div className="w-2 h-2 rotate-45 bg-gold" />
        <span className="font-serif-elegant italic text-cream/80 text-[44px]">Build.</span>
        <div className="w-2 h-2 rotate-45 bg-gold" />
        <span className="font-serif-elegant italic text-cream/80 text-[44px]">Innovate.</span>
      </div>

      <div className="px-12 py-5 gold-border bg-ink-soft/60 backdrop-blur-sm">
        <p className="font-display tracking-[0.4em] text-cream text-[24px] uppercase">
          Professional Poster Design Services
        </p>
      </div>
    </div>

    {/* Bottom branding */}
    <div className="absolute bottom-16 left-0 right-0 flex justify-center">
      <span className="font-serif-elegant text-cream/40 text-[20px] tracking-[0.3em]">
        @CREATIVENODE.IN  ·  +91 6369278905
      </span>
    </div>
  </SlideLayout>
);
