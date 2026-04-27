import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ThemePalette {
  id: string;
  name: string;
  gold: string;
  goldBright: string;
  goldDeep: string;
  ink: string;
  inkSoft: string;
  cream: string;
  gradientGold: string;
}

export const THEMES: ThemePalette[] = [
  {
    id: "dark-gold", name: "Dark Gold",
    gold: "42 65% 60%", goldBright: "45 80% 65%", goldDeep: "38 50% 42%",
    ink: "0 0% 4%", inkSoft: "0 0% 9%", cream: "42 35% 92%",
    gradientGold: "linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(45 85% 70%) 50%, hsl(38 60% 45%) 100%)",
  },
  {
    id: "midnight-blue", name: "Midnight Blue",
    gold: "210 100% 67%", goldBright: "212 90% 72%", goldDeep: "215 80% 45%",
    ink: "215 30% 5%", inkSoft: "215 20% 10%", cream: "210 20% 88%",
    gradientGold: "linear-gradient(135deg, hsl(215 80% 45%) 0%, hsl(212 90% 72%) 50%, hsl(215 80% 45%) 100%)",
  },
  {
    id: "obsidian-rose", name: "Obsidian Rose",
    gold: "340 70% 60%", goldBright: "345 80% 68%", goldDeep: "335 55% 40%",
    ink: "340 30% 5%", inkSoft: "340 20% 10%", cream: "340 25% 90%",
    gradientGold: "linear-gradient(135deg, hsl(335 55% 40%) 0%, hsl(345 80% 68%) 50%, hsl(335 55% 40%) 100%)",
  },
  {
    id: "forest-emerald", name: "Forest Emerald",
    gold: "140 60% 45%", goldBright: "145 70% 55%", goldDeep: "135 50% 30%",
    ink: "150 25% 4%", inkSoft: "150 18% 9%", cream: "140 20% 90%",
    gradientGold: "linear-gradient(135deg, hsl(135 50% 30%) 0%, hsl(145 70% 55%) 50%, hsl(135 50% 30%) 100%)",
  },
  {
    id: "deep-violet", name: "Deep Violet",
    gold: "260 60% 68%", goldBright: "265 75% 75%", goldDeep: "255 50% 45%",
    ink: "260 30% 6%", inkSoft: "260 20% 11%", cream: "260 20% 92%",
    gradientGold: "linear-gradient(135deg, hsl(255 50% 45%) 0%, hsl(265 75% 75%) 50%, hsl(255 50% 45%) 100%)",
  },
  {
    id: "sunset-amber", name: "Sunset Amber",
    gold: "30 85% 55%", goldBright: "35 90% 62%", goldDeep: "25 70% 38%",
    ink: "25 30% 5%", inkSoft: "25 20% 9%", cream: "30 30% 92%",
    gradientGold: "linear-gradient(135deg, hsl(25 70% 38%) 0%, hsl(35 90% 62%) 50%, hsl(25 70% 38%) 100%)",
  },
];

interface ThemeCtx {
  currentTheme: ThemePalette;
  themeId: string;
  setThemeId: (id: string) => void;
  transitioning: boolean;
}

const Ctx = createContext<ThemeCtx | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeIdRaw] = useState(() => localStorage.getItem("cn-theme") || "dark-gold");
  const [transitioning, setTransitioning] = useState(false);

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  const setThemeId = (id: string) => {
    setTransitioning(true);
    setTimeout(() => {
      setThemeIdRaw(id);
      localStorage.setItem("cn-theme", id);
      setTimeout(() => setTransitioning(false), 500);
    }, 250);
  };

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--gold", currentTheme.gold);
    r.setProperty("--gold-bright", currentTheme.goldBright);
    r.setProperty("--gold-deep", currentTheme.goldDeep);
    r.setProperty("--ink", currentTheme.ink);
    r.setProperty("--ink-soft", currentTheme.inkSoft);
    r.setProperty("--cream", currentTheme.cream);
    r.setProperty("--gradient-gold", currentTheme.gradientGold);
    // Also update shadcn mapped vars
    r.setProperty("--background", currentTheme.ink);
    r.setProperty("--foreground", currentTheme.cream);
    r.setProperty("--primary", currentTheme.gold);
    r.setProperty("--accent", currentTheme.gold);
    r.setProperty("--ring", currentTheme.gold);
    r.setProperty("--border", currentTheme.goldDeep);
  }, [currentTheme]);

  return (
    <Ctx.Provider value={{ currentTheme, themeId, setThemeId, transitioning }}>
      {/* Transition overlay */}
      <div
        className={`fixed inset-0 z-[99999] pointer-events-none transition-opacity duration-500 ${transitioning ? "opacity-100" : "opacity-0"}`}
        style={{ background: `radial-gradient(circle at center, hsl(${currentTheme.gold} / 0.15), hsl(${currentTheme.ink}))` }}
      />
      {children}
    </Ctx.Provider>
  );
};

export const useTheme = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be inside ThemeProvider");
  return v;
};
