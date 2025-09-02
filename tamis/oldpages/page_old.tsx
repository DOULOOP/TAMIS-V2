'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fieldUnitsData } from '@/data';

// Dynamically import the map component to avoid SSR issues
const FieldUnitsMap = dynamic(() => import('@/components/map/FieldUnitsMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64">Harita yükleniyor...</div>
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

export default function FieldUnitsPage() {
  const [selectedUnit, setSelectedUnit] = useState<FieldUnitDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  // Get data from JSON and adapt to existing interface
  const adaptFieldUnitsData = () => {
    return fieldUnitsData.fieldUnits.map((unit: any) => ({
      id: unit.id,
      name: unit.name,
      location: unit.location,
      coordinates: unit.coordinates as [number, number],
      status: unit.status,
      lastReport: unit.lastReport,
      dataCount: unit.dataCount || 0,
      areasCovered: unit.areasCovered || [],
      batteryLevel: unit.batteryLevel,
      signalStrength: unit.signalStrength,
      teamLeader: unit.teamLeader,
      establishedTime: unit.establishedTime,
      missionType: unit.missionType,
      personnel: unit.personnel || [],
      equipment: unit.equipment || [],
      communications: unit.communications || {},
      vehicle: unit.vehicle || {}
    }));
  };

  const fieldUnits = adaptFieldUnitsData();

  // Get status colors and icons
      name: 'Alfa Takımı',
      location: 'Merkez Bölge A',
      coordinates: [36.206, 36.147],
      status: 'active',
      lastReport: '2 dakika önce',
      dataCount: 45,
      areasCovered: ['Merkez İlkokulu', 'Atatürk Parkı'],
      batteryLevel: 87,
      signalStrength: 92,
      teamLeader: 'Mühendis Ahmet Kaya',
      establishedTime: '08:30',
      missionType: 'Doluluk Oranı İzleme',
      personnel: [
        {
          id: 'p1',
          name: 'Mühendis Ahmet Kaya',
          role: 'Takım Lideri',
          certification: 'İnşaat Mühendisi',
          experience: '8 yıl',
          contact: '+90 555 123 4567'
        },
        {
          id: 'p2',
          name: 'Teknisyen Mehmet Özkan',
          role: 'Veri Toplama Uzmanı',
          certification: 'Harita Teknisyeni',
          experience: '5 yıl',
          contact: '+90 555 234 5678'
        },
        {
          id: 'p3',
          name: 'Görevli Fatma Demir',
          role: 'İletişim Sorumlusu',
          certification: 'Acil Durum Teknisyeni',
          experience: '3 yıl',
          contact: '+90 555 345 6789'
        }
      ],
      equipment: [
        {
          id: 'eq1',
          name: 'GPS Alıcısı',
          type: 'Navigasyon',
          status: 'active',
          condition: 'İyi',
          lastMaintenance: '15 Ağustos 2025'
        },
        {
          id: 'eq2',
          name: 'Taşınabilir Radar',
          type: 'Ölçüm',
          status: 'active',
          condition: 'Mükemmel',
          lastMaintenance: '10 Ağustos 2025'
        },
        {
          id: 'eq3',
          name: 'Drone DJI Phantom',
          type: 'Görüntüleme',
          status: 'active',
          condition: 'İyi',
          lastMaintenance: '20 Ağustos 2025'
        },
        {
          id: 'eq4',
          name: 'Tablet Bilgisayar',
          type: 'Veri Toplama',
          status: 'active',
          condition: 'İyi',
          lastMaintenance: '25 Ağustos 2025'
        }
      ],
      communications: {
        radio: 'VHF 156.800 MHz',
        satellite: 'Thuraya XT-LITE',
        cellular: '4G LTE Aktif'
      },
      vehicle: {
        type: 'Arazi Aracı - Toyota Hilux',
        plateNumber: '06 TAM 2024',
        fuelLevel: 75,
        condition: 'İyi'
      }
    },
    {
      id: 'unit-002',
      name: 'Beta Takımı',
      location: 'Kuzey Bölge B',
      coordinates: [36.212, 36.154],
      status: 'reporting',
      lastReport: '5 dakika önce',
      dataCount: 32,
      areasCovered: ['Spor Stadyumu', 'Belediye Parkı'],
      batteryLevel: 64,
      signalStrength: 78,
      teamLeader: 'Mühendis Zeynep Yılmaz',
      establishedTime: '09:00',
      missionType: 'Güvenlik Alan Kontrolü',
      personnel: [
        {
          id: 'p4',
          name: 'Mühendis Zeynep Yılmaz',
          role: 'Takım Lideri',
          certification: 'Harita Mühendisi',
          experience: '6 yıl',
          contact: '+90 555 456 7890'
        },
        {
          id: 'p5',
          name: 'Teknisyen Ali Şen',
          role: 'Güvenlik Uzmanı',
          certification: 'İSG Uzmanı',
          experience: '4 yıl',
          contact: '+90 555 567 8901'
        }
      ],
      equipment: [
        {
          id: 'eq5',
          name: 'Termal Kamera',
          type: 'Görüntüleme',
          status: 'active',
          condition: 'İyi',
          lastMaintenance: '12 Ağustos 2025'
        },
        {
          id: 'eq6',
          name: 'Ses Seviye Ölçer',
          type: 'Ölçüm',
          status: 'warning',
          condition: 'Orta',
          lastMaintenance: '5 Ağustos 2025'
        }
      ],
      communications: {
        radio: 'UHF 450.125 MHz',
        satellite: 'Iridium 9555',
        cellular: '3G Zayıf'
      },
      vehicle: {
        type: 'Minibüs - Ford Transit',
        plateNumber: '06 TAM 2025',
        fuelLevel: 45,
        condition: 'Orta'
      }
    },
    {
      id: 'unit-003',
      name: 'Gamma Takımı',
      location: 'Güney Bölge C',
      coordinates: [36.208, 36.159],
      status: 'active',
      lastReport: '1 dakika önce',
      dataCount: 28,
      areasCovered: ['Cumhuriyet Meydanı'],
      batteryLevel: 91,
      signalStrength: 85,
      teamLeader: 'Mühendis Can Arslan',
      establishedTime: '08:45',
      missionType: 'Alan Kapasitesi Analizi',
      personnel: [
        {
          id: 'p6',
          name: 'Mühendis Can Arslan',
          role: 'Takım Lideri',
          certification: 'Şehir Plancısı',
          experience: '7 yıl',
          contact: '+90 555 678 9012'
        },
        {
          id: 'p7',
          name: 'Teknisyen Ayşe Kılıç',
          role: 'Veri Analisti',
          certification: 'CBS Uzmanı',
          experience: '4 yıl',
          contact: '+90 555 789 0123'
        }
      ],
      equipment: [
        {
          id: 'eq7',
          name: 'Lazer Mesafe Ölçer',
          type: 'Ölçüm',
          status: 'active',
          condition: 'Mükemmel',
          lastMaintenance: '18 Ağustos 2025'
        },
        {
          id: 'eq8',
          name: 'Tablet PC',
          type: 'Veri Toplama',
          status: 'active',
          condition: 'İyi',
          lastMaintenance: '22 Ağustos 2025'
        }
      ],
      communications: {
        radio: 'VHF 162.550 MHz',
        satellite: 'Thuraya X5-Touch',
        cellular: '4G LTE Güçlü'
      },
      vehicle: {
        type: 'SUV - Honda CR-V',
        plateNumber: '06 TAM 2026',
        fuelLevel: 85,
        condition: 'Mükemmel'
      }
    },
    {
      id: 'unit-004',
      name: 'Delta Takımı',
      location: 'Doğu Bölge D',
      coordinates: [36.204, 36.151],
      status: 'inactive',
      lastReport: '25 dakika önce',
      dataCount: 15,
      areasCovered: ['Sanayi Bölgesi'],
      batteryLevel: 23,
      signalStrength: 45,
      teamLeader: 'Mühendis Oğuz Tuncay',
      establishedTime: '07:30',
      missionType: 'Altyapı Kontrolü',
      personnel: [
        {
          id: 'p8',
          name: 'Mühendis Oğuz Tuncay',
          role: 'Takım Lideri',
          certification: 'Makine Mühendisi',
          experience: '9 yıl',
          contact: '+90 555 890 1234'
        },
        {
          id: 'p9',
          name: 'Teknisyen Serkan Demirtaş',
          role: 'Teknik Uzman',
          certification: 'Elektrik Teknisyeni',
          experience: '6 yıl',
          contact: '+90 555 901 2345'
        }
      ],
      equipment: [
        {
          id: 'eq9',
          name: 'Multimetre',
          type: 'Ölçüm',
          status: 'inactive',
          condition: 'Orta',
          lastMaintenance: '1 Ağustos 2025'
        },
        {
          id: 'eq10',
          name: 'Endoskop Kamera',
          type: 'İnceleme',
          status: 'maintenance',
          condition: 'Bakım Gerekli',
          lastMaintenance: '28 Temmuz 2025'
        }
      ],
      communications: {
        radio: 'UHF 465.000 MHz',
        satellite: 'Bağlantı Yok',
        cellular: '2G Zayıf'
      },
      vehicle: {
        type: 'Pickup - Mitsubishi L200',
        plateNumber: '06 TAM 2023',
        fuelLevel: 15,
        condition: 'Bakım Gerekli'
      }
    }
  ];

  // Get status colors and icons
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-50 border-green-200';
      case 'reporting': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'inactive': return 'text-red-500 bg-red-50 border-red-200';
      case 'emergency': return 'text-orange-500 bg-orange-50 border-orange-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 70) return 'text-green-500';
    if (strength > 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleUnitSelect = (unit: FieldUnitDetails) => {
    setSelectedUnit(unit);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">📡</span>
                  Saha Birim Yönetimi
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Aktif saha birimlerinin konum ve detay bilgileri
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {fieldUnits.filter(u => u.status === 'active').length} Aktif
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {fieldUnits.filter(u => u.status === 'reporting').length} Raporluyor
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {fieldUnits.filter(u => u.status === 'inactive').length} Pasif
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Units List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Saha Birimleri</h3>
              <div className="space-y-3">
                {fieldUnits.map((unit) => (
                  <div 
                    key={unit.id}
                    onClick={() => handleUnitSelect(unit)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedUnit?.id === unit.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">{unit.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(unit.status)}`}>
                        {unit.status === 'active' ? 'Aktif' : 
                         unit.status === 'reporting' ? 'Raporluyor' : 'Pasif'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <span className="mr-1">👤</span>
                        <span>{unit.teamLeader}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">📍</span>
                        <span>{unit.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center">
                          <span className={`mr-1 ${getBatteryColor(unit.batteryLevel)}`}>🔋</span>
                          <span>{unit.batteryLevel}%</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`mr-1 ${getSignalColor(unit.signalStrength)}`}>📶</span>
                          <span>{unit.signalStrength}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Birim Konumları</h3>
              <div className="h-96">
                <FieldUnitsMap 
                  fieldUnits={fieldUnits}
                  selectedUnit={selectedUnit}
                  onUnitSelect={handleUnitSelect}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Unit Details Modal */}
        {showDetails && selectedUnit && (
          <div className="fixed inse    t-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📡</span>
                  {selectedUnit.name} - Detay Bilgileri
                </h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">ℹ️</span>
                      Temel Bilgiler
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Takım Lideri:</strong> {selectedUnit.teamLeader}</div>
                      <div><strong>Görev Tipi:</strong> {selectedUnit.missionType}</div>
                      <div><strong>Kurulum Saati:</strong> {selectedUnit.establishedTime}</div>
                      <div><strong>Son Rapor:</strong> {selectedUnit.lastReport}</div>
                      <div><strong>Toplanan Veri:</strong> {selectedUnit.dataCount} nokta</div>
                      <div><strong>Sorumluluk Alanları:</strong> {selectedUnit.areasCovered.join(', ')}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">📊</span>
                      Teknik Durumu
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Durum:</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedUnit.status)}`}>
                          {selectedUnit.status === 'active' ? 'Aktif' : 
                           selectedUnit.status === 'reporting' ? 'Raporluyor' : 'Pasif'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Batarya:</span>
                        <span className={getBatteryColor(selectedUnit.batteryLevel)}>
                          {selectedUnit.batteryLevel}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sinyal Gücü:</span>
                        <span className={getSignalColor(selectedUnit.signalStrength)}>
                          {selectedUnit.signalStrength}%
                        </span>
                      </div>
                      <div><strong>Koordinatlar:</strong> {selectedUnit.coordinates[1]}°N, {selectedUnit.coordinates[0]}°E</div>
                    </div>
                  </div>
                </div>

                {/* Personnel */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">👥</span>
                    Takım Üyeleri ({selectedUnit.personnel.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedUnit.personnel.map((person) => (
                      <div key={person.id} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900">{person.name}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div><strong>Görev:</strong> {person.role}</div>
                          <div><strong>Sertifika:</strong> {person.certification}</div>
                          <div><strong>Deneyim:</strong> {person.experience}</div>
                          <div><strong>İletişim:</strong> {person.contact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">⚙️</span>
                    Ekipmanlar ({selectedUnit.equipment.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ekipman
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tip
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kondisyon
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Son Bakım
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedUnit.equipment.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.type}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEquipmentStatusColor(item.status)}`}>
                                {item.status === 'active' ? 'Aktif' :
                                 item.status === 'warning' ? 'Uyarı' :
                                 item.status === 'inactive' ? 'Pasif' : 'Bakım'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.condition}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.lastMaintenance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Communications & Vehicle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">📡</span>
                      İletişim Sistemleri
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Radyo:</strong> {selectedUnit.communications.radio}</div>
                      <div><strong>Uydu:</strong> {selectedUnit.communications.satellite}</div>
                      <div><strong>Hücresel:</strong> {selectedUnit.communications.cellular}</div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">🚗</span>
                      Araç Bilgileri
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Tip:</strong> {selectedUnit.vehicle.type}</div>
                      <div><strong>Plaka:</strong> {selectedUnit.vehicle.plateNumber}</div>
                      <div className="flex items-center justify-between">
                        <span><strong>Yakıt:</strong></span>
                        <div className="flex items-center">
                          <span className="text-sm mr-2">{selectedUnit.vehicle.fuelLevel}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedUnit.vehicle.fuelLevel > 50 ? 'bg-green-500' :
                                selectedUnit.vehicle.fuelLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedUnit.vehicle.fuelLevel}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div><strong>Durum:</strong> {selectedUnit.vehicle.condition}</div>
                    </div>
                  </div>
                </div>

                {/* Mission Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Görev Durumu
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUnit.dataCount}</div>
                      <div className="text-gray-600">Toplanan Veri</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedUnit.areasCovered.length}</div>
                      <div className="text-gray-600">Sorumluluk Alanı</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedUnit.personnel.length}</div>
                      <div className="text-gray-600">Takım Üyesi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end flex-shrink-0">
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
