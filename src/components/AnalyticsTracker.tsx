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

      try {
        await supabase.from("page_views").insert({
          path: location.pathname,
          session_id: getSessionId(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || "direct"
        });
      } catch (err) {
        console.error("Failed to track pageview", err);
      }
    };

    trackPageview();
  }, [location.pathname]);

  return null;
};
