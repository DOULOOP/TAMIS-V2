#!/usr/bin/env python3
"""
Hatay Deprem Değerlendirmesi için Koordinat Çıkarıcısı
Çoklu kodlama desteği ile şekil dosyası ve raster verilerinden hassas koordinatları çıkarır
"""

import geopandas as gpd
from rasterio import open as raster_open
import rasterio.warp
import pandas as pd
import os
import json
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime


class CoordinateExtractor:
    """
    Hatay veri setinden koordinatları ve coğrafi bilgileri çıkarır
    """
    
    def __init__(self, data_dir: str = "1c__Hatay_Enkaz_Bina_Etiketleme"):
        """
        Koordinat çıkarıcıyı başlat
        
        Args:
            data_dir (str): Uydu görüntüsü verilerini içeren dizin
        """
        self.data_dir = data_dir
        self.output_dir = "output"
        self.shapefile_path = None
        self.raster_paths = {}
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Locate data files
        self._locate_data_files()
        
        # Progress tracking
        self.progress_callbacks = []
    
    def add_progress_callback(self, callback):
        """İlerleme güncellemeleri için geri çağırma fonksiyonu ekle"""
        self.progress_callbacks.append(callback)
    
    def _update_progress(self, progress: float, message: str):
        """Kayıtlı tüm geri çağırma fonksiyonları için ilerlemeyi güncelle"""
        for callback in self.progress_callbacks:
            try:
                callback(progress, message)
            except Exception as e:
                print(f"Uyarı: İlerleme geri çağırma fonksiyonu başarısız: {e}")
    
    def _locate_data_files(self):
        """Veri dizininde şekil dosyası ve raster dosyalarını bul"""
        if not os.path.exists(self.data_dir):
            raise FileNotFoundError(f"Veri dizini bulunamadı: {self.data_dir}")
        
        # Look for shapefile
        for file in os.listdir(self.data_dir):
            if file.endswith('.shp') and 'SINIR' in file.upper():
                self.shapefile_path = os.path.join(self.data_dir, file)
                break
        
        # Look for raster files
        for file in os.listdir(self.data_dir):
            if file.endswith('.tif'):
                if '2015' in file:
                    self.raster_paths['2015'] = os.path.join(self.data_dir, file)
                elif '2023' in file:
                    self.raster_paths['2023'] = os.path.join(self.data_dir, file)
    
    def load_shapefile_with_encoding(self) -> Optional[gpd.GeoDataFrame]:
        """
        Türkçe veriler için çoklu kodlama denemeleri ile şekil dosyasını yükle
        
        Returns:
            GeoDataFrame veya yükleme başarısız olursa None
        """
        if not self.shapefile_path or not os.path.exists(self.shapefile_path):
            print(f"Şekil dosyası bulunamadı: {self.shapefile_path}")
            return None
        
        encodings = [
            None,  # Default encoding
            'windows-1254',  # Turkish encoding
            'iso-8859-9',    # Turkish encoding
            'utf-8',         # Unicode
            'cp1252'         # Western European
        ]
        
        for encoding in encodings:
            try:
                if encoding is None:
                    shapefile = gpd.read_file(self.shapefile_path)
                    print("Şekil dosyası varsayılan kodlama ile başarıyla yüklendi")
                else:
                    shapefile = gpd.read_file(self.shapefile_path, encoding=encoding)
                    print(f"Şekil dosyası {encoding} kodlaması ile başarıyla yüklendi")
                return shapefile
            except (UnicodeDecodeError, Exception) as e:
                if encoding is None:
                    print(f"Varsayılan kodlama başarısız: {e}")
                else:
                    print(f"Kodlama {encoding} başarısız: {e}")
                continue
        
        print("Herhangi bir kodlama ile şekil dosyası okunamadı")
        return None
    
    def extract_shapefile_coordinates(self) -> Dict[str, Any]:
        """
        Şekil dosyasından koordinat bilgilerini çıkar
        
        Returns:
            Koordinat verilerini içeren sözlük
        """
        self._update_progress(10, "Şekil dosyası yükleniyor...")
        
        shapefile = self.load_shapefile_with_encoding()
        if shapefile is None:
            return {
                'error': 'Şekil dosyası yüklenemedi',
                'shapefile_path': self.shapefile_path
            }
        
        self._update_progress(30, "Şekil dosyası koordinatları çıkarılıyor...")
        
        # Basic information
        info = {
            'file_path': self.shapefile_path,
            'feature_count': len(shapefile),
            'crs_original': str(shapefile.crs),
            'columns': list(shapefile.columns),
            'geometry_type': shapefile.geom_type.iloc[0] if len(shapefile) > 0 else None
        }
        
        if len(shapefile) == 0:
            return {'error': 'Şekil dosyası hiçbir özellik içermiyor', **info}
        
        # Original bounds
        bounds_original = shapefile.bounds.iloc[0]
        info['bounds_original'] = {
            'minx': float(bounds_original['minx']),
            'miny': float(bounds_original['miny']),
            'maxx': float(bounds_original['maxx']),
            'maxy': float(bounds_original['maxy'])
        }
        
        # Convert to WGS84 for latitude/longitude
        shapefile_wgs84 = shapefile.to_crs("EPSG:4326")
        bounds_wgs84 = shapefile_wgs84.bounds.iloc[0]
        
        # Center coordinates
        center_lat = (bounds_wgs84['miny'] + bounds_wgs84['maxy']) / 2
        center_lon = (bounds_wgs84['minx'] + bounds_wgs84['maxx']) / 2
        
        info['coordinates_wgs84'] = {
            'center': {
                'latitude': float(center_lat),
                'longitude': float(center_lon)
            },
            'bounds': {
                'minx': float(bounds_wgs84['minx']),  # West
                'miny': float(bounds_wgs84['miny']),  # South
                'maxx': float(bounds_wgs84['maxx']),  # East
                'maxy': float(bounds_wgs84['maxy'])   # North
            },
            'southwest_corner': {
                'latitude': float(bounds_wgs84['miny']),
                'longitude': float(bounds_wgs84['minx'])
            },
            'northeast_corner': {
                'latitude': float(bounds_wgs84['maxy']),
                'longitude': float(bounds_wgs84['maxx'])
            }
        }
        
        # Area calculation
        if shapefile.crs and shapefile.crs.to_string() != 'EPSG:4326':
            area_sq_m = shapefile.geometry.area.sum()
            info['area_sq_km'] = float(area_sq_m / 1_000_000)
        
        # Attribute data sample
        if len(shapefile.columns) > 1:  # More than just geometry
            info['attribute_sample'] = shapefile.drop('geometry', axis=1).head(3).to_dict('records')
        
        return info
    
    def extract_raster_coordinates(self, year: str) -> Dict[str, Any]:
        """
        Raster dosyasından koordinat bilgilerini çıkar
        
        Args:
            year: Rasterin yılı ('2015' veya '2023')
            
        Returns:
            Raster koordinat verilerini içeren sözlük
        """
        if year not in self.raster_paths:
            return {'error': f'{year} yılı için raster dosyası bulunamadı'}
        
        raster_path = self.raster_paths[year]
        
        self._update_progress(50, f"{year} raster koordinatları çıkarılıyor...")
        
        try:
            with raster_open(raster_path) as src:
                info = {
                    'file_path': raster_path,
                    'year': year,
                    'bands': src.count,
                    'width': src.width,
                    'height': src.height,
                    'crs_original': str(src.crs),
                    'data_types': [str(dtype) for dtype in src.dtypes],
                    'resolution': {
                        'x': abs(src.transform[0]),
                        'y': abs(src.transform[4])
                    }
                }
                
                # Original bounds
                raster_bounds = src.bounds
                info['bounds_original'] = {
                    'left': float(raster_bounds.left),
                    'bottom': float(raster_bounds.bottom),
                    'right': float(raster_bounds.right),
                    'top': float(raster_bounds.top)
                }
                
                # Transform bounds to WGS84
                left, bottom, right, top = rasterio.warp.transform_bounds(
                    src.crs, 'EPSG:4326', *raster_bounds
                )
                
                # Center coordinates
                center_lat = (bottom + top) / 2
                center_lon = (left + right) / 2
                
                info['coordinates_wgs84'] = {
                    'center': {
                        'latitude': float(center_lat),
                        'longitude': float(center_lon)
                    },
                    'bounds': {
                        'minx': float(left),   # West
                        'miny': float(bottom), # South
                        'maxx': float(right),  # East
                        'maxy': float(top)     # North
                    },
                    'southwest_corner': {
                        'latitude': float(bottom),
                        'longitude': float(left)
                    },
                    'northeast_corner': {
                        'latitude': float(top),
                        'longitude': float(right)
                    }
                }
                
                return info
                
        except Exception as e:
            return {
                'error': f'Raster dosyası {raster_path} okunamadı: {str(e)}',
                'file_path': raster_path,
                'year': year
            }
    
    def extract_all_coordinates(self) -> Dict[str, Any]:
        """
        Mevcut tüm veri dosyalarından koordinatları çıkar
        
        Returns:
            Veri seti için tüm koordinat bilgileri
        """
        self._update_progress(0, "Koordinat çıkarma başlatılıyor...")
        
        result = {
            'extraction_time': datetime.now().isoformat(),
            'data_directory': self.data_dir
        }
        
        # Extract shapefile coordinates
        result['shapefile'] = self.extract_shapefile_coordinates()
        
        # Extract raster coordinates for both years
        result['rasters'] = {}
        for year in ['2015', '2023']:
            if year in self.raster_paths:
                result['rasters'][year] = self.extract_raster_coordinates(year)
        
        # Summary information
        if 'coordinates_wgs84' in result.get('shapefile', {}):
            result['summary'] = {
                'region': 'Hatay, Türkiye',
                'center_coordinates': result['shapefile']['coordinates_wgs84']['center'],
                'available_years': list(result['rasters'].keys()),
                'coordinate_system': 'WGS84 (EPSG:4326)'
            }
        
        self._update_progress(90, "Koordinat verileri kaydediliyor...")
        
        # Save to JSON file
        output_file = os.path.join(self.output_dir, 'hatay_coordinates.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        result['output_file'] = output_file
        
        self._update_progress(100, "Koordinat çıkarma tamamlandı")
        
        return result
    
    def get_center_coordinates(self) -> Optional[Tuple[float, float]]:
        """
        Veri seti için merkez koordinatlarını (lat, lon) al
        
        Returns:
            (enlem, boylam) tuple'ı veya mevcut değilse None
        """
        coordinates = self.extract_all_coordinates()
        if 'summary' in coordinates and 'center_coordinates' in coordinates['summary']:
            center = coordinates['summary']['center_coordinates']
            return (center['latitude'], center['longitude'])
        return None
    
    def get_bounds_wgs84(self) -> Optional[Dict[str, float]]:
        """
        Veri seti için WGS84 sınırlarını al
        
        Returns:
            Sınırları içeren sözlük veya mevcut değilse None
        """
        coordinates = self.extract_all_coordinates()
        if 'shapefile' in coordinates and 'coordinates_wgs84' in coordinates['shapefile']:
            return coordinates['shapefile']['coordinates_wgs84']['bounds']
        return None


def main():
    """Bağımsız çalıştırma için ana fonksiyon"""
    print("HATAY KOORDİNAT ÇIKARICI")
    print("=" * 50)
    
    extractor = CoordinateExtractor()
    
    # Add progress callback
    def progress_callback(progress, message):
        print(f"[{progress:3.0f}%] {message}")
    
    extractor.add_progress_callback(progress_callback)
    
    # Extract all coordinates
    result = extractor.extract_all_coordinates()
    
    print("\n" + "=" * 50)
    print("ÇIKARMA SONUÇLARI")
    print("=" * 50)
    
    # Display summary
    if 'summary' in result:
        summary = result['summary']
        print(f"Bölge: {summary['region']}")
        center = summary['center_coordinates']
        print(f"Merkez: {center['latitude']:.6f}°K, {center['longitude']:.6f}°D")
        print(f"Mevcut yıllar: {', '.join(summary['available_years'])}")
        print(f"Koordinat sistemi: {summary['coordinate_system']}")
    
    # Display shapefile info
    if 'shapefile' in result and 'error' not in result['shapefile']:
        shapefile = result['shapefile']
        print(f"\nŞekil dosyası özellikleri: {shapefile['feature_count']}")
        if 'area_sq_km' in shapefile:
            print(f"Alan: {shapefile['area_sq_km']:.2f} km²")
    
    # Display raster info
    if 'rasters' in result:
        for year, raster in result['rasters'].items():
            if 'error' not in raster:
                print(f"\n{year} Raster: {raster['width']}x{raster['height']} piksel, {raster['bands']} bant")
    
    if 'output_file' in result:
        print(f"\nDetaylı sonuçlar kaydedildi: {result['output_file']}")
    
    return result


if __name__ == "__main__":
    main()