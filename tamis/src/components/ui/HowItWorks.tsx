"use client";

import React from "react";

type HowItWorksProps = {
  title?: string;
  howToUseTitle?: string;
  howItWorksTitle?: string;
  howToUseText?: string;
  howItWorksText?: string;
  /**
   * If provided, overrides the positioning classes. Otherwise uses relative container rules.
   */
  className?: string;
  /** Add an aria-label for accessibility */
  ariaLabel?: string;
  /** If true, positions itself fixed at bottom-right (page-level helper) */
  fixed?: boolean;
};

export default function HowItWorks({
  title = "Nasıl Çalışır",
  howToUseTitle = "Ne için kullanılır",
  howItWorksTitle = "Nasıl çalışır",
  howToUseText = "Bu bölümdeki kontrolleri kullanarak haritayı gezebilir, filtreleri uygulayabilir ve detaylara ulaşabilirsiniz.",
  howItWorksText = "Sistem, sahadan gelen verileri gerçek zamanlı işler ve görselleştirir. İlgili analizler otomatik olarak güncellenir.",
  className = "",
  ariaLabel = "Nasıl Çalışır bilgi balonu",
  fixed = false,
}: HowItWorksProps) {
  const containerClasses = fixed
    ? "fixed bottom-6 right-4 sm:bottom-4 sm:right-4 z-50"
    : "absolute top-3 right-3 sm:top-2 sm:right-2 z-40 pointer-events-auto";

  return (
  <div className={`${containerClasses} ${className}`}>
      <div className="group relative inline-flex">
        {/* Icon button - Büyütülmüş ve mobil uyumlu */}
        <button
          aria-label={ariaLabel}
          className="h-12 w-12 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg sm:text-base md:text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <span className="select-none">?</span>
        </button>

        {/* Tooltip balloon - Mobil uyumlu boyutlar */}
        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 mt-2 w-80 sm:w-72 md:w-80 origin-top-right scale-95 opacity-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-3 text-sm text-gray-700 shadow-xl transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 max-w-[calc(100vw-2rem)]"
        >
          <div className="font-semibold text-gray-900 mb-2 text-base sm:text-sm">{title}</div>
          <div className="space-y-3 sm:space-y-2">
            <div>
              <div className="text-sm sm:text-xs font-medium text-gray-600 mb-1">{howToUseTitle}</div>
              <p className="text-sm sm:text-xs text-gray-600 leading-relaxed">{howToUseText}</p>
            </div>
            <div className="border-t border-gray-100 pt-3 sm:pt-2">
              <div className="text-sm sm:text-xs font-medium text-gray-600 mb-1">{howItWorksTitle}</div>
              <p className="text-sm sm:text-xs text-gray-600 leading-relaxed">{howItWorksText}</p>
            </div>
          </div>
          <div className="absolute -top-1 right-4 sm:right-3 h-2 w-2 rotate-45 bg-white border-l border-t border-gray-200" />
        </div>
      </div>
    </div>
  );
}
