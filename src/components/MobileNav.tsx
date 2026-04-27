import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Image as ImageIcon, Tag, User, MessageSquare } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "clients", label: "Clients", icon: ImageIcon, path: "/clients" },
  { id: "chat", label: "Chat", icon: MessageSquare, action: "open-chat" },
  { id: "plan", label: "Plan", icon: Tag, path: "/plan" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export const MobileNav = () => {
  const location = useLocation();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // Determine active index based on path and hash
    const currentPath = location.pathname + location.hash;
    const index = NAV_ITEMS.findIndex(item => item.path === currentPath);
    
    if (index !== -1) {
      setActiveIdx(index);
    } else if (location.pathname === "/" && !location.hash) {
      setActiveIdx(0); 
    } else if (location.pathname.includes("/profile") || location.pathname.includes("/admin") || location.pathname.includes("/login")) {
      setActiveIdx(4); // Profile
    } else if (location.pathname.includes("/plan")) {
      setActiveIdx(3); // Plan
    } else if (location.pathname.includes("/clients")) {
      setActiveIdx(1); // Clients
    }
  }, [location.pathname, location.hash]);

  // Hide on portfolio deck (presentation mode)
  if (location.pathname.includes("/portfolio")) return null;

  return (
    <nav className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-[400px]" style={{ zIndex: 99999 }}>
      <div className="relative flex items-center w-full bg-ink/90 backdrop-blur-xl border border-gold/20 rounded-2xl p-2 shadow-[0_10px_40px_hsl(var(--gold)/0.15)]">
        
        {/* Animated Background Pill */}
        <div className="absolute inset-2 pointer-events-none flex">
          <div 
            className="h-full bg-gold/15 border border-gold/30 rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: "20%",
              transform: `translateX(${activeIdx * 100}%)`
            }}
          />
        </div>
        
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeIdx === i;
          
          if (item.action) {
            return (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveIdx(i);
                  window.dispatchEvent(new CustomEvent(item.action));
                }}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center py-2 transition-colors duration-300 ${
                  isActive ? "text-gold" : "text-cream/50 hover:text-cream/80"
                }`}
              >
                <item.icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-display tracking-widest uppercase">{item.label}</span>
              </button>
            );
          }
          return (
            <Link 
              key={item.id}
              to={item.path as string}
              onClick={() => {
                if (item.path && item.path.includes("#")) {
                  setTimeout(() => {
                    const id = (item.path as string).split("#")[1];
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }
              }}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-2 transition-colors duration-300 ${
                isActive ? "text-gold" : "text-cream/50 hover:text-cream/80"
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-display tracking-widest uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
