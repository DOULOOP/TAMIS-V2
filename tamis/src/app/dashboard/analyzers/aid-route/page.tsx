'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/map/RouteMap'), { ssr: false });

export default function AidRouteAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const router = useRouter();

  // Load summary/list from DB-backed API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/aid-routes', { cache: 'no-store' });
        const j = await res.json();
        setAnalysisResults(j.aidRouteAnalysis);
      } catch {}
    })();
  }, []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch('/api/aid-routes', { cache: 'no-store' });
      const j = await res.json();
      setAnalysisResults(j.aidRouteAnalysis);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };

  // New: interactive routing state
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeMeta, setRouteMeta] = useState<{ distanceKm?: number; durationMin?: number }>({});
  const [fetchingRoute, setFetchingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Closed zones and alternatives state
  const [closedZones, setClosedZones] = useState<{ id?: string; name?: string; polygon: [number, number][] }[]>([]);
  const [drawZoneMode, setDrawZoneMode] = useState(false);
  const [avoidClosed, setAvoidClosed] = useState(true);
  const [altRoutes, setAltRoutes] = useState<[number, number][][]>([]);
  const [hitZones, setHitZones] = useState<{ id?: string; name?: string }[]>([]);

  async function loadZones() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/closed-zones');
      if (res.ok) {
        const j = await res.json();
        setClosedZones(j.zones || []);
      }
    } catch {}
  }
  useEffect(() => { loadZones(); }, []);

  const handleSelectPoint = (point: [number, number], kind: 'start' | 'end') => {
    if (kind === 'start') setStartPoint(point);
    else setEndPoint(point);
  };

  function extractCoordsFromRoute(route: any): [number, number][] {
    let coords: [number, number][] = [];
    const routes0 = route?.routes?.[0];
    if (routes0?.geometry?.coordinates) {
      coords = routes0.geometry.coordinates as [number, number][];
    } else {
      const feat0 = route?.features?.[0];
      const geom = feat0?.geometry;
      if (geom?.type === 'LineString' && Array.isArray(geom.coordinates)) {
        coords = geom.coordinates as [number, number][];
      } else if (geom?.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
        const flat = (geom.coordinates as [number, number][][]).flat();
        coords = flat as [number, number][];
      }
    }
    return coords;
  }

  async function fetchOptimalRoute() {
    if (!startPoint || !endPoint) return;
    setFetchingRoute(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        start_lat: String(startPoint[1]),
        start_lng: String(startPoint[0]),
        end_lat: String(endPoint[1]),
        end_lng: String(endPoint[0]),
        avoid_closed_zones: String(avoidClosed),
      });
      const res = await fetch(`http://127.0.0.1:8000/api/findOptimalRoute?${params.toString()}`, {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const route = data.route;

      // Extract geometry coordinates (supports LineString and MultiLineString)
      let coords: [number, number][] = extractCoordsFromRoute(route);
      if (!coords.length) throw new Error('Rota bulunamadı');
      setRouteCoords(coords);

      // Steps/instructions: support different shapes
      let steps: any[] = [];
      const routes0 = route?.routes?.[0];
      if (routes0?.legs?.[0]?.steps) steps = routes0.legs[0].steps; else {
        const feat0 = route?.features?.[0];
        steps = feat0?.properties?.legs?.[0]?.steps || feat0?.properties?.segments?.[0]?.steps || [];
      }
      setRouteSteps(steps);

      // Meta distance/duration
      let distanceMeters = 0;
      let durationSeconds = 0;
      if (routes0?.summary) {
        distanceMeters = routes0.summary.length || 0;
        durationSeconds = routes0.summary.duration || 0;
      } else {
        const feat0 = route?.features?.[0];
        distanceMeters = feat0?.properties?.distance
          || feat0?.properties?.segments?.[0]?.distance
          || feat0?.properties?.legs?.[0]?.distance
          || 0;
        durationSeconds = feat0?.properties?.time
          || feat0?.properties?.segments?.[0]?.duration
          || feat0?.properties?.legs?.[0]?.time
          || 0;
      }
      setRouteMeta({
        distanceKm: distanceMeters ? Math.round(distanceMeters) / 1000 : undefined,
        durationMin: durationSeconds ? Math.round(durationSeconds / 60) : undefined,
      });

      // Closed zone hits and alternatives
      setHitZones(data.closed_zones_hit || []);
      const alts = Array.isArray(data.alternatives) ? data.alternatives : [];
      const altCoords: [number, number][][] = [];
      for (const a of alts) {
        const rc = extractCoordsFromRoute(a.route);
        if (rc.length) altCoords.push(rc);
      }
      setAltRoutes(altCoords);
    } catch (e: any) {
      setError(e.message || 'Rota alınamadı');
      setRouteCoords(null);
      setRouteSteps([]);
      setRouteMeta({});
      setAltRoutes([]);
      setHitZones([]);
    } finally {
      setFetchingRoute(false);
    }
  }

  async function handleClosedZoneComplete(poly: [number, number][]) {
    try {
      const name = typeof window !== 'undefined' ? (prompt('Bölge adı (opsiyonel):') || `Kapalı Bölge ${closedZones.length + 1}`) : `Kapalı Bölge ${closedZones.length + 1}`;
      const res = await fetch('http://127.0.0.1:8000/api/closed-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, polygon: poly }),
      });
      if (!res.ok) throw new Error('Bölge kaydedilemedi');
      await loadZones();
    } catch (e: any) {
      setError(e.message || 'Bölge kaydedilemedi');
    }
  }

  async function deleteZone(id?: string) {
    if (!id) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/closed-zones/${id}`, { method: 'DELETE' });
      if (res.ok) await loadZones();
    } catch {}
  }

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
              <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Yardım Rotası Analizi
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analiz Yapılıyor...' : 'Analizi Başlat'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Interactive Route Builder */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Harita Üzerinde Rota Oluştur</h2>
              <p className="text-sm text-gray-600 mb-4">Haritaya tıklayarak önce başlangıç noktasını, sonra hedef noktayı seçin. Ardından "Rota Bul" ile en uygun rotayı çizin.</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <RouteMap
                    height="420px"
                    center={[36.15972, 36.20294]}
                    zoom={15}
                    start={startPoint}
                    end={endPoint}
                    routeCoords={routeCoords}
                    onSelectPoint={handleSelectPoint}
                    closedZones={closedZones}
                    drawClosedZone={drawZoneMode}
                    onClosedZoneComplete={handleClosedZoneComplete}
                    alternativeRoutes={altRoutes}
                  />
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Başlangıç</span><span className="font-mono">{startPoint ? `${startPoint[1].toFixed(5)}, ${startPoint[0].toFixed(5)}` : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Hedef</span><span className="font-mono">{endPoint ? `${endPoint[1].toFixed(5)}, ${endPoint[0].toFixed(5)}` : '-'}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={fetchOptimalRoute} disabled={!startPoint || !endPoint || fetchingRoute} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">{fetchingRoute ? 'Rota Alınıyor...' : 'Rota Bul'}</button>
                    <button onClick={() => { setStartPoint(null); setEndPoint(null); setRouteCoords(null); setRouteSteps([]); setRouteMeta({}); }} className="px-4 py-2 rounded border">Temizle</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="accent-blue-600" checked={avoidClosed} onChange={(e) => setAvoidClosed(e.target.checked)} />
                      Kapalı bölgelerden kaçın
                    </label>
                    <button onClick={() => setDrawZoneMode((v) => !v)} className={`px-3 py-1.5 rounded text-sm ${drawZoneMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}>{drawZoneMode ? 'Çizimi Bitirmek için Çift Tıkla' : 'Kapalı Bölge Çiz'}</button>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {routeMeta.distanceKm && (
                    <div className="text-sm text-gray-700">Mesafe: <span className="font-semibold">{routeMeta.distanceKm} km</span>, Süre: <span className="font-semibold">{routeMeta.durationMin} dk</span></div>
                  )}
                  {hitZones.length > 0 && (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
                      Kapalı bölge çakışması: {hitZones.map((z) => z.name || z.id).join(', ')}. Alternatifler gösteriliyor.
                    </div>
                  )}
                  {altRoutes.length > 0 && (
                    <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{altRoutes.length} alternatif rota görüntüleniyor (kesikli mavi çizgi)</div>
                  )}
                  {closedZones.length > 0 && (
                    <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
                      <div className="font-medium mb-1">Kapalı Bölgeler</div>
                      <ul className="space-y-1">
                        {closedZones.map((z) => (
                          <li key={z.id || JSON.stringify(z.polygon.slice(0,1))} className="flex justify-between items-center">
                            <span>{z.name || z.id}</span>
                            {z.id && <button onClick={() => deleteZone(z.id)} className="text-red-600 hover:underline">Sil</button>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Steps / Instructions */}
          {routeSteps.length > 0 && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Adım Adım Yönlendirme</h3>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  {routeSteps.map((s: any, idx: number) => {
                    const text = s?.instruction?.text ?? s?.instruction ?? s?.name ?? s?.maneuver ?? 'Adım';
                    const dist = s?.distance ?? s?.length;
                    const dur = s?.time ?? s?.duration;
                    return (
                      <li key={idx} className="text-gray-700">
                        <div className="flex justify-between">
                          <span>{text}</span>
                          <span className="text-gray-500">
                            {dist ? `${Math.round(dist)} m` : ''} {dur ? `• ${Math.round(dur)} sn` : ''}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}

          {/* Analysis Description */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Analiz Hakkında</h2>
              <p className="text-gray-600">
                Bu analiz, acil durum ekipleri için en optimal yardım rotalarını hesaplar ve önerir. 
                Trafik verisi, yol durumu, tehlike konumları ve ekip konumları dikkate alınarak en hızlı ulaşım rotaları belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Durumu</h2>
              
              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
                  <span className="text-orange-600">Optimal rotalar hesaplanıyor...</span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Henüz analiz başlatılmadı</p>
                  <p className="text-sm text-gray-400">Analizi başlatmak için yukarıdaki butona tıklayın</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Parameters removed by request */}

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.routes?.length || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Optimal Rotalar</div>
                  <div className="text-xs text-orange-600">Hesaplanan rota sayısı</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.averageTime || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Ortalama Süre</div>
                  <div className="text-xs text-orange-600">Saat</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.averageDistance || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Toplam Mesafe</div>
                  <div className="text-xs text-orange-600">Kilometre</div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Yardım Rotaları Haritası</p>
                  <p className="text-sm text-gray-400">Analiz sonrası görüntülenecek</p>
                </div>
              </div>

              {/* Route Details */}
              {analysisResults ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Rota Detayları</h3>
                  <div className="space-y-4">
                    {analysisResults.routes.map((route: any) => (
                      <div key={route.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">{route.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Mesafe: {route.distance}km</span>
                              <span>Süre: {route.estimatedTime} saat</span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                route.status === 'active' ? 'bg-green-100 text-green-800' :
                                route.status === 'blocked' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {route.status === 'active' ? 'Aktif' :
                                 route.status === 'blocked' ? 'Kapalı' : 'Kısıtlı'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {route.vehicles.length} Araç
                            </div>
                          </div>
                        </div>

                        {/* Supplies Summary */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Taşınan Malzemeler:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {route.supplies.map((supply: any, index: number) => (
                              <div key={index} className="text-sm bg-gray-100 rounded px-2 py-1">
                                <span className="font-medium capitalize">{supply.type.replace('_', ' ')}: </span>
                                <span>{supply.amount} {supply.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Vehicles */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Araçlar:</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.vehicles.map((vehicle: any) => (
                              <span 
                                key={vehicle.id}
                                className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                                  vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {vehicle.type} ({vehicle.plate})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Checkpoints */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Kontrol Noktaları:</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.checkpoints.map((checkpoint: any) => (
                              <span 
                                key={checkpoint.id}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  checkpoint.status === 'clear' ? 'bg-green-100 text-green-800' :
                                  checkpoint.status === 'congested' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {checkpoint.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Rota Detayları</h3>
                  <div className="text-center text-gray-500 py-8">
                    <p>Hesaplanan rotalar ve detayları burada görüntülenecek</p>
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
