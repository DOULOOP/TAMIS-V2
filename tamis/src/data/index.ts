// Sample data for TAMIS (Instant Hazard Engineering Monitoring System)

// Population Density Analysis Data
import populationDensityData from './population-density.json';

// Safe Zone Analysis Data  
import safeZoneData from './safe-zone.json';

// Aid Route Analysis Data
import aidRouteData from './aid-route.json';

// Communication Network Analysis Data
import communicationNetworkData from './communication-network.json';

// Field Units Data
import fieldUnitsData from './field-units.json';

export {
  populationDensityData,
  safeZoneData,
  aidRouteData,
  communicationNetworkData,
  fieldUnitsData
};

// Export individual sections for easy access
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

// Helper functions to get specific data
export const getPopulationZones = () => populationDensityAnalysis.populationData;
export const getSafeZones = () => safeZoneAnalysis.safeZones;
export const getAidRoutes = () => aidRouteAnalysis.routes;
export const getModemStations = () => communicationNetworkAnalysis.modemStations;
export const getFieldUnits = () => fieldUnitsAnalysis.fieldUnits;
export const getAreaData = () => fieldUnitsAnalysis.areaData;

// Data summary functions
export const getSystemSummary = () => ({
  population: populationDensityAnalysis.summary,
  safeZones: safeZoneAnalysis.summary,
  aidRoutes: aidRouteAnalysis.summary,
  communications: communicationNetworkAnalysis.summary,
  fieldUnits: fieldUnitsAnalysis.summary
});

// Alert type definition
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
  
  // Population density critical zones
  populationDensityAnalysis.riskAssessment.criticalZones.forEach(zone => {
    alerts.push({
      type: 'population',
      level: 'critical',
      message: `High risk zone: ${zone.zoneId}`,
      factors: zone.riskFactors
    });
  });
  
  // Safe zone critical occupancy
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
  
  // Blocked aid routes
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
  
  // Communication network critical issues
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
  
  // Field unit critical issues
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
