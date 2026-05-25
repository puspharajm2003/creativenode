import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ADSENSE_CLIENT = "ca-pub-1350053040032417";
const ADSENSE_SCRIPT_ID = "adsense-script";

/**
 * Checks if the current pathname is an allowed publisher content page where ads are permitted.
 * We only permit ads on:
 * - "/" (Home/Landing page)
 * - "/blog" (Blog listing page)
 * - "/blog/:slug" (Substantive long-form blog articles)
 */
const isAllowedAdRoute = (pathname: string): boolean => {
  return pathname === "/" || pathname === "/blog" || pathname.startsWith("/blog/");
};

/**
 * Thoroughly scrubs the DOM and window context to completely eliminate all traces of
 * Google AdSense code, elements, and styles. This prevents ads from being served on
 * behavioral, utility, or low-value pages in our React SPA.
 */
const cleanupAdSense = () => {
  try {
    // 1. Remove script tag
    const script = document.getElementById(ADSENSE_SCRIPT_ID);
    if (script) {
      script.remove();
    }

    // 2. Remove all Google-injected DOM nodes (ins units, dynamic iframe overlays, anchor frames)
    const selectors = [
      "ins.adsbygoogle",
      "iframe[src*='googleads']",
      "iframe[src*='doubleclick']",
      "iframe[id^='google_ads']",
      "iframe[name^='google_ads']",
      "div[id^='google_ads']",
      "div[class*='google-ad']",
      "div[id*='google-ad']",
      "ins[data-ad-client]",
      "div[id*='aswift']",
      "iframe[id*='aswift']"
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try {
          el.remove();
        } catch (e) {
          // Keep iterating even if one element fails
        }
      });
    });

    // 3. Clear styling attributes added to HTML or Body by Google Auto-Ads (like anchors, overlays, or layout shifting)
    const cleanContainerStyles = (el: HTMLElement | null) => {
      if (!el) return;
      
      // Remove specific Google Adsense attributes
      el.removeAttribute("style");
      
      // Filter out AdSense class signatures
      const classesToRemove = Array.from(el.classList).filter(
        c => c.startsWith("google") || c.includes("adsense") || c.includes("ad-") || c.includes("aswift")
      );
      classesToRemove.forEach(c => el.classList.remove(c));
    };

    cleanContainerStyles(document.documentElement);
    cleanContainerStyles(document.body);

    // 4. Reset AdSense global registers
    delete (window as any).adsbygoogle;
    (window as any).adsbygoogle = [];
  } catch (err) {
    console.warn("AdSense cleanup encountered an issue:", err);
  }
};

export const AdSenseLoader = () => {
  const location = useLocation();

  useEffect(() => {
    const shouldLoadAds = isAllowedAdRoute(location.pathname);

    if (shouldLoadAds) {
      // Load Google AdSense script if not already present
      const existing = document.getElementById(ADSENSE_SCRIPT_ID);
      if (!existing) {
        const script = document.createElement("script");
        script.id = ADSENSE_SCRIPT_ID;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
        document.head.appendChild(script);
      }
    } else {
      // Actively purge all AdSense trace elements on non-publisher/behavioral routes
      cleanupAdSense();
    }

    // Clean up when the component unmounts
    return () => {
      cleanupAdSense();
    };
  }, [location.pathname]);

  return null;
};
