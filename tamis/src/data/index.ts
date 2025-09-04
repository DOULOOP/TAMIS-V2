// TAMIS (Anlık Tehlike Mühendisliği İzleme Sistemi) için örnek veriler

// Nüfus Yoğunluğu Analiz Verileri
import populationDensityData from './population-density.json';

// Güvenli Bölge Analiz Verileri  
import safeZoneData from './safe-zone.json';

// Yardım Rotası Analiz Verileri
import aidRouteData from './aid-route.json';

// İletişim Ağı Analiz Verileri
import communicationNetworkData from './communication-network.json';

// Saha Birimleri Verileri
import fieldUnitsData from './field-units.json';

export {
  populationDensityData,
  safeZoneData,
  aidRouteData,
  communicationNetworkData,
  fieldUnitsData
};

// Kolay erişim için bireysel bölümleri dışa aktar
export const {
  populationDensityAnalysis
} = populationDensityData;

export const {
  safeZoneAnalysis
} = safeZoneData;

export const {
  aidRouteAnalysis
} = aidRouteData;

export const {
  communicationNetworkAnalysis
} = communicationNetworkData;

export const {
  fieldUnitsData: fieldUnitsAnalysis
} = fieldUnitsData;

// Belirli verileri almak için yardımcı fonksiyonlar
export const getPopulationZones = () => populationDensityAnalysis.populationData;
export const getSafeZones = () => safeZoneAnalysis.safeZones;
export const getAidRoutes = () => aidRouteAnalysis.routes;
export const getModemStations = () => communicationNetworkAnalysis.modemStations;
export const getFieldUnits = () => fieldUnitsAnalysis.fieldUnits;
export const getAreaData = () => fieldUnitsAnalysis.areaData;

// Veri özet fonksiyonları
export const getSystemSummary = () => ({
  population: populationDensityAnalysis.summary,
  safeZones: safeZoneAnalysis.summary,
  aidRoutes: aidRouteAnalysis.summary,
  communications: communicationNetworkAnalysis.summary,
  fieldUnits: fieldUnitsAnalysis.summary
});

// Uyarı tipi tanımı
interface Alert {
  type: string;
  level: string;
  message: string;
  factors?: string[];
  occupancy?: number;
  reason?: string;
  timestamp?: string;
  details?: string;
}

export const getCriticalAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  
  // Nüfus yoğunluğu kritik bölgeleri
  populationDensityAnalysis.riskAssessment.criticalZones.forEach(zone => {
    alerts.push({
      type: 'population',
      level: 'critical',
      message: `High risk zone: ${zone.zoneId}`,
      factors: zone.riskFactors
    });
  });
  
  // Güvenli bölge kritik doluluk
  safeZoneAnalysis.safeZones.forEach(zone => {
    if (zone.status === 'critical') {
      alerts.push({
        type: 'safe_zone',
        level: 'critical',
        message: `Critical occupancy: ${zone.name}`,
        occupancy: zone.occupancyRate
      });
    }
  });
  
  // Engellenen yardım rotaları
  aidRouteAnalysis.routes.forEach(route => {
    if (route.status === 'blocked') {
      alerts.push({
        type: 'aid_route',
        level: 'critical',
        message: `Blocked route: ${route.name}`,
        reason: route.blockageReason
      });
    }
  });
  
  // İletişim ağı kritik sorunları
  communicationNetworkAnalysis.modemStations.forEach(modem => {
    modem.alerts.forEach(alert => {
      if (alert.level === 'critical') {
        alerts.push({
          type: 'communication',
          level: 'critical',
          message: `${modem.name}: ${alert.message}`,
          timestamp: alert.timestamp
        });
      }
    });
  });
  
  // Saha birimi kritik sorunları
  fieldUnitsAnalysis.fieldUnits.forEach(unit => {
    if (unit.status === 'inactive' || unit.batteryLevel < 30) {
      alerts.push({
        type: 'field_unit',
        level: unit.status === 'inactive' ? 'critical' : 'warning',
        message: `Unit issue: ${unit.name}`,
        details: unit.status === 'inactive' ? 'Unit offline' : 'Low battery'
      });
    }
  });
  
  return alerts;
};

export default {
  populationDensityData,
  safeZoneData,
  aidRouteData,
  communicationNetworkData,
  fieldUnitsData,
  getSystemSummary,
  getCriticalAlerts
};
