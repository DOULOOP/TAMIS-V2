"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import HowItWorks from "@/components/ui/HowItWorks";
// OpenLayers için sadece tip importları
import type MapType from "ol/Map";
import type ViewType from "ol/View";
import type TileLayerType from "ol/layer/Tile";
import type VectorLayerType from "ol/layer/Vector";
import type HeatmapLayerType from "ol/layer/Heatmap";
import type OSMType from "ol/source/OSM";
import type VectorSourceType from "ol/source/Vector";
import type FeatureType from "ol/Feature";
import type { Geometry } from "ol/geom";
import type MapBrowserEvent from "ol/MapBrowserEvent";

type AAIAModemInfo = {
  modem_report?: {
    modem_id: string;
    timestamp: string;
    power?: { battery_pct?: number; temperature_c?: number };
    position?: { lat: number; lon: number };
    status?: { health?: "ok" | "warning" | "degraded" | "critical" };
    radio?: {
      rssi_dbm?: number;
      coverage_radius_m?: number;
      packet_loss_pct?: number;
    };
    counters?: { clients_total?: number };
  };
  geo_enrichment?: {
    region?: { city?: string; district?: string; neighborhood?: string };
    nearest_assembly_area?: {
      id?: string;
      name?: string;
      capacity?: number;
      current_estimated_people?: number;
    };
    affected_buildings?: Array<{
      building_id: string;
      geom_center: { lat: number; lon: number };
      impact_score: number;
    }>;
    total_estimated_affected_buildings?: number;
    density_heatmap_score?: number;
  };
  analytics?: {
    overall_health?: "ok" | "warning" | "degraded" | "critical";
    alerts?: Array<{
      alert_id: string;
      type: string;
      severity: "low" | "medium" | "high";
      message: string;
      recommended_action?: string;
    }>;
    summary?: {
      active_modems_in_area?: number;
      offline_modems_in_area?: number;
      total_connected_people_estimate?: number;
      predicted_high_risk_buildings?: number;
    };
  };
  ui_summary?: {
    operator_panel?: {
      key_metrics?: any;
      top_risk_areas?: Array<{ name: string; score: number }>;
    };
  };
};

type ModemStation = {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  location?: { type?: string; coordinates?: [number, number] };
  signalStrength?: number;
  dataRate?: number;
  connectedDevices?: number;
  lastPing?: string;
  coverageRadius?: number; // km
  batteryLevel?: number; // %
  operatingTemp?: number; // °C
  networkLoad?: number; // %
};

type CommunicationNetworkAnalysis = {
  modemStations: ModemStation[];
  aaia_modems_information?: AAIAModemInfo;
};

type OL = {
  Map: typeof import("ol/Map").default;
  View: typeof import("ol/View").default;
  TileLayer: typeof import("ol/layer/Tile").default;
  VectorLayer: typeof import("ol/layer/Vector").default;
  HeatmapLayer: typeof import("ol/layer/Heatmap").default;
  OSM: typeof import("ol/source/OSM").default;
  VectorSource: typeof import("ol/source/Vector").default;
  Feature: typeof import("ol/Feature").default;
  fromLonLat: typeof import("ol/proj").fromLonLat;
  Point: typeof import("ol/geom/Point").default;
  Circle: typeof import("ol/geom/Circle").default;
  Style: typeof import("ol/style/Style").default;
  Icon: typeof import("ol/style/Icon").default;
  Fill: typeof import("ol/style/Fill").default;
  Stroke: typeof import("ol/style/Stroke").default;
};

export default function CommunicationNetworkAnalyzer() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] =
    useState<CommunicationNetworkAnalysis | null>(null);
  const [aaia, setAaia] = useState<AAIAModemInfo | null>(null);
  const [filters, setFilters] = useState({
    signalMin: 0,
    batteryMin: 0,
    minClients: 0,
  });
  const [timeIdx, setTimeIdx] = useState(0);
  const [selectedModem, setSelectedModem] = useState<ModemStation | null>(null);

  // OpenLayers ref'leri
  const mapRef = useRef<HTMLDivElement | null>(null);
  const olRef = useRef<OL | null>(null); // OL sınıflarını tutar
  const mapObjRef = useRef<MapType | null>(null);
  const layersRef = useRef<{
    modems?: VectorLayerType;
    coverage?: VectorLayerType;
    buildings?: VectorLayerType;
    heat?: HeatmapLayerType;
    shelters?: VectorLayerType;
  }>({});

  // API'den veri yükle
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/communication-network", {
          cache: "no-store",
        });
        const j = await res.json();
        const analysis =
          j.communicationNetworkAnalysis as CommunicationNetworkAnalysis;
        setAnalysisResults(analysis);
        setAaia(analysis?.aaia_modems_information ?? null);
      } catch {}
    })();
  }, []);

  // OpenLayers haritasını başlat (sadece istemci tarafında)
  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return;
    (async () => {
      const [
        { default: Map },
        { default: View },
        { default: TileLayer },
        { default: VectorLayer },
        { default: HeatmapLayer },
        { default: OSM },
        { default: VectorSource },
        { default: Feature },
        proj,
        geomPoint,
        geomCircle,
        style,
        styleIcon,
        styleFill,
        styleStroke,
      ] = await Promise.all([
        import("ol/Map"),
        import("ol/View"),
        import("ol/layer/Tile"),
        import("ol/layer/Vector"),
        import("ol/layer/Heatmap"),
        import("ol/source/OSM"),
        import("ol/source/Vector"),
        import("ol/Feature"),
        import("ol/proj"),
        import("ol/geom/Point"),
        import("ol/geom/Circle"),
        import("ol/style/Style"),
        import("ol/style/Icon"),
        import("ol/style/Fill"),
        import("ol/style/Stroke"),
      ]);
      olRef.current = {
        Map,
        View,
        TileLayer,
        VectorLayer,
        HeatmapLayer,
        OSM,
        VectorSource,
        Feature,
        fromLonLat: proj.fromLonLat,
        Point: geomPoint.default,
        Circle: geomCircle.default,
        Style: style.default,
        Icon: styleIcon.default,
        Fill: styleFill.default,
        Stroke: styleStroke.default,
      } as OL;
      const base = new TileLayer({
        source: new OSM(),
      }) as unknown as TileLayerType;
      const map = new Map({
        target: mapRef.current!,
        layers: [base],
        view: new View({ center: proj.fromLonLat([36.15, 36.206]), zoom: 13 }),
      }) as MapType;
      const modems = new VectorLayer({
        source: new VectorSource(),
      }) as unknown as VectorLayerType;
      const coverage = new VectorLayer({
        source: new VectorSource(),
      }) as unknown as VectorLayerType;
      const buildings = new VectorLayer({
        source: new VectorSource(),
      }) as unknown as VectorLayerType;
      const shelters = new VectorLayer({
        source: new VectorSource(),
      }) as unknown as VectorLayerType;
      const heat = new HeatmapLayer({
        source: new VectorSource(),
        blur: 15,
        radius: 10,
      }) as unknown as HeatmapLayerType;
      map.addLayer(coverage);
      map.addLayer(buildings);
      map.addLayer(shelters);
      map.addLayer(heat);
      map.addLayer(modems);
      mapObjRef.current = map;
      layersRef.current = { modems, coverage, buildings, heat, shelters };

      // modem seçmek için tıklama etkileşimi
      map.on("singleclick", (evt: any) => {
        let sel: ModemStation | null = null;
        map.forEachFeatureAtPixel(evt.pixel, (feat) => {
          const d = (feat as FeatureType<Geometry>).get("data") as
            | ModemStation
            | undefined;
          if (d && d.id) sel = d;
        });
        setSelectedModem(sel);
      });
    })();
  }, []);

  // Veri değiştiğinde veya filtreler/zaman değiştiğinde katmanları render et
  useEffect(() => {
    const map = mapObjRef.current;
    const ol = olRef.current;
    const lr = layersRef.current;
    if (!map || !analysisResults || !ol || !lr) return;
    const stations = (analysisResults.modemStations ?? [])
      .filter((s) => (s.signalStrength ?? 0) >= filters.signalMin)
      .filter((s) => (s.batteryLevel ?? 100) >= filters.batteryMin)
      .filter((s) => (s.connectedDevices ?? 0) >= filters.minClients);

    // Kaynakları temizle
    [lr.modems, lr.coverage, lr.buildings, lr.shelters, lr.heat].forEach((vl) =>
      vl?.getSource()?.clear(),
    );

    // Modem noktalarını ve kapsama alanlarını ekle
    stations.forEach((s) => {
      const lon = s.location?.coordinates?.[1];
      const lat = s.location?.coordinates?.[0];
      if (typeof lon !== "number" || typeof lat !== "number") return;
      const point = new ol.Point(ol.fromLonLat([lon, lat]));
      const f = new ol.Feature({
        geometry: point,
        data: s,
      }) as FeatureType<Geometry>;
      // Çoklu faktörlere göre sağlık durumu ve rengini belirle
      let healthStatus = "healthy";
      let healthColor = "#16A34A"; // yeşil

      if (s.status === "inactive") {
        healthStatus = "offline";
        healthColor = "#9CA3AF"; // gri
      } else if ((s.batteryLevel ?? 100) < 20 || (s.operatingTemp ?? 0) > 50) {
        healthStatus = "critical";
        healthColor = "#DC2626"; // kırmızı
      } else if (
        (s.signalStrength ?? 0) < 60 ||
        (s.batteryLevel ?? 100) < 40 ||
        (s.operatingTemp ?? 0) > 40
      ) {
        healthStatus = "warning";
        healthColor = "#F59E0B"; // sarı
      }

      // Sağlık durumuna göre renk kodlu bir daire işareti oluştur
      f.setStyle(
        new ol.Style({
          image: new ol.Icon({
            src:
              "data:image/svg+xml;charset=utf-8," +
              encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" fill="${healthColor}" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white" opacity="0.8"/>
              <text x="12" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="${healthColor}">M</text>
            </svg>
          `),
            scale: 1.2,
          }),
        }),
      );
      lr.modems?.getSource()?.addFeature(f);

      // Sinyal gücü ve türe göre gerçekçi yarıçaplı kapsama alanı
      let radiusKm = s.coverageRadius ?? 0;
      if (radiusKm === 0) {
        // Tür ve sinyal gücüne göre kapsama alanını tahmin et
        if (s.type === "primary") radiusKm = 5;
        else if (s.type === "secondary") radiusKm = 3;
        else radiusKm = 2;

        // Sinyal gücüne göre ayarla
        const signalFactor = (s.signalStrength ?? 80) / 100;
        radiusKm = radiusKm * signalFactor;
      }

      const radius = radiusKm * 1000; // metreye çevir
      if (radius > 0) {
        const c = new ol.Feature({
          geometry: new ol.Circle(ol.fromLonLat([lon, lat]), radius),
        }) as FeatureType<Geometry>;
        // Sinyal kalitesine göre kapsama rengi
        const opacity = Math.max(
          0.1,
          Math.min(0.4, (s.signalStrength ?? 80) / 200),
        );
        const strokeOpacity = Math.max(
          0.3,
          Math.min(0.8, (s.signalStrength ?? 80) / 100),
        );
        c.setStyle(
          new ol.Style({
            stroke: new ol.Stroke({
              color: `rgba(37,99,235,${strokeOpacity})`,
              width: 2,
              lineDash: s.status === "active" ? [] : [5, 5],
            }),
            fill: new ol.Fill({
              color: `rgba(37,99,235,${opacity})`,
            }),
          }),
        );
        lr.coverage?.getSource()?.addFeature(c);
      }

      // bağlı cihazlar ve ağ yükü ile ağırlıklı heatmap noktası
      const hf = new ol.Feature({
        geometry: new ol.Point(ol.fromLonLat([lon, lat])),
      }) as FeatureType<Geometry>;
      const weight = Math.min(
        1,
        Math.max(
          0,
          ((s.connectedDevices ?? 0) / 50) * ((s.networkLoad ?? 50) / 100),
        ),
      );
      hf.set("weight", weight);
      lr.heat?.getSource()?.addFeature(hf);
    });

    // Daha iyi görselleştirme ile AAIA'dan etkilenen binalar
    const buildings = aaia?.geo_enrichment?.affected_buildings ?? [];
    buildings.forEach((b) => {
      const lon = b.geom_center.lon;
      const lat = b.geom_center.lat;
      const f = new ol.Feature({
        geometry: new ol.Point(ol.fromLonLat([lon, lat])),
        data: b,
      }) as FeatureType<Geometry>;
      const score = Math.max(0, Math.min(1, b.impact_score));

      // Etki skorları için daha iyi renk ölçeği
      let color = "#84CC16"; // düşük etki (yeşil)
      if (score > 0.8)
        color = "#DC2626"; // yüksek etki (kırmızı)
      else if (score > 0.6)
        color = "#F97316"; // orta-yüksek (turuncu)
      else if (score > 0.4) color = "#F59E0B"; // orta (sarı)

      // Building icon with impact score indicator
      f.setStyle(
        new ol.Style({
          image: new ol.Icon({
            src:
              "data:image/svg+xml;charset=utf-8," +
              encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <rect x="2" y="4" width="12" height="10" fill="${color}" stroke="white" stroke-width="1"/>
              <rect x="4" y="6" width="2" height="2" fill="white" opacity="0.7"/>
              <rect x="6" y="6" width="2" height="2" fill="white" opacity="0.7"/>
              <rect x="10" y="6" width="2" height="2" fill="white" opacity="0.7"/>
              <rect x="4" y="9" width="2" height="2" fill="white" opacity="0.7"/>
              <rect x="6" y="9" width="2" height="2" fill="white" opacity="0.7"/>
              <rect x="10" y="9" width="2" height="2" fill="white" opacity="0.7"/>
            </svg>
          `),
            scale: 1.0,
          }),
        }),
      );
      lr.buildings?.getSource()?.addFeature(f);
    });

    // Kapasite/doluluk göstergeleri ile toplanma alanları
    const assemblyArea = aaia?.geo_enrichment?.nearest_assembly_area;
    if (assemblyArea && stations.length > 0) {
      // Use first active station location as assembly area location for demo
      const activeStation =
        stations.find((s) => s.status === "active") || stations[0];
      if (activeStation) {
        const lon = activeStation.location?.coordinates?.[1];
        const lat = activeStation.location?.coordinates?.[0];
        if (typeof lon === "number" && typeof lat === "number") {
          const f = new ol.Feature({
            geometry: new ol.Point(ol.fromLonLat([lon + 0.002, lat + 0.002])), // offset slightly
            data: assemblyArea,
          }) as FeatureType<Geometry>;

          // Doluluk oranını hesapla
          const capacity = assemblyArea.capacity ?? 1000;
          const current = assemblyArea.current_estimated_people ?? 0;
          const occupancyRatio = current / capacity;

          // Doluluk durumuna göre renk
          let shelterColor = "#16A34A"; // yeşil (düşük doluluk)
          if (occupancyRatio > 0.8)
            shelterColor = "#DC2626"; // kırmızı (yüksek)
          else if (occupancyRatio > 0.6) shelterColor = "#F59E0B"; // sarı (orta)

          f.setStyle(
            new ol.Style({
              image: new ol.Icon({
                src:
                  "data:image/svg+xml;charset=utf-8," +
                  encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                  <polygon points="10,2 18,18 2,18" fill="${shelterColor}" stroke="white" stroke-width="2"/>
                  <text x="10" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="white">S</text>
                </svg>
              `),
                scale: 1.2,
              }),
            }),
          );
          lr.shelters?.getSource()?.addFeature(f);
        }
      }
    }
  }, [analysisResults, aaia, filters, timeIdx]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const res = await fetch("/api/communication-network", {
        cache: "no-store",
      });
      const j = await res.json();
      const analysis =
        j.communicationNetworkAnalysis as CommunicationNetworkAnalysis;
      setAnalysisResults(analysis);
      setAaia(analysis?.aaia_modems_information ?? null);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };

  const kpis = useMemo(() => {
    const stations = analysisResults?.modemStations ?? [];
    const active = stations.filter((s) => s.status === "active").length;
    const offline = stations.filter((s) => s.status === "inactive").length;
    const maintenance = stations.filter(
      (s) => s.status === "maintenance",
    ).length;

    // AAIA verileri dahil gelişmiş batarya hesaplaması
    const batteryLevels = stations.map((s) => s.batteryLevel ?? 0);
    if (aaia?.modem_report?.power?.battery_pct) {
      batteryLevels.push(aaia.modem_report.power.battery_pct);
    }
    const avgBattery = batteryLevels.length
      ? Math.round(
          batteryLevels.reduce((a, b) => a + b, 0) / batteryLevels.length,
        )
      : 0;

    // AAIA verileri ile gelişmiş RSSI
    const rssiValues = stations.map((s) => s.signalStrength ?? 0);
    if (aaia?.modem_report?.radio?.rssi_dbm) {
      rssiValues.push(Math.abs(aaia.modem_report.radio.rssi_dbm)); // Convert negative dBm to positive for averaging
    }
    const avgRssi = rssiValues.length
      ? Math.round(rssiValues.reduce((a, b) => a + b, 0) / rssiValues.length)
      : 0;

    // Enhanced coverage calculation
    const coverageValues = stations.map((s) => (s.coverageRadius ?? 0) * 1000);
    const avgCoverage = coverageValues.length
      ? Math.round(
          coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length,
        )
      : 0;

    // AAIA'ya özgü metrikler
    const affected =
      aaia?.geo_enrichment?.total_estimated_affected_buildings ?? 0;
    const alerts = aaia?.analytics?.alerts?.length ?? 0;
    const estimatedPeople =
      aaia?.geo_enrichment?.nearest_assembly_area?.current_estimated_people ??
      0;
    const packetLoss = aaia?.modem_report?.radio?.packet_loss_pct ?? 0;

    return {
      total: stations.length,
      active,
      maintenance,
      offline,
      affected,
      avgBattery,
      avgRssi,
      avgCoverage,
      alerts,
      estimatedPeople,
      packetLoss,
      healthStatus: aaia?.analytics?.overall_health ?? "unknown",
    };
  }, [analysisResults, aaia]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
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
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                İletişim Ağı Modem Versi Analizi
              </h1>
            </div>

            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>
                {isAnalyzing ? "Analiz Yapılıyor..." : "Analizi Başlat"}
              </span>
            </button>
          </div>
        </div>
        {/* HowTo button moved to main content top-right */}
      </header>

      {/* Main Content */}
      <main className="mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* HowTo at the very top, aligned right */}
          <div className="relative mb-2 h-10">
            <HowItWorks
              title="İletişim Ağı"
              howToUseText="AAIA Projesi, afet sonrasında yaşanan iletişim kesintilerini gidermek ve afet yönetimini daha etkin hale getirmek için kullanılır. Afet anında çöken veya zarar gören mevcut altyapılara bağımlı olmadan, kendi oluşturduğu bağımsız iletişim ağı sayesinde kesintisiz bağlantı sağlar. Bu sayede hem bireyler aileleriyle haberleşebilir hem de bakanlıklar, AFAD, belediyeler ve arama kurtarma ekipleri arasında hızlı bilgi paylaşımı yapılır. Ayrıca sistem, hasar tespiti ve enkaz altındaki bireylerin yerinin belirlenmesi gibi kritik süreçleri hızlandırarak, hem kurtarma çalışmalarına hem de afet sonrası şehircilik planlamalarına katkı sunar."
              howItWorksText="Sistem, afet sonrası modemlerin kendi içerisinde tuttuğu konum, batarya durumu, kapsama bilgisi ve bağlı cihaz sayısı gibi verileri merkeze gönderir. Bu veriler alındığında önce doğrulanır, ardından harita üzerinde modem ikonları, kapsama alanı çemberleri ve bina katmanları ile görselleştirilir. Modemden gelen cihaz yoğunluğu ve sinyal bilgisi kullanılarak, kapsama alanındaki binalar analiz edilir ve hangi binaların etkilendiği tahmin edilir. Bu tahminler haritanın altında anlamlı bilgiler halinde operatöre sunulur; örneğin “27 bina etkilenmiş, 315 kişi bağlantıda, en riskli mahalle Odabaşı Mahallesi.” Böylece operatör hem görsel harita üzerinden hem de özet verilerle hızlı karar verebilir."
              ariaLabel="İletişim ağı nasıl çalışır"
            />
          </div>

          {/* Analysis Description */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <div className="mb-3 flex items-center">
                <span className="mr-3 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Kritik Altyapı
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  Otomatik İzleme
                </span>
              </div>
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Analiz Hakkında
              </h2>
              <p className="text-gray-600">
                AAIA Projesi, afet sonrasında yaşanan iletişim kesintilerini
                gidermek ve afet yönetimini daha etkin hale getirmek için
                kullanılır. Afet anında çöken veya zarar gören mevcut
                altyapılara bağımlı olmadan, kendi oluşturduğu bağımsız iletişim
                ağı sayesinde kesintisiz bağlantı sağlar. Bu sayede hem bireyler
                aileleriyle haberleşebilir hem de bakanlıklar, AFAD, belediyeler
                ve arama kurtarma ekipleri arasında hızlı bilgi paylaşımı
                yapılır. Ayrıca sistem, hasar tespiti ve enkaz altındaki
                bireylerin yerinin belirlenmesi gibi kritik süreçleri
                hızlandırarak, hem kurtarma çalışmalarına hem de afet sonrası
                şehircilik planlamalarına katkı sunar.
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
                  <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                  <span className="text-indigo-600">
                    Modem versiyonları taranıyor...
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
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
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

          {/* Parameters removed per request */}

          {/* Map + Results Section */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Analiz Sonuçları ve Harita
              </h2>
              {/* Enhanced KPI boxes */}
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
                <div className="rounded-lg bg-indigo-50 p-3 text-center">
                  <div className="text-lg font-bold text-indigo-900">
                    {kpis.total}
                  </div>
                  <div className="text-xs font-medium text-indigo-700">
                    Toplam Modem
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <div className="text-lg font-bold text-green-900">
                    {kpis.active}
                  </div>
                  <div className="text-xs font-medium text-green-700">
                    Aktif
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-center">
                  <div className="text-lg font-bold text-yellow-900">
                    {kpis.maintenance}
                  </div>
                  <div className="text-xs font-medium text-yellow-700">
                    Kısmi/Bakım
                  </div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <div className="text-lg font-bold text-red-900">
                    {kpis.offline}
                  </div>
                  <div className="text-xs font-medium text-red-700">
                    Offline
                  </div>
                </div>
                <div className="rounded-lg bg-rose-50 p-3 text-center">
                  <div className="text-lg font-bold text-rose-900">
                    {kpis.affected}
                  </div>
                  <div className="text-xs font-medium text-rose-700">
                    Etkilenen Bina
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {kpis.avgBattery}%
                  </div>
                  <div className="text-xs font-medium text-blue-700">
                    Ort. Pil
                  </div>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <div className="text-lg font-bold text-purple-900">
                    {kpis.avgRssi}
                  </div>
                  <div className="text-xs font-medium text-purple-700">
                    Ort. RSSI
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <div className="text-lg font-bold text-slate-900">
                    {kpis.alerts}
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    Alarmlar
                  </div>
                </div>
              </div>

              {/* Additional AAIA KPIs */}
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-orange-50 p-3 text-center">
                  <div className="text-lg font-bold text-orange-900">
                    {kpis.estimatedPeople}
                  </div>
                  <div className="text-xs font-medium text-orange-700">
                    Tahmini Kişi
                  </div>
                </div>
                <div className="rounded-lg bg-cyan-50 p-3 text-center">
                  <div className="text-lg font-bold text-cyan-900">
                    {kpis.avgCoverage}m
                  </div>
                  <div className="text-xs font-medium text-cyan-700">
                    Ort. Kapsama
                  </div>
                </div>
                <div className="rounded-lg bg-pink-50 p-3 text-center">
                  <div className="text-lg font-bold text-pink-900">
                    {kpis.packetLoss.toFixed(1)}%
                  </div>
                  <div className="text-xs font-medium text-pink-700">
                    Paket Kaybı
                  </div>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${
                    kpis.healthStatus === "ok"
                      ? "bg-green-50"
                      : kpis.healthStatus === "warning"
                        ? "bg-yellow-50"
                        : kpis.healthStatus === "critical"
                          ? "bg-red-50"
                          : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-lg font-bold ${
                      kpis.healthStatus === "ok"
                        ? "text-green-900"
                        : kpis.healthStatus === "warning"
                          ? "text-yellow-900"
                          : kpis.healthStatus === "critical"
                            ? "text-red-900"
                            : "text-gray-900"
                    }`}
                  >
                    {kpis.healthStatus.toUpperCase()}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      kpis.healthStatus === "ok"
                        ? "text-green-700"
                        : kpis.healthStatus === "warning"
                          ? "text-yellow-700"
                          : kpis.healthStatus === "critical"
                            ? "text-red-700"
                            : "text-gray-700"
                    }`}
                  >
                    Genel Sağlık
                  </div>
                </div>
              </div>

              {/* Region + Filters */}
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-gray-500">İl</label>
                  <select
                    className="rounded border px-2 py-1 text-sm"
                    defaultValue={aaia?.geo_enrichment?.region?.city ?? ""}
                  >
                    <option>
                      {aaia?.geo_enrichment?.region?.city ?? "Hatay"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">İlçe</label>
                  <select
                    className="rounded border px-2 py-1 text-sm"
                    defaultValue={aaia?.geo_enrichment?.region?.district ?? ""}
                  >
                    <option>
                      {aaia?.geo_enrichment?.region?.district ?? "Antakya"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Mahalle</label>
                  <select
                    className="rounded border px-2 py-1 text-sm"
                    defaultValue={
                      aaia?.geo_enrichment?.region?.neighborhood ?? ""
                    }
                  >
                    <option>
                      {aaia?.geo_enrichment?.region?.neighborhood ??
                        "Odabaşı Mahallesi"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Sinyal eşiği
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.signalMin}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        signalMin: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Pil eşiği
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.batteryMin}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        batteryMin: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Min. client
                  </label>
                  <input
                    type="number"
                    className="rounded border px-2 py-1"
                    value={filters.minClients}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        minClients: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-xs text-gray-500">Zaman</label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={timeIdx}
                    onChange={(e) => setTimeIdx(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Map */}
              <div
                className="relative h-[500px] w-full overflow-hidden rounded-lg border"
                ref={mapRef}
              >
                {selectedModem && (
                  <div className="absolute top-3 right-3 max-h-[480px] w-80 overflow-y-auto rounded border bg-white/95 p-3 shadow">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-lg font-medium">
                        {selectedModem.name}
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setSelectedModem(null)}
                      >
                        ✕
                      </button>
                    </div>

                    {/* AAIA Modem Data */}
                    {aaia?.modem_report && (
                      <div className="mb-3 rounded bg-blue-50 p-2">
                        <div className="mb-1 text-sm font-medium text-blue-800">
                          AAIA Modem: {aaia.modem_report.modem_id}
                        </div>
                        <div className="text-xs text-blue-600">
                          Firmware: {aaia.modem_report.firmware_version}
                        </div>
                        <div className="text-xs text-blue-600">
                          Uptime:{" "}
                          {Math.floor(
                            (aaia.modem_report.hardware?.uptime_s ?? 0) / 3600,
                          )}
                          h
                        </div>
                      </div>
                    )}

                    {/* Core Metrics */}
                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Pil:</span>
                        <span
                          className={`ml-1 font-medium ${(selectedModem.batteryLevel ?? 0) < 20 ? "text-red-600" : (selectedModem.batteryLevel ?? 0) < 40 ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {selectedModem.batteryLevel ??
                            aaia?.modem_report?.power?.battery_pct ??
                            "-"}
                          %
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sıcaklık:</span>
                        <span
                          className={`ml-1 font-medium ${(selectedModem.operatingTemp ?? aaia?.modem_report?.power?.temperature_c ?? 0) > 50 ? "text-red-600" : (selectedModem.operatingTemp ?? aaia?.modem_report?.power?.temperature_c ?? 0) > 40 ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {selectedModem.operatingTemp ??
                            aaia?.modem_report?.power?.temperature_c ??
                            "-"}
                          °C
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Clients:</span>
                        <span className="ml-1 font-medium">
                          {selectedModem.connectedDevices ??
                            aaia?.modem_report?.counters?.clients_total ??
                            0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">RSSI:</span>
                        <span className="ml-1 font-medium">
                          {aaia?.modem_report?.radio?.rssi_dbm ??
                            selectedModem.signalStrength ??
                            "-"}{" "}
                          dBm
                        </span>
                      </div>
                    </div>

                    {/* Radio Performance */}
                    {aaia?.modem_report?.radio && (
                      <div className="mb-3 rounded bg-gray-50 p-2">
                        <div className="mb-1 text-sm font-medium">
                          Radio Performance
                        </div>
                        <div className="space-y-1 text-xs">
                          <div>
                            Packet Loss:{" "}
                            <span
                              className={`font-medium ${(aaia.modem_report.radio.packet_loss_pct ?? 0) > 5 ? "text-red-600" : "text-green-600"}`}
                            >
                              {aaia.modem_report.radio.packet_loss_pct ?? 0}%
                            </span>
                          </div>
                          <div>
                            Coverage: ~{selectedModem.coverageRadius ?? 2} km
                            radius
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Health Status */}
                    {aaia?.analytics?.overall_health && (
                      <div className="mb-3 rounded bg-gray-50 p-2">
                        <div className="mb-1 text-sm font-medium">
                          Health Status
                        </div>
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs ${
                            aaia.analytics.overall_health === "ok"
                              ? "bg-green-100 text-green-800"
                              : aaia.analytics.overall_health === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {aaia.analytics.overall_health.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Alerts */}
                    {aaia?.analytics?.alerts &&
                      aaia.analytics.alerts.length > 0 && (
                        <div className="mb-3 rounded bg-red-50 p-2">
                          <div className="mb-1 text-sm font-medium text-red-800">
                            Active Alerts
                          </div>
                          {aaia.analytics.alerts.slice(0, 3).map((alert) => (
                            <div
                              key={alert.alert_id}
                              className="mb-1 text-xs text-red-700"
                            >
                              <span className="font-medium">{alert.type}:</span>{" "}
                              {alert.message}
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Location Info */}
                    {aaia?.geo_enrichment?.region && (
                      <div className="mb-3 rounded bg-green-50 p-2">
                        <div className="mb-1 text-sm font-medium text-green-800">
                          Location
                        </div>
                        <div className="text-xs text-green-700">
                          {aaia.geo_enrichment.region.neighborhood},{" "}
                          {aaia.geo_enrichment.region.district}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Son ping: {selectedModem.lastPing}
                    </div>

                    {/* Mini Chart Placeholder */}
                    <div className="mt-2">
                      <div className="mb-1 text-xs text-gray-500">
                        Son 30 dk trend (örnek)
                      </div>
                      <div className="flex h-12 items-end justify-between rounded bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 px-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className="w-1 rounded-t bg-blue-400"
                            style={{ height: `${20 + Math.random() * 20}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Alarm queue */}
                <div className="rounded border bg-white p-3">
                  <h3 className="mb-2 font-medium">Alarm Kuyruğu</h3>
                  <ul className="max-h-48 space-y-2 overflow-auto">
                    {(aaia?.analytics?.alerts ?? []).map((a) => (
                      <li
                        key={a.alert_id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span
                          className={`mt-1 h-2 w-2 rounded-full ${a.severity === "high" ? "bg-red-500" : a.severity === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                        />
                        <div>
                          <div className="font-medium">{a.type}</div>
                          <div className="text-gray-600">{a.message}</div>
                          {a.recommended_action && (
                            <div className="text-xs text-gray-500">
                              Öneri: {a.recommended_action}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {!(aaia?.analytics?.alerts ?? []).length && (
                      <div className="text-xs text-gray-500">Alarm yok</div>
                    )}
                  </ul>
                </div>
                {/* Risky neighborhoods */}
                <div className="rounded border bg-white p-3">
                  <h3 className="mb-2 font-medium">En Riskli Mahalleler</h3>
                  <ul className="space-y-1 text-sm">
                    {(aaia?.ui_summary?.operator_panel?.top_risk_areas ?? [])
                      .slice(0, 10)
                      .map((r) => (
                        <li key={r.name} className="flex justify-between">
                          <span>{r.name}</span>
                          <span className="font-medium">{r.score}</span>
                        </li>
                      ))}
                    {!(aaia?.ui_summary?.operator_panel?.top_risk_areas ?? [])
                      .length && (
                      <div className="text-xs text-gray-500">Veri yok</div>
                    )}
                  </ul>
                </div>
                {/* Modem health ranking */}
                <div className="rounded border bg-white p-3">
                  <h3 className="mb-2 font-medium">Modem Sağlık Sıralaması</h3>
                  <ul className="space-y-1 text-sm">
                    {(analysisResults?.modemStations ?? [])
                      .slice()
                      .sort(
                        (a, b) =>
                          (a.batteryLevel ?? 0) - (b.batteryLevel ?? 0) ||
                          (b.operatingTemp ?? 0) - (a.operatingTemp ?? 0),
                      )
                      .slice(0, 10)
                      .map((s) => (
                        <li key={s.id} className="flex justify-between">
                          <span>{s.name}</span>
                          <span className="font-medium">
                            {s.batteryLevel ?? 0}% / {s.operatingTemp ?? 0}°C
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Network Status Chart */}
              {analysisResults ? (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="text-md mb-4 font-medium text-gray-900">
                    Ağ İstatistikleri
                  </h3>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-green-100 p-3">
                        <span className="font-medium text-green-800">
                          Online
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {
                            analysisResults.modemStations.filter(
                              (s) => s.status === "active",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-red-100 p-3">
                        <span className="font-medium text-red-800">
                          Offline
                        </span>
                        <span className="text-xl font-bold text-red-600">
                          {
                            analysisResults.modemStations.filter(
                              (s) => s.status === "inactive",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-yellow-100 p-3">
                        <span className="font-medium text-yellow-800">
                          Bakım
                        </span>
                        <span className="text-xl font-bold text-yellow-600">
                          {
                            analysisResults.modemStations.filter(
                              (s) => s.status === "maintenance",
                            ).length
                          }
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">En İyi Sinyal:</span>
                        <span className="font-semibold text-green-600">
                          {analysisResults.modemStations.length
                            ? Math.max(
                                ...analysisResults.modemStations.map(
                                  (s) => s.signalStrength ?? 0,
                                ),
                              )
                            : 0}{" "}
                          dBm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">En Kötü Sinyal:</span>
                        <span className="font-semibold text-red-600">
                          {analysisResults.modemStations.length
                            ? Math.min(
                                ...analysisResults.modemStations.map(
                                  (s) => s.signalStrength ?? 0,
                                ),
                              )
                            : 0}{" "}
                          dBm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Ortalama Veri Oranı:
                        </span>
                        <span className="font-semibold">
                          {analysisResults.modemStations.length
                            ? Math.round(
                                analysisResults.modemStations.reduce(
                                  (acc: number, s) => acc + (s.dataRate ?? 0),
                                  0,
                                ) / analysisResults.modemStations.length,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Bağlantı:</span>
                        <span className="font-semibold">
                          {analysisResults.modemStations.reduce(
                            (acc: number, s) => acc + (s.connectedDevices ?? 0),
                            0,
                          )}{" "}
                          cihaz
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ağ Yükü:</span>
                        <span className="font-semibold text-yellow-600">
                          %
                          {analysisResults.modemStations.length
                            ? Math.round(
                                analysisResults.modemStations.reduce(
                                  (acc: number, s) =>
                                    acc + (s.networkLoad ?? 0),
                                  0,
                                ) / analysisResults.modemStations.length,
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Güvenlik Durumu:</span>
                        <span className="font-semibold text-green-600">
                          Güvenli
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-gray-500">İletişim Ağı Durumu Grafiği</p>
                    <p className="text-sm text-gray-400">
                      Analiz sonrası görüntülenecek
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device Details Table */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Cihaz Detayları
              </h2>

              {/* Filter Controls */}
              <div className="mb-4 flex flex-wrap gap-4">
                <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option>Tüm Durumlar</option>
                  <option>Güncel</option>
                  <option>Güncellenecek</option>
                  <option>Kritik Risk</option>
                </select>

                <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option>Tüm Markalar</option>
                  <option>Huawei</option>
                  <option>Cisco</option>
                  <option>Ericsson</option>
                </select>

                <input
                  type="text"
                  placeholder="Cihaz ara..."
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Station Details Table */}
              {analysisResults ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            İstasyon
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Durum
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Sinyal Gücü
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Veri Oranı
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Bağlı Cihaz
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">
                            Son Ping
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analysisResults.modemStations.map(
                          (station: ModemStation) => (
                            <tr
                              key={station.id}
                              className="bg-white hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 font-medium">
                                {station.name}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    station.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : station.status === "inactive"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {station.status === "active"
                                    ? "Aktif"
                                    : station.status === "inactive"
                                      ? "İnaktif"
                                      : "Bakım"}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`font-medium ${
                                    (station.signalStrength ?? 0) > 80
                                      ? "text-green-600"
                                      : (station.signalStrength ?? 0) > 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {station.signalStrength ?? 0}%
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`font-medium ${
                                    (station.dataRate ?? 0) > 90
                                      ? "text-green-600"
                                      : (station.dataRate ?? 0) > 70
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {station.dataRate ?? 0}%
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                {station.connectedDevices}
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-500">
                                {station.lastPing}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="py-8 text-center text-gray-500">
                    <p>Cihaz listesi ve detayları burada görüntülenecek</p>
                    <p className="text-sm text-gray-400">
                      Tablo: Cihaz ID, Model, Firmware, Durum, Son Güncelleme
                    </p>
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
