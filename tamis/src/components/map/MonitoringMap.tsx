'use client';

import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
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
import LineString from 'ol/geom/LineString';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import 'ol/ol.css';

interface LayerConfig {
  id: string;
  name: string;
  type: 'population' | 'safeZone' | 'aidRoute' | 'communication' | 'fieldUnit';
  enabled: boolean;
  color: string;
  opacity: number;
  icon: string;
}

interface MonitoringMapProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  onMapReady?: (map: Map) => void;
  layers: LayerConfig[];
  onFeatureSelect?: Dispatch<SetStateAction<any>>;
  dataMap?: {
    population?: any;
    safeZone?: any;
    aidRoute?: any;
    communication?: any;
    fieldUnit?: any;
  };
}

export default function MonitoringMap({ 
  height = '100%', 
  center = [36.150837, 36.209898],
  zoom = 13,
  onMapReady,
  layers,
  onFeatureSelect,
  dataMap
}: MonitoringMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorLayersRef = useRef<{ [key: string]: VectorLayer<VectorSource> }>({});
  const onFeatureSelectRef = useRef<typeof onFeatureSelect>(undefined);
  onFeatureSelectRef.current = onFeatureSelect;

  useEffect(() => {
    if (!mapRef.current) return;

    // Create base layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Create map instance
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer],
      view: new View({
        center: transform(center, 'EPSG:4326', 'EPSG:3857'),
        zoom: zoom,
      }),
    });

    mapInstanceRef.current = map;

    // Add click handler for feature selection
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature && onFeatureSelectRef.current) {
        const properties = (feature as Feature).getProperties();
        onFeatureSelectRef.current(properties.data);
      } else if (onFeatureSelectRef.current) {
        onFeatureSelectRef.current(null);
      }
    });

    // Change cursor on hover
    map.on('pointermove', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      map.getTargetElement().style.cursor = feature ? 'pointer' : '';
    });

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
  // initialize once
  }, []);

  // Keep view in sync if center/zoom props change (without recreating map)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const view = mapInstanceRef.current.getView();
    if (center) view.setCenter(transform(center, 'EPSG:4326', 'EPSG:3857'));
    if (typeof zoom === 'number') view.setZoom(zoom);
  }, [center, zoom]);

  // Update layers when layer configuration changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove all existing vector layers
    Object.values(vectorLayersRef.current).forEach(layer => {
      map.removeLayer(layer);
    });
    vectorLayersRef.current = {};

    // Add layers based on configuration
    layers.forEach(layerConfig => {
      if (!layerConfig.enabled) return;

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: createLayerStyle(layerConfig),
        opacity: layerConfig.opacity,
        zIndex: getLayerZIndex(layerConfig.type)
      });

      // Add layer data based on type
      addLayerData(vectorSource, layerConfig);

      map.addLayer(vectorLayer);
      vectorLayersRef.current[layerConfig.id] = vectorLayer;
    });
  }, [layers, dataMap]);

  const createLayerStyle = (layerConfig: LayerConfig) => {
    return (feature: FeatureLike) => {
      const properties = (feature as Feature).getProperties();
      const data = properties.data;
      
      switch (layerConfig.type) {
        case 'population':
          return createPopulationStyle(layerConfig.color, data);
        case 'safeZone':
          return createSafeZoneStyle(layerConfig.color, data);
        case 'aidRoute':
          return createAidRouteStyle(layerConfig.color, data);
        case 'communication':
          return createCommunicationStyle(layerConfig.color, data);
        case 'fieldUnit':
          return createFieldUnitStyle(layerConfig.color, data);
        default:
          return createDefaultStyle(layerConfig.color);
      }
    };
  };

  const createPopulationStyle = (color: string, data: any) => {
    const intensity = data?.density ? Math.min(data.density / 4000, 1) : 0.5;
    const fillColor = hexToRgba(color, 0.3 + intensity * 0.4);
    
    return new Style({
      fill: new Fill({ color: fillColor }),
      stroke: new Stroke({ color, width: 2 }),
      text: new Text({
        text: data?.population?.toString() || '',
        font: '12px Arial',
        fill: new Fill({ color: '#fff' }),
        stroke: new Stroke({ color: '#000', width: 2 })
      })
    });
  };

  const createSafeZoneStyle = (color: string, data: any) => {
    const fillColor = data?.status === 'critical' ? '#ff4444' : 
                     data?.status === 'warning' ? '#ffaa44' : color;
    
    return new Style({
      fill: new Fill({ color: hexToRgba(fillColor, 0.4) }),
      stroke: new Stroke({ color: fillColor, width: 2 }),
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: '🛡️',
        font: '16px Arial',
        offsetY: -20
      })
    });
  };

  const createAidRouteStyle = (color: string, data: any) => {
    const strokeColor = data?.status === 'blocked' ? '#ff4444' : 
                       data?.status === 'delayed' ? '#ffaa44' : color;
    
    return new Style({
      stroke: new Stroke({ 
        color: strokeColor, 
        width: 4,
        lineDash: data?.status === 'blocked' ? [10, 5] : undefined
      }),
      text: new Text({
        text: data?.name || '',
        font: '11px Arial',
        fill: new Fill({ color: '#fff' }),
        stroke: new Stroke({ color: '#000', width: 2 }),
        placement: 'line'
      })
    });
  };

  const createCommunicationStyle = (color: string, data: any) => {
    const radius = 6 + (data?.signalStrength || 0) / 100 * 8;
    const fillColor = data?.status === 'inactive' ? '#ff4444' : 
                     data?.status === 'maintenance' ? '#ffaa44' : color;
    
    return new Style({
      image: new CircleStyle({
        radius,
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: '📡',
        font: '14px Arial',
        offsetY: -20
      })
    });
  };

  const createFieldUnitStyle = (color: string, data: any) => {
    const fillColor = data?.status === 'inactive' ? '#ff4444' : 
                     data?.batteryLevel < 30 ? '#ffaa44' : color;
    
    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: '📱',
        font: '12px Arial',
        offsetY: -18
      })
    });
  };

  const createDefaultStyle = (color: string) => {
    return new Style({
      fill: new Fill({ color: hexToRgba(color, 0.3) }),
      stroke: new Stroke({ color, width: 2 }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: '#fff', width: 1 })
      })
    });
  };

  const getLayerZIndex = (type: LayerConfig['type']): number => {
    switch (type) {
      case 'population': return 1;
      case 'aidRoute': return 2;
      case 'safeZone': return 3;
      case 'communication': return 4;
      case 'fieldUnit': return 5;
      default: return 0;
    }
  };

  const addLayerData = (vectorSource: VectorSource, layerConfig: LayerConfig) => {
    // Prefer provided dataMap to avoid dynamic imports on client
    let sourceData: any | undefined;
    switch (layerConfig.type) {
      case 'population':
        sourceData = dataMap?.population;
        break;
      case 'safeZone':
        sourceData = dataMap?.safeZone;
        break;
      case 'aidRoute':
        sourceData = dataMap?.aidRoute;
        break;
      case 'communication':
        sourceData = dataMap?.communication;
        break;
      case 'fieldUnit':
        sourceData = dataMap?.fieldUnit;
        break;
    }
    if (!sourceData) return;

    const features = createFeaturesFromData(sourceData, layerConfig.type);
    vectorSource.addFeatures(features);
  };

  const createFeaturesFromData = (data: any, type: LayerConfig['type']): Feature[] => {
    const features: Feature[] = [];

    switch (type) {
      case 'population':
        data.populationDensityAnalysis?.populationData?.forEach((zone: any) => {
          if (zone.bounds) {
            const polygon = new Polygon([[
              transform([zone.bounds.west, zone.bounds.north], 'EPSG:4326', 'EPSG:3857'),
              transform([zone.bounds.east, zone.bounds.north], 'EPSG:4326', 'EPSG:3857'),
              transform([zone.bounds.east, zone.bounds.south], 'EPSG:4326', 'EPSG:3857'),
              transform([zone.bounds.west, zone.bounds.south], 'EPSG:4326', 'EPSG:3857'),
              transform([zone.bounds.west, zone.bounds.north], 'EPSG:4326', 'EPSG:3857')
            ]]);
            
            const feature = new Feature({ geometry: polygon });
            feature.setProperties({ data: zone });
            features.push(feature);
          }
        });
        break;

      case 'safeZone':
        data.safeZoneAnalysis?.safeZones?.forEach((zone: any) => {
          if (zone.coordinates) {
            const point = new Point(transform(zone.coordinates, 'EPSG:4326', 'EPSG:3857'));
            const feature = new Feature({ geometry: point });
            feature.setProperties({ data: zone });
            features.push(feature);
          }
        });
        break;

      case 'aidRoute':
        data.aidRouteAnalysis?.routes?.forEach((route: any) => {
          if (route.startPoint && route.endPoint) {
            const coordinates = [
              transform(route.startPoint.coordinates, 'EPSG:4326', 'EPSG:3857'),
              ...((route.waypoints || []).map((wp: any) => 
                transform(wp.coordinates, 'EPSG:4326', 'EPSG:3857')
              )),
              transform(route.endPoint.coordinates, 'EPSG:4326', 'EPSG:3857')
            ];
            
            const lineString = new LineString(coordinates);
            const feature = new Feature({ geometry: lineString });
            feature.setProperties({ data: route });
            features.push(feature);
          }
        });
        break;

      case 'communication':
        data.communicationNetworkAnalysis?.modemStations?.forEach((modem: any) => {
          if (modem.location?.coordinates) {
            const point = new Point(transform(modem.location.coordinates, 'EPSG:4326', 'EPSG:3857'));
            const feature = new Feature({ geometry: point });
            feature.setProperties({ data: modem });
            features.push(feature);
            
            // Add coverage circle
            if (modem.coverageRadius) {
              const circle = new Circle(
                transform(modem.location.coordinates, 'EPSG:4326', 'EPSG:3857'),
                modem.coverageRadius * 1000 // Convert km to meters
              );
              const coverageFeature = new Feature({ geometry: circle });
              coverageFeature.setProperties({ data: { ...modem, iscoverage: true } });
              features.push(coverageFeature);
            }
          }
        });
        break;

      case 'fieldUnit':
        data.fieldUnitsData?.fieldUnits?.forEach((unit: any) => {
          if (unit.location?.coordinates) {
            const point = new Point(transform(unit.location.coordinates, 'EPSG:4326', 'EPSG:3857'));
            const feature = new Feature({ geometry: point });
            feature.setProperties({ data: unit });
            features.push(feature);
          }
        });
        break;
    }

    return features;
  };

  const hexToRgba = (hex: string, opacity: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) return `rgba(0, 0, 0, ${opacity})`;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height, 
        position: 'relative' 
      }}
      className="monitoring-map"
    />
  );
}
