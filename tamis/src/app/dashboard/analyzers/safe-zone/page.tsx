'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SafeZoneAnalyzer() {
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
              <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Güvenli Bölge Analizi
              </h1>
            </div>
            
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                Bu analiz, mevcut tehlikelerden uzak güvenli bölgeleri tespit eder ve kapasitelerini değerlendirir. 
                Coğrafi veriler, altyapı bilgileri ve geçmiş tehlike verileri kullanılarak en uygun güvenli alanlar belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Durumu</h2>
              
              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
                  <span className="text-emerald-600">Güvenli bölgeler taranıyor...</span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
                    Minimum Güvenlik Mesafesi (km)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    defaultValue={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Alan (m²)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    defaultValue={10000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altyapı Gereksinimleri
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option>Su ve elektrik erişimi</option>
                    <option>Sadece su erişimi</option>
                    <option>Temel altyapı yok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ulaşım Kriterleri
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option>Ana yola 5km mesafe</option>
                    <option>Ana yola 10km mesafe</option>
                    <option>Ulaşım önemli değil</option>
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
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">-</div>
                  <div className="text-sm text-emerald-700 font-medium">Güvenli Bölge</div>
                  <div className="text-xs text-emerald-600">Tespit edilen alan sayısı</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">-</div>
                  <div className="text-sm text-emerald-700 font-medium">Toplam Kapasite</div>
                  <div className="text-xs text-emerald-600">Kişi barındırma</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">-</div>
                  <div className="text-sm text-emerald-700 font-medium">Güvenlik Skoru</div>
                  <div className="text-xs text-emerald-600">Ortalama değer</div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500">Güvenli Bölgeler Haritası</p>
                  <p className="text-sm text-gray-400">Analiz sonrası görüntülenecek</p>
                </div>
              </div>

              {/* Safe Zones List Placeholder */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Güvenli Bölgeler Listesi</h3>
                <div className="text-center text-gray-500 py-8">
                  <p>Tespit edilen güvenli bölgeler burada listelenecek</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
