'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ViewMode = 'overlay' | 'split' | 'sideBySide';

export default function SatelliteComparisonAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [splitPosition, setSplitPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSplitDragging, setIsSplitDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResults({
        destructionPercentage: 35.7,
        affectedAreas: 847,
        totalArea: 2370,
        changedPixels: 1256789,
        majorChanges: [
          { area: 'Merkez İş Bölgesi', destruction: 78.3, coordinates: [36.147, 36.206] },
          { area: 'Konut Bölgesi A', destruction: 45.2, coordinates: [36.155, 36.198] },
          { area: 'Sanayi Bölgesi', destruction: 23.1, coordinates: [36.162, 36.215] },
        ]
      });
    }, 3000);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isSplitDragging) return; // Don't pan when dragging split
    setIsDragging(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isSplitDragging]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSplitDragging && containerRef.current) {
      // Handle split line dragging
      const rect = containerRef.current.getBoundingClientRect();
      const newPosition = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setSplitPosition(newPosition);
      return;
    }

    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + deltaX / zoom,
      y: prev.y + deltaY / zoom
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isDragging, isSplitDragging, lastPanPoint, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsSplitDragging(false);
  }, []);

  const handleSplitMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSplitDragging(true);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * zoomFactor)));
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
      `}</style>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Uydu Görüntüsü Karşılaştırma Analizi
              </h1>
            </div>
            
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analiz Yapılıyor...' : 'Analizi Başlat'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Analysis Description */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                  Görüntü Analizi
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Hasar Değerlendirme
                </span>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Analiz Hakkında</h2>
              <p className="text-gray-600">
                Bu analiz, 2015 ve 2023 yıllarına ait uydu görüntülerini karşılaştırarak bölgedeki değişimleri tespit eder. 
                Deprem hasarı, yapısal değişiklikler ve arazi kullanım farklılıkları detaylı olarak analiz edilir.
              </p>
            </div>
          </div>

          {/* View Controls */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Görünüm Kontrolleri</h2>
              
              {/* View Mode Selection */}
              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'overlay'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Üst Üste Bindirme
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'split'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bölünmüş Görünüm
                </button>
                <button
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'sideBySide'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yan Yana
                </button>
              </div>

              {/* Overlay Controls */}
              {viewMode === 'overlay' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görüntü Şeffaflığı (2023 üstte)
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">2015</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">2023</span>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-1">
                    {overlayOpacity}% 2023 Görünürlük
                  </div>
                </div>
              )}

              {/* Split Controls */}
              {viewMode === 'split' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bölünme Pozisyonu
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">2015</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={splitPosition}
                      onChange={(e) => setSplitPosition(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${splitPosition}%, #e5e7eb ${splitPosition}%, #e5e7eb 100%)`
                      }}
                    />
                    <span className="text-sm text-gray-600">2023</span>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-1">
                    Bölünme: {splitPosition}%
                  </div>
                </div>
              )}

              {/* Zoom and Pan Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(prev => Math.min(3, prev * 1.25))}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={resetView}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                >
                  Sıfırla
                </button>
              </div>
            </div>
          </div>

          {/* Image Comparison Viewer */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Görüntü Karşılaştırma</h2>
              
              <div 
                ref={containerRef}
                className="relative w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden bg-gray-100"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ 
                  cursor: isSplitDragging ? 'col-resize' : 
                          isDragging ? 'grabbing' : 
                          viewMode === 'split' ? 'grab' : 'grab'
                }}
              >
                {/* Side by Side View */}
                {viewMode === 'sideBySide' && (
                  <div className="flex h-full">
                    <div className="w-1/2 relative border-r border-gray-300">
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm z-10">
                        2015
                      </div>
                      <div 
                        className="w-full h-full relative"
                        style={{
                          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <Image
                          src="/images/HATAY-MERKEZ-2-2015.jpg"
                          alt="2015 Satellite Image"
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="w-1/2 relative">
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm z-10">
                        2023
                      </div>
                      <div 
                        className="w-full h-full relative"
                        style={{
                          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <Image
                          src="/images/HATAY-MERKEZ-2-2023.jpg"
                          alt="2023 Satellite Image"
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay View */}
                {viewMode === 'overlay' && (
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/HATAY-MERKEZ-2-2015.jpg"
                          alt="2015 Satellite Image"
                          fill
                          priority
                          sizes="100vw"
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                    <div 
                      className="absolute inset-0"
                      style={{
                        opacity: overlayOpacity / 100,
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/HATAY-MERKEZ-2-2023.jpg"
                          alt="2023 Satellite Image"
                          fill
                          sizes="100vw"
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm z-10">
                      2015 + 2023 Bindirme
                    </div>
                  </>
                )}

                {/* Split View */}
                {viewMode === 'split' && (
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/HATAY-MERKEZ-2-2015.jpg"
                          alt="2015 Satellite Image"
                          fill
                          priority
                          sizes="100vw"
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                    <div 
                      className="absolute inset-0"
                      style={{
                        clipPath: `polygon(${splitPosition}% 0%, 100% 0%, 100% 100%, ${splitPosition}% 100%)`,
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/HATAY-MERKEZ-2-2023.jpg"
                          alt="2023 Satellite Image"
                          fill
                          sizes="100vw"
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                    
                    {/* Split Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-20 cursor-col-resize hover:bg-blue-300 transition-colors"
                      style={{ left: `${splitPosition}%`, marginLeft: '-2px' }}
                      onMouseDown={handleSplitMouseDown}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-500 flex items-center justify-center hover:border-blue-600">
                        <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm z-10">
                      2015
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm z-10">
                      2023
                    </div>
                  </>
                )}

                {/* Navigation hint */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  Sürükle: Hareket | Tekerlek: Yakınlaştır
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResults && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Statistics */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Değişim İstatistikleri</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hasar Oranı:</span>
                    <span className="font-bold text-red-600">{analysisResults.destructionPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Etkilenen Alan:</span>
                    <span className="font-semibold">{analysisResults.affectedAreas} hektar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Alan:</span>
                    <span className="font-semibold">{analysisResults.totalArea} hektar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Değişen Piksel:</span>
                    <span className="font-semibold">{analysisResults.changedPixels.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Major Changes */}
              <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kritik Değişim Alanları</h3>
                <div className="space-y-3">
                  {analysisResults.majorChanges.map((change: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{change.area}</div>
                        <div className="text-sm text-gray-500">
                          Koordinat: {change.coordinates[0]}, {change.coordinates[1]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          change.destruction > 60 ? 'text-red-600' :
                          change.destruction > 30 ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          {change.destruction}%
                        </div>
                        <div className="text-sm text-gray-500">hasar</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-600">Uydu görüntüleri analiz ediliyor...</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
        <Image
          src="/images/HATAY-MERKEZ-2-2023.jpg"
          alt="2023 Satellite Image"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          className="pointer-events-none"
        />
    </>
  );
}
