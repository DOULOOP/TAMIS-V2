'use client';

import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';

// OpenLayers imports
let Map: any, View: any, TileLayer: any, OSM: any, VectorLayer: any, VectorSource: any;
let Feature: any, Point: any, Style: any, Icon: any, Text: any, Fill: any, Stroke: any;
let fromLonLat: any;

interface Personnel {
  id: string;
  name: string;
  role: string;
  certification: string;
  experience: string;
  contact: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  condition: string;
  lastMaintenance: string;
}

interface FieldUnitDetails {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: 'active' | 'reporting' | 'inactive' | 'emergency';
  lastReport: string;
  dataCount: number;
  areasCovered: string[];
  batteryLevel: number;
  signalStrength: number;
  teamLeader: string;
  establishedTime: string;
  missionType: string;
  personnel: Personnel[];
  equipment: Equipment[];
  communications: {
    radio: string;
    satellite: string;
    cellular: string;
  };
  vehicle: {
    type: string;
    plateNumber: string;
    fuelLevel: number;
    condition: string;
  };
}

interface FieldUnitsMapProps {
  fieldUnits: FieldUnitDetails[];
  selectedUnit: FieldUnitDetails | null;
  onUnitSelect: (unit: FieldUnitDetails) => void;
}

const FieldUnitsMap = ({ fieldUnits, selectedUnit, onUnitSelect }: FieldUnitsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const vectorSourceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load OpenLayers dynamically
  useEffect(() => {
    const loadOpenLayers = async () => {
      try {
        const ol = await import('ol');
        const olView = await import('ol/View');
        const olTileLayer = await import('ol/layer/Tile');
        const olOSM = await import('ol/source/OSM');
        const olVectorLayer = await import('ol/layer/Vector');
        const olVectorSource = await import('ol/source/Vector');
        const olFeature = await import('ol/Feature');
        const olPoint = await import('ol/geom/Point');
        const olStyle = await import('ol/style/Style');
        const olIcon = await import('ol/style/Icon');
        const olText = await import('ol/style/Text');
        const olFill = await import('ol/style/Fill');
        const olStroke = await import('ol/style/Stroke');
        const olProj = await import('ol/proj');

        Map = ol.Map;
        View = olView.default;
        TileLayer = olTileLayer.default;
        OSM = olOSM.default;
        VectorLayer = olVectorLayer.default;
        VectorSource = olVectorSource.default;
        Feature = olFeature.default;
        Point = olPoint.default;
        Style = olStyle.default;
        Icon = olIcon.default;
        Text = olText.default;
        Fill = olFill.default;
        Stroke = olStroke.default;
        fromLonLat = olProj.fromLonLat;

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading OpenLayers:', error);
      }
    };

    loadOpenLayers();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Create vector source for field units
    vectorSourceRef.current = new VectorSource();

    // Create the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: vectorSourceRef.current,
        })
      ],
      view: new View({
        center: fromLonLat([36.206, 36.150]), // Center on Hatay area
        zoom: 13
      })
    });

    mapInstanceRef.current = map;

    // Add click interaction
    map.on('click', (event: any) => {
      map.forEachFeatureAtPixel(event.pixel, (feature: any) => {
        const unitId = feature.get('unitId');
        if (unitId) {
          const unit = fieldUnits.find(u => u.id === unitId);
          if (unit) {
            onUnitSelect(unit);
          }
        }
      });
    });

    return () => {
      map.setTarget();
    };
  }, [isLoaded, fieldUnits, onUnitSelect]);

  // Update field unit markers
  useEffect(() => {
    if (!isLoaded || !vectorSourceRef.current) return;

    // Clear existing features
    vectorSourceRef.current.clear();

    // Add field unit markers
    fieldUnits.forEach(unit => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([unit.coordinates[0], unit.coordinates[1]])),
        unitId: unit.id,
        unitData: unit
      });

      // Get status colors
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'active': return '#10b981'; // green
          case 'reporting': return '#3b82f6'; // blue
          case 'inactive': return '#ef4444'; // red
          case 'emergency': return '#f59e0b'; // orange
          default: return '#6b7280'; // gray
        }
      };

      const isSelected = selectedUnit?.id === unit.id;
      const statusColor = getStatusColor(unit.status);

      // Create marker style
      const markerStyle = new Style({
        image: new Icon({
          src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" fill="${statusColor}" stroke="${isSelected ? '#1f2937' : '#ffffff'}" stroke-width="${isSelected ? '3' : '2'}"/>
              <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">📡</text>
            </svg>
          `),
          scale: isSelected ? 1.2 : 1.0
        }),
        text: new Text({
          text: unit.name,
          offsetY: -35,
          font: 'bold 12px Arial',
          fill: new Fill({
            color: '#1f2937'
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 3
          })
        })
      });

      feature.setStyle(markerStyle);
      vectorSourceRef.current.addFeature(feature);
    });
  }, [isLoaded, fieldUnits, selectedUnit]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-gray-600">Harita yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 text-xs">
        <h4 className="font-semibold text-gray-800 mb-2">Durum Göstergeleri</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Aktif</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Raporluyor</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Pasif</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Acil Durum</span>
          </div>
        </div>
      </div>

      {/* Selected Unit Quick Info */}
      {selectedUnit && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{selectedUnit.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs ${
              selectedUnit.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedUnit.status === 'reporting' ? 'bg-blue-100 text-blue-800' :
              selectedUnit.status === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedUnit.status === 'active' ? 'Aktif' : 
               selectedUnit.status === 'reporting' ? 'Raporluyor' : 'Pasif'}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Takım Lideri:</strong> {selectedUnit.teamLeader}</div>
            <div><strong>Görev:</strong> {selectedUnit.missionType}</div>
            <div><strong>Personel:</strong> {selectedUnit.personnel.length} kişi</div>
            <div><strong>Ekipman:</strong> {selectedUnit.equipment.length} adet</div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <span className="flex items-center">
                🔋 {selectedUnit.batteryLevel}%
              </span>
              <span className="flex items-center">
                📶 {selectedUnit.signalStrength}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldUnitsMap;
