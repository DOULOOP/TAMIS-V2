'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { safeZoneData } from '@/data';

// Dynamically import the map component to avoid SSR issues
const SafeZoneMap = dynamic(() => import('@/components/map/SafeZoneMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

interface SafeZone {
  id: string;
  name: string;
  coord: [number, number];
  capacity: number;
  currentOccupancy: number;
  type: 'school' | 'park' | 'stadium' | 'plaza';
  facilities: string[];
  safetyScore: number;
}

export default function SafeZoneAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);
  const router = useRouter();

  // Get data from JSON
  const { safeZoneAnalysis } = safeZoneData;

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis with actual data
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResults(safeZoneAnalysis);
    }, 3000);
  };

  useEffect(() => {
    // Auto-load results for demo
    setAnalysisResults(safeZoneAnalysis);
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

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Güvenli Bölgeler Analizi</h2>
              
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">
                    {analysisResults?.summary?.totalSafeZones || 0}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Güvenli Bölge</div>
                  <div className="text-xs text-emerald-600">Tespit edilen alan sayısı</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">
                    {analysisResults?.summary?.totalCapacity?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Toplam Kapasite</div>
                  <div className="text-xs text-emerald-600">Kişi barındırma</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">
                    {analysisResults?.summary?.currentOccupancy?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Mevcut Doluluk</div>
                  <div className="text-xs text-emerald-600">Şu anda barınan</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-900">
                    {analysisResults?.summary?.averageAccessTime || 0}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Erişim Süresi</div>
                  <div className="text-xs text-emerald-600">Dakika ortalama</div>
                </div>
              </div>
              
              {/* Interactive Map */}
              <div className="aspect-square mb-6">
                <SafeZoneMap 
                  showSafeZones={true}
                  onZoneSelect={setSelectedZone}
                />
              </div>

              {/* Safe Zones List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-4">Güvenli Bölgeler Listesi</h3>
                <div className="space-y-3">
                  {analysisResults?.safeZones?.map((zone: any) => {
                    const occupancyRate = (zone.currentOccupancy / zone.capacity) * 100;
                    const occupancyColor = occupancyRate < 30 ? 'green' : occupancyRate < 70 ? 'orange' : 'red';
                    
                    return (
                      <div 
                        key={zone.id} 
                        className={`bg-white rounded-lg p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedZone?.id === zone.id 
                            ? 'border-l-emerald-500 bg-emerald-50' 
                            : 'border-l-gray-300'
                        }`}
                        onClick={() => setSelectedZone(zone)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{zone.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Tip: {
                                zone.type === 'school' ? 'Okul' :
                                zone.type === 'park' ? 'Park' :
                                zone.type === 'stadium' ? 'Stadyum' :
                                zone.type === 'plaza' ? 'Meydan' : zone.type
                              }</span>
                              <span>Güvenlik: {zone.safetyScore}/10</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {zone.facilities && Object.entries(zone.facilities)
                                .filter(([_, available]) => available)
                                .map(([facility]) => (
                                <span 
                                  key={facility}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {facility === 'restrooms' ? 'WC' :
                                   facility === 'water' ? 'Su' :
                                   facility === 'electricity' ? 'Elektrik' :
                                   facility === 'shelter' ? 'Barınak' :
                                   facility === 'medical' ? 'Tıbbi' :
                                   facility === 'communication' ? 'İletişim' :
                                   facility === 'parking' ? 'Otopark' : facility}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-gray-900">
                              {zone.currentOccupancy}/{zone.capacity}
                            </div>
                            <div className={`text-sm font-medium ${
                              occupancyColor === 'green' ? 'text-green-600' :
                              occupancyColor === 'orange' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              %{occupancyRate.toFixed(0)} dolu
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  occupancyColor === 'green' ? 'bg-green-500' :
                                  occupancyColor === 'orange' ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${occupancyRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
