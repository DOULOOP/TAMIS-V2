"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HowItWorks from "@/components/ui/HowItWorks";
// Fetch from API instead of static JSON

// Dynamically import the map component to avoid SSR issues
const OpenLayersMap = dynamic(() => import("@/components/map/OpenLayersMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function PopulationDensityAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const router = useRouter();

  // Load analysis from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/population-zones", { cache: "no-store" });
        const j = await res.json();
        setAnalysisResults(j.populationDensityAnalysis);
      } catch {}
    })();
  }, []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch("/api/population-zones", { cache: "no-store" });
      const j = await res.json();
      setAnalysisResults(j.populationDensityAnalysis);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                <svg
                  className="h-5 w-5 text-white"
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
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Nufüs Yoğunluğu Analizi
              </h1>
            </div>

            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="rounded-md bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? "Analiz Yapılıyor..." : "Analizi Başlat"}
            </button>
          </div>
        </div>
        {/* HowTo button moved to main content top-right */}
      </header>

      {/* Main Content */}
      <main className="mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* HowTo at the very top, aligned right */}
          <div className="relative mb-2 h-10">
            <HowItWorks
              title="Nüfus Yoğunluğu"
              howToUseText="Hasarlı alanlarda nüfus tahmini modülü, afet sonrasında etkilenen bölgelerde yaşayan kişi sayısını doğru ve güncel bir şekilde tahmin etmek için kullanılır. Uydu, İHA görüntüleri ve saha raporlarından elde edilen hasarlı alan verileri ile resmi bina ve nüfus kayıtları birleştirilir. Böylece yalnızca kayıtlı nüfus değil, aynı zamanda AAIA sistemi üzerinden modemlere bağlı cihaz sayısı da hesaba katılarak anlık nüfus yoğunluğu ortaya çıkarılır. Bu sayede hem resmî veriler hem de gerçek zamanlı cihaz verileri birlikte değerlendirilir ve afet yönetimi, güvenli alan planlaması ve tahliye kararları için kritik bir altyapı sağlanır."
              howItWorksText="Sistem, önce uydu veya İHA görüntülerinden elde edilen hasarlı alan poligonlarını çıkarır. Bu poligonlar CBS (Coğrafi Bilgi Sistemleri) üzerinde bina poligonlarıyla çakıştırılır. Her bina için kayıtlı nüfus (MAKS verisi) ve AAIA’dan gelen cihaz verileri eşleştirilir. Daha sonra cihaz sayıları kişi tahminine dönüştürülür ve kayıtlı nüfus ile ağırlıklı ortalama alınarak gerçekçi bir nüfus değeri hesaplanır. Eğer bina hasarlı alanla kısmen kesişiyorsa, kesişim oranına göre katkı payı belirlenir. Son aşamada tüm binalardan gelen katkılar toplanarak bölge nüfusu ve yoğunluğu (kişi/ha, kişi/km²) bulunur. Sonuçlar harita üzerinde gösterilir ve hem kayıtlı nüfus hem de anlık nüfus yan yana karşılaştırmalı olarak sunulur."
              ariaLabel="Nüfus yoğunluğu nasıl çalışır"
            />
          </div>

          {/* Analysis Description */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Analiz Hakkında
              </h2>
              <p className="text-gray-600">
                Bu analiz, tehlike bölgelerindeki nufüs yoğunluğunu hesaplayarak
                risk değerlendirmesi yapar. Demographic veriler ve coğrafi
                bilgiler kullanılarak en yüksek risk taşıyan bölgeler
                belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Analiz Durumu
              </h2>

              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  <span className="text-purple-600">
                    Nufüs verileri analiz ediliyor...
                  </span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">Henüz analiz başlatılmadı</p>
                  <p className="text-sm text-gray-400">
                    Analizi başlatmak için yukarıdaki butona tıklayın
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Analiz Sonuçları
              </h2>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {analysisResults
                      ? analysisResults.summary.totalPopulation.toLocaleString()
                      : "-"}
                  </div>
                  <div className="text-sm font-medium text-purple-700">
                    Toplam Nüfus
                  </div>
                  <div className="text-xs text-purple-600">Risk bölgesinde</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {analysisResults
                      ? analysisResults.summary.averageDensity
                      : "-"}
                  </div>
                  <div className="text-sm font-medium text-purple-700">
                    Ortalama Yoğunluk
                  </div>
                  <div className="text-xs text-purple-600">Kişi/km²</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {analysisResults ? analysisResults.summary.riskScore : "-"}
                  </div>
                  <div className="text-sm font-medium text-purple-700">
                    Risk Skoru
                  </div>
                  <div className="text-xs text-purple-600">1-10 arası</div>
                </div>
              </div>

              {/* New summary cards using DB-backed analysis data */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Evacuation Capacity */}
                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                  <div className="mb-1 text-sm font-medium text-gray-600">
                    Tahliye Kapasitesi
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analysisResults
                        ? analysisResults.riskAssessment.evacuationCapacity.currentCapacity.toLocaleString()
                        : "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Gereken: {analysisResults
                        ? analysisResults.riskAssessment.evacuationCapacity.requiredCapacity.toLocaleString()
                        : "-"}
                    </div>
                  </div>
                  {analysisResults && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={
                        analysisResults.riskAssessment.evacuationCapacity.deficit > 0
                          ? "font-medium text-red-600"
                          : "font-medium text-green-700"
                      }>
                        {analysisResults.riskAssessment.evacuationCapacity.deficit > 0
                          ? `Eksik: ${analysisResults.riskAssessment.evacuationCapacity.deficit.toLocaleString()}`
                          : "Karşılanıyor"}
                      </span>
                      <span className="text-gray-500">
                        {analysisResults.riskAssessment.evacuationCapacity.evacuationTime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Min/Max Density */}
                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                  <div className="mb-1 text-sm font-medium text-gray-600">Yoğunluk (Min/Max)</div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analysisResults ? analysisResults.summary.minDensity : "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Max: {analysisResults ? analysisResults.summary.maxDensity : "-"}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Birim: kişi/km²</div>
                </div>

                {/* Latest Update */}
                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                  <div className="mb-1 text-sm font-medium text-gray-600">Son Güncelleme</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {analysisResults?.metadata?.latestUpdate
                      ? new Date(analysisResults.metadata.latestUpdate).toLocaleString()
                      : "-"}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Veri kaynağı: COMBINED_DB
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="mb-6  overflow-hidden rounded-lg">
                <OpenLayersMap showPopulationData={true} />
              </div>

              {/* Analysis Results Details */}
              {analysisResults && (
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Risk Assessment */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="text-md mb-3 font-medium text-gray-900">
                      Risk Değerlendirmesi
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-red-100 p-3">
                        <span className="font-medium text-red-800">
                          Yüksek Risk
                        </span>
                        <span className="text-xl font-bold text-red-600">
                          {
                            analysisResults.populationData.filter(
                              (zone: any) => zone.riskLevel === "high",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-yellow-100 p-3">
                        <span className="font-medium text-yellow-800">
                          Orta Risk
                        </span>
                        <span className="text-xl font-bold text-yellow-600">
                          {
                            analysisResults.populationData.filter(
                              (zone: any) => zone.riskLevel === "medium",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-green-100 p-3">
                        <span className="font-medium text-green-800">
                          Düşük Risk
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {
                            analysisResults.populationData.filter(
                              (zone: any) => zone.riskLevel === "low",
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Demographics Summary */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="text-md mb-3 font-medium text-gray-900">
                      Demografik Özet
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ortalama Yaş:</span>
                        <span className="font-semibold">
                          {Math.round(
                            analysisResults.populationData.reduce(
                              (acc: number, zone: any) =>
                                acc + (zone.demographics?.averageAge || 0),
                              0,
                            ) / analysisResults.populationData.length,
                          )}{" "}
                          yaş
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Çocuk Nüfusu:</span>
                        <span className="font-semibold">
                          {Math.round(
                            analysisResults.populationData.reduce(
                              (acc: number, zone: any) =>
                                acc + (zone.demographics?.children || 0),
                              0,
                            ) / analysisResults.populationData.length,
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yaşlı Nüfusu:</span>
                        <span className="font-semibold">
                          {Math.round(
                            analysisResults.populationData.reduce(
                              (acc: number, zone: any) =>
                                acc + (zone.demographics?.elderly || 0),
                              0,
                            ) / analysisResults.populationData.length,
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engelli Nüfusu:</span>
                        <span className="font-semibold">
                          {Math.round(
                            analysisResults.populationData.reduce(
                              (acc: number, zone: any) =>
                                acc + (zone.demographics?.disabled || 0),
                              0,
                            ) / analysisResults.populationData.length,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Data Table */}
              {analysisResults ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="text-md mb-3 font-medium text-gray-900">
                    Bölge Detayları
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Bölge
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Nüfus
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Yoğunluk
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Risk
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analysisResults.populationData.map(
                          (zone: any, index: number) => (
                            <tr
                              key={index}
                              className="bg-white hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 font-medium">
                                {zone.name}
                              </td>
                              <td className="px-4 py-2">
                                {zone.population.toLocaleString()}
                              </td>
                              <td className="px-4 py-2">{zone.density}/km²</td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    zone.riskLevel === "high"
                                      ? "bg-red-100 text-red-800"
                                      : zone.riskLevel === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {zone.riskLevel === "high"
                                    ? "Yüksek"
                                    : zone.riskLevel === "medium"
                                      ? "Orta"
                                      : "Düşük"}
                                </span>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="text-md mb-3 font-medium text-gray-900">
                    Detaylı Veriler
                  </h3>
                  <div className="py-8 text-center text-gray-500">
                    <p>Analiz sonuçları burada görüntülenecek</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
