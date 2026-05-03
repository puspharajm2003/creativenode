import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve a session ID for the current browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("cn_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("cn_session_id", sessionId);
  }
  return sessionId;
};

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageview = async () => {
      // Don't track admin pages to avoid skewing analytics
      if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/login")) {
        return;
      }

      // Track Google Analytics pageview for SPA routing
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "page_view", {
          page_path: location.pathname + location.search,
          page_location: window.location.href,
        });
      }

      try {
        const { error } = await supabase.from("page_views").insert({
          path: location.pathname,
          session_id: getSessionId(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || "direct"
        });
        // Silently ignore if table doesn't exist (404) or RLS blocks
        if (error && error.code !== "42P01" && !error.message?.includes("404")) {
          // Only log unexpected errors
        }
      } catch {
        // Silently fail — analytics should never break the app
      }
    };

    trackPageview();
  }, [location.pathname, location.search]);

  return null;
};
