'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
}

interface FieldUnit {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'reporting';
  lastReport: string;
  dataCount: number;
  areasCovered: string[];
  batteryLevel: number;
  signalStrength: number;
}

interface AreaData {
  areaId: string;
  areaName: string;
  coordinates: string;
  currentOccupancy: number;
  maxCapacity: number;
  lastUpdated: string;
  reportingUnits: string[];
  dataPoints: number;
  status: 'safe' | 'warning' | 'critical';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sample field units data
  const fieldUnits: FieldUnit[] = [
    {
      id: 'unit-001',
      name: 'Alfa Takımı',
      location: 'Merkez Bölge A',
      status: 'active',
      lastReport: '2 dakika önce',
      dataCount: 45,
      areasCovered: ['Merkez İlkokulu', 'Atatürk Parkı'],
      batteryLevel: 87,
      signalStrength: 92
    },
    {
      id: 'unit-002', 
      name: 'Beta Takımı',
      location: 'Kuzey Bölge B',
      status: 'reporting',
      lastReport: '5 dakika önce',
      dataCount: 32,
      areasCovered: ['Spor Stadyumu', 'Belediye Parkı'],
      batteryLevel: 64,
      signalStrength: 78
    },
    {
      id: 'unit-003',
      name: 'Gamma Takımı', 
      location: 'Güney Bölge C',
      status: 'active',
      lastReport: '1 dakika önce',
      dataCount: 28,
      areasCovered: ['Cumhuriyet Meydanı'],
      batteryLevel: 91,
      signalStrength: 85
    },
    {
      id: 'unit-004',
      name: 'Delta Takımı',
      location: 'Doğu Bölge D', 
      status: 'inactive',
      lastReport: '25 dakika önce',
      dataCount: 15,
      areasCovered: ['Sanayi Bölgesi'],
      batteryLevel: 23,
      signalStrength: 45
    }
  ];

  // Sample area data
  const areaData: AreaData[] = [
    {
      areaId: 'area-001',
      areaName: 'Merkez İlkokulu Bahçesi',
      coordinates: '36.147°N, 36.206°E',
      currentOccupancy: 120,
      maxCapacity: 500,
      lastUpdated: '1 dakika önce',
      reportingUnits: ['Alfa Takımı'],
      dataPoints: 25,
      status: 'safe'
    },
    {
      areaId: 'area-002',
      areaName: 'Atatürk Parkı',
      coordinates: '36.154°N, 36.212°E', 
      currentOccupancy: 450,
      maxCapacity: 800,
      lastUpdated: '2 dakika önce',
      reportingUnits: ['Alfa Takımı'],
      dataPoints: 20,
      status: 'warning'
    },
    {
      areaId: 'area-003',
      areaName: 'Spor Stadyumu',
      coordinates: '36.151°N, 36.204°E',
      currentOccupancy: 1200,
      maxCapacity: 2000,
      lastUpdated: '5 dakika önce',
      reportingUnits: ['Beta Takımı'],
      dataPoints: 18,
      status: 'warning'
    },
    {
      areaId: 'area-004',
      areaName: 'Cumhuriyet Meydanı',
      coordinates: '36.159°N, 36.208°E',
      currentOccupancy: 300,
      maxCapacity: 1000,
      lastUpdated: '1 dakika önce',
      reportingUnits: ['Gamma Takımı'],
      dataPoints: 15,
      status: 'safe'
    },
    {
      areaId: 'area-005',
      areaName: 'Belediye Parkı',
      coordinates: '36.145°N, 36.213°E',
      currentOccupancy: 520,
      maxCapacity: 600,
      lastUpdated: '5 dakika önce',
      reportingUnits: ['Beta Takımı'],
      dataPoints: 14,
      status: 'critical'
    }
  ];

  // Get status colors and icons
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-50 border-green-200';
      case 'reporting': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'inactive': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getAreaStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [router]);


  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      ADMIN: 'Yönetici',
      SUPERVISOR: 'Süpervizör',
      ENGINEER: 'Mühendis',
      USER: 'Kullanıcı',
    };
    return roleNames[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Ana Panel</h1>
            <p className="text-gray-600">Sistem durumu ve genel istatistikler</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Hoş Geldiniz, {user.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {getRoleDisplayName(user.role)} - {user.department || 'Departman belirtilmemiş'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    E-posta: {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Aktif Tehlikeler
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Bekleyen İncelemeler
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Çözümlenen
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Rapor
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Hızlı İşlemler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors text-left">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <div className="font-medium">Tehlike Bildir</div>
                      <div className="text-sm text-red-200">Yeni tehlike raporu oluştur</div>
                    </div>
                  </div>
                </button>

                <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-left">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Raporları Görüntüle</div>
                      <div className="text-sm text-blue-200">Mevcut raporları incele</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/dashboard/monitoring-map')}
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium">Monitoring Haritası</div>
                      <div className="text-sm text-green-200">Tüm sistem analitikleri - Gerçek zamanlı</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>


        

        </div>
      </main>
    </div>
  );
}
