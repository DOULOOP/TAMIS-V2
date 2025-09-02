'use client';

import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import 'ol/ol.css';

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

interface SafeZoneMapProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  onMapReady?: (map: Map) => void;
  showSafeZones?: boolean;
  onZoneSelect?: (zone: SafeZone) => void;
}

export default function SafeZoneMap({ 
  height = '100%', 
  center = [36.150837, 36.209898],
  zoom = 15,
  onMapReady,
  showSafeZones = true,
  onZoneSelect
}: SafeZoneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);

  const safeZones: SafeZone[] = [
    {
      id: 'sz1',
      name: 'Merkez İlkokulu Bahçesi',
      coord: [36.147000, 36.206000],
      capacity: 500,
      currentOccupancy: 120,
      type: 'school',
      facilities: ['Su', 'Elektrik', 'Tuvalet', 'İlk Yardım'],
      safetyScore: 9.2
    },
    {
      id: 'sz2', 
      name: 'Atatürk Parkı',
      coord: [36.154000, 36.212000],
      capacity: 800,
      currentOccupancy: 450,
      type: 'park',
      facilities: ['Su', 'Elektrik', 'Çeşme'],
      safetyScore: 8.7
    },
    {
      id: 'sz3',
      name: 'Spor Stadyumu',
      coord: [36.151000, 36.204000],
      capacity: 2000,
      currentOccupancy: 1200,
      type: 'stadium',
      facilities: ['Su', 'Elektrik', 'Tuvalet', 'İlk Yardım', 'Kapalı Alan'],
      safetyScore: 9.8
    },
    {
      id: 'sz4',
      name: 'Cumhuriyet Meydanı',
      coord: [36.159000, 36.208000],
      capacity: 1000,
      currentOccupancy: 300,
      type: 'plaza',
      facilities: ['Su', 'Elektrik'],
      safetyScore: 8.1
    },
    {
      id: 'sz5',
      name: 'Belediye Parkı',
      coord: [36.145000, 36.213000],
      capacity: 600,
      currentOccupancy: 520,
      type: 'park',
      facilities: ['Su', 'Çeşme'],
      safetyScore: 7.9
    }
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    // Create base layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Create vector layer for safe zones
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create map instance
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: transform(center, 'EPSG:4326', 'EPSG:3857'),
        zoom: zoom,
      }),
    });

    mapInstanceRef.current = map;

    // Add click handler for zone selection
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return feature;
      });
      
      if (feature && feature.get('zone')) {
        const zone = feature.get('zone') as SafeZone;
        setSelectedZone(zone);
        if (onZoneSelect) {
          onZoneSelect(zone);
        }
      }
    });

    // Add safe zones if requested
    if (showSafeZones) {
      addSafeZones(vectorSource);
    }

    // Call onMapReady callback
    if (onMapReady) {
      onMapReady(map);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onMapReady, showSafeZones, onZoneSelect]);

  const getZoneColor = (zone: SafeZone) => {
    const occupancyRate = zone.currentOccupancy / zone.capacity;
    
    if (occupancyRate < 0.3) return '#10b981'; // Green - Low occupancy
    if (occupancyRate < 0.7) return '#f59e0b'; // Orange - Medium occupancy  
    return '#ef4444'; // Red - High occupancy
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'school': return '🏫';
      case 'park': return '🌳';
      case 'stadium': return '🏟️';
      case 'plaza': return '🏛️';
      default: return '📍';
    }
  };

  const addSafeZones = (vectorSource: VectorSource) => {
    // Add boundary rectangle first
    const swCorner: [number, number] = [36.136884, 36.200889];
    const neCorner: [number, number] = [36.164790, 36.218908];
    
    const boundaryCoords: number[][][] = [
      [
        [swCorner[0], swCorner[1]], // SW
        [neCorner[0], swCorner[1]], // SE
        [neCorner[0], neCorner[1]], // NE
        [swCorner[0], neCorner[1]], // NW
        [swCorner[0], swCorner[1]], // Close polygon
      ]
    ];

    const boundaryGeometry = new Polygon(boundaryCoords);
    boundaryGeometry.transform('EPSG:4326', 'EPSG:3857');
    
    const boundaryFeature = new Feature({
      geometry: boundaryGeometry,
      name: 'Analysis Boundary',
      type: 'boundary'
    });

    boundaryFeature.setStyle(
      new Style({
        fill: new Fill({
          color: 'rgba(59, 130, 246, 0.1)', // Light blue fill
        }),
        stroke: new Stroke({
          color: '#3b82f6', // Blue border
          width: 3,
        }),
      })
    );

    vectorSource.addFeature(boundaryFeature);

    // Add safe zones
    safeZones.forEach(zone => {
      const centerCoord = transform(zone.coord, 'EPSG:4326', 'EPSG:3857') as [number, number];
      const occupancyRate = zone.currentOccupancy / zone.capacity;
      
      // Create coverage area (circle showing zone influence)
      const radius = Math.sqrt(zone.capacity) * 2; // Scale radius based on capacity
      const coverageFeature = new Feature({
        geometry: new Circle(centerCoord, radius),
        zone: zone,
        type: 'coverage'
      });

      const zoneColor = getZoneColor(zone);
      
      coverageFeature.setStyle(
        new Style({
          fill: new Fill({
            color: `${zoneColor}30`, // 30 = ~0.2 alpha in hex
          }),
          stroke: new Stroke({
            color: zoneColor,
            width: 2,
            lineDash: [5, 5]
          }),
        })
      );

      // Create main zone marker
      const zoneFeature = new Feature({
        geometry: new Point(centerCoord),
        zone: zone,
        type: 'zone'
      });

      zoneFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 15,
            fill: new Fill({
              color: zoneColor,
            }),
            stroke: new Stroke({
              color: 'white',
              width: 3,
            }),
          }),
          text: new Text({
            text: getZoneIcon(zone.type),
            font: '16px sans-serif',
            fill: new Fill({
              color: 'white',
            }),
          }),
        })
      );

      // Create occupancy indicator
      const occupancyFeature = new Feature({
        geometry: new Point([centerCoord[0], centerCoord[1] + 150]),
        zone: zone,
        type: 'occupancy'
      });

      const occupancyPercentage = Math.round(occupancyRate * 100);
      
      occupancyFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.9)',
            }),
            stroke: new Stroke({
              color: zoneColor,
              width: 2,
            }),
          }),
          text: new Text({
            text: `${occupancyPercentage}%`,
            font: 'bold 10px sans-serif',
            fill: new Fill({
              color: zoneColor,
            }),
          }),
        })
      );

      vectorSource.addFeatures([coverageFeature, zoneFeature, occupancyFeature]);
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 overflow-hidden"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Doluluk Oranı</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Düşük (0-30%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Orta (30-70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Yüksek (70%+)</span>
          </div>
        </div>
      </div>

      {/* Zone Info Panel */}
      {selectedZone && (
        <div className="absolute top-4 right-4 bg-white shadow-xl rounded-lg p-4 border border-gray-200 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{selectedZone.name}</h3>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Occupancy Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Doluluk Durumu</span>
                <span className={`text-sm font-bold ${
                  selectedZone.currentOccupancy / selectedZone.capacity < 0.7 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {Math.round((selectedZone.currentOccupancy / selectedZone.capacity) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    selectedZone.currentOccupancy / selectedZone.capacity < 0.3 
                      ? 'bg-green-500' 
                      : selectedZone.currentOccupancy / selectedZone.capacity < 0.7 
                      ? 'bg-orange-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${(selectedZone.currentOccupancy / selectedZone.capacity) * 100}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{selectedZone.currentOccupancy} kişi</span>
                <span>Kapasite: {selectedZone.capacity}</span>
              </div>
            </div>

            {/* Safety Score */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Güvenlik Skoru</span>
              <span className="text-sm font-bold text-emerald-600">
                {selectedZone.safetyScore}/10
              </span>
            </div>

            {/* Facilities */}
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Mevcut Olanaklar</span>
              <div className="flex flex-wrap gap-1">
                {selectedZone.facilities.map(facility => (
                  <span 
                    key={facility}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            {/* Available Space */}
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-sm">
                <div className="font-medium text-emerald-800">
                  Ek Kapasite: {selectedZone.capacity - selectedZone.currentOccupancy} kişi
                </div>
                <div className="text-emerald-600 text-xs mt-1">
                  {selectedZone.currentOccupancy / selectedZone.capacity < 0.9 
                    ? 'Ek kişiler kabul edilebilir' 
                    : 'Kapasite neredeyse dolu'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
