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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img
                src="/TAMISLOGO.png"
                alt="TAMIS Logo"
                className="h-10 w-auto mr-4"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                TAMIS Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Hoş geldiniz, <span className="font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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

                <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium">İzleme Haritası</div>
                      <div className="text-sm text-green-200">Coğrafi izleme sistemi</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Panels */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Analiz Araçları
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Population Density Analysis */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-purple-900">
                      Nufüs Yoğunluğu Analizi
                    </h4>
                  </div>
                  <p className="text-purple-700 text-sm mb-4">
                    Tehlike bölgelerindeki nufüs yoğunluğunu analiz ederek risk değerlendirmesi yapar.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-purple-900">
                      -
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard/analyzers/population-density')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                    >
                      Analiz Et
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-purple-600">
                    Son güncellenme: Henüz analiz yapılmadı
                  </div>
                </div>

                {/* Safe Zone Analysis */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg border border-emerald-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-emerald-900">
                      Güvenli Bölge Analizi
                    </h4>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4">
                    Mevcut tehlikelerden uzak güvenli bölgeleri tespit eder ve kapasitelerini değerlendirir.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-emerald-900">
                      -
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard/analyzers/safe-zone')}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 transition-colors"
                    >
                      Analiz Et
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-emerald-600">
                    Son güncellenme: Henüz analiz yapılmadı
                  </div>
                </div>

                {/* Aid Route Analysis */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-orange-900">
                      Yardım Rotası Analizi
                    </h4>
                  </div>
                  <p className="text-orange-700 text-sm mb-4">
                    Acil durum ekipleri için en optimal yardım rotalarını hesaplar ve önerir.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-900">
                      -
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard/analyzers/aid-route')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors"
                    >
                      Analiz Et
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-orange-600">
                    Son güncellenme: Henüz analiz yapılmadı
                  </div>
                </div>

              </div>

              {/* Communication Network Analysis - Full Width */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200 mt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-indigo-900">
                        Afet Anında İletişim Ağı Modem Versi Analizi
                      </h4>
                      <p className="text-indigo-700 text-sm mt-1">
                        Afet durumlarında kritik iletişim altyapısının modem versiyonlarını analiz eder ve uyumluluk kontrolü yapar.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/analyzers/communication-network')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Analiz Et</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/60 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-900">-</div>
                    <div className="text-sm text-indigo-700 font-medium">Aktif Modem</div>
                    <div className="text-xs text-indigo-600">Toplam cihaz sayısı</div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-900">-</div>
                    <div className="text-sm text-indigo-700 font-medium">Güncel Versiyon</div>
                    <div className="text-xs text-indigo-600">En son firmware</div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-900">-</div>
                    <div className="text-sm text-indigo-700 font-medium">Uyumluluk</div>
                    <div className="text-xs text-indigo-600">%Uyumlu cihazlar</div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-900">-</div>
                    <div className="text-sm text-indigo-700 font-medium">Risk Seviyesi</div>
                    <div className="text-xs text-indigo-600">Genel değerlendirme</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-indigo-600">
                    Son güncellenme: Henüz analiz yapılmadı
                  </div>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Kritik Altyapı
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Otomatik İzleme
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Analiz Sonuçları Özeti
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz Analiz Yapılmadı
                </h4>
                <p className="text-gray-500 mb-4">
                  Analiz araçlarını kullanarak detaylı raporlar ve öneriler alabilirsiniz.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Tüm Analizleri Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
