"use client";

import { useEffect } from "react";

document.querySelectorAll("section").forEach(attachToAnchor);
// Ve data-section ipucu ile ana kapsayıcılara} from "react";
import HowItWorks from "./HowItWorks";

/**
 * Mounts a small HowItWorks button on each <section> and top-level page container.
 * Uses portals by dynamically creating anchors and rendering HowItWorks into them via React 18 API.
 * Simpler approach: insert a minimal container and hydrate with React using createRoot.
 */
export default function HowItWorksInjector() {
  useEffect(() => {
    // Hedef elemente bileşen yerleştirmek için yardımcı
    const ensureAnchor = (host: Element) => {
      const id = "tamis-howitworks-anchor";
      let anchor = host.querySelector(`:scope > .${id}`);
      if (!anchor) {
        anchor = document.createElement("div");
        anchor.className = `${id} absolute inset-0 pointer-events-none`;
        const cs = getComputedStyle(host as HTMLElement);
        (host as HTMLElement).style.position =
          cs.position === "static" ? "relative" : cs.position;
        host.appendChild(anchor);
        // Web Components'siz yaklaşımla basit klonlanmış balon render et
        // Global state'den kaçınmak için her anchor için minimal React root monte edeceğiz.
        // Bağımlılıkları küçük tutmak için react-dom/client'ın dinamik import'unu kullan.
        import("react-dom/client").then(({ createRoot }) => {
          const root = createRoot(anchor as Element);
          root.render(<HowItWorks />);
        });
      }
    };

    const scan = () => {
      // Her bölüme ekle
      document.querySelectorAll("section").forEach(ensureAnchor);
      // Ve data-section ipucu ile ana kapsayıcılara
      document.querySelectorAll("[data-section], main").forEach(ensureAnchor);
    };

    // İlk tarama
    scan();

    // Rota/sayfa değişikliklerini ve DOM mutasyonlarını gözlemle
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.addedNodes && m.addedNodes.length) {
          scan();
          break;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Geçmiş navigasyonunda yeniden tara
    const onPop = () => setTimeout(scan, 50);
    window.addEventListener("popstate", onPop);

    return () => {
      mo.disconnect();
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return null;
}
