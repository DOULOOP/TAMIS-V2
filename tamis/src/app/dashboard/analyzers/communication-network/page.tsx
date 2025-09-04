'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HowItWorks from '@/components/ui/HowItWorks';
// Fetch from API instead of static JSON

export default function CommunicationNetworkAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const router = useRouter();

  // Load data from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/communication-network', { cache: 'no-store' });
        const j = await res.json();
        setAnalysisResults(j.communicationNetworkAnalysis);
      } catch {}
    })();
  }, []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch('/api/communication-network', { cache: 'no-store' });
      const j = await res.json();
      setAnalysisResults(j.communicationNetworkAnalysis);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
  <header className="bg-white shadow relative">
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
        {/* HowTo button moved to main content top-right */}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* HowTo at the very top, aligned right */}
          <div className="relative h-10 mb-2">
            <HowItWorks
              title="İletişim Ağı"
              howToUseText="Analizi başlatın; istasyon tablosu ve özet metriklerden ağ sağlığını izleyin. Filtre ve arama ile cihazları bulun."
              howItWorksText="Sistem modem istasyon verilerini toplayarak durum, sinyal, veri oranı ve ağ yükünü hesaplar; güvenlik ve uyumluluğu raporlar."
              ariaLabel="İletişim ağı nasıl çalışır"
            />
          </div>
          
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

          {/* Parameters removed per request */}

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">
                    {analysisResults?.summary?.totalModems || 0}
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">Aktif Modem</div>
                  <div className="text-xs text-indigo-600">Toplam cihaz sayısı</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">
                    {analysisResults ? analysisResults.modemStations.filter((s: any) => s.status === 'active').length : 0}
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">Online İstasyon</div>
                  <div className="text-xs text-indigo-600">Çalışan durumda</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">
                    {analysisResults?.summary?.networkCoverage || 0}%
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">Ağ Sağlığı</div>
                  <div className="text-xs text-indigo-600">Genel performans</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">
                    {analysisResults?.summary?.averageSignalStrength || 0}
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">Sinyal Gücü</div>
                  <div className="text-xs text-indigo-600">dBm ortalaması</div>
                </div>
              </div>
              
              {/* Network Status Chart */}
              {analysisResults ? (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Ağ İstatistikleri</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                        <span className="font-medium text-green-800">Online</span>
                        <span className="text-xl font-bold text-green-600">
                          {analysisResults.modemStations.filter((s: any) => s.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                        <span className="font-medium text-red-800">Offline</span>
                        <span className="text-xl font-bold text-red-600">
                          {analysisResults.modemStations.filter((s: any) => s.status === 'inactive').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg">
                        <span className="font-medium text-yellow-800">Bakım</span>
                        <span className="text-xl font-bold text-yellow-600">
                          {analysisResults.modemStations.filter((s: any) => s.status === 'maintenance').length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">En İyi Sinyal:</span>
                        <span className="font-semibold text-green-600">
                          {Math.max(...analysisResults.modemStations.map((s: any) => s.signalStrength))} dBm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">En Kötü Sinyal:</span>
                        <span className="font-semibold text-red-600">
                          {Math.min(...analysisResults.modemStations.map((s: any) => s.signalStrength))} dBm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ortalama Veri Oranı:</span>
                        <span className="font-semibold">
                          {Math.round(analysisResults.modemStations.reduce((acc: number, s: any) => acc + s.dataRate, 0) / analysisResults.modemStations.length)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Bağlantı:</span>
                        <span className="font-semibold">
                          {analysisResults.modemStations.reduce((acc: number, s: any) => acc + s.connectedDevices, 0)} cihaz
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ağ Yükü:</span>
                        <span className="font-semibold text-yellow-600">
                          %{Math.round(analysisResults.modemStations.reduce((acc: number, s: any) => acc + s.networkLoad, 0) / analysisResults.modemStations.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Güvenlik Durumu:</span>
                        <span className="font-semibold text-green-600">Güvenli</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500">İletişim Ağı Durumu Grafiği</p>
                    <p className="text-sm text-gray-400">Analiz sonrası görüntülenecek</p>
                  </div>
                </div>
              )}
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
              
              {/* Station Details Table */}
              {analysisResults ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">İstasyon</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Durum</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Sinyal Gücü</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Veri Oranı</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Bağlı Cihaz</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Son Ping</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analysisResults.modemStations.map((station: any) => (
                          <tr key={station.id} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{station.name}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                station.status === 'active' ? 'bg-green-100 text-green-800' :
                                station.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {station.status === 'active' ? 'Aktif' :
                                 station.status === 'inactive' ? 'İnaktif' : 'Bakım'}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`font-medium ${
                                station.signalStrength > 80 ? 'text-green-600' :
                                station.signalStrength > 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {station.signalStrength}%
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`font-medium ${
                                station.dataRate > 90 ? 'text-green-600' :
                                station.dataRate > 70 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {station.dataRate}%
                              </span>
                            </td>
                            <td className="px-4 py-2">{station.connectedDevices}</td>
                            <td className="px-4 py-2 text-gray-500 text-xs">{station.lastPing}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center text-gray-500 py-8">
                    <p>Cihaz listesi ve detayları burada görüntülenecek</p>
                    <p className="text-sm text-gray-400">Tablo: Cihaz ID, Model, Firmware, Durum, Son Güncelleme</p>
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
