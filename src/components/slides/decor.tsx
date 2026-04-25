export const GoldCorner = ({ position = "tl" }: { position?: "tl" | "tr" | "bl" | "br" }) => {
  const map = {
    tl: "top-12 left-12 border-t border-l",
    tr: "top-12 right-12 border-t border-r",
    bl: "bottom-12 left-12 border-b border-l",
    br: "bottom-12 right-12 border-b border-r",
  };
  return <div className={`absolute w-24 h-24 border-gold/60 ${map[position]}`} />;
};

export const GoldDot = () => <span className="inline-block w-2 h-2 rotate-45 bg-gold mx-3 align-middle" />;

export const SlideEyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-16 h-px bg-gold" />
    <span className="font-display tracking-[0.5em] text-gold text-[20px] uppercase">{children}</span>
  </div>
);
