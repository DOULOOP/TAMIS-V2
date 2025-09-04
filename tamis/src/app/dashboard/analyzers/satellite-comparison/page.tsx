'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SatelliteDamageCompare from '@/components/map/SatelliteDamageCompare';
import HowItWorks from '@/components/ui/HowItWorks';

// Dynamically import the map to avoid SSR issues
const DamageReportMap = dynamic(() => import('@/components/map/DamageReportMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">Harita yükleniyor...</div>
});

interface DamageField {
  field_id: number;
  geometry: {
    compactness: number;
    pixel_coordinates: {
      centroid: [number, number];
      bounds: {
        xmin: number;
        xmax: number;
        ymin: number;
        ymax: number;
      };
    };
    geographic_coordinates?: {
      centroid: [number, number];
      bounds: {
        xmin: number;
        xmax: number;
        ymin: number;
        ymax: number;
      };
    };
  };
  damage_assessment: {
    damage_level: 'minimal' | 'moderate' | 'severe' | 'catastrophic';
    change_percentage: number;
    severity_score: number;
    confidence_level: number;
  };
  shape_analysis?: any;
}

interface AnalysisResults {
  metadata: {
    total_fields: number;
    analysis_timestamp: string;
    analysis_method: string;
    damage_thresholds: {
      minimal: string;
      moderate: string;
      severe: string;
      catastrophic: string;
    };
    field_statistics: {
      damage_distribution: {
        catastrophic: number;
        severe?: number;
        moderate?: number;
        minimal?: number;
      };
    };
  };
  fields: DamageField[];
}

export default function SatelliteComparisonPage() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [selectedField, setSelectedField] = useState<DamageField | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch damage analysis data
  const fetchDamageData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://tamis-v2.onrender.com/api/results/field-analysis', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalysisResults(data);
    } catch (err) {
      console.error('Error fetching damage data:', err);
      setError(err instanceof Error ? err.message : 'Veri alınırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDamageData();
  }, []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 3000));
    await fetchDamageData();
    setIsAnalyzing(false);
  };

  const exportResults = () => {
    if (!analysisResults) return;
    
    const dataStr = JSON.stringify(analysisResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hatay_damage_analysis_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDamageStats = () => {
    if (!analysisResults) return null;
    
    const stats = analysisResults.metadata.field_statistics.damage_distribution;
    const total = analysisResults.metadata.total_fields;
    
    return {
      total,
      catastrophic: stats.catastrophic || 0,
      severe: stats.severe || 0,
      moderate: stats.moderate || 0,
      minimal: stats.minimal || 0,
    };
  };

  const stats = getDamageStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Uydu Görüntü Karşılaştırması</h1>
          <p className="text-gray-600">
            Yapay zeka destekli uydu görüntü analizi ile Hatay bölgesindeki hasar tespiti
          </p>
        </div>

        {/* HowTo at the very top, aligned right under page title */}
        <div className="relative h-10 mb-4">
          <HowItWorks
            title="Uydu Karşılaştırması"
            howToUseText="Analizi başlatın veya verileri yenileyin; harita ve istatistikler üzerinden hasar dağılımını inceleyin."
            howItWorksText="Arka planda şu adımlar uygulanır: (1) Öncesi/sonrası uydu görüntüleri coğrafi olarak hizalanır ve normalize edilir. (2) Değişim tespiti (spektral indeksler ve/veya derin öğrenme) ile hasar olasılık haritası çıkarılır. (3) Alan/parselleme bazında segmentasyon yapılarak her alan için değişim yüzdesi ve şiddet skoru üretilir. (4) Eşik değerlere göre hasar düzeyi (Minimal/Orta/Şiddetli/Felaket) atanır; güven puanı belirsizlik ölçümlerinden türetilir. (5) Sonuçlar PostGIS ile mekânsal olarak birleştirilir ve harita ile istatistik panellerine aktarılır."
            ariaLabel="Uydu karşılaştırması nasıl çalışır"
          />
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`text-lg ${isAnalyzing ? 'animate-spin' : ''}`}>
                  {isAnalyzing ? '🔄' : '▶️'}
                </span>
                <span>{isAnalyzing ? 'Analiz Ediliyor...' : 'Analizi Başlat'}</span>
              </button>
              
              <button
                onClick={fetchDamageData}
                disabled={isLoading}
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`text-lg ${isLoading ? 'animate-spin' : ''}`}>🔄</span>
                <span>Verileri Yenile</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {analysisResults && (
                  <>Analiz Tarihi: {new Date(analysisResults.metadata.analysis_timestamp).toLocaleString('tr-TR')}</>
                )}
              </div>
              <button
                onClick={exportResults}
                disabled={!analysisResults}
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📥</span>
                <span>Sonuçları İndir</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Statistics Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analiz İstatistikleri</h3>
              
              {stats ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Toplam Alan</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-900"></div>
                        <span className="text-sm">Felaket</span>
                      </div>
                      <span className="font-semibold">{stats.catastrophic}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Şiddetli</span>
                      </div>
                      <span className="font-semibold">{stats.severe}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Orta</span>
                      </div>
                      <span className="font-semibold">{stats.moderate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Minimal</span>
                      </div>
                      <span className="font-semibold">{stats.minimal}</span>
                    </div>
                  </div>
                  
                  {/* Damage percentage */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Hasar Dağılımı</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Felaket</span>
                        <span>{((stats.catastrophic / stats.total) * 100).toFixed(1)}%</span>
                      </div>
                      {stats.severe > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Şiddetli</span>
                          <span>{((stats.severe / stats.total) * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Analiz sonuçları yükleniyor...</p>
                </div>
              )}
            </div>

            {/* Analysis Method Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analiz Yöntemi</h3>
              {analysisResults && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Yöntem:</span> 
                    <span className="ml-2">{analysisResults.metadata.analysis_method}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="font-medium mb-2">Hasar Eşikleri:</div>
                    <div className="space-y-1 text-xs">
                      <div>Minimal: {analysisResults.metadata.damage_thresholds.minimal}</div>
                      <div>Orta: {analysisResults.metadata.damage_thresholds.moderate}</div>
                      <div>Şiddetli: {analysisResults.metadata.damage_thresholds.severe}</div>
                      <div>Felaket: {analysisResults.metadata.damage_thresholds.catastrophic}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasar Haritası</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Analiz verileri yükleniyor...</p>
                  </div>
                </div>
              ) : analysisResults ? (
                <DamageReportMap

                />
              ) : (
                <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
                  <p className="text-gray-600">Analiz sonuçları bulunamadı</p>
                </div>
              )}
            </div>

            {/* Field Details */}
            {selectedField && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Seçili Alan Detayları - #{selectedField.field_id}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Hasar Değerlendirmesi</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Hasar Seviyesi:</span>
                        <span className={`font-medium ${
                          selectedField.damage_assessment.damage_level === 'catastrophic' ? 'text-red-900' :
                          selectedField.damage_assessment.damage_level === 'severe' ? 'text-red-500' :
                          selectedField.damage_assessment.damage_level === 'moderate' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {selectedField.damage_assessment.damage_level === 'catastrophic' ? 'Felaket' :
                           selectedField.damage_assessment.damage_level === 'severe' ? 'Şiddetli' :
                           selectedField.damage_assessment.damage_level === 'moderate' ? 'Orta' :
                           'Minimal'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Değişim Oranı:</span>
                        <span>{selectedField.damage_assessment.change_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hasar Skoru:</span>
                        <span>{selectedField.damage_assessment.severity_score.toFixed(1)}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Güven Düzeyi:</span>
                        <span>{selectedField.damage_assessment.confidence_level.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Geometrik Özellikler</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Kompaktlık:</span>
                        <span>{selectedField.geometry.compactness.toFixed(2)}</span>
                      </div>
                      {selectedField.geometry.geographic_coordinates && (
                        <>
                          <div className="flex justify-between">
                            <span>Enlem:</span>
                            <span>{selectedField.geometry.geographic_coordinates.centroid[1].toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Boylam:</span>
                            <span>{selectedField.geometry.geographic_coordinates.centroid[0].toFixed(6)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <SatelliteDamageCompare></SatelliteDamageCompare>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}