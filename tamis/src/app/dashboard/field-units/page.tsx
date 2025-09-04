"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { fieldUnitsData } from "@/data";
import HowItWorks from "@/components/ui/HowItWorks";

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

export default function FieldUnitsPage() {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  // Get data from JSON
  const fieldUnits = fieldUnitsData.fieldUnitsData.fieldUnits;
  const summary = fieldUnitsData.fieldUnitsData.summary;

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

  const handleUnitClick = (unit: any) => {
    setSelectedUnit(unit);
    setShowDetails(true);
  };

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
              title="Saha Birimleri"
              howToUseText="Afet ve kriz yönetiminde en kritik konulardan biri mevcut kaynakların (insan gücü, araç, ekipman, sağlık hizmetleri vb.) doğru dağıtılması ve koordinasyonudur. Projemizin bu modülü, canlı envanter takibi, akıllı görevlendirme ve çakışma önleme mekanizmalarıyla, sahadaki ekiplerin en verimli şekilde yönlendirilmesini sağlar."
              howItWorksText=", afet sırasında mevcut kaynakları (ekipler, araçlar, ekipman, sağlık hizmetleri) anlık olarak izleyip en verimli şekilde yönlendirmek için çalışır. Kriz merkezi paneli ve mobil uygulama üzerinden tüm ekiplerin konumu GPS ile takip edilir, canlı envanter sürekli güncellenir. Optimizasyon algoritmaları; görev önceliği, mesafe ve ekip uygunluğunu değerlendirerek en uygun ekibi sahaya atar. Çakışma önleme mekanizması sayesinde aynı bölgeye gereksiz ekip yönlendirilmez, böylece zaman ve kaynak israfı engellenir. Ekip liderleri mobil uygulamadan görev bildirimlerini alır, konum ve durum güncellemeleri yapar. Tüm bu bilgiler gerçek zamanlı olarak harita tabanlı dashboard’a yansır ve kriz yönetim ekibi anlık karar alabilir."
              ariaLabel="Saha birimleri nasıl çalışır"
            />
          </div>
          {/* Analysis Description */}
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Modül Hakkında
              </h2>
              <p className="text-gray-600">
                Kaynak Dağılımı ve Ekip Yönetimi Modülü, afet sırasında mevcut
                kaynakları (ekipler, araçlar, ekipman, sağlık hizmetleri) anlık
                olarak izleyip en verimli şekilde yönlendirmek için çalışır.
                Kriz merkezi paneli ve mobil uygulama üzerinden tüm ekiplerin
                konumu GPS ile takip edilir, canlı envanter sürekli güncellenir.
                <br></br>
                Sistem, önce uydu veya İHA görüntülerinden elde edilen hasarlı
                alan poligonlarını çıkarır. Bu poligonlar CBS (Coğrafi Bilgi
                Sistemleri) üzerinde bina poligonlarıyla çakıştırılır. Her bina
                için kayıtlı nüfus (MAKS verisi) ve AAIA’dan gelen cihaz
                verileri eşleştirilir. Daha sonra cihaz sayıları kişi tahminine
                dönüştürülür ve kayıtlı nüfus ile ağırlıklı ortalama alınarak
                gerçekçi bir nüfus değeri hesaplanır.
              </p>
            </div>
          </div>
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
            </div>
            <div className="p-6">
              <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-gray-500">Saha Birimleri Haritası</p>
                  <p className="text-sm text-gray-400">
                    {fieldUnits.length} birim görüntülenecek
                  </p>
                </div>
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
                        {selectedUnit.personnel.map((person: any) => (
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
                        {selectedUnit.equipment.map((equipment: any) => (
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Vehicle Info */}
              {selectedUnit.vehicle && (
                <div className="mt-6">
                  <h4 className="text-md mb-3 font-semibold text-gray-900">
                    Araç Bilgileri
                  </h4>
                  <div className="rounded bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
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
