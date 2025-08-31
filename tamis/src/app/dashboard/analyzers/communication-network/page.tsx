'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunicationNetworkAnalyzer() {
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
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                İletişim Ağı Modem Versi Analizi
              </h1>
            </div>
            
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{isAnalyzing ? 'Analiz Yapılıyor...' : 'Analizi Başlat'}</span>
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
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3">
                  Kritik Altyapı
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Otomatik İzleme
                </span>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Analiz Hakkında</h2>
              <p className="text-gray-600">
                Bu analiz, afet durumlarında kritik iletişim altyapısının modem versiyonlarını analiz eder ve uyumluluk kontrolü yapar. 
                Firmware güncellik durumu, güvenlik açıkları ve performans metrikleri değerlendirilerek sistem güvenilirliği belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Durumu</h2>
              
              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                  <span className="text-indigo-600">Modem versiyonları taranıyor...</span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
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
                    Modem Tipi
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Tüm modemler</option>
                    <option>4G LTE Modemler</option>
                    <option>5G Modemler</option>
                    <option>Satelit Modemler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bölge Filtresi
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Tüm bölgeler</option>
                    <option>Kritik bölgeler</option>
                    <option>Afet bölgeleri</option>
                    <option>İdari merkez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firmware Kontrolü
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Detaylı kontrol</option>
                    <option>Hızlı tarama</option>
                    <option>Sadece güncellik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Güvenlik Analizi
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Tam güvenlik taraması</option>
                    <option>Kritik açıklar</option>
                    <option>Temel kontrol</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section (Template) */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">-</div>
                  <div className="text-sm text-indigo-700 font-medium">Aktif Modem</div>
                  <div className="text-xs text-indigo-600">Toplam cihaz sayısı</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">-</div>
                  <div className="text-sm text-indigo-700 font-medium">Güncel Versiyon</div>
                  <div className="text-xs text-indigo-600">En son firmware</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">-%</div>
                  <div className="text-sm text-indigo-700 font-medium">Uyumluluk</div>
                  <div className="text-xs text-indigo-600">Uyumlu cihazlar</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">-</div>
                  <div className="text-sm text-indigo-700 font-medium">Risk Seviyesi</div>
                  <div className="text-xs text-indigo-600">Genel değerlendirme</div>
                </div>
              </div>
              
              {/* Network Status Chart Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">İletişim Ağı Durumu Grafiği</p>
                  <p className="text-sm text-gray-400">Analiz sonrası görüntülenecek</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Details Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cihaz Detayları</h2>
              
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4 mb-4">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Tüm Durumlar</option>
                  <option>Güncel</option>
                  <option>Güncellenecek</option>
                  <option>Kritik Risk</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Tüm Markalar</option>
                  <option>Huawei</option>
                  <option>Cisco</option>
                  <option>Ericsson</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Cihaz ara..."
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              {/* Table Placeholder */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-500 py-8">
                  <p>Cihaz listesi ve detayları burada görüntülenecek</p>
                  <p className="text-sm text-gray-400">Tablo: Cihaz ID, Model, Firmware, Durum, Son Güncelleme</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
