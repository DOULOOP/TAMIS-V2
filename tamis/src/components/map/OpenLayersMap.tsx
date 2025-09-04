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
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import 'ol/ol.css';

type DataSource = 'aaia-modem' | 'government' | 'both';

interface OpenLayersMapProps {
  height?: string;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  onMapReady?: (map: Map) => void;
  showPopulationData?: boolean;
}

export default function OpenLayersMap({ 
  height = '100%', 
  center = [36.150837, 36.209898], // Your specified center coordinates
  zoom = 15, // Higher zoom for detailed area view
  onMapReady,
  showPopulationData = true
}: OpenLayersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource>('aaia-modem');
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create base layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Create vector layer for population data
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(147, 51, 234, 0.2)', // Purple with transparency
        }),
        stroke: new Stroke({
          color: '#7c3aed',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#7c3aed',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      }),
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

    // Add sample population data if requested
    if (showPopulationData) {
      addSamplePopulationData(vectorSource, selectedDataSource);
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
  }, [center, zoom, onMapReady, showPopulationData, selectedDataSource]);

  const createSquarePolygon = (coord: [number, number], size: number): Polygon => {
    const centerCoord = transform(coord, 'EPSG:4326', 'EPSG:3857') as [number, number];
    const squareSize = size * 111320; // Convert degrees to meters approximately
    
    const squareCoords: number[][][] = [
      [
        [centerCoord[0] - squareSize, centerCoord[1] - squareSize], // SW
        [centerCoord[0] + squareSize, centerCoord[1] - squareSize], // SE
        [centerCoord[0] + squareSize, centerCoord[1] + squareSize], // NE
        [centerCoord[0] - squareSize, centerCoord[1] + squareSize], // NW
        [centerCoord[0] - squareSize, centerCoord[1] - squareSize], // Close polygon
      ]
    ];

    return new Polygon(squareCoords);
  };

  const addSamplePopulationData = (vectorSource: VectorSource, dataSource: DataSource) => {
    // Define boundary coordinates
    const swCorner: [number, number] = [36.136884, 36.200889]; // Southwest corner
    const neCorner: [number, number] = [36.164790, 36.218908]; // Northeast corner
    
    // Create boundary rectangle coordinates
    const boundaryCoords: number[][][] = [
      [
        [swCorner[0], swCorner[1]], // SW
        [neCorner[0], swCorner[1]], // SE
        [neCorner[0], neCorner[1]], // NE
        [swCorner[0], neCorner[1]], // NW
        [swCorner[0], swCorner[1]], // Close polygon
      ]
    ];

    // Create boundary feature
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
          color: 'rgba(255, 0, 0, 0.1)', // Light red fill
        }),
        stroke: new Stroke({
          color: '#dc2626', // Red border
          width: 3,
        }),
      })
    );

    vectorSource.addFeature(boundaryFeature);

    // Different data sets based on source
    const getPopulationData = (source: DataSource) => {
      const aaiaModemData = [
        { coord: [36.145000, 36.205000], density: 920, name: 'AAIA Zone A' },
        { coord: [36.150000, 36.210000], density: 1350, name: 'AAIA Zone B' },
        { coord: [36.155000, 36.208000], density: 580, name: 'AAIA Zone C' },
        { coord: [36.148000, 36.203000], density: 1050, name: 'AAIA Zone D' },
        { coord: [36.152000, 36.215000], density: 1200, name: 'AAIA Zone E' },
        { coord: [36.158000, 36.212000], density: 680, name: 'AAIA Zone F' },
        { coord: [36.144000, 36.209000], density: 870, name: 'AAIA Zone G' },
        { coord: [36.160000, 36.206000], density: 750, name: 'AAIA Zone H' },
      ];

      const governmentData = [
        { coord: [36.145000, 36.205000], density: 780, name: 'Gov Zone A' },
        { coord: [36.150000, 36.210000], density: 1050, name: 'Gov Zone B' },
        { coord: [36.155000, 36.208000], density: 720, name: 'Gov Zone C' },
        { coord: [36.148000, 36.203000], density: 850, name: 'Gov Zone D' },
        { coord: [36.152000, 36.215000], density: 980, name: 'Gov Zone E' },
        { coord: [36.158000, 36.212000], density: 820, name: 'Gov Zone F' },
        { coord: [36.144000, 36.209000], density: 1030, name: 'Gov Zone G' },
        { coord: [36.160000, 36.206000], density: 890, name: 'Gov Zone H' },
      ];

      const combinedData = [
        { coord: [36.145000, 36.205000], density: 850, name: 'Combined Zone A' },
        { coord: [36.150000, 36.210000], density: 1200, name: 'Combined Zone B' },
        { coord: [36.155000, 36.208000], density: 650, name: 'Combined Zone C' },
        { coord: [36.148000, 36.203000], density: 900, name: 'Combined Zone D' },
        { coord: [36.152000, 36.215000], density: 1100, name: 'Combined Zone E' },
        { coord: [36.158000, 36.212000], density: 750, name: 'Combined Zone F' },
        { coord: [36.144000, 36.209000], density: 950, name: 'Combined Zone G' },
        { coord: [36.160000, 36.206000], density: 800, name: 'Combined Zone H' },
      ];

      switch (source) {
        case 'aaia-modem':
          return aaiaModemData;
        case 'government':
          return governmentData;
        case 'both':
          return combinedData;
        default:
          return combinedData;
      }
    };

    const populationPoints = getPopulationData(dataSource);

    // Find the maximum density in the current dataset for proper normalization
    const maxDensity = Math.max(...populationPoints.map(p => p.density));

    populationPoints.forEach(point => {
      // Create point feature for location marker
      const pointFeature = new Feature({
        geometry: new Point(transform(point.coord, 'EPSG:4326', 'EPSG:3857')),
        name: point.name,
        density: point.density,
        type: 'point'
      });

      // Create density area (square) based on population density
      const size = (point.density / maxDensity) * 0.002; // Scale size based on density (in degrees)
      
      const squareFeature = new Feature({
        geometry: createSquarePolygon(point.coord as [number, number], size),
        name: point.name,
        density: point.density,
        type: 'density'
      });

      // Color intensity based on density - properly normalized to current dataset
      const intensity = Math.min(point.density / maxDensity, 1); // Ensure it doesn't exceed 1
      const red = Math.max(0, Math.min(255, Math.floor(255 * (1 - intensity))));
      const green = Math.max(0, Math.min(255, Math.floor(100 * (1 - intensity))));
      const blue = Math.max(0, Math.min(255, Math.floor(255 * intensity)));

      squareFeature.setStyle(
        new Style({
          fill: new Fill({
            color: `rgba(${red}, ${green}, ${blue}, 0.4)`,
          }),
          stroke: new Stroke({
            color: `rgb(${red}, ${green}, ${blue})`,
            width: 2,
          }),
        })
      );

      // Style for point markers
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({
              color: `rgb(${red}, ${green}, ${blue})`,
            }),
            stroke: new Stroke({
              color: 'white',
              width: 2,
            }),
          }),
        })
      );

      vectorSource.addFeatures([squareFeature, pointFeature]);
    });

    // Add density legend areas for better visualization
    const densityAreas = [
      { coord: [36.142000, 36.204000], size: 0.001, color: 'rgba(255, 100, 100, 0.3)', name: 'High Density' },
      { coord: [36.156000, 36.214000], size: 0.0008, color: 'rgba(255, 200, 100, 0.3)', name: 'Medium Density' },
      { coord: [36.162000, 36.208000], size: 0.0006, color: 'rgba(100, 255, 100, 0.3)', name: 'Low Density' },
    ];

    densityAreas.forEach(area => {
      const areaFeature = new Feature({
        geometry: createSquarePolygon(area.coord as [number, number], area.size),
        name: area.name,
        type: 'area'
      });

      areaFeature.setStyle(
        new Style({
          fill: new Fill({
            color: area.color,
          }),
          stroke: new Stroke({
            color: area.color.replace('0.3', '0.8'),
            width: 1,
          }),
        })
      );

      vectorSource.addFeature(areaFeature);
    });
  };

  const updatePopulationData = (newDataSource: DataSource) => {
    setSelectedDataSource(newDataSource);
    
    if (vectorSourceRef.current && showPopulationData) {
      // Clear existing features
      vectorSourceRef.current.clear();
      // Add new data with selected source
      addSamplePopulationData(vectorSourceRef.current, newDataSource);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 overflow-hidden"
      />
      
      {/* Tools Panel Toggle Button */}
      <button
        onClick={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
        className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50 transition-colors border border-gray-200"
        title="Veri Kaynağı Araçları"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      {/* Tools Panel */}
      {isToolsPanelOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-xl rounded-lg p-4 border border-gray-200 min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Veri Kaynağı Seçimi</h3>
            <button
              onClick={() => setIsToolsPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Nufüs yoğunluğu verilerini farklı kaynaklardan görüntüleyebilirsiniz:
            </p>

            {/* AAIA Modem Data */}
            <div
              onClick={() => updatePopulationData('aaia-modem')}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                selectedDataSource === 'aaia-modem'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">AAIA Modem Konum Verisi</h4>
                  <p className="text-sm text-gray-600">Gerçek zamanlı modem konumları</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedDataSource === 'aaia-modem' ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              </div>
            </div>

            {/* Government Data */}
            <div
              onClick={() => updatePopulationData('government')}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                selectedDataSource === 'government'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Devlet Verisi</h4>
                  <p className="text-sm text-gray-600">TÜİK ve resmi kayıtlar</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedDataSource === 'government' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
            </div>

            {/* Both Combined */}
            <div
              onClick={() => updatePopulationData('both')}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                selectedDataSource === 'both'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Kombine Veri</h4>
                  <p className="text-sm text-gray-600">Her iki kaynağın birleşimi</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedDataSource === 'both' ? 'bg-purple-500' : 'bg-gray-300'
                }`} />
              </div>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Aktif Veri Kaynağı:</h5>
            <div className="text-sm text-gray-600">
              {selectedDataSource === 'aaia-modem' && (
                <div>
                  <span className="font-medium text-blue-600">AAIA Modem Verisi</span>
                  <p>Anlık modem konumları kullanılarak hesaplanmış nufüs yoğunluğu</p>
                </div>
              )}
              {selectedDataSource === 'government' && (
                <div>
                  <span className="font-medium text-green-600">Devlet Verisi</span>
                  <p>TÜİK ve diğer resmi kurumlardan alınan nüfus verileri</p>
                </div>
              )}
              {selectedDataSource === 'both' && (
                <div>
                  <span className="font-medium text-purple-600">Kombine Veri</span>
                  <p>AAIA modem ve devlet verilerinin ortalaması</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
