"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const navigation: NavigationItem[] = [
    {
      name: "Ana Panel",
      href: "/dashboard",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
      description: "Genel durum ve istatistikler",
    },
    {
      name: "İzleme Haritası",
      href: "/dashboard/monitoring-map",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
      description: "Gerçek zamanlı sistem haritası",
    },
    {
      name: "Saha Birimleri",
      href: "/dashboard/field-units",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      description: "Saha ekipleri takibi",
    },
  ];

  const analyzerNavigation: NavigationItem[] = [
        {
      name: "İletişim Ağı",
      href: "/dashboard/analyzers/communication-network",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      ),
      description: "İletişim altyapısı durumu",
    },
        {
      name: "Yardım Rotaları",
      href: "/dashboard/analyzers/aid-route",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      description: "Optimum yardım güzergahları",
    },
    {
      name: "Uydu Karşılaştırması",
      href: "/dashboard/analyzers/satellite-comparison",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      description: "Hasar tespiti analizi",
    },
    {
      name: "Güvenli Bölgeler",
      href: "/dashboard/analyzers/safe-zone",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      description: "Güvenli toplanma alanları",
    },

    {
      name: "Nüfus Yoğunluğu",
      href: "/dashboard/analyzers/population-density",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      description: "Nüfus dağılım analizi",
    },

  ];

  const handleLogout = () => {
    // Depolanan auth verilerini temizle
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="bg-opacity-75 fixed inset-0 z-20 bg-gray-600 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 z-30 h-full transform bg-gray-900 text-white transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:inset-0 lg:translate-x-0 ${isOpen ? "w-80" : "w-80"} flex flex-col`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <img src="/TAMISLOGO.png" alt="tamis logo" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold">TAMIS</h1>
              <p className="text-xs text-gray-400">Monitoring System</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Ana Menü
            </h3>
            <div className="mt-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } `}
                  >
                    <span
                      className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                    >
                      {item.icon}
                    </span>
                    <div className="ml-3 flex-1">
                      <span className="block">{item.name}</span>
                      {item.description && (
                        <span
                          className={`mt-0.5 block text-xs ${isActive ? "text-blue-200" : "text-gray-500 group-hover:text-gray-400"}`}
                        >
                          {item.description}
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="ml-3 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Analyzer Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Analiz Araçları
            </h3>
            <div className="mt-3 space-y-1">
              {analyzerNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } `}
                  >
                    <span
                      className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                    >
                      {item.icon}
                    </span>
                    <div className="ml-3 flex-1">
                      <span className="block">{item.name}</span>
                      {item.description && (
                        <span
                          className={`mt-0.5 block text-xs ${isActive ? "text-blue-200" : "text-gray-500 group-hover:text-gray-400"}`}
                        >
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
                <svg
                  className="h-6 w-6 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {user?.name || "Kullanıcı"}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email || "admin@tamis.gov.tr"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              title="Çıkış Yap"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
