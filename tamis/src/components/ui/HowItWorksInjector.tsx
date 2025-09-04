"use client";

import { useEffect } from "react";
import HowItWorks from "./HowItWorks";

/**
 * Mounts a small HowItWorks button on each <section> and top-level page container.
 * Uses portals by dynamically creating anchors and rendering HowItWorks into them via React 18 API.
 * Simpler approach: insert a minimal container and hydrate with React using createRoot.
 */
export default function HowItWorksInjector() {
  useEffect(() => {
    // Helper to mount component to target element
    const ensureAnchor = (host: Element) => {
      const id = "tamis-howitworks-anchor";
      let anchor = host.querySelector(`:scope > .${id}`);
      if (!anchor) {
        anchor = document.createElement("div");
        anchor.className = `${id} absolute inset-0 pointer-events-none`;
        const cs = getComputedStyle(host as HTMLElement);
        (host as HTMLElement).style.position = cs.position === "static" ? "relative" : cs.position;
        host.appendChild(anchor);
        // Render a simple cloned balloon using Web Components-free approach
        // We'll mount a minimal React root per anchor to avoid global state.
        // To keep dependencies tiny, use dynamic import of react-dom/client.
        import("react-dom/client").then(({ createRoot }) => {
          const root = createRoot(anchor as Element);
          root.render(<HowItWorks />);
        });
      }
    };

    const scan = () => {
      // Attach to every section
      document.querySelectorAll("section").forEach(ensureAnchor);
      // And to main containers with data-section hint
      document.querySelectorAll('[data-section], main').forEach(ensureAnchor);
    };

    // Initial scan
    scan();

    // Observe route/page changes and DOM mutations
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.addedNodes && m.addedNodes.length) {
          scan();
          break;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Re-scan on history navigation
    const onPop = () => setTimeout(scan, 50);
    window.addEventListener("popstate", onPop);

    return () => {
      mo.disconnect();
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return null;
}
