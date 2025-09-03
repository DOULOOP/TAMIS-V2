'use client';

import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Stroke, Circle as CircleStyle, Fill } from 'ol/style';
import Polygon from 'ol/geom/Polygon';
import 'ol/ol.css';

export type LonLat = [number, number]; // [lon, lat]

interface RouteMapProps {
  height?: string;
  center?: LonLat;
  zoom?: number;
  start?: LonLat | null;
  end?: LonLat | null;
  routeCoords?: LonLat[] | null; // route in lon/lat
  onSelectPoint?: (point: LonLat, kind: 'start' | 'end') => void;
  // Closed road zones to display: polygon points as [lat, lng]
  closedZones?: { id?: string; name?: string; polygon: [number, number][] }[];
  // Optional: allow drawing a new closed zone by clicking vertices, finish with double-click
  drawClosedZone?: boolean;
  onClosedZoneComplete?: (polygon: [number, number][]) => void;
  // Alternative routes to display (dashed)
  alternativeRoutes?: LonLat[][];
}

export default function RouteMap({
  height = '320px',
  center = [36.150837, 36.209898],
  zoom = 14,
  start = null,
  end = null,
  routeCoords = null,
  onSelectPoint,
  closedZones = [],
  drawClosedZone = false,
  onClosedZoneComplete,
  alternativeRoutes = [],
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerSourceRef = useRef<VectorSource | null>(null);
  const routeSourceRef = useRef<VectorSource | null>(null);
  const altRouteSourceRef = useRef<VectorSource | null>(null);
  const zonesSourceRef = useRef<VectorSource | null>(null);
  const tempDrawSourceRef = useRef<VectorSource | null>(null);
  // keep latest selection values for click handler
  const startRef = useRef<typeof start>(start);
  const endRef = useRef<typeof end>(end);
  const drawModeRef = useRef<boolean>(drawClosedZone);
  const tempPolyRef = useRef<[number, number][]>([]); // stores [lat,lng]
  useEffect(() => { startRef.current = start; }, [start]);
  useEffect(() => { endRef.current = end; }, [end]);
  useEffect(() => { drawModeRef.current = drawClosedZone; if (!drawClosedZone) { tempPolyRef.current = []; if (tempDrawSourceRef.current) tempDrawSourceRef.current.clear(); } }, [drawClosedZone]);

  // init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const base = new TileLayer({ source: new OSM() });

    const markerSource = new VectorSource();
    markerSourceRef.current = markerSource;
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: (feature) => {
        const isStart = feature.get('kind') === 'start';
        return new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: isStart ? '#10B981' : '#EF4444' }),
            stroke: new Stroke({ color: '#FFF', width: 2 }),
          }),
        });
      },
      zIndex: 10,
    });

    const routeSource = new VectorSource();
    routeSourceRef.current = routeSource;
    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({ color: '#2563EB', width: 4 }),
      }),
      zIndex: 5,
    });

    const altRouteSource = new VectorSource();
    altRouteSourceRef.current = altRouteSource;
    const altRouteLayer = new VectorLayer({
      source: altRouteSource,
      style: new Style({
        stroke: new Stroke({ color: '#60A5FA', width: 3, lineDash: [8, 6] }),
      }),
      zIndex: 4,
    });

    const zonesSource = new VectorSource();
    zonesSourceRef.current = zonesSource;
    const zonesLayer = new VectorLayer({
      source: zonesSource,
      style: new Style({
        stroke: new Stroke({ color: '#DC2626', width: 2 }),
        fill: new Fill({ color: 'rgba(220,38,38,0.2)' })
      }),
      zIndex: 2,
    });

    const tempDrawSource = new VectorSource();
    tempDrawSourceRef.current = tempDrawSource;
    const tempDrawLayer = new VectorLayer({
      source: tempDrawSource,
      style: new Style({
        stroke: new Stroke({ color: '#EF4444', width: 2, lineDash: [4,4] }),
        fill: new Fill({ color: 'rgba(239,68,68,0.15)' })
      }),
      zIndex: 6,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [base, zonesLayer, altRouteLayer, routeLayer, markerLayer, tempDrawLayer],
      view: new View({
        center: transform(center, 'EPSG:4326', 'EPSG:3857'),
        zoom,
      }),
    });
    mapInstanceRef.current = map;

    // selection logic: first click sets start, second sets end
    map.on('click', (evt) => {
      const [x, y] = evt.coordinate as [number, number]; // in 3857
      const transformed = transform([x, y], 'EPSG:3857', 'EPSG:4326');
      const lon = Number(transformed[0]);
      const lat = Number(transformed[1]);
      if (drawModeRef.current) {
        // draw mode: accumulate polygon points (store [lat,lng])
        tempPolyRef.current = [...tempPolyRef.current, [lat, lon]];
        // update preview polygon
        if (tempDrawSourceRef.current) {
          tempDrawSourceRef.current.clear();
          if (tempPolyRef.current.length >= 2) {
            const ringLonLat: [number, number][]= tempPolyRef.current.map(([la, lo]) => [lo, la]);
            if (ringLonLat.length > 0) {
              // close ring for preview
              const firstPoint = ringLonLat[0] as [number, number];
              const ringClosed = [...ringLonLat, firstPoint];
              const coords3857 = ringClosed.map((c: [number, number]) => transform(c, 'EPSG:4326', 'EPSG:3857') as [number, number]);
              const poly = new Polygon([coords3857]);
              const feat = new Feature({ geometry: poly });
              tempDrawSourceRef.current.addFeature(feat);
            }
          }
        }
        return;
      }
      if (!onSelectPoint) return;
      // decide based on latest values (refs) to avoid stale closure
      if (!startRef.current) {
        onSelectPoint([lon, lat], 'start');
      } else if (!endRef.current) {
        onSelectPoint([lon, lat], 'end');
      } else {
        // both set: start a new selection cycle
        onSelectPoint([lon, lat], 'start');
      }
    });

    // finish polygon with double click in draw mode
    map.on('dblclick', (evt) => {
      if (!drawModeRef.current) return;
      if (tempPolyRef.current.length >= 3) {
        const completed = tempPolyRef.current.slice();
        onClosedZoneComplete && onClosedZoneComplete(completed);
      }
      tempPolyRef.current = [];
      if (tempDrawSourceRef.current) tempDrawSourceRef.current.clear();
    });

    // hover cursor
    map.on('pointermove', (evt) => {
      map.getTargetElement().style.cursor = 'crosshair';
    });
  }, [center, zoom, onSelectPoint]);

  // update markers when start/end change
  useEffect(() => {
    if (!markerSourceRef.current) return;
    const src = markerSourceRef.current;
    src.clear();
    if (start) {
      const startFeature = new Feature({
        geometry: new Point(transform(start, 'EPSG:4326', 'EPSG:3857')),
      });
      startFeature.set('kind', 'start');
      src.addFeature(startFeature);
    }
    if (end) {
      const endFeature = new Feature({
        geometry: new Point(transform(end, 'EPSG:4326', 'EPSG:3857')),
      });
      endFeature.set('kind', 'end');
      src.addFeature(endFeature);
    }
  }, [start, end]);

  // update route line when provided
  useEffect(() => {
    if (!routeSourceRef.current) return;
    const src = routeSourceRef.current;
    src.clear();
    if (routeCoords && routeCoords.length > 1) {
      const line = new LineString(
        routeCoords.map((c) => transform(c, 'EPSG:4326', 'EPSG:3857'))
      );
      const feature = new Feature({ geometry: line });
      src.addFeature(feature);

      // fit view to route
      const map = mapInstanceRef.current;
      if (map) {
        const extent = line.getExtent();
        map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 17 });
      }
    }
  }, [routeCoords]);

  // update alternative routes layer
  useEffect(() => {
    if (!altRouteSourceRef.current) return;
    const src = altRouteSourceRef.current;
    src.clear();
    if (alternativeRoutes && alternativeRoutes.length) {
      for (const coords of alternativeRoutes) {
        if (coords.length > 1) {
          const line = new LineString(coords.map((c) => transform(c, 'EPSG:4326', 'EPSG:3857')));
          src.addFeature(new Feature({ geometry: line }));
        }
      }
    }
  }, [alternativeRoutes]);

  // update zones layer when closedZones change
  useEffect(() => {
    if (!zonesSourceRef.current) return;
    const src = zonesSourceRef.current;
    src.clear();
    if (closedZones && closedZones.length) {
      for (const z of closedZones) {
        if (z.polygon && z.polygon.length >= 3) {
          const ringLonLat = z.polygon.map(([la, lo]) => [lo, la]) as [number, number][];
          if (ringLonLat.length > 0) {
            const firstPoint = ringLonLat[0] as [number, number];
            const ringClosed = [...ringLonLat, firstPoint];
            const coords3857 = ringClosed.map((c: [number, number]) => transform(c, 'EPSG:4326', 'EPSG:3857') as [number, number]);
            const poly = new Polygon([coords3857]);
            const feat = new Feature({ geometry: poly });
            feat.set('zone_id', z.id || '');
            src.addFeature(feat);
          }
        }
      }
    }
  }, [closedZones]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height, position: 'relative' }}
      className="rounded overflow-hidden border border-gray-200"
    />
  );
}
