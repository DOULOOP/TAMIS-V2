"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const FieldUnitsMap = dynamic(() => import("@/components/map/FieldUnitsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

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

interface FieldUnitsData {
  summary: {
    totalUnits: number;
    activeUnits: number;
    reportingUnits: number;
    inactiveUnits: number;
    totalPersonnel: number;
    totalEquipment: number;
    averageBatteryLevel: number;
    averageSignalStrength: number;
    totalDataPoints: number;
    coverageAreas: number;
  };
  fieldUnits: FieldUnitDetails[];
}

export default function FieldUnitsPage() {
  const [selectedUnit, setSelectedUnit] = useState<FieldUnitDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [fieldUnitsData, setFieldUnitsData] = useState<FieldUnitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  // Veritabanından saha birim verilerini al
  const fetchFieldUnitsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/field-units');
      if (!response.ok) {
        throw new Error('Saha birim verileri alınamadı');
      }
      
      const data = await response.json();
      setFieldUnitsData(data.fieldUnitsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Saha birim verileri yüklenirken hata:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Component mount edildiğinde verileri yükle
  useEffect(() => {
    fetchFieldUnitsData();
  }, []);

  // Veri yoksa veya yükleniyorsa
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Saha birim verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFieldUnitsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!fieldUnitsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Saha birim verileri bulunamadı</p>
          <button
            onClick={fetchFieldUnitsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Yükle
          </button>
        </div>
      </div>
    );
  }

  const { fieldUnits, summary } = fieldUnitsData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-50 border-green-200";
      case "reporting":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "inactive":
        return "text-gray-500 bg-gray-50 border-gray-200";
      case "emergency":
        return "text-red-500 bg-red-50 border-red-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "reporting":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "emergency":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const handleUnitClick = (unit: FieldUnitDetails) => {
    setSelectedUnit(unit);
    setShowDetails(true);
  };

  const handleMapUnitSelect = (unit: FieldUnitDetails) => {
    setSelectedUnit(unit);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
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
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Saha Birim Yönetimi
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
                </div>
              )}
              <button
                onClick={fetchFieldUnitsData}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <svg
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? 'Yenileniyor...' : 'Yenile'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto  py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Toplam Birim
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalUnits}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Aktif Birim
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.activeUnits}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Toplam Personel
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalPersonnel}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
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
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Ekipman Sayısı
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalEquipment}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">
                Saha Birimleri Haritası
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {fieldUnits.length} birim görüntüleniyor • Son güncelleme: {lastUpdated?.toLocaleTimeString('tr-TR')}
              </p>
            </div>
            <div className="p-6">
              <div className="h-96 rounded-lg overflow-hidden">
                <FieldUnitsMap
                  fieldUnits={fieldUnits}
                  selectedUnit={selectedUnit}
                  onUnitSelect={handleMapUnitSelect}
                />
              </div>
            </div>
          </div>

          {/* Field Units List */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">
                Saha Birimleri
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-6">
                {fieldUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                      selectedUnit?.id === unit.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleUnitClick(unit)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center">
                          <h3 className="mr-3 text-lg font-medium text-gray-900">
                            {unit.name}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(unit.status)}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(unit.status)}
                            </span>
                            {unit.status === "active"
                              ? "Aktif"
                              : unit.status === "reporting"
                                ? "Raporluyor"
                                : unit.status === "inactive"
                                  ? "Pasif"
                                  : unit.status === "emergency"
                                    ? "Acil Durum"
                                    : unit.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                          <div>
                            <span className="font-medium">Lokasyon:</span>
                            <br />
                            {unit.location}
                          </div>
                          <div>
                            <span className="font-medium">Takım Lideri:</span>
                            <br />
                            {unit.teamLeader}
                          </div>
                          <div>
                            <span className="font-medium">Görev:</span>
                            <br />
                            {unit.missionType}
                          </div>
                          <div>
                            <span className="font-medium">Son Rapor:</span>
                            <br />
                            {unit.lastReport}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="mb-1 text-sm text-gray-500">
                          Batarya
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            unit.batteryLevel > 50
                              ? "text-green-600"
                              : unit.batteryLevel > 20
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {unit.batteryLevel}%
                        </div>
                        <div className="mt-2 mb-1 text-sm text-gray-500">
                          Sinyal
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            unit.signalStrength > 70
                              ? "text-green-600"
                              : unit.signalStrength > 40
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {unit.signalStrength}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && selectedUnit && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-11/12 max-w-4xl rounded-md border bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedUnit.name} - Detaylar
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowDetails(false)}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Personnel */}
                {selectedUnit.personnel &&
                  selectedUnit.personnel.length > 0 && (
                    <div>
                      <h4 className="text-md mb-3 font-semibold text-gray-900">
                        Personel
                      </h4>
                      <div className="space-y-2">
                        {selectedUnit.personnel.map((person: Personnel) => (
                          <div
                            key={person.id}
                            className="rounded bg-gray-50 p-3"
                          >
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm text-gray-600">
                              {person.role}
                            </div>
                            <div className="text-sm text-gray-500">
                              {person.contact}
                            </div>
                            {person.certification && (
                              <div className="text-xs text-blue-600 mt-1">
                                Sertifika: {person.certification}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Equipment */}
                {selectedUnit.equipment &&
                  selectedUnit.equipment.length > 0 && (
                    <div>
                      <h4 className="text-md mb-3 font-semibold text-gray-900">
                        Ekipman
                      </h4>
                      <div className="space-y-2">
                        {selectedUnit.equipment.map((equipment: Equipment) => (
                          <div
                            key={equipment.id}
                            className="rounded bg-gray-50 p-3"
                          >
                            <div className="font-medium">{equipment.name}</div>
                            <div className="text-sm text-gray-600">
                              {equipment.type}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                equipment.status === "active"
                                  ? "text-green-600"
                                  : equipment.status === "maintenance"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {equipment.status === "active"
                                ? "Aktif"
                                : equipment.status === "maintenance"
                                  ? "Bakım"
                                  : "Arızalı"}
                            </div>
                            {equipment.lastMaintenance && (
                              <div className="text-xs text-gray-500 mt-1">
                                Son bakım: {equipment.lastMaintenance}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Communications */}
              {selectedUnit.communications && (
                <div className="mt-6">
                  <h4 className="text-md mb-3 font-semibold text-gray-900">
                    İletişim Durumu
                  </h4>
                  <div className="rounded bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                      <div>
                        <span className="font-medium">Radyo:</span>
                        <br />
                        <span className={selectedUnit.communications.radio === 'active' ? 'text-green-600' : 'text-red-600'}>
                          {selectedUnit.communications.radio === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Uydu:</span>
                        <br />
                        <span className={selectedUnit.communications.satellite === 'active' ? 'text-green-600' : 'text-red-600'}>
                          {selectedUnit.communications.satellite === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Hücresel:</span>
                        <br />
                        <span className={selectedUnit.communications.cellular === 'active' ? 'text-green-600' : 'text-red-600'}>
                          {selectedUnit.communications.cellular === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              {selectedUnit.vehicle && (
                <div className="mt-6">
                  <h4 className="text-md mb-3 font-semibold text-gray-900">
                    Araç Bilgileri
                  </h4>
                  <div className="rounded bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="font-medium">Tip:</span>
                        <br />
                        {selectedUnit.vehicle.type}
                      </div>
                      <div>
                        <span className="font-medium">Plaka:</span>
                        <br />
                        {selectedUnit.vehicle.plateNumber}
                      </div>
                      <div>
                        <span className="font-medium">Yakıt:</span>
                        <br />
                        <span
                          className={`font-semibold ${
                            selectedUnit.vehicle.fuelLevel > 50
                              ? "text-green-600"
                              : selectedUnit.vehicle.fuelLevel > 20
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {selectedUnit.vehicle.fuelLevel}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Durum:</span>
                        <br />
                        <span className={selectedUnit.vehicle.condition === 'good' ? 'text-green-600' : 'text-yellow-600'}>
                          {selectedUnit.vehicle.condition === 'good' ? 'İyi' : 'Bakım Gerekli'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
