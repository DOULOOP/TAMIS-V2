'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { populationDensityData } from '@/data';

// Dynamically import the map component to avoid SSR issues
const OpenLayersMap = dynamic(() => import('@/components/map/OpenLayersMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function PopulationDensityAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const router = useRouter();

  // Get data from JSON
  const { populationDensityAnalysis } = populationDensityData;

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis with actual data
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResults(populationDensityAnalysis);
    }, 3000);
  };

  useEffect(() => {
    // Auto-load results for demo
    setAnalysisResults(populationDensityAnalysis);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Nufüs Yoğunluğu Analizi
              </h1>
            </div>
            
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analiz Yapılıyor...' : 'Analizi Başlat'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Analysis Description */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Analiz Hakkında</h2>
              <p className="text-gray-600">
                Bu analiz, tehlike bölgelerindeki nufüs yoğunluğunu hesaplayarak risk değerlendirmesi yapar. 
                Demographic veriler ve coğrafi bilgiler kullanılarak en yüksek risk taşıyan bölgeler belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Durumu</h2>
              
              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-purple-600">Nufüs verileri analiz ediliyor...</span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Henüz analiz başlatılmadı</p>
                  <p className="text-sm text-gray-400">Analizi başlatmak için yukarıdaki butona tıklayın</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {analysisResults ? analysisResults.summary.totalPopulation.toLocaleString() : '-'}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Toplam Nüfus</div>
                  <div className="text-xs text-purple-600">Risk bölgesinde</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {analysisResults ? analysisResults.summary.averageDensity : '-'}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Ortalama Yoğunluk</div>
                  <div className="text-xs text-purple-600">Kişi/km²</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {analysisResults ? analysisResults.summary.riskScore : '-'}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Risk Skoru</div>
                  <div className="text-xs text-purple-600">1-10 arası</div>
                </div>
              </div>
              
              {/* Map Section */}
              <div className="rounded-lg overflow-hidden mb-6 aspect-square">
                <OpenLayersMap showPopulationData={true} />
              </div>

              {/* Analysis Results Details */}
              {analysisResults && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Risk Assessment */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Risk Değerlendirmesi</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                        <span className="font-medium text-red-800">Yüksek Risk</span>
                        <span className="text-xl font-bold text-red-600">
                          {analysisResults.populationData.filter((zone: any) => zone.riskLevel === 'high').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg">
                        <span className="font-medium text-yellow-800">Orta Risk</span>
                        <span className="text-xl font-bold text-yellow-600">
                          {analysisResults.populationData.filter((zone: any) => zone.riskLevel === 'medium').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                        <span className="font-medium text-green-800">Düşük Risk</span>
                        <span className="text-xl font-bold text-green-600">
                          {analysisResults.populationData.filter((zone: any) => zone.riskLevel === 'low').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Demographics Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Demografik Özet</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ortalama Yaş:</span>
                        <span className="font-semibold">
                          {Math.round(analysisResults.populationData.reduce((acc: number, zone: any) => acc + (zone.demographics?.averageAge || 0), 0) / analysisResults.populationData.length)} yaş
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Çocuk Nüfusu:</span>
                        <span className="font-semibold">
                          {Math.round(analysisResults.populationData.reduce((acc: number, zone: any) => acc + (zone.demographics?.children || 0), 0) / analysisResults.populationData.length)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yaşlı Nüfusu:</span>
                        <span className="font-semibold">
                          {Math.round(analysisResults.populationData.reduce((acc: number, zone: any) => acc + (zone.demographics?.elderly || 0), 0) / analysisResults.populationData.length)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engelli Nüfusu:</span>
                        <span className="font-semibold">
                          {Math.round(analysisResults.populationData.reduce((acc: number, zone: any) => acc + (zone.demographics?.disabled || 0), 0) / analysisResults.populationData.length)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Data Table */}
              {analysisResults ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Bölge Detayları</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Bölge</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Nüfus</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Yoğunluk</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analysisResults.populationData.map((zone: any, index: number) => (
                          <tr key={index} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{zone.name}</td>
                            <td className="px-4 py-2">{zone.population.toLocaleString()}</td>
                            <td className="px-4 py-2">{zone.density}/km²</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                zone.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                zone.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {zone.riskLevel === 'high' ? 'Yüksek' : 
                                 zone.riskLevel === 'medium' ? 'Orta' : 
                                 'Düşük'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Detaylı Veriler</h3>
                  <div className="text-center text-gray-500 py-8">
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
