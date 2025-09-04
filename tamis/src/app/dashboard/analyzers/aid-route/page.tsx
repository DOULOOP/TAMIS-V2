"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HowItWorks from "@/components/ui/HowItWorks";

const RouteMap = dynamic(() => import("@/components/map/RouteMap"), {
  ssr: false,
});

export default function AidRouteAnalyzer() {
  // Types for Aid Route analysis
  interface RouteStep {
    instruction?: string | { text?: string };
    name?: string;
    maneuver?: string;
    distance?: number;
    length?: number;
    time?: number;
    duration?: number;
  }

  interface AidRouteSupply {
    type: string;
    amount: number;
    unit: string;
  }

  interface AidRouteVehicle {
    id: string;
    type: string;
    plate: string;
    status: "active" | "maintenance" | "offline" | string;
  }

  interface AidRouteCheckpoint {
    id: string;
    name: string;
    status: "clear" | "congested" | "blocked" | string;
  }

  interface AidRoute {
    id: string;
    name: string;
    distance: number; // km
    estimatedTime: number; // hours
    status: "active" | "blocked" | "restricted" | string;
    vehicles: AidRouteVehicle[];
    supplies: AidRouteSupply[];
    checkpoints: AidRouteCheckpoint[];
  }

  interface AidRouteAnalysis {
    routes: AidRoute[];
    averageTime?: number;
    averageDistance?: number;
  }

  type Coord = [number, number];

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AidRouteAnalysis | null>(null);
  const router = useRouter();

  // Load summary/list from DB-backed API
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/aid-routes", { cache: "no-store" });
        const j = (await res.json()) as { aidRouteAnalysis?: AidRouteAnalysis };
        setAnalysisResults(j.aidRouteAnalysis ?? null);
      } catch {
        // ignore
      }
    })();
  }, []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch("/api/aid-routes", { cache: "no-store" });
      const j = await res.json();
      setAnalysisResults(j.aidRouteAnalysis);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };

  // New: interactive routing state
  const [startPoint, setStartPoint] = useState<Coord | null>(null);
  const [endPoint, setEndPoint] = useState<Coord | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coord[] | null>(
    null,
  );
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [routeMeta, setRouteMeta] = useState<{
    distanceKm?: number;
    durationMin?: number;
  }>({});
  const [fetchingRoute, setFetchingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Closed zones and alternatives state
  const [closedZones, setClosedZones] = useState<
    { id?: string; name?: string; polygon: [number, number][] }[]
  >([]);
  const [drawZoneMode, setDrawZoneMode] = useState(false);
  const [avoidClosed, setAvoidClosed] = useState(true);
  const [altRoutes, setAltRoutes] = useState<Coord[][]>([]);
  const [hitZones, setHitZones] = useState<{ id?: string; name?: string }[]>(
    [],
  );

  async function loadZones() {
    try {
      const res = await fetch("https://tamis-v2.onrender.com/api/closed-zones");
      if (res.ok) {
        const j = (await res.json()) as { zones?: { id?: string; name?: string; polygon: [number, number][] }[] };
        setClosedZones(j.zones ?? []);
      }
    } catch {}
  }
  useEffect(() => {
    void loadZones();
  }, []);

  const handleSelectPoint = (
    point: Coord,
    kind: "start" | "end",
  ) => {
    if (kind === "start") setStartPoint(point);
    else setEndPoint(point);
  };

  // Minimal route result types (OSRM/ORS-like)
  type OSRMRouteLike = {
    routes?: Array<{
      geometry?: { coordinates?: Coord[] };
      legs?: Array<{ steps?: RouteStep[] }>;
      summary?: { length?: number; duration?: number };
    }>;
  };
  type ORSFeatureLike = {
    features?: Array<{
      geometry?:
        | { type: "LineString"; coordinates: Coord[] }
        | { type: "MultiLineString"; coordinates: Coord[][] };
      properties?: {
        distance?: number;
        time?: number;
        legs?: Array<{ steps?: RouteStep[]; distance?: number; time?: number }>;
        segments?: Array<{ steps?: RouteStep[]; distance?: number; duration?: number }>;
      };
    }>;
  };

  function extractCoordsFromRoute(route: OSRMRouteLike | ORSFeatureLike): Coord[] {
    let coords: Coord[] = [];
    const routes0 = (route as OSRMRouteLike)?.routes?.[0];
    if (routes0?.geometry?.coordinates) {
      coords = routes0.geometry.coordinates as Coord[];
    } else {
      const feat0 = (route as ORSFeatureLike)?.features?.[0];
      const geom = feat0?.geometry;
      if (geom?.type === "LineString" && Array.isArray(geom.coordinates)) {
        coords = geom.coordinates as Coord[];
      } else if (
        geom?.type === "MultiLineString" && Array.isArray(geom.coordinates)
      ) {
        const flat = (geom.coordinates as Coord[][]).flat();
        coords = flat as Coord[];
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
      const res = await fetch(
        `https://tamis-v2.onrender.com/api/findOptimalRoute?${params.toString()}`,
        {
          headers: { accept: "application/json" },
        },
      );
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as {
        route: OSRMRouteLike | ORSFeatureLike;
        alternatives?: Array<{ route: OSRMRouteLike | ORSFeatureLike }>;
        closed_zones_hit?: { id?: string; name?: string }[];
      };
      const route = data.route;

      // Extract geometry coordinates (supports LineString and MultiLineString)
  let coords: Coord[] = extractCoordsFromRoute(route);
      if (!coords.length) throw new Error("Rota bulunamadı");
      setRouteCoords(coords);

      // Steps/instructions: support different shapes
      let steps: RouteStep[] = [];
      const routes0 = (route as OSRMRouteLike)?.routes?.[0];
      if (routes0?.legs?.[0]?.steps) steps = routes0.legs[0].steps as RouteStep[];
      else {
        const feat0 = (route as ORSFeatureLike)?.features?.[0];
        steps =
          (feat0?.properties?.legs?.[0]?.steps as RouteStep[] | undefined) ??
          (feat0?.properties?.segments?.[0]?.steps as RouteStep[] | undefined) ??
          [];
      }
      setRouteSteps(steps);

      // Meta distance/duration
      let distanceMeters = 0;
      let durationSeconds = 0;
      if (routes0?.summary) {
        distanceMeters = routes0.summary.length ?? 0;
        durationSeconds = routes0.summary.duration ?? 0;
      } else {
        const feat0 = (route as ORSFeatureLike)?.features?.[0];
        distanceMeters =
          feat0?.properties?.distance ??
          feat0?.properties?.segments?.[0]?.distance ??
          feat0?.properties?.legs?.[0]?.distance ??
          0;
        durationSeconds =
          feat0?.properties?.time ??
          feat0?.properties?.segments?.[0]?.duration ??
          feat0?.properties?.legs?.[0]?.time ??
          0;
      }
      setRouteMeta({
        distanceKm: distanceMeters
          ? Math.round(distanceMeters) / 1000
          : undefined,
        durationMin: durationSeconds
          ? Math.round(durationSeconds / 60)
          : undefined,
      });

      // Closed zone hits and alternatives
      setHitZones(data.closed_zones_hit ?? []);
      const alts = Array.isArray(data.alternatives) ? data.alternatives : [];
      const altCoords: Coord[][] = [];
      for (const a of alts) {
        const rc = extractCoordsFromRoute(a.route);
        if (rc.length) altCoords.push(rc);
      }
      setAltRoutes(altCoords);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Rota alınamadı";
      setError(msg);
      setRouteCoords(null);
      setRouteSteps([]);
      setRouteMeta({});
      setAltRoutes([]);
      setHitZones([]);
    } finally {
      setFetchingRoute(false);
    }
  }

  async function handleClosedZoneComplete(poly: Coord[]) {
    try {
      const name =
        typeof window !== "undefined"
          ? prompt("Bölge adı (opsiyonel):") ||
            `Kapalı Bölge ${closedZones.length + 1}`
          : `Kapalı Bölge ${closedZones.length + 1}`;
      const res = await fetch(
        "https://tamis-v2.onrender.com/api/closed-zones",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, polygon: poly }),
        },
      );
      if (!res.ok) throw new Error("Bölge kaydedilemedi");
      await loadZones();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Bölge kaydedilemedi";
      setError(msg);
    }
  }

  async function deleteZone(id?: string) {
    if (!id) return;
    try {
      const res = await fetch(
        `https://tamis-v2.onrender.com/api/closed-zones/${id}`,
        { method: "DELETE" },
      );
      if (res.ok) await loadZones();
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
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
                className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {isAnalyzing ? "Analiz Yapılıyor..." : "Analizi Başlat"}
              </button>
            </div>
          </div>
        </div>
        {/* HowTo button moved to main content top-right */}
      </header>

      {/* Main Content */}
      <main className="mx-autopy-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* HowTo at the very top, aligned right */}
          <div className="relative mb-2 h-10">
            <HowItWorks
              title="Yardım Rotaları"
              howToUseText="Modülün temel amacı, afet sonrasında güvenli toplanma alanlarının durumunu (kapasite, doluluk oranı) gerçek zamanlı olarak takip etmek ve vatandaşları doluluk durumuna göre en uygun alternatif alanlara yönlendirerek kaos ve yığılmayı önlemektir."
              howItWorksText="Rota motoru trafik/kapalı bölgeleri dikkate alır; alternatif rotaları üretir ve süre/mesafe metriklerini hesaplar."
              ariaLabel="Yardım rotaları nasıl çalışır"
            />
          </div>
          {/* Interactive Route Builder */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Harita Üzerinde Rota Oluştur
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                TAMİS projesinin Güvenli Alan ve Tahliye Yönetimi Modülü, afet
                sonrası toplanma alanlarının kapasite ve doluluk durumlarını
                gerçek zamanlı takip ederek çalışır. Sistem; AFAD, belediyeler,
                emniyet, meteoroloji, sağlık, enerji kurumları, karayolları,
                telekom operatörleri, uydu/drone görüntüleri ve vatandaşlardan
                gelen verileri tek merkezde toplar. Bu veriler PostgreSQL +
                PostGIS tabanlı bir veritabanına işlenir ve anlık güncellemeler
                Websocket/MQTT ile sisteme aktarılır. <br></br>Doluluk oranı kritik
                eşikleri geçtiğinde uyarılar üretilir ve PostGIS mekânsal
                sorguları kullanılarak vatandaşlar en yakın uygun güvenli alana
                yönlendirilir. Karar verme sürecinde yol durumu, nüfus yoğunluğu
                ve hava şartları da dikkate alınır.
              </p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                  <div className="rounded bg-gray-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Başlangıç</span>
                      <span className="font-mono">
                        {startPoint
                          ? `${startPoint[1].toFixed(5)}, ${startPoint[0].toFixed(5)}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hedef</span>
                      <span className="font-mono">
                        {endPoint
                          ? `${endPoint[1].toFixed(5)}, ${endPoint[0].toFixed(5)}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchOptimalRoute}
                      disabled={!startPoint || !endPoint || fetchingRoute}
                      className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {fetchingRoute ? "Rota Alınıyor..." : "Rota Bul"}
                    </button>
                    <button
                      onClick={() => {
                        setStartPoint(null);
                        setEndPoint(null);
                        setRouteCoords(null);
                        setRouteSteps([]);
                        setRouteMeta({});
                      }}
                      className="rounded border px-4 py-2"
                    >
                      Temizle
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={avoidClosed}
                        onChange={(e) => setAvoidClosed(e.target.checked)}
                      />
                      Kapalı bölgelerden kaçın
                    </label>
                    <button
                      onClick={() => setDrawZoneMode((v) => !v)}
                      className={`rounded px-3 py-1.5 text-sm ${drawZoneMode ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"}`}
                    >
                      {drawZoneMode
                        ? "Çizimi Bitirmek için Çift Tıkla"
                        : "Kapalı Bölge Çiz"}
                    </button>
                  </div>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  {routeMeta.distanceKm && (
                    <div className="text-sm text-gray-700">
                      Mesafe:{" "}
                      <span className="font-semibold">
                        {routeMeta.distanceKm} km
                      </span>
                      , Süre:{" "}
                      <span className="font-semibold">
                        {routeMeta.durationMin} dk
                      </span>
                    </div>
                  )}
                  {hitZones.length > 0 && (
                    <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      Kapalı bölge çakışması:{" "}
                      {hitZones.map((z) => z.name || z.id).join(", ")}.
                      Alternatifler gösteriliyor.
                    </div>
                  )}
                  {altRoutes.length > 0 && (
                    <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-700">
                      {altRoutes.length} alternatif rota görüntüleniyor (kesikli
                      mavi çizgi)
                    </div>
                  )}
                  {closedZones.length > 0 && (
                    <div className="rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
                      <div className="mb-1 font-medium">Kapalı Bölgeler</div>
                      <ul className="space-y-1">
                        {closedZones.map((z) => (
                          <li
                            key={z.id || JSON.stringify(z.polygon.slice(0, 1))}
                            className="flex items-center justify-between"
                          >
                            <span>{z.name || z.id}</span>
                            {z.id && (
                              <button
                                onClick={() => deleteZone(z.id)}
                                className="text-red-600 hover:underline"
                              >
                                Sil
                              </button>
                            )}
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
            <div className="mb-6 rounded-lg bg-white shadow">
              <div className="px-6 py-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Adım Adım Yönlendirme
                    </h3>
                    <p className="text-sm text-gray-500">
                      Rotanızı takip etmek için aşağıdaki talimatları izleyin
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      Toplam {routeSteps.length} adım
                    </span>
                    {routeMeta.distanceKm && (
                      <>
                        <span>•</span>
                        <span>{routeMeta.distanceKm} km</span>
                      </>
                    )}
                    {routeMeta.durationMin && (
                      <>
                        <span>•</span>
                        <span>Tahmini {routeMeta.durationMin} dakika</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {routeSteps.map((s: RouteStep, idx: number) => {
                    const instr =
                      typeof s?.instruction === "object"
                        ? s.instruction?.text
                        : s?.instruction;
                    const text =
                      instr ??
                      s?.name ??
                      s?.maneuver ??
                      "Adım";
                    const dist = s?.distance ?? s?.length;
                    const dur = s?.time ?? s?.duration;

                    // Get maneuver type for icon
                    const getManeuverIcon = (instruction: string) => {
                      const instr = instruction.toLowerCase();
                      if (instr.includes("sağ") || instr.includes("right")) {
                        return (
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        );
                      }
                      if (instr.includes("sol") || instr.includes("left")) {
                        return (
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        );
                      }
                      if (
                        instr.includes("düz") ||
                        instr.includes("straight") ||
                        instr.includes("devam")
                      ) {
                        return (
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                        );
                      }
                      return (
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      );
                    };

                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {idx + 1}
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-3">
                          {getManeuverIcon(text)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-5 font-medium text-gray-900">
                            {text}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            {dist && (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                  />
                                </svg>
                                {Math.round(dist)} m
                              </span>
                            )}
                            {dur && (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {Math.round(dur)} sn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Güvenli yolculuklar dileriz
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Yazdır
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Description */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Analiz Hakkında
              </h2>
              <p className="text-gray-600">
                Bu analiz, acil durum ekipleri için en optimal yardım rotalarını
                hesaplar ve önerir. Trafik verisi, yol durumu, tehlike konumları
                ve ekip konumları dikkate alınarak en hızlı ulaşım rotaları
                belirlenir.
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Analiz Durumu
              </h2>

              {isAnalyzing && (
                <div className="flex items-center">
                  <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600"></div>
                  <span className="text-orange-600">
                    Optimal rotalar hesaplanıyor...
                  </span>
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">Henüz analiz başlatılmadı</p>
                  <p className="text-sm text-gray-400">
                    Analizi başlatmak için yukarıdaki butona tıklayın
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Parameters removed by request */}

          {/* Results Section */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Analiz Sonuçları
              </h2>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.routes?.length ?? 0}
                  </div>
                  <div className="text-sm font-medium text-orange-700">
                    Optimal Rotalar
                  </div>
                  <div className="text-xs text-orange-600">
                    Hesaplanan rota sayısı
                  </div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.averageTime ?? 0}
                  </div>
                  <div className="text-sm font-medium text-orange-700">
                    Ortalama Süre
                  </div>
                  <div className="text-xs text-orange-600">Saat</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {analysisResults?.averageDistance ?? 0}
                  </div>
                  <div className="text-sm font-medium text-orange-700">
                    Toplam Mesafe
                  </div>
                  <div className="text-xs text-orange-600">Kilometre</div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mb-6 flex h-64 items-center justify-center rounded-lg bg-gray-100">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500">Yardım Rotaları Haritası</p>
                  <p className="text-sm text-gray-400">
                    Analiz sonrası görüntülenecek
                  </p>
                </div>
              </div>

              {/* Route Details */}
              {analysisResults ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="text-md mb-3 font-medium text-gray-900">
                    Rota Detayları
                  </h3>
                  <div className="space-y-4">
                    {analysisResults.routes.map((route: AidRoute) => (
                      <div
                        key={route.id}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h4 className="mb-1 font-medium text-gray-900">
                              {route.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Mesafe: {route.distance}km</span>
                              <span>Süre: {route.estimatedTime} saat</span>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  route.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : route.status === "blocked"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {route.status === "active"
                                  ? "Aktif"
                                  : route.status === "blocked"
                                    ? "Kapalı"
                                    : "Kısıtlı"}
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
                          <h5 className="mb-2 text-sm font-medium text-gray-700">
                            Taşınan Malzemeler:
                          </h5>
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            {route.supplies.map(
                              (supply: AidRouteSupply, index: number) => (
                                <div
                                  key={index}
                                  className="rounded bg-gray-100 px-2 py-1 text-sm"
                                >
                                  <span className="font-medium capitalize">
                                    {supply.type.replace("_", " ")}:{" "}
                                  </span>
                                  <span>
                                    {supply.amount} {supply.unit}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Vehicles */}
                        <div className="mb-3">
                          <h5 className="mb-2 text-sm font-medium text-gray-700">
                            Araçlar:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {route.vehicles.map((vehicle: AidRouteVehicle) => (
                              <span
                                key={vehicle.id}
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  vehicle.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : vehicle.status === "maintenance"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {vehicle.type} ({vehicle.plate})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Checkpoints */}
                        <div>
                          <h5 className="mb-2 text-sm font-medium text-gray-700">
                            Kontrol Noktaları:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {route.checkpoints.map((checkpoint: AidRouteCheckpoint) => (
                              <span
                                key={checkpoint.id}
                                className={`rounded-full px-2 py-1 text-xs ${
                                  checkpoint.status === "clear"
                                    ? "bg-green-100 text-green-800"
                                    : checkpoint.status === "congested"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
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
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="text-md mb-3 font-medium text-gray-900">
                    Rota Detayları
                  </h3>
                  <div className="py-8 text-center text-gray-500">
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
