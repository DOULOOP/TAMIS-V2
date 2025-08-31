'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PopulationDensityAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const router = useRouter();

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // TODO: Implement actual analysis logic
    setTimeout(() => {
      setIsAnalyzing(false);
      // TODO: Set real analysis results
    }, 3000);
  };

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

          {/* Analysis Parameters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Parametreleri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analiz Yarıçapı (km)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    defaultValue={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Nufüs Eşiği
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    defaultValue={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veri Kaynağı
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500">
                    <option>TÜİK Verileri</option>
                    <option>Mahalli İdare Verileri</option>
                    <option>Kombine Veriler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Güncellik
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500">
                    <option>Son 1 yıl</option>
                    <option>Son 5 yıl</option>
                    <option>Tüm veriler</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section (Template) */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">-</div>
                  <div className="text-sm text-purple-700 font-medium">Toplam Nufüs</div>
                  <div className="text-xs text-purple-600">Risk bölgesinde</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">-</div>
                  <div className="text-sm text-purple-700 font-medium">Yoğunluk</div>
                  <div className="text-xs text-purple-600">Kişi/km²</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">-</div>
                  <div className="text-sm text-purple-700 font-medium">Risk Skoru</div>
                  <div className="text-xs text-purple-600">1-10 arası</div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-500">Nufüs Yoğunluğu Haritası</p>
                  <p className="text-sm text-gray-400">Analiz sonrası görüntülenecek</p>
                </div>
              </div>

              {/* Data Table Placeholder */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Detaylı Veriler</h3>
                <div className="text-center text-gray-500 py-8">
                  <p>Analiz sonuçları burada görüntülenecek</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
