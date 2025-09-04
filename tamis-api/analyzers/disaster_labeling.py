#!/usr/bin/env python3
"""
Hatay Deprem Değerlendirmesi için Yüksek Performanslı Afet Boyutu Etiketleme Sistemi
Değişiklik tespiti ve hasar sınıflandırması için optimize edilmiş görüntü işleme teknikleri kullanır
"""

import os
import numpy as np
import rasterio
from rasterio.windows import Window
from rasterio.warp import reproject, Resampling
import cv2
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from concurrent.futures import ThreadPoolExecutor
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Import coordinate extraction functionality
try:
    from .coordinate_extractor import CoordinateExtractor
except ImportError:
    try:
        from coordinate_extractor import CoordinateExtractor
    except ImportError:
        try:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.abspath(__file__)))
            from coordinate_extractor import CoordinateExtractor
        except ImportError:
            print("Uyarı: CoordinateExtractor mevcut değil")
            CoordinateExtractor = None

class DisasterLabeler:
    def __init__(self, data_dir="1c__Hatay_Enkaz_Bina_Etiketleme"):
        """
        Afet etiketleme sistemini başlat
        
        Args:
            data_dir (str): Uydu görüntülerini içeren dizin
        """
        self.data_dir = data_dir
        self.img_2015_path = os.path.join(data_dir, "HATAY MERKEZ-2 2015.tif")
        self.img_2023_path = os.path.join(data_dir, "HATAY MERKEZ-2 2023.tif")
        
        # Damage classification thresholds
        self.damage_thresholds = {
            'minimal': 0.1,     # < 10% change
            'moderate': 0.3,    # 10-30% change
            'severe': 0.6,      # 30-60% change
            'catastrophic': 1.0  # > 60% change
        }
        
        # Performance optimization settings - will be adjusted based on available memory
        self.base_tile_size = 1024  # Base tile size, will be adjusted dynamically
        self.downsample_factor = 2  # Conservative default downsample factor
        self.num_threads = min(5, max(1, os.cpu_count() - 1))  # Adaptive thread count
        
        # Initialize coordinate extractor
        if CoordinateExtractor is not None:
            try:
                self.coordinate_extractor = CoordinateExtractor(data_dir)
                self.coordinates_data = None
                print("Koordinat çıkarıcı başarıyla başlatıldı")
            except Exception as e:
                print(f"Uyarı: Koordinat çıkarıcı başlatılamadı: {e}")
                self.coordinate_extractor = None
                self.coordinates_data = None
        else:
            print("Uyarı: CoordinateExtractor mevcut değil - coğrafi koordinatlar dahil edilmeyecek")
            self.coordinate_extractor = None
            self.coordinates_data = None
        
    def get_memory_efficient_dimensions(self, src):
        """
        Mevcut sistem belleğine göre bellek verimli boyutları hesapla
        """
        import psutil
        
        # Get available memory in bytes
        available_memory = psutil.virtual_memory().available
        
        # Reserve 2GB for system and other processes
        safe_memory = available_memory - (2 * 1024**3)
        
        # Each pixel takes 3 bytes (RGB uint8) for both images + processing overhead
        bytes_per_pixel = 3 * 2 * 4  # 2 images, 4x overhead for processing
        
        # Calculate max pixels we can safely handle
        max_pixels = safe_memory // bytes_per_pixel
        
        # Get original dimensions
        original_width = src.width
        original_height = src.height
        total_pixels = original_width * original_height
        
        if total_pixels <= max_pixels:
            # Image fits in memory
            return original_width, original_height, 1
        else:
            # Calculate downsample factor
            downsample_factor = int(np.ceil(np.sqrt(total_pixels / max_pixels)))
            new_width = original_width // downsample_factor
            new_height = original_height // downsample_factor
            
            print(f"  Bellek optimizasyonu: {downsample_factor} faktörüyle örnekleme")
            print(f"  Orijinal: {original_width} x {original_height} = {total_pixels:,} piksel")
            print(f"  Optimize: {new_width} x {new_height} = {new_width*new_height:,} piksel")
            
            return new_width, new_height, downsample_factor

    def load_and_align_images(self):
        """
        Karşılaştırma için 2015 ve 2023 görüntülerini bellek optimizasyonuyla yükle ve hizala
        Hizalanmış görüntü dizilerini ve meta verileri döndürür
        """
        print("Uydu görüntüleri yükleniyor ve hizalanıyor...")
        
        with rasterio.open(self.img_2015_path) as src_2015:
            with rasterio.open(self.img_2023_path) as src_2023:
                # Get memory-efficient dimensions using 2023 image as reference
                opt_width, opt_height, downsample_factor = self.get_memory_efficient_dimensions(src_2023)
                
                # Calculate new transform accounting for downsampling
                original_transform = src_2023.transform
                new_pixel_size = abs(original_transform[0]) * downsample_factor
                
                # Create new transform with adjusted pixel size
                from rasterio.transform import Affine
                target_transform = Affine(
                    new_pixel_size, 0, original_transform[2],
                    0, -new_pixel_size, original_transform[5]
                )
                
                print(f"  Optimize boyutlar: {opt_width} x {opt_height}")
                print(f"  Etkili çözünürlük: {new_pixel_size:.3f} m/piksel")
                
                # Read images with windowing and resampling for memory efficiency
                window_2015 = Window(0, 0, src_2015.width, src_2015.height)
                window_2023 = Window(0, 0, src_2023.width, src_2023.height)
                
                # Read with automatic resampling to target size
                img_2015 = src_2015.read(
                    [1, 2, 3], 
                    window=window_2015,
                    out_shape=(3, opt_height, opt_width),
                    resampling=Resampling.bilinear
                )
                
                img_2023 = src_2023.read(
                    [1, 2, 3],
                    window=window_2023, 
                    out_shape=(3, opt_height, opt_width),
                    resampling=Resampling.bilinear
                )
                
                # Align 2015 image to match 2023 coordinate system
                img_2015_aligned = np.zeros_like(img_2023, dtype=np.uint8)
                
                # Use simpler alignment for memory efficiency
                # Just ensure both images have the same dimensions
                if img_2015.shape == img_2023.shape:
                    img_2015_aligned = img_2015.astype(np.uint8)
                    img_2023_aligned = img_2023.astype(np.uint8)
                else:
                    # Resize 2015 to match 2023 if needed
                    from scipy.ndimage import zoom
                    scale_factors = (
                        1,  # Don't scale channels
                        img_2023.shape[1] / img_2015.shape[1],  # height scaling
                        img_2023.shape[2] / img_2015.shape[2]   # width scaling
                    )
                    img_2015_aligned = zoom(img_2015, scale_factors, order=1).astype(np.uint8)
                    img_2023_aligned = img_2023.astype(np.uint8)
                
                # Get bounds for the downsampled image
                bounds = src_2023.bounds
                
                metadata = {
                    'width': opt_width,
                    'height': opt_height,
                    'transform': target_transform,
                    'crs': src_2023.crs,
                    'bounds': bounds,
                    'resolution': new_pixel_size,
                    'downsample_factor': downsample_factor
                }
                
                return img_2015_aligned, img_2023_aligned, metadata
    
    def initialize_coordinates(self, metadata):
        """
        Piksel-coğrafi koordinat dönüşümü için koordinat sistemini başlat
        
        Args:
            metadata: Dönüşüm ve CRS bilgilerini içeren görüntü meta verileri
        """
        if self.coordinate_extractor:
            try:
                # Extract coordinate data if not already available
                if self.coordinates_data is None:
                    print("Koordinat referans verileri çıkarılıyor...")
                    self.coordinates_data = self.coordinate_extractor.extract_all_coordinates()
                
                # Store transformation info for pixel-to-coordinate conversion
                self.transform = metadata['transform']
                self.crs = metadata['crs']
                
                print(f"Koordinat sistemi başlatıldı: {self.crs}")
                
            except Exception as e:
                print(f"Uyarı: Koordinat sistemi başlatılamadı: {e}")
                self.coordinates_data = None
    
    def pixel_to_geographic(self, pixel_x, pixel_y):
        """
        Piksel koordinatlarını coğrafi koordinatlara (WGS84) dönüştür
        
        Args:
            pixel_x, pixel_y: Piksel koordinatları
            
        Returns:
            WGS84'te (boylam, enlem) tuple'ı veya dönüştürme başarısız olursa None
        """
        if not hasattr(self, 'transform') or self.transform is None:
            return None
            
        try:
            import rasterio.transform
            
            # Convert pixel coordinates to map coordinates using the transform
            map_x, map_y = rasterio.transform.xy(self.transform, pixel_y, pixel_x)
            
            # If we have CRS info, convert to WGS84
            if hasattr(self, 'crs') and self.crs is not None:
                import rasterio.warp
                
                # Transform from original CRS to WGS84
                lon, lat = rasterio.warp.transform(
                    self.crs, 'EPSG:4326', [map_x], [map_y]
                )
                
                return float(lon[0]), float(lat[0])
            else:
                # Return map coordinates if no CRS conversion available
                return float(map_x), float(map_y)
                
        except Exception as e:
            print(f"Uyarı: Piksel ({pixel_x}, {pixel_y}) koordinatlara dönüştürülemedi: {e}")
            return None
    
    def compute_change_detection_fast(self, img1, img2):
        """
        Optimize edilmiş algoritmalar kullanarak hızlı değişiklik tespiti
        
        Args:
            img1, img2: Giriş görüntüleri (3D diziler: kanallar, yükseklik, genişlik)
            
        Returns:
            change_map: Değişiklik yoğunluğu haritası
            change_binary: İkili değişiklik maskesi
        """
        print("Optimize edilmiş değişiklik tespiti başlatılıyor...")
        
        # Convert to HWC format for processing
        img1_hwc = np.transpose(img1, (1, 2, 0))
        img2_hwc = np.transpose(img2, (1, 2, 0))
        
        # Fast grayscale conversion using optimized weights
        gray1 = np.dot(img1_hwc[...,:3], [0.299, 0.587, 0.114]).astype(np.uint8)
        gray2 = np.dot(img2_hwc[...,:3], [0.299, 0.587, 0.114]).astype(np.uint8)
        
        # Method 1: Fast normalized cross-correlation instead of full SSIM
        # Much faster than SSIM with similar results for large-scale changes
        mean1 = cv2.blur(gray1.astype(np.float32), (11, 11))
        mean2 = cv2.blur(gray2.astype(np.float32), (11, 11))
        
        # Compute local standard deviations efficiently
        sqr1 = cv2.blur((gray1.astype(np.float32))**2, (11, 11))
        sqr2 = cv2.blur((gray2.astype(np.float32))**2, (11, 11))
        
        std1 = np.sqrt(np.maximum(sqr1 - mean1**2, 0)) + 1e-10
        std2 = np.sqrt(np.maximum(sqr2 - mean2**2, 0)) + 1e-10
        
        # Fast correlation-based similarity
        corr = cv2.blur(gray1.astype(np.float32) * gray2.astype(np.float32), (11, 11))
        ncc = (corr - mean1 * mean2) / (std1 * std2)
        change_structural = 1 - np.clip(ncc, -1, 1)
        
        # Method 2: Vectorized color difference (much faster than loop)
        diff_color = np.linalg.norm(img1_hwc.astype(np.float32) - img2_hwc.astype(np.float32), axis=2)
        diff_color_norm = diff_color / (np.sqrt(3) * 255)
        
        # Method 3: Fast edge detection using Sobel instead of Canny
        sobelx1 = cv2.Sobel(gray1, cv2.CV_64F, 1, 0, ksize=3)
        sobely1 = cv2.Sobel(gray1, cv2.CV_64F, 0, 1, ksize=3)
        edges1 = np.sqrt(sobelx1**2 + sobely1**2)
        
        sobelx2 = cv2.Sobel(gray2, cv2.CV_64F, 1, 0, ksize=3)
        sobely2 = cv2.Sobel(gray2, cv2.CV_64F, 0, 1, ksize=3)
        edges2 = np.sqrt(sobelx2**2 + sobely2**2)
        
        # Normalize edge differences
        max_edge = max(np.max(edges1), np.max(edges2), 1e-10)
        edge_diff = np.abs(edges1 - edges2) / max_edge
        
        # Combine methods with weights - vectorized operation
        change_map = 0.5 * change_structural + 0.3 * diff_color_norm + 0.2 * edge_diff
        
        # Fast smoothing with smaller kernel
        change_map = cv2.GaussianBlur(change_map.astype(np.float32), (3, 3), 0.8)
        
        # Simple thresholding instead of adaptive (much faster)
        threshold = np.mean(change_map) + 1.5 * np.std(change_map)
        change_binary = (change_map > threshold).astype(np.uint8)
        
        return change_map, change_binary

    def compute_change_detection(self, img1, img2):
        """
        Görüntü boyutuna göre otomatik yöntem seçimi ile değişiklik tespiti hesapla
        """
        total_pixels = img1.shape[1] * img1.shape[2]
        
        if total_pixels > 500000:  # Use fast method for large images
            return self.compute_change_detection_fast(img1, img2)
        else:
            # Use original accurate method for smaller images
            return self.compute_change_detection_accurate(img1, img2)
    
    def compute_change_detection_accurate(self, img1, img2):
        """
        Orijinal hassas değişiklik tespit yöntemi (küçük görüntüler için saklandı)
        """
        print("Hassas değişiklik tespiti başlatılıyor...")
        
        # Convert to HWC format for OpenCV
        img1_hwc = np.transpose(img1, (1, 2, 0))
        img2_hwc = np.transpose(img2, (1, 2, 0))
        
        # Method 1: Structural Similarity Index (SSIM) - most accurate
        from skimage.metrics import structural_similarity as ssim
        
        # Convert to grayscale for SSIM
        gray1 = cv2.cvtColor(img1_hwc, cv2.COLOR_RGB2GRAY)
        gray2 = cv2.cvtColor(img2_hwc, cv2.COLOR_RGB2GRAY)
        
        # Compute SSIM map
        ssim_map = ssim(gray1, gray2, full=True)[1]
        change_ssim = 1 - ssim_map  # Invert so high values = high change
        
        # Method 2: Color-based change detection
        diff_color = np.sqrt(np.sum((img1_hwc.astype(float) - img2_hwc.astype(float))**2, axis=2))
        diff_color_norm = diff_color / np.sqrt(3 * 255**2)  # Normalize to 0-1
        
        # Method 3: Edge-based change detection
        edges1 = cv2.Canny(gray1, 50, 150)
        edges2 = cv2.Canny(gray2, 50, 150)
        edge_diff = np.abs(edges1.astype(float) - edges2.astype(float)) / 255
        
        # Combine methods with weights
        change_map = (0.5 * change_ssim + 0.3 * diff_color_norm + 0.2 * edge_diff)
        
        # Apply Gaussian smoothing to reduce noise
        change_map = cv2.GaussianBlur(change_map, (5, 5), 1.0)
        
        # Create binary change mask using adaptive thresholding
        change_binary = cv2.adaptiveThreshold(
            (change_map * 255).astype(np.uint8),
            255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        ) / 255
        
        return change_map, change_binary
    
    def classify_damage_regions_fast(self, change_map, change_binary):
        """
        Vektörleştirilmiş işlemlerle hızlı hasar bölgesi sınıflandırması
        """
        print("Optimize algoritmaları ile hasar şiddeti sınıflandırılıyor...")
        
        # Find connected components
        num_labels, labels = cv2.connectedComponents(change_binary.astype(np.uint8))
        
        if num_labels <= 1:  # Only background
            return np.zeros_like(labels), {level: {'count': 0, 'total_area': 0, 'avg_intensity': 0} 
                                          for level in self.damage_thresholds.keys()}, {'fields': [], 'metadata': {}}
        
        # Vectorized region analysis
        damage_labels = np.zeros_like(labels, dtype=np.uint8)
        damage_stats = {level: {'count': 0, 'total_area': 0, 'avg_intensity': 0} 
                       for level in self.damage_thresholds.keys()}
        
        # Pre-compute all region properties vectorized
        region_props = {}
        for label_id in range(1, num_labels):
            mask = (labels == label_id)
            region_size = np.sum(mask)
            
            if region_size < 10:  # Skip tiny regions
                continue
                
            # Vectorized computations
            coords = np.where(mask)
            y_coords, x_coords = coords
            
            # Batch calculate properties
            region_props[label_id] = {
                'mask': mask,
                'size': region_size,
                'bounds': {
                    'min_x': int(x_coords.min()),
                    'max_x': int(x_coords.max()),
                    'min_y': int(y_coords.min()),
                    'max_y': int(y_coords.max())
                },
                'centroid': (float(x_coords.mean()), float(y_coords.mean())),
                'intensity_stats': {
                    'mean': float(change_map[mask].mean()),
                    'max': float(change_map[mask].max()),
                    'min': float(change_map[mask].min())
                }
            }
        
        # Build field data efficiently
        field_data = {
            'metadata': {
                'total_fields': len(region_props),
                'analysis_timestamp': datetime.now().isoformat(),
                'analysis_method': 'Optimize çoklu algoritma değişiklik tespiti',
                'coordinate_system': {
                    'has_geographic_coords': hasattr(self, 'transform') and self.transform is not None
                }
            },
            'fields': []
        }
        
        # Batch process all regions
        threshold_keys = list(self.damage_thresholds.keys())
        threshold_values = list(self.damage_thresholds.values())
        
        for label_id, props in region_props.items():
            avg_intensity = props['intensity_stats']['mean']
            
            # Fast threshold lookup
            damage_level = 1  # minimal by default
            for i, threshold in enumerate(threshold_values):
                if avg_intensity <= threshold:
                    damage_level = i + 1
                    level_name = threshold_keys[i]
                    break
            else:
                damage_level = len(threshold_keys)
                level_name = threshold_keys[-1]
            
            # Update arrays and stats
            damage_labels[props['mask']] = damage_level
            damage_stats[level_name]['count'] += 1
            damage_stats[level_name]['total_area'] += props['size']
            damage_stats[level_name]['avg_intensity'] += avg_intensity
            
            # Create simplified field entry (skip expensive coordinate transforms for speed)
            bounds = props['bounds']
            centroid_x, centroid_y = props['centroid']
            
            field_entry = {
                'field_id': int(label_id),
                'geometry': {
                    'bounds': bounds,
                    'centroid': {'x': centroid_x, 'y': centroid_y},
                    'area_pixels': int(props['size'])
                },
                'damage_assessment': {
                    'level': level_name,
                    'level_index': int(damage_level),
                    'intensity': props['intensity_stats']
                }
            }
            
            # Add geographic coordinates only if requested (expensive operation)
            if hasattr(self, 'transform') and self.transform is not None:
                centroid_coords = self.pixel_to_geographic(centroid_x, centroid_y)
                if centroid_coords:
                    field_entry['geometry']['centroid'].update({
                        'longitude': centroid_coords[0],
                        'latitude': centroid_coords[1]
                    })
            
            field_data['fields'].append(field_entry)
        
        # Calculate average intensities
        for level, stats in damage_stats.items():
            if stats['count'] > 0:
                stats['avg_intensity'] /= stats['count']
        
        return damage_labels, damage_stats, field_data

    def classify_damage_regions(self, change_map, change_binary):
        """
        Otomatik yöntem seçimi ile hasar bölgelerini sınıflandır
        """
        total_regions = np.max(change_binary) if change_binary.size > 0 else 0
        
        if total_regions > 1000 or change_map.size > 1000000:  # Use fast method for many regions or large images
            return self.classify_damage_regions_fast(change_map, change_binary)
        else:
            return self.classify_damage_regions_accurate(change_map, change_binary)
    
    def classify_damage_regions_accurate(self, change_map, change_binary):
        """
        Orijinal hassas hasar bölgesi sınıflandırması (daha küçük veri kümeleri için saklandı)
        """
        print("Tam doğrulukla hasar şiddeti sınıflandırılıyor...")
        
        # Find connected components in the binary change mask
        num_labels, labels = cv2.connectedComponents(change_binary.astype(np.uint8))
        
        damage_labels = np.zeros_like(labels, dtype=np.uint8)
        damage_stats = {level: {'count': 0, 'total_area': 0, 'avg_intensity': 0} 
                       for level in self.damage_thresholds.keys()}
        
        # Initialize field-level data structure
        field_data = {
            'metadata': {
                'total_fields': num_labels - 1,  # Subtract background
                'analysis_timestamp': datetime.now().isoformat(),
                'analysis_method': 'Çoklu algoritma değişiklik tespiti (SSIM + Renk + Kenar)',
                'damage_thresholds': {
                    'minimal': '< %10 değişiklik',
                    'moderate': '%10-30 değişiklik',
                    'severe': '%30-60 değişiklik',
                    'catastrophic': '> %60 değişiklik'
                },
                'coordinate_system': {
                    'pixel_coordinates': 'Görüntü piksel koordinatları (başlangıç: sol-üst)',
                    'geographic_coordinates': 'WGS84 (EPSG:4326) boylam, enlem',
                    'crs_original': str(getattr(self, 'crs', 'Bilinmiyor')) if hasattr(self, 'crs') else 'Bilinmiyor',
                    'has_geographic_coords': hasattr(self, 'transform') and self.transform is not None
                }
            },
            'fields': []
        }
        
        for label_id in range(1, num_labels):  # Skip background (0)
            mask = (labels == label_id)
            region_size = np.sum(mask)
            
            # Skip very small regions (likely noise)
            if region_size < 10:
                continue
            
            # Calculate field properties
            # Get field bounds
            y_indices, x_indices = np.where(mask)
            bounds = {
                'min_x': int(np.min(x_indices)),
                'max_x': int(np.max(x_indices)),
                'min_y': int(np.min(y_indices)),
                'max_y': int(np.max(y_indices))
            }
            
            # Add geographic bounds
            sw_coords = self.pixel_to_geographic(bounds['min_x'], bounds['max_y'])  # Southwest corner
            ne_coords = self.pixel_to_geographic(bounds['max_x'], bounds['min_y'])  # Northeast corner
            
            if sw_coords and ne_coords:
                bounds['geographic'] = {
                    'southwest': {
                        'longitude': sw_coords[0],
                        'latitude': sw_coords[1]
                    },
                    'northeast': {
                        'longitude': ne_coords[0],
                        'latitude': ne_coords[1]
                    }
                }
            
            # Calculate centroid
            centroid_x = float(np.mean(x_indices))
            centroid_y = float(np.mean(y_indices))
            
            centroid = {
                'x': centroid_x,
                'y': centroid_y
            }
            
            # Add geographic coordinates for centroid
            centroid_coords = self.pixel_to_geographic(centroid_x, centroid_y)
            if centroid_coords:
                centroid['longitude'] = centroid_coords[0]
                centroid['latitude'] = centroid_coords[1]
            
            # Calculate shape properties
            width = bounds['max_x'] - bounds['min_x']
            height = bounds['max_y'] - bounds['min_y']
            perimeter = cv2.arcLength(np.float32(np.column_stack((x_indices, y_indices))), True)
            area = region_size
            compactness = (perimeter * perimeter) / (4 * np.pi * area) if area > 0 else 0
            
            # Calculate average change intensity in this region
            avg_intensity = float(np.mean(change_map[mask]))
            max_intensity = float(np.max(change_map[mask]))
            min_intensity = float(np.min(change_map[mask]))
            
            # Calculate intensity distribution
            intensity_hist, _ = np.histogram(change_map[mask], bins=10, range=(0, 1))
            intensity_distribution = intensity_hist.tolist()
            
            # Classify damage level based on intensity
            damage_level = 0  # Default: minimal
            for i, (level, threshold) in enumerate(self.damage_thresholds.items()):
                if avg_intensity <= threshold:
                    damage_level = i + 1
                    level_name = level
                    break
            else:
                damage_level = len(self.damage_thresholds)
                level_name = 'catastrophic'
            
            # Create field data entry
            field_entry = {
                'field_id': int(label_id),
                'geometry': {
                    'bounds': bounds,
                    'centroid': centroid,
                    'width_pixels': int(width),
                    'height_pixels': int(height),
                    'area_pixels': int(area),
                    'perimeter_pixels': float(perimeter),
                    'compactness': float(compactness)
                },
                'damage_assessment': {
                    'level': level_name,
                    'level_index': int(damage_level),
                    'intensity': {
                        'average': float(avg_intensity),
                        'max': float(max_intensity),
                        'min': float(min_intensity),
                        'distribution': intensity_distribution
                    }
                },
                'shape_analysis': {
                    'aspect_ratio': float(width / height) if height > 0 else 0,
                    'regularity': float(4 * np.pi * area / (perimeter * perimeter)) if perimeter > 0 else 0,
                    'elongation': float(min(width, height) / max(width, height)) if max(width, height) > 0 else 0
                }
            }
            
            # Add field to the collection
            field_data['fields'].append(field_entry)
            
            # Update damage labels and statistics
            damage_labels[mask] = damage_level
            damage_stats[level_name]['count'] += 1
            damage_stats[level_name]['total_area'] += region_size
            damage_stats[level_name]['avg_intensity'] += avg_intensity
        
        # Calculate average intensities
        for level, stats in damage_stats.items():
            if stats['count'] > 0:
                stats['avg_intensity'] /= stats['count']
        
        # Add field statistics to metadata
        field_data['metadata'].update({
            'field_statistics': {
                'size_distribution': {
                    'min_area': min(f['geometry']['area_pixels'] for f in field_data['fields']),
                    'max_area': max(f['geometry']['area_pixels'] for f in field_data['fields']),
                    'avg_area': sum(f['geometry']['area_pixels'] for f in field_data['fields']) / len(field_data['fields'])
                },
                'damage_distribution': {
                    level: len([f for f in field_data['fields'] if f['damage_assessment']['level'] == level])
                    for level in self.damage_thresholds.keys()
                },
                'shape_metrics': {
                    'avg_compactness': sum(f['geometry']['compactness'] for f in field_data['fields']) / len(field_data['fields']),
                    'avg_regularity': sum(f['shape_analysis']['regularity'] for f in field_data['fields']) / len(field_data['fields'])
                }
            }
        })
        
        # Save field data to separate JSON file
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        field_data_path = os.path.join(output_dir, "hatay_field_analysis.json")
        with open(field_data_path, 'w') as f:
            json.dump(field_data, f, indent=2)
        print(f"Alan seviyesi analiz kaydedildi: {field_data_path}")
        
        return damage_labels, damage_stats, field_data
    
    def calculate_optimal_tile_size(self, img_shape):
        """
        Görüntü boyutları ve mevcut belleğe göre optimal kutucuk boyutunu hesapla
        """
        import psutil
        
        available_memory = psutil.virtual_memory().available
        safe_memory = available_memory * 0.3  # Use only 30% of available memory
        
        # Each tile needs memory for: original data, processing buffers, results
        # Estimate 8x overhead for processing
        bytes_per_pixel = 3 * 8  # RGB + processing overhead
        max_tile_pixels = safe_memory // bytes_per_pixel
        
        # Calculate optimal tile size (square tiles are more efficient)
        max_tile_side = int(np.sqrt(max_tile_pixels))
        
        # Constrain to reasonable bounds
        optimal_tile_size = max(256, min(max_tile_side, self.base_tile_size))
        
        print(f"  Hesaplanan optimal kutucuk boyutu: {optimal_tile_size}x{optimal_tile_size}")
        return optimal_tile_size

    def process_in_tiles(self, img1, img2, metadata):
        """
        Bellek verimliliği için büyük görüntüleri kutucuklarda işle
        
        Args:
            img1, img2: Giriş görüntüleri
            metadata: Görüntü meta verileri
            
        Returns:
            Tam değişiklik haritası ve hasar etiketleri
        """
        # Calculate optimal tile size for current memory conditions
        tile_size = self.calculate_optimal_tile_size(img1.shape)
        
        print(f"{tile_size}x{tile_size} kutucuklarla işleniyor...")
        
        height, width = img1.shape[1], img1.shape[2]
        full_change_map = np.zeros((height, width), dtype=np.float32)
        full_damage_labels = np.zeros((height, width), dtype=np.uint8)
        
        # Calculate number of tiles
        tiles_y = (height + tile_size - 1) // tile_size
        tiles_x = (width + tile_size - 1) // tile_size
        
        print(f"  {tiles_x * tiles_y} kutucuk işleniyor...")
        
        def process_tile(args):
            i, j = args
            y_start = i * tile_size
            y_end = min((i + 1) * tile_size, height)
            x_start = j * tile_size
            x_end = min((j + 1) * tile_size, width)
            
            tile1 = img1[:, y_start:y_end, x_start:x_end]
            tile2 = img2[:, y_start:y_end, x_start:x_end]
            
            # Skip tiles that are too small or have insufficient data
            if tile1.shape[1] < 50 or tile1.shape[2] < 50:
                return None
            
            # Early termination: Skip tiles with very little variation (likely water/empty areas)
            tile1_var = np.var(tile1)
            tile2_var = np.var(tile2)
            
            if tile1_var < 100 and tile2_var < 100:  # Very uniform tiles, likely water/empty
                # Return empty result to skip processing
                empty_change_map = np.zeros((tile1.shape[1], tile1.shape[2]), dtype=np.float32)
                empty_damage_labels = np.zeros((tile1.shape[1], tile1.shape[2]), dtype=np.uint8)
                empty_field_data = {'fields': [], 'metadata': {}}
                return (y_start, y_end, x_start, x_end, empty_change_map, empty_damage_labels, empty_field_data)
            
            change_map, change_binary = self.compute_change_detection(tile1, tile2)
            
            # Early termination: Skip further processing if no significant changes detected
            if np.sum(change_binary) < 10:  # Less than 10 changed pixels
                empty_damage_labels = np.zeros_like(change_binary, dtype=np.uint8)
                empty_field_data = {'fields': [], 'metadata': {}}
                return (y_start, y_end, x_start, x_end, change_map, empty_damage_labels, empty_field_data)
            
            damage_labels, _, field_data = self.classify_damage_regions(change_map, change_binary)
            
            return (y_start, y_end, x_start, x_end, change_map, damage_labels, field_data)
        
        # Process tiles in parallel with progress tracking
        tile_coords = [(i, j) for i in range(tiles_y) for j in range(tiles_x)]
        
        # Use optimized thread pool with batch processing
        batch_size = max(1, len(tile_coords) // (self.num_threads * 2))
        results = []
        
        with ThreadPoolExecutor(max_workers=self.num_threads) as executor:
            # Process in batches for better memory management
            for i in range(0, len(tile_coords), batch_size):
                batch = tile_coords[i:i + batch_size]
                batch_results = list(executor.map(process_tile, batch))
                results.extend(batch_results)
                
                # Progress indicator
                processed = min(i + batch_size, len(tile_coords))
                print(f"  İlerleme: {processed}/{len(tile_coords)} kutucuk işlendi ({processed/len(tile_coords)*100:.1f}%)")
        
        # Combine results
        for result in results:
            if result is not None:
                y_start, y_end, x_start, x_end, change_map, damage_labels, field_data = result
                full_change_map[y_start:y_end, x_start:x_end] = change_map
                full_damage_labels[y_start:y_end, x_start:x_end] = damage_labels
                
                # Merge field data
                if 'fields' in field_data:
                    for field in field_data['fields']:
                        # Adjust field coordinates to global space
                        field['geometry']['bounds']['min_x'] += x_start
                        field['geometry']['bounds']['max_x'] += x_start
                        field['geometry']['bounds']['min_y'] += y_start
                        field['geometry']['bounds']['max_y'] += y_start
                        field['geometry']['centroid']['x'] += x_start
                        field['geometry']['centroid']['y'] += y_start
        
        # Combine field data from all tiles
        combined_field_data = {
            'metadata': {
                'total_fields': 0,
                'analysis_timestamp': datetime.now().isoformat(),
                'analysis_method': 'Çoklu algoritma değişiklik tespiti (SSIM + Renk + Kenar)',
                'damage_thresholds': {
                    'minimal': '< %10 değişiklik',
                    'moderate': '%10-30 değişiklik',
                    'severe': '%30-60 değişiklik',
                    'catastrophic': '> %60 değişiklik'
                },
                'coordinate_system': {
                    'pixel_coordinates': 'Görüntü piksel koordinatları (başlangıç: sol-üst)',
                    'geographic_coordinates': 'WGS84 (EPSG:4326) boylam, enlem',
                    'crs_original': str(getattr(self, 'crs', 'Bilinmiyor')) if hasattr(self, 'crs') else 'Bilinmiyor',
                    'has_geographic_coords': hasattr(self, 'transform') and self.transform is not None
                }
            },
            'fields': []
        }
        
        # Merge field data from all tiles
        for result in results:
            if result is not None:
                _, _, _, _, _, _, field_data = result
                if 'fields' in field_data:
                    # Recalculate geographic coordinates for combined fields
                    for field in field_data['fields']:
                        if 'geometry' in field and 'centroid' in field['geometry']:
                            # Update centroid coordinates
                            centroid_x = field['geometry']['centroid']['x']
                            centroid_y = field['geometry']['centroid']['y']
                            centroid_coords = self.pixel_to_geographic(centroid_x, centroid_y)
                            
                            if centroid_coords:
                                field['geometry']['centroid']['longitude'] = centroid_coords[0]
                                field['geometry']['centroid']['latitude'] = centroid_coords[1]
                            
                            # Update bounds coordinates
                            if 'bounds' in field['geometry']:
                                bounds = field['geometry']['bounds']
                                sw_coords = self.pixel_to_geographic(bounds['min_x'], bounds['max_y'])
                                ne_coords = self.pixel_to_geographic(bounds['max_x'], bounds['min_y'])
                                
                                if sw_coords and ne_coords:
                                    bounds['geographic'] = {
                                        'southwest': {
                                            'longitude': sw_coords[0],
                                            'latitude': sw_coords[1]
                                        },
                                        'northeast': {
                                            'longitude': ne_coords[0],
                                            'latitude': ne_coords[1]
                                        }
                                    }
                    
                    combined_field_data['fields'].extend(field_data['fields'])
        
        # Update total fields count
        combined_field_data['metadata']['total_fields'] = len(combined_field_data['fields'])
        
        # Add field statistics
        if combined_field_data['fields']:
            combined_field_data['metadata'].update({
                'field_statistics': {
                    'size_distribution': {
                        'min_area': min(f['geometry']['area_pixels'] for f in combined_field_data['fields']),
                        'max_area': max(f['geometry']['area_pixels'] for f in combined_field_data['fields']),
                        'avg_area': sum(f['geometry']['area_pixels'] for f in combined_field_data['fields']) / len(combined_field_data['fields'])
                    },
                    'damage_distribution': {
                        level: len([f for f in combined_field_data['fields'] if f['damage_assessment']['level'] == level])
                        for level in self.damage_thresholds.keys()
                    },
                    'shape_metrics': {
                        'avg_compactness': sum(f['geometry']['compactness'] for f in combined_field_data['fields']) / len(combined_field_data['fields']),
                        'avg_regularity': sum(f['shape_analysis']['regularity'] for f in combined_field_data['fields']) / len(combined_field_data['fields'])
                    }
                }
            })
        
        return full_change_map, full_damage_labels, combined_field_data
    
    def create_damage_visualization(self, img_2023, damage_labels, metadata, output_path):
        """
        Hasar değerlendirme sonuçlarının görselleştirmesini oluştur
        
        Args:
            img_2023: 2023 uydu görüntüsü
            damage_labels: Sınıflandırılmış hasar bölgeleri
            metadata: Görüntü meta verileri
            output_path: Çıktı dosya yolu
        """
        print("Hasar görselleştirmesi oluşturuluyor...")
        
        # Convert image to display format
        img_display = np.transpose(img_2023, (1, 2, 0))
        
        # Create color map for damage levels
        colors = {
            0: [0, 0, 0, 0],           # No damage (transparent)
            1: [0, 255, 0, 100],       # Minimal (green)
            2: [255, 255, 0, 150],     # Moderate (yellow)
            3: [255, 165, 0, 200],     # Severe (orange)
            4: [255, 0, 0, 250]        # Catastrophic (red)
        }
        
        # Create damage overlay
        overlay = np.zeros((*damage_labels.shape, 4), dtype=np.uint8)
        for damage_level, color in colors.items():
            mask = (damage_labels == damage_level)
            overlay[mask] = color
        
        # Create figure
        fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(20, 7))
        
        # Original 2023 image
        ax1.imshow(img_display)
        ax1.set_title('2023 Deprem Sonrası Görüntüsü', fontsize=14, fontweight='bold')
        ax1.axis('off')
        
        # Damage overlay
        ax2.imshow(img_display)
        ax2.imshow(overlay, alpha=0.6)
        ax2.set_title('Hasar Değerlendirme Katmanı', fontsize=14, fontweight='bold')
        ax2.axis('off')
        
        # Damage classification only
        damage_rgb = np.zeros((*damage_labels.shape, 3), dtype=np.uint8)
        for damage_level, color in colors.items():
            if damage_level > 0:  # Skip transparent
                mask = (damage_labels == damage_level)
                damage_rgb[mask] = color[:3]
        
        ax3.imshow(damage_rgb)
        ax3.set_title('Hasar Sınıflandırması', fontsize=14, fontweight='bold')
        ax3.axis('off')
        
        # Add legend
        legend_elements = [
            patches.Patch(color='green', alpha=0.7, label='Minimal Hasar'),
            patches.Patch(color='yellow', alpha=0.7, label='Orta Hasar'),
            patches.Patch(color='orange', alpha=0.7, label='Ciddi Hasar'),
            patches.Patch(color='red', alpha=0.7, label='Felaket Hasar')
        ]
        ax3.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.3, 1))
        
        plt.suptitle('AI Etiketleme ile Hatay Deprem Hasar Değerlendirmesi', 
                     fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Hasar görselleştirmesi kaydedildi: {output_path}")
    
    def generate_damage_report(self, damage_stats, metadata, output_path):
        """
        Detaylı hasar değerlendirme raporu oluştur
        
        Args:
            damage_stats: Her hasar seviyesi için istatistikler
            metadata: Görüntü meta verileri
            output_path: Çıktı JSON dosya yolu
        """
        print("Hasar değerlendirme raporu oluşturuluyor...")
        
        # Calculate total areas and percentages
        total_pixels = metadata['width'] * metadata['height']
        pixel_area_m2 = metadata['resolution'] ** 2
        total_area_m2 = total_pixels * pixel_area_m2
        
        report = {
            'analysis_metadata': {
                'timestamp': datetime.now().isoformat(),
                'image_dimensions': f"{metadata['width']} x {metadata['height']}",
                'resolution_m_per_pixel': metadata['resolution'],
                'total_area_km2': total_area_m2 / 1_000_000,
                'analysis_method': 'SSIM, renk farkı ve kenar algılama ile çoklu yöntem değişiklik tespiti'
            },
            'damage_assessment': {}
        }
        
        total_damaged_pixels = sum(stats['total_area'] for stats in damage_stats.values())
        
        for level, stats in damage_stats.items():
            area_m2 = stats['total_area'] * pixel_area_m2
            area_km2 = area_m2 / 1_000_000
            
            percentage_of_total = (stats['total_area'] / total_pixels) * 100
            percentage_of_damaged = (stats['total_area'] / total_damaged_pixels * 100) if total_damaged_pixels > 0 else 0
            
            report['damage_assessment'][level] = {
                'region_count': int(stats['count']),
                'total_area_m2': float(round(area_m2, 2)),
                'total_area_km2': float(round(area_km2, 6)),
                'percentage_of_total_area': float(round(percentage_of_total, 2)),
                'percentage_of_damaged_area': float(round(percentage_of_damaged, 2)),
                'average_change_intensity': float(round(stats['avg_intensity'], 3))
            }
        
        # Summary statistics
        total_damaged_area_km2 = sum(data['total_area_km2'] for data in report['damage_assessment'].values())
        report['summary'] = {
            'total_damaged_area_km2': float(round(total_damaged_area_km2, 6)),
            'percentage_area_affected': float(round((total_damaged_area_km2 / report['analysis_metadata']['total_area_km2']) * 100, 2)),
            'most_common_damage_level': max(damage_stats.keys(), key=lambda k: damage_stats[k]['total_area']) if damage_stats else 'none',
            'total_damage_regions': int(sum(stats['count'] for stats in damage_stats.values()))
        }
        
        # Save report
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"Hasar raporu kaydedildi: {output_path}")
        
        # Print summary to console
        print("\n" + "="*60)
        print("HASAR DEĞERLENDİRME ÖZETİ")
        print("="*60)
        print(f"Toplam analiz edilen alan: {report['analysis_metadata']['total_area_km2']:.3f} km²")
        print(f"Toplam hasarlı alan: {total_damaged_area_km2:.6f} km²")
        print(f"Etkilenen yüzde: {report['summary']['percentage_area_affected']:.2f}%")
        print(f"Toplam hasar bölgesi: {report['summary']['total_damage_regions']}")
        print(f"En yaygın hasar: {report['summary']['most_common_damage_level'].title()}")
        
        print(f"\nHASAR DAĞILIMI:")
        for level, data in report['damage_assessment'].items():
            if data['region_count'] > 0:
                print(f"  {level.title():12}: {data['region_count']:3} bölge, "
                      f"{data['total_area_km2']:.6f} km² ({data['percentage_of_total_area']:.2f}%)")
    
    def run_analysis(self, force_downsample=False):
        """
        Otomatik bellek optimizasyonu ile tam afet etiketleme analizi çalıştır
        
        Args:
            force_downsample (bool): Ek örnekleme zorlanıp zorlanmayacağı
        """
        print("Afet Boyutu Etiketleme Analizi Başlatılıyor")
        print("="*60)
        
        # Load and align images with automatic memory optimization
        img_2015, img_2023, metadata = self.load_and_align_images()
        
        # Initialize coordinate system
        self.initialize_coordinates(metadata)
        
        # Optional additional downsampling for faster processing
        if force_downsample and 'downsample_factor' in metadata and metadata['downsample_factor'] == 1:
            print(f"{self.downsample_factor} faktörüyle ek örnekleme uygulanıyor...")
            img_2015 = img_2015[:, ::self.downsample_factor, ::self.downsample_factor]
            img_2023 = img_2023[:, ::self.downsample_factor, ::self.downsample_factor]
            metadata['width'] = img_2015.shape[2]
            metadata['height'] = img_2015.shape[1]
            metadata['resolution'] *= self.downsample_factor
            metadata['downsample_factor'] *= self.downsample_factor
        
        # Process change detection
        if img_2015.shape[1] * img_2015.shape[2] > 1000000:  # > 1M pixels
            change_map, damage_labels, field_data = self.process_in_tiles(img_2015, img_2023, metadata)
        else:
            change_map, change_binary = self.compute_change_detection(img_2015, img_2023)
            damage_labels, damage_stats, field_data = self.classify_damage_regions(change_map, change_binary)
        
        # If processed in tiles, compute final statistics
        if img_2015.shape[1] * img_2015.shape[2] > 1000000:
            damage_stats = {level: {'count': 0, 'total_area': 0, 'avg_intensity': 0} 
                           for level in self.damage_thresholds.keys()}
            
            for damage_level, level_name in enumerate(['minimal', 'moderate', 'severe', 'catastrophic'], 1):
                mask = (damage_labels == damage_level)
                if np.any(mask):
                    damage_stats[level_name]['total_area'] = np.sum(mask)
                    damage_stats[level_name]['count'] = 1  # Simplified for tiled processing
                    damage_stats[level_name]['avg_intensity'] = np.mean(change_map[mask])
        
                    # Create visualizations and reports
            output_dir = "output"
            os.makedirs(output_dir, exist_ok=True)
            output_viz = os.path.join(output_dir, "hatay_damage_assessment.png")
            output_report = os.path.join(output_dir, "hatay_damage_report.json")
            output_fields = os.path.join(output_dir, "hatay_field_analysis.json")
            
            self.create_damage_visualization(img_2023, damage_labels, metadata, output_viz)
            self.generate_damage_report(damage_stats, metadata, output_report)
            
            print("\nAnaliz Tamamlandı!")
            print(f"Oluşturulan dosyalar:")
            print(f"  • {output_viz} - Hasar görselleştirmesi")
            print(f"  • {output_report} - Detaylı değerlendirme raporu")
            print(f"  • {output_fields} - Alan seviyesi analiz verileri")
            
            # Print field analysis summary
            print("\nALAN ANALİZ ÖZETİ")
            print("=" * 60)
            print(f"Toplam analiz edilen alan: {len(field_data['fields'])}")
            print("\nHasar dağılımı:")
            for level, count in field_data['metadata']['field_statistics']['damage_distribution'].items():
                print(f"  {level.title():12}: {count:3} alan")
            
            print("\nAlan boyut ölçütleri:")
            size_stats = field_data['metadata']['field_statistics']['size_distribution']
            print(f"  Ortalama alan: {size_stats['avg_area']:.1f} piksel")
            print(f"  Boyut aralığı: {size_stats['min_area']} ile {size_stats['max_area']} piksel")
            
            print("\nŞekil analizi:")
            shape_stats = field_data['metadata']['field_statistics']['shape_metrics']
            print(f"  Ortalama sıkılık: {shape_stats['avg_compactness']:.3f}")
            print(f"  Ortalama düzenlilik: {shape_stats['avg_regularity']:.3f}")
            
            return damage_labels, damage_stats, metadata

def main():
    """Afet etiketleme analizi çalıştırmak için ana fonksiyon"""
    try:
        # Create labeler instance
        labeler = DisasterLabeler()
        
        # Run analysis with automatic memory optimization
        damage_labels, damage_stats, metadata = labeler.run_analysis(force_downsample=False)
        
        print("\nAfet etiketleme analizi başarıyla tamamlandı!")
        
    except Exception as e:
        print(f"Analiz sırasında hata: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()