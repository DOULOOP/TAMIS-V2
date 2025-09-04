"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import { Icon, Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { fileURLToPath } from "url";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <MapCanvas />
      </div>
    </div>
  );
}

// Color coding by damage level with better contrast and meaning
function levelColor(level?:string) {
  switch ((level||"").toLowerCase()) {
    case "catastrophic": return "#dc2626"; // Bright red for catastrophic
    case "severe": return "#ea580c"; // Orange-red for severe
    case "moderate": return "#d97706"; // Amber for moderate
    case "minor": case "minimal": return "#16a34a"; // Green for minor/minimal
    default: return "#2563eb"; // Blue for unknown
  }
}

// Modal component for detailed point information
function PointDetailModal({ point, isOpen, onClose }: { point: any, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !point) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
      <div className="bg-white  rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: levelColor(point.damage_assessment?.level) }}
              ></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Alan {point.field_id}</h2>
                <p className="text-sm text-gray-600">Ayrıntılı Hasar Değerlendirme Raporu</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Damage Assessment Section */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-l-4" 
               style={{ borderLeftColor: levelColor(point.damage_assessment?.level) }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🏗️ Hasar Değerlendirmesi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Hasar Seviyesi</label>
                <div className="flex items-center gap-3 mt-1">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: levelColor(point.damage_assessment?.level) }}
                  ></div>
                  <span className="text-lg font-bold capitalize text-gray-800">
                    {point.damage_assessment?.level || 'Bilinmiyor'}
                  </span>
                </div>
              </div>
              {point.damage_assessment?.confidence && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Değerlendirme Güveni</label>
                  <div className="text-lg font-bold text-gray-800 mt-1">
                    {(point.damage_assessment.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📍 Konum Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Koordinatlar (WGS84)</label>
                <div className="mt-1 font-mono text-sm">
                  <div>Enlem: {point.coordinates.latitude.toFixed(6)}°</div>
                  <div>Boylam: {point.coordinates.longitude.toFixed(6)}°</div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Piksel Koordinatları</label>
                <div className="mt-1 font-mono text-sm">
                  <div>X: {point.geometry.centroid.x}</div>
                  <div>Y: {point.geometry.centroid.y}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Geometry Information */}
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📐 Geometri Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Alan</label>
                <div className="text-lg font-bold text-gray-800 mt-1">
                  {point.geometry.area?.toFixed(0)} px²
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sınır Kutusu</label>
                <div className="text-sm text-gray-700 mt-1 font-mono">
                  <div>Batı: {point.geometry.bounds.min_x}</div>
                  <div>Doğu: {point.geometry.bounds.max_x}</div>
                  <div>Kuzey: {point.geometry.bounds.min_y}</div>
                  <div>Güney: {point.geometry.bounds.max_y}</div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Boyutlar</label>
                <div className="text-sm text-gray-700 mt-1">
                  <div>Genişlik: {point.geometry.bounds.max_x - point.geometry.bounds.min_x} px</div>
                  <div>Yükseklik: {point.geometry.bounds.max_y - point.geometry.bounds.min_y} px</div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Metrics */}
          {point.damage_assessment?.change_metrics && (
            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📊 Değişim Tespit Metrikleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(point.damage_assessment.change_metrics).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <div className="text-sm font-semibold text-gray-800 mt-1 font-mono">
                      {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Technical Details */}
          {point.shape_metrics && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🔬 Şekil Analizi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(point.shape_metrics).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <div className="text-sm font-semibold text-gray-800 mt-1 font-mono">
                      {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapCanvas() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorRef = useRef<VectorSource | null>(null);
  const resizeObs = useRef<ResizeObserver | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [damageFilters, setDamageFilters] = useState({
    minimal: true,
    moderate: true,
    severe: true,
    catastrophic: true,
  });
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [overlayPosition, setOverlayPosition] = useState<[number, number] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load field data from JSON file
    fetch('http://127.0.0.1:8000/api/results/field-analysis')
      .then(response => response.json())
      .then(data => {
        setFields(data.fields || []);
      })
      .catch(error => {
        console.error('Error loading field data:', error);
        setFields([]);
      });
  }, []);

  useEffect(() => {
    if (!mapEl.current || fields.length === 0) return;

    const base = new TileLayer({ source: new OSM() });

    const vectorSource = new VectorSource();
    vectorRef.current = vectorSource;
    const vectorLayer = new VectorLayer({ source: vectorSource });

    // Create overlay for popup
    const overlay = new Overlay({
      element: overlayRef.current!,
      autoPan: false, // Disable auto-panning to prevent map movement
    });

    const map = new Map({
      target: mapEl.current,
      layers: [base, vectorLayer],
      overlays: [overlay],
      view: new View({
        center: fromLonLat([36.150837, 36.209898]),
        zoom: 15,
      }),
    });

    mapRef.current = map;

    resizeObs.current = new ResizeObserver(() => {
      // Add a small delay to prevent immediate resize when side panel appears
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.updateSize();
        }
      }, 100);
    });
    resizeObs.current.observe(mapEl.current);

    // Define boundary polygon using SW and NE corners
    const sw = fromLonLat([36.136884, 36.200889]);
    const ne = fromLonLat([36.164790, 36.218908]);
    const nw = fromLonLat([36.136884, 36.218908]);
    const se = fromLonLat([36.164790, 36.200889]);

    const polygon = new Polygon([[sw, se, ne, nw, sw]]);

    const polygonFeature = new Feature(polygon);
    polygonFeature.setStyle(
      new Style({
        stroke: new Stroke({ color: "red", width: 2 }),
        fill: new Fill({ color: "rgba(255,0,0,0.2)" }),
      })
    );

    vectorSource.addFeature(polygonFeature);

    // === Detection fields (paste your JSON into the `fields` array) ===
    // Mapping from image pixel space (0..W, 0..H) into geographic bbox
    // defined by the red rectangle: [minLon, minLat] .. [maxLon, maxLat]
    const minLon = 36.136884;
    const maxLon = 36.164790;
    const minLat = 36.200889;
    const maxLat = 36.218908;

    // Fields data loaded from JSON file

    // Determine the full raster size from bounds (assumes top-left origin)
    const imgWidth = Math.max(...fields.map((f:any) => f.geometry.bounds.max_x));
    const imgHeight = Math.max(...fields.map((f:any) => f.geometry.bounds.max_y));

    function pixelToLonLat(x:number, y:number) {
      const lon = minLon + (x / imgWidth) * (maxLon - minLon);
      const lat = maxLat - (y / imgHeight) * (maxLat - minLat); // invert Y (image origin at top)
      return [lon, lat] as [number, number];
    }


    const DRAW_BOXES = false; // set true to draw each field's bounding box

    fields.forEach((f:any) => {
      const damageLevel = (f.damage_assessment?.level || "").toLowerCase();
      
      // Only add feature if this damage level is enabled in filters
      if (!damageFilters[damageLevel as keyof typeof damageFilters]) {
        return;
      }

      const { centroid, bounds } = f.geometry;
      const [lon, lat] = pixelToLonLat(centroid.x, centroid.y);

      // Point at centroid
      const pointFeature = new Feature({ 
        geometry: new Point(fromLonLat([lon, lat])), 
        field_id: f.field_id,
        field_data: f,
        longitude: lon,
        latitude: lat
      });
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: levelColor(f.damage_assessment?.level) }),
            stroke: new Stroke({ color: "#ffffff", width: 1.5 }),
          }),
        })
      );
      vectorSource.addFeature(pointFeature);

      if (DRAW_BOXES) {
        const ring = [
          pixelToLonLat(bounds.min_x, bounds.min_y),
          pixelToLonLat(bounds.max_x, bounds.min_y),
          pixelToLonLat(bounds.max_x, bounds.max_y),
          pixelToLonLat(bounds.min_x, bounds.max_y),
          pixelToLonLat(bounds.min_x, bounds.min_y),
        ].map((p) => fromLonLat(p as [number,number]));
        const boxFeature = new Feature(new Polygon([ring]));
        boxFeature.setStyle(
          new Style({
            stroke: new Stroke({ color: "rgba(25,118,210,0.9)", width: 1 }),
            fill: new Fill({ color: "rgba(25,118,210,0.08)" }),
          })
        );
        vectorSource.addFeature(boxFeature);
      }
    });

    // Click handler to show point info
    const clickHandler = (evt: any) => {
      // Prevent default behavior and stop propagation
      evt.preventDefault();
      evt.stopPropagation();
      
      const features = map.getFeaturesAtPixel(evt.pixel);
      
      if (features && features.length > 0) {
        const feature = features[0];
        if (!feature) return;
        const fieldData = feature.get('field_data');
        
        if (fieldData) {
          const lon = feature.get('longitude') ;
          const lat = feature.get('latitude');
          
          setSelectedPoint({
            ...fieldData,
            coordinates: { longitude: lon, latitude: lat }
          });
          
          // Position overlay at the clicked point without auto-panning
          overlay.setPosition(evt.coordinate);
          setOverlayPosition(evt.coordinate);
          return;
        }
      }
      
      // If no point feature clicked, hide overlay and add a marker like before
      overlay.setPosition(undefined);
      setSelectedPoint(null);
      setOverlayPosition(null);
      
      const feature = new Feature({ geometry: new Point(evt.coordinate) });
      feature.setStyle(
        new Style({
          image: new Icon({
            src:
              "data:image/svg+xml;utf8," +
              encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                   <path fill='%23d00' d='M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.57 7.23 12.18a1 1 0 0 0 1.54 0C14.6 20.57 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z'/>
                 </svg>`
              ),
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
          }),
        })
      );
      vectorSource.addFeature(feature);
    };

    map.on("click", clickHandler);

    return () => {
      map.un("click", clickHandler);
      resizeObs.current?.disconnect();
      map.setTarget(undefined);
      mapRef.current = null;
      vectorRef.current = null;
    };
  }, [fields, damageFilters]);

  const toggleFilter = (level: keyof typeof damageFilters) => {
    setDamageFilters(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="rounded-2xl shadow bg-white p-3 relative">
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          {Object.entries(damageFilters).map(([level, isVisible]) => (
            <label 
              key={level} 
              className={`flex items-center gap-3 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                isVisible 
                  ? 'border-gray-300 bg-white shadow-sm hover:shadow-md' 
                  : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'
              }`}
            >
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => toggleFilter(level as keyof typeof damageFilters)}
                className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: levelColor(level) }}
                ></div>
                <span className="text-sm font-medium capitalize text-gray-700">{displayLevel(level)}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div
        ref={mapEl}
        style={{ 
          width: "100%", 
          height: "70vh", 
          borderRadius: 12, 
          overflow: "hidden",
          minWidth: 0 // Prevent flex shrinking issues
        }}
      />
      
      {/* Harita Üstü Açılır Kart */}
      <div 
        ref={overlayRef} 
        className={`absolute bg-white opacity-80 border-0 rounded-xl shadow-xl p-4 max-w-xs min-w-xs z-20 ${
          selectedPoint && overlayPosition ? 'block' : 'hidden'
        }`}
        style={{
          transform: 'translate(-50%, -100%)',
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderTop: `4px solid ${selectedPoint ? levelColor(selectedPoint.damage_assessment?.level) : '#1976d2'}`
        }}
      >
        {selectedPoint && (
          <>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: levelColor(selectedPoint.damage_assessment?.level) }}
                ></div>
                <h4 className="text-base font-bold text-gray-800">Alan {selectedPoint.field_id}</h4>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPoint(null);
                  setOverlayPosition(null);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: levelColor(selectedPoint.damage_assessment?.level) }}
                  ></div>
                  <span className="font-semibold text-gray-800 capitalize">
                    {(selectedPoint.damage_assessment?.level || 'Bilinmiyor')} Hasar
                  </span>
                  {selectedPoint.damage_assessment?.confidence && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {(selectedPoint.damage_assessment.confidence * 100).toFixed(1)}% güven
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-blue-600 font-medium mb-1">📍 Konum</div>
                  <div className="text-gray-700">
                    <div>{selectedPoint.coordinates.latitude.toFixed(6)}°</div>
                    <div>{selectedPoint.coordinates.longitude.toFixed(6)}°</div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="text-green-600 font-medium mb-1">📐 Alan</div>
                  <div className="text-gray-700">
                    {selectedPoint.geometry.area?.toFixed(0)} px²
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <span>📋</span>
                  Detayları Göster
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="text-sm text-gray-500 mt-3 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
        <div className="flex items-start gap-2">
          <span className="text-blue-500">ℹ️</span>
          <div>
            <div className="font-medium text-blue-700 mb-1">Etkileşimli Harita Rehberi</div>
            <div className="text-blue-600">Kırmızı sınır analiz alanını gösterir. Ayrıntılı hasar bilgisi için renkli noktalara tıklayın.</div>
          </div>
        </div>
      </div>
      
      {/* Detailed Modal */}
      <PointDetailModal 
        point={selectedPoint} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
}

// Türkçe etiket için hasar seviyesi gösterimi
function displayLevel(level: string) {
  switch (level) {
    case 'minimal': return 'Minimal';
    case 'moderate': return 'Orta';
    case 'severe': return 'Şiddetli';
    case 'catastrophic': return 'Felaket';
    default: return level;
  }
}
