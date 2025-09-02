'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { aidRouteData } from '@/data';

export default function AidRouteAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const router = useRouter();

  // Get data from JSON
  const { aidRouteAnalysis } = aidRouteData;

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis with actual data
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResults(aidRouteAnalysis);
    }, 3000);
  };

  useEffect(() => {
    // Auto-load results for demo
    setAnalysisResults(aidRouteAnalysis);
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
              <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Yardım Rotası Analizi
              </h1>
            </div>
            
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                Bu analiz, acil durum ekipleri için en optimal yardım rotalarını hesaplar ve önerir. 
                Trafik verisi, yol durumu, tehlike konumları ve ekip konumları dikkate alınarak en hızlı ulaşım rotaları belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Durumu</h2>
              
              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
                  <span className="text-orange-600">Optimal rotalar hesaplanıyor...</span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Henüz analiz başlatılmadı</p>
                  <p className="text-sm text-gray-400">Analizi başlatmak için yukarıdaki butona tıklayın</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Parameters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Parametreleri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ekip Türü
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                    <option>İtfaiye Ekibi</option>
                    <option>Sağlık Ekibi</option>
                    <option>Arama Kurtarma</option>
                    <option>Polis Ekibi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik Kriteri
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                    <option>En hızlı rota</option>
                    <option>En güvenli rota</option>
                    <option>En kısa mesafe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trafik Verisi
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                    <option>Canlı trafik</option>
                    <option>Geçmiş veriler</option>
                    <option>Trafik göz ardı et</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternatif Rota Sayısı
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    defaultValue={3}
                    min={1}
                    max={5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.routes?.length || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Optimal Rotalar</div>
                  <div className="text-xs text-orange-600">Hesaplanan rota sayısı</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.averageTime || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Ortalama Süre</div>
                  <div className="text-xs text-orange-600">Saat</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.averageDistance || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Toplam Mesafe</div>
                  <div className="text-xs text-orange-600">Kilometre</div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Yardım Rotaları Haritası</p>
                  <p className="text-sm text-gray-400">Analiz sonrası görüntülenecek</p>
                </div>
              </div>

              {/* Route Details */}
              {analysisResults ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Rota Detayları</h3>
                  <div className="space-y-4">
                    {analysisResults.routes.map((route: any) => (
                      <div key={route.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">{route.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Mesafe: {route.distance}km</span>
                              <span>Süre: {route.estimatedTime} saat</span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                route.status === 'active' ? 'bg-green-100 text-green-800' :
                                route.status === 'blocked' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {route.status === 'active' ? 'Aktif' :
                                 route.status === 'blocked' ? 'Kapalı' : 'Kısıtlı'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {route.vehicles.length} Araç
                            </div>
                          </div>
                        </div>

                        {/* Supplies Summary */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Taşınan Malzemeler:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {route.supplies.map((supply: any, index: number) => (
                              <div key={index} className="text-sm bg-gray-100 rounded px-2 py-1">
                                <span className="font-medium capitalize">{supply.type.replace('_', ' ')}: </span>
                                <span>{supply.amount} {supply.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Vehicles */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Araçlar:</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.vehicles.map((vehicle: any) => (
                              <span 
                                key={vehicle.id}
                                className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                                  vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {vehicle.type} ({vehicle.plate})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Checkpoints */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Kontrol Noktaları:</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.checkpoints.map((checkpoint: any) => (
                              <span 
                                key={checkpoint.id}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  checkpoint.status === 'clear' ? 'bg-green-100 text-green-800' :
                                  checkpoint.status === 'congested' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {checkpoint.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Rota Detayları</h3>
                  <div className="text-center text-gray-500 py-8">
                    <p>Hesaplanan rotalar ve detayları burada görüntülenecek</p>
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
