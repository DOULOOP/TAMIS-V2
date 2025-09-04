'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Map from 'ol/Map';
import {
  populationDensityData,
  safeZoneData,
  aidRouteData,
  communicationNetworkData,
  fieldUnitsData,
  getSystemSummary,
  getCriticalAlerts
} from '@/data';

// Dynamically import the map component to avoid SSR issues
const MonitoringMap = dynamic(() => import('@/components/map/MonitoringMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Monitoring haritası yükleniyor...</p>
      </div>
    </div>
  ),
});

interface LayerConfig {
  id: string;
  name: string;
  type: 'population' | 'safeZone' | 'aidRoute' | 'communication' | 'fieldUnit';
  enabled: boolean;
  color: string;
  opacity: number;
  icon: string;
}

export default function MonitoringMapPage() {
  const router = useRouter();
  const mapRef = useRef<Map | null>(null);
  
  const [layers, setLayers] = useState<LayerConfig[]>([
    {
      id: 'population',
      name: 'Nüfus Yoğunluğu',
      type: 'population',
      enabled: true,
      color: '#FF6B6B',
      opacity: 0.7,
      icon: '👥'
    },
    {
      id: 'safeZones',
      name: 'Güvenli Bölgeler',
      type: 'safeZone',
      enabled: true,
      color: '#4ECDC4',
      opacity: 0.8,
      icon: '🛡️'
    },
    {
      id: 'aidRoutes',
      name: 'Yardım Rotaları',
      type: 'aidRoute',
      enabled: true,
      color: '#45B7D1',
      opacity: 0.9,
      icon: '🚛'
    },
    {
      id: 'communications',
      name: 'İletişim Ağı',
      type: 'communication',
      enabled: true,
      color: '#F7DC6F',
      opacity: 0.8,
      icon: '📡'
    },
    {
      id: 'fieldUnits',
      name: 'Saha Birimleri',
      type: 'fieldUnit',
      enabled: false,
      color: '#BB8FCE',
      opacity: 0.8,
      icon: '📱'
    }
  ]);

  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    // Load system data
    const summary = getSystemSummary();
    const alerts = getCriticalAlerts();
    setSystemStats(summary);
    setCriticalAlerts(alerts);
  }, []);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, enabled: !layer.enabled }
          : layer
      )
    );
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, opacity }
          : layer
      )
    );
  };

  const enableAllLayers = () => {
    setLayers(prev => prev.map(layer => ({ ...layer, enabled: true })));
  };

  const disableAllLayers = () => {
    setLayers(prev => prev.map(layer => ({ ...layer, enabled: false })));
  };

  const getLayerData = (layerType: LayerConfig['type']) => {
    switch (layerType) {
      case 'population':
        return populationDensityData.populationDensityAnalysis.populationData;
      case 'safeZone':
        return safeZoneData.safeZoneAnalysis.safeZones;
      case 'aidRoute':
        return aidRouteData.aidRouteAnalysis.routes;
      case 'communication':
        return communicationNetworkData.communicationNetworkAnalysis.modemStations;
      case 'fieldUnit':
        return fieldUnitsData.fieldUnitsData.fieldUnits;
      default:
        return [];
    }
  };

  const onMapReady = (map: Map) => {
    mapRef.current = map;
  };

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header Stats */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TAMIS Monitoring Haritası</h1>
            <p className="text-sm text-gray-400">Tüm sistem analitikleri - Gerçek zamanlı izleme</p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            {systemStats && (
              <>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Toplam Nüfus</div>
                  <div className="font-bold text-blue-400">{systemStats.population.totalPopulation.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Güvenli Bölge</div>
                  <div className="font-bold text-green-400">{systemStats.safeZones.totalSafeZones}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Aktif Rotalar</div>
                  <div className="font-bold text-yellow-400">{systemStats.aidRoutes.activeRoutes}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Kritik Uyarılar</div>
                  <div className="font-bold text-red-400">{criticalAlerts.length}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-full">
        {/* Control Panel */}
        <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
          isControlPanelOpen ? 'w-80' : 'w-12'
        } flex flex-col`}>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
            className="p-3 hover:bg-gray-700 transition-colors border-b border-gray-700"
          >
            <svg 
              className={`h-5 w-5 transition-transform ${isControlPanelOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {isControlPanelOpen && (
            <>
              {/* Layer Controls */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">Katmanlar</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={enableAllLayers}
                      className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      Tümü
                    </button>
                    <button
                      onClick={disableAllLayers}
                      className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                    >
                      Hiçbiri
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {layers.map(layer => (
                    <div key={layer.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={layer.enabled}
                            onChange={() => toggleLayer(layer.id)}
                            className="rounded"
                          />
                          <span className="text-lg">{layer.icon}</span>
                          <span className="text-sm font-medium">{layer.name}</span>
                        </div>
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: layer.color }}
                        />
                      </div>
                      
                      {layer.enabled && (
                        <div className="ml-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">Saydamlık:</span>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={layer.opacity}
                              onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-300 w-8">
                              {Math.round(layer.opacity * 100)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {getLayerData(layer.type).length} öğe
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Alerts */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-lg mb-3 text-red-400">
                  Kritik Uyarılar ({criticalAlerts.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {criticalAlerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="bg-red-900/30 border border-red-700 rounded p-2">
                      <div className="flex items-start space-x-2">
                        <div className="text-red-400 mt-0.5">⚠️</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-300">{alert.message}</div>
                          {alert.factors && (
                            <div className="text-xs text-gray-400 mt-1">
                              {alert.factors[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {criticalAlerts.length > 5 && (
                    <div className="text-xs text-gray-400 text-center py-2">
                      +{criticalAlerts.length - 5} daha fazla uyarı
                    </div>
                  )}
                </div>
              </div>

              {/* System Status */}
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg mb-3">Sistem Durumu</h3>
                {systemStats && (
                  <div className="space-y-3">
                    <div className="bg-gray-700/50 rounded p-3">
                      <div className="text-sm font-medium mb-2">Nüfus Analizi</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Risk Skoru:</span>
                          <span className="font-medium">{systemStats.population.riskScore}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kritik Bölge:</span>
                          <span className="font-medium">{systemStats.population.criticalZones}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded p-3">
                      <div className="text-sm font-medium mb-2">Güvenli Bölgeler</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Kapasite:</span>
                          <span className="font-medium">{systemStats.safeZones.totalCapacity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Doluluk:</span>
                          <span className="font-medium">{systemStats.safeZones.occupancyRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/50 rounded p-3">
                      <div className="text-sm font-medium mb-2">İletişim</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Aktif Modem:</span>
                          <span className="font-medium">{systemStats.communications.activeModems}/{systemStats.communications.totalModems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sinyal Gücü:</span>
                          <span className="font-medium">{systemStats.communications.averageSignalStrength}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MonitoringMap
            height="100%"
            center={[36.150837, 36.209898]}
            zoom={13}
            onMapReady={onMapReady}
            layers={layers}
            onFeatureSelect={setSelectedFeature}
            dataMap={{
              population: populationDensityData,
              safeZone: safeZoneData,
              aidRoute: aidRouteData,
              communication: communicationNetworkData,
              fieldUnit: fieldUnitsData
            }}
          />

          {/* Feature Info Panel */}
          {selectedFeature && (
            <div className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm z-20">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Detay Bilgisi</h4>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">İsim:</span>
                  <span className="ml-2 font-medium">{selectedFeature.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Tür:</span>
                  <span className="ml-2 font-medium">{selectedFeature.type}</span>
                </div>
                {selectedFeature.status && (
                  <div>
                    <span className="text-gray-400">Durum:</span>
                    <span className={`ml-2 font-medium ${
                      selectedFeature.status === 'active' ? 'text-green-400' :
                      selectedFeature.status === 'blocked' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedFeature.status}
                    </span>
                  </div>
                )}
                {selectedFeature.capacity && (
                  <div>
                    <span className="text-gray-400">Kapasite:</span>
                    <span className="ml-2 font-medium">{selectedFeature.capacity}</span>
                  </div>
                )}
                {selectedFeature.coordinates && (
                  <div>
                    <span className="text-gray-400">Konum:</span>
                    <span className="ml-2 font-mono text-xs">
                      {selectedFeature.coordinates[0].toFixed(4)}, {selectedFeature.coordinates[1].toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg p-3 z-10">
            <h4 className="font-semibold text-sm mb-2">Harita Göstergesi</h4>
            <div className="space-y-1 text-xs">
              {layers.filter(l => l.enabled).map(layer => (
                <div key={layer.id} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: layer.color }}
                  />
                  <span>{layer.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading overlay */}
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center pointer-events-none z-30" style={{ display: 'none' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Harita verileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
