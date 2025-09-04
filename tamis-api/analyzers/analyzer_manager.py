#!/usr/bin/env python3
"""
Hatay Deprem Değerlendirmesi için Merkezi Analizör Yöneticisi
Bu sınıf tabanlı altyapı, tüm analiz araçları için birleşik bir arayüz sağlar
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Callable, Any
import importlib.util


class AnalyzerManager:
    """
    Tüm Hatay deprem analiz araçları için merkezi yönetici
    Analizleri programatik olarak çalıştırmak için sınıf tabanlı arayüz sağlar
    """
    
    def __init__(self, data_dir: str = "1c__Hatay_Enkaz_Bina_Etiketleme"):
        """
        Analizör yöneticisini başlat
        
        Args:
            data_dir (str): Uydu görüntüsü verilerini içeren dizin
        """
        self.data_dir = data_dir
        self.output_dir = "output"
        self.analyzers_dir = os.path.dirname(os.path.abspath(__file__))
        self.root_dir = os.path.dirname(self.analyzers_dir)
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Define available analyzers
        self.analyzers = {
            'data_info': {
                'name': 'Veri Bilgileri Kontrolü',
                'description': 'Uydu görüntüsü dosyaları hakkında temel bilgileri analiz et',
                'script': 'check_data_info.py',
                'class': None,  # Script-based analyzer
                'outputs': ['console_output'],
                'estimated_time': 10  # seconds
            },
            'coordinates': {
                'name': 'Koordinat Çıkarma',
                'description': 'Shapefile ve raster verilerinden kesin koordinatları çıkar',
                'script': 'coordinate_extractor.py',
                'class': 'CoordinateExtractor',
                'outputs': ['hatay_coordinates.json'],
                'estimated_time': 30
            },
            'visualization': {
                'name': 'Statik Görselleştirme',
                'description': 'Yan yana karşılaştırma görselleştirmeleri oluştur',
                'script': 'visualize_hatay_data.py',
                'class': None,
                'outputs': ['hatay_comparison.png', 'hatay_damage_assessment.png'],
                'estimated_time': 120
            },
            'web_map': {
                'name': 'Etkileşimli Web Haritası',
                'description': 'Hasar katmanları ile etkileşimli web haritası oluştur',
                'script': 'create_web_map.py',
                'class': None,
                'outputs': ['hatay_interactive_map.html'],
                'estimated_time': 45
            },
            'damage_labeling': {
                'name': 'AI Hasar Değerlendirmesi',
                'description': 'Şiddet analizi ile AI destekli hasar sınıflandırması',
                'script': 'disaster_labeling.py',
                'class': 'DisasterLabeler',
                'outputs': ['hatay_damage_assessment.png', 'hatay_damage_report.json', 'hatay_field_analysis.json'],
                'estimated_time': 180
            },
            'full_analysis': {
                'name': 'Tam Analiz Hattı',
                'description': 'Tüm analiz araçlarını sırayla çalıştır',
                'script': 'run_analysis.py',
                'class': None,
                'outputs': ['all_outputs'],
                'estimated_time': 300
            }
        }
        
        # Progress tracking
        self.current_analysis = None
        self.progress_callbacks = []
    
    def add_progress_callback(self, callback: Callable[[str, float, str], None]):
        """
        İlerleme güncellemeleri için geri çağırma fonksiyonu ekle
        
        Args:
            callback: (analysis_id, progress_percent, message) alan fonksiyon
        """
        self.progress_callbacks.append(callback)
    
    def _update_progress(self, analysis_id: str, progress: float, message: str):
        """Kayıtlı tüm geri çağırmalar için ilerlemeyi güncelle"""
        for callback in self.progress_callbacks:
            try:
                callback(analysis_id, progress, message)
            except Exception as e:
                print(f"Uyarı: İlerleme geri çağırması başarısız: {e}")
    
    def list_analyzers(self) -> Dict[str, Dict[str, Any]]:
        """Mevcut tüm analizörler hakkında bilgi al"""
        return self.analyzers.copy()
    
    def get_analyzer_info(self, analyzer_id: str) -> Optional[Dict[str, Any]]:
        """Belirli bir analizör hakkında detaylı bilgi al"""
        return self.analyzers.get(analyzer_id)
    
    def check_prerequisites(self) -> Dict[str, bool]:
        """
        Analizleri çalıştırmak için tüm ön koşulların karşılanıp karşılanmadığını kontrol et
        
        Returns:
            Çeşitli ön koşulların durumunu içeren Dict
        """
        status = {}
        
        # Check data directory
        status['data_directory'] = os.path.exists(self.data_dir)
        
        # Check required data files
        required_files = [
            "HATAY MERKEZ-2 2015.tif",
            "HATAY MERKEZ-2 2023.tif",
            "HATAY MERKEZ-2 SINIR.shp"
        ]
        
        for file in required_files:
            file_path = os.path.join(self.data_dir, file)
            status[f'file_{file}'] = os.path.exists(file_path)
        
        # Check Python dependencies
        required_packages = [
            'rasterio', 'geopandas', 'matplotlib', 'folium', 
            'scikit-learn', 'opencv-python', 'scikit-image'
        ]
        
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                status[f'package_{package}'] = True
            except ImportError:
                status[f'package_{package}'] = False
        
        return status
    
    def run_analyzer_script(self, analyzer_id: str, analysis_id: str = None) -> Dict[str, Any]:
        """
        Bir analizörü subprocess kullanarak çalıştır (script tabanlı yaklaşım)
        
        Args:
            analyzer_id: Çalıştırılacak analizörün ID'si
            analysis_id: Bu analiz çalışması için benzersiz ID
            
        Returns:
            Analiz sonuçları ve meta verileri içeren Dict
        """
        if analyzer_id not in self.analyzers:
            raise ValueError(f"Bilinmeyen analizör: {analyzer_id}")
        
        analyzer = self.analyzers[analyzer_id]
        script_path = os.path.join(self.analyzers_dir, analyzer['script'])
        
        if not os.path.exists(script_path):
            raise FileNotFoundError(f"Analizör scripti bulunamadı: {script_path}")
        
        analysis_id = analysis_id or f"{analyzer_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_analysis = analysis_id
        
        result = {
            'analysis_id': analysis_id,
            'analyzer_id': analyzer_id,
            'analyzer_name': analyzer['name'],
            'start_time': datetime.now().isoformat(),
            'status': 'running',
            'progress': 0,
            'message': f"{analyzer['name']} başlatılıyor...",
            'outputs': {},
            'errors': []
        }
        
        try:
            self._update_progress(analysis_id, 10, "Analiz başlatılıyor...")
            
            # Change to root directory for script execution
            original_cwd = os.getcwd()
            os.chdir(self.root_dir)
            
            # Add special handling for automated run_analysis
            cmd = [sys.executable, os.path.join(self.analyzers_dir, analyzer['script'])]
            if analyzer_id == 'full_analysis':
                cmd.append('--auto')
            
            self._update_progress(analysis_id, 20, f"{analyzer['name']} çalıştırılıyor...")
            
            # Run the script
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=analyzer['estimated_time'] + 60,  # Add buffer time
                cwd=self.root_dir
            )
            
            # Restore original working directory
            os.chdir(original_cwd)
            
            if process.returncode == 0:
                self._update_progress(analysis_id, 90, "Analiz tamamlandı, çıktılar işleniyor...")
                
                result.update({
                    'status': 'completed',
                    'progress': 100,
                    'message': f"{analyzer['name']} başarıyla tamamlandı",
                    'end_time': datetime.now().isoformat(),
                    'stdout': process.stdout,
                    'stderr': process.stderr
                })
                
                # Check for output files
                result['outputs'] = self._check_output_files(analyzer['outputs'])
                
            else:
                result.update({
                    'status': 'failed',
                    'progress': 100,
                    'message': f"{analyzer['name']} {process.returncode} dönüş koduyla başarısız",
                    'end_time': datetime.now().isoformat(),
                    'stdout': process.stdout,
                    'stderr': process.stderr,
                    'errors': [f"İşlem {process.returncode} dönüş koduyla başarısız"]
                })
            
        except subprocess.TimeoutExpired:
            result.update({
                'status': 'timeout',
                'progress': 100,
                'message': f"{analyzer['name']} {analyzer['estimated_time']} saniye sonra zaman aşımına uğradı",
                'end_time': datetime.now().isoformat(),
                'errors': ['Analiz zaman aşımına uğradı']
            })
            
        except Exception as e:
            result.update({
                'status': 'error',
                'progress': 100,
                'message': f"{analyzer['name']} hata ile başarısız: {str(e)}",
                'end_time': datetime.now().isoformat(),
                'errors': [str(e)]
            })
        
        finally:
            self.current_analysis = None
            self._update_progress(analysis_id, 100, result['message'])
        
        return result
    
    def run_analyzer_class(self, analyzer_id: str, analysis_id: str = None) -> Dict[str, Any]:
        """
        Doğrudan sınıf örneklemesi kullanarak analizör çalıştır (sınıf tabanlı yaklaşım)
        
        Args:
            analyzer_id: Çalıştırılacak analizörün ID'si
            analysis_id: Bu analiz çalışması için benzersiz ID
            
        Returns:
            Analiz sonuçları ve meta verileri içeren Dict
        """
        if analyzer_id not in self.analyzers:
            raise ValueError(f"Bilinmeyen analizör: {analyzer_id}")
        
        analyzer = self.analyzers[analyzer_id]
        
        if not analyzer['class']:
            # Fall back to script-based approach
            return self.run_analyzer_script(analyzer_id, analysis_id)
        
        analysis_id = analysis_id or f"{analyzer_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_analysis = analysis_id
        
        result = {
            'analysis_id': analysis_id,
            'analyzer_id': analyzer_id,
            'analyzer_name': analyzer['name'],
            'start_time': datetime.now().isoformat(),
            'status': 'running',
            'progress': 0,
            'message': f"{analyzer['name']} başlatılıyor...",
            'outputs': {},
            'errors': []
        }
        
        try:
            self._update_progress(analysis_id, 10, "Analizör sınıfı yükleniyor...")
            
            # Import the analyzer module and class
            script_path = os.path.join(self.analyzers_dir, analyzer['script'])
            spec = importlib.util.spec_from_file_location("analyzer_module", script_path)
            module = importlib.util.module_from_spec(spec)
            
            # Change to root directory for class execution
            original_cwd = os.getcwd()
            os.chdir(self.root_dir)
            
            spec.loader.exec_module(module)
            
            analyzer_class = getattr(module, analyzer['class'])
            
            self._update_progress(analysis_id, 20, "Analizör başlatılıyor...")
            
            # Create analyzer instance
            analyzer_instance = analyzer_class(data_dir=self.data_dir)
            
            # Add progress callback to analyzer if it supports it
            if hasattr(analyzer_instance, 'add_progress_callback'):
                analyzer_instance.add_progress_callback(
                    lambda p, m: self._update_progress(analysis_id, 20 + (p * 0.7), m)
                )
            
            self._update_progress(analysis_id, 30, "Analiz çalıştırılıyor...")
            
            # Run the analysis
            if analyzer_id == 'damage_labeling':
                analysis_result = analyzer_instance.run_analysis()
            elif analyzer_id == 'coordinates':
                analysis_result = analyzer_instance.extract_all_coordinates()
            else:
                analysis_result = analyzer_instance.analyze()
            
            # Restore original working directory
            os.chdir(original_cwd)
            
            self._update_progress(analysis_id, 90, "Analiz tamamlandı, çıktılar işleniyor...")
            
            result.update({
                'status': 'completed',
                'progress': 100,
                'message': f"{analyzer['name']} başarıyla tamamlandı",
                'end_time': datetime.now().isoformat(),
                'analysis_result': analysis_result
            })
            
            # Check for output files
            result['outputs'] = self._check_output_files(analyzer['outputs'])
            
        except Exception as e:
            result.update({
                'status': 'error',
                'progress': 100,
                'message': f"{analyzer['name']} hata ile başarısız: {str(e)}",
                'end_time': datetime.now().isoformat(),
                'errors': [str(e)]
            })
        
        finally:
            self.current_analysis = None
            self._update_progress(analysis_id, 100, result['message'])
        
        return result
    
    def run_analyzer(self, analyzer_id: str, analysis_id: str = None, use_class: bool = True) -> Dict[str, Any]:
        """
        Otomatik yöntem seçimi ile analizör çalıştır
        
        Args:
            analyzer_id: Çalıştırılacak analizörün ID'si
            analysis_id: Bu analiz çalışması için benzersiz ID
            use_class: Mevcut olduğunda sınıf tabanlı yaklaşımı tercih edip etmeme
            
        Returns:
            Analiz sonuçları ve meta verileri içeren Dict
        """
        analyzer = self.analyzers.get(analyzer_id)
        
        if not analyzer:
            raise ValueError(f"Bilinmeyen analizör: {analyzer_id}")
        
        # Choose execution method
        if use_class and analyzer['class']:
            return self.run_analyzer_class(analyzer_id, analysis_id)
        else:
            return self.run_analyzer_script(analyzer_id, analysis_id)
    
    def _check_output_files(self, expected_outputs: List[str]) -> Dict[str, Any]:
        """Beklenen çıktı dosyalarının oluşturulup oluşturulmadığını kontrol et"""
        outputs = {}
        
        # Common output locations
        output_locations = [
            self.output_dir,
            self.root_dir,
            os.path.join(self.root_dir, "static")
        ]
        
        for expected in expected_outputs:
            if expected in ['console_output', 'all_outputs']:
                continue
                
            found = False
            for location in output_locations:
                file_path = os.path.join(location, expected)
                if os.path.exists(file_path):
                    outputs[expected] = {
                        'path': file_path,
                        'size': os.path.getsize(file_path),
                        'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                    }
                    found = True
                    break
            
            if not found:
                outputs[expected] = {'status': 'not_found'}
        
        return outputs
    
    def get_analysis_status(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Bir analizin mevcut durumunu al (eğer mevcut analizse)"""
        if self.current_analysis == analysis_id:
            return {
                'analysis_id': analysis_id,
                'status': 'running',
                'current': True
            }
        return None
    
    def cancel_analysis(self, analysis_id: str) -> bool:
        """
        Çalışan bir analizi iptal etmeye çalış
        Not: Bu subprocess tabanlı analizler için sınırlıdır
        """
        if self.current_analysis == analysis_id:
            # For now, we can't easily cancel subprocess-based analyses
            # In future versions, we could implement process tracking
            return False
        return True


# Convenience functions for backward compatibility
def run_data_info_check() -> Dict[str, Any]:
    """Veri bilgileri kontrolü çalıştır"""
    manager = AnalyzerManager()
    return manager.run_analyzer('data_info')

def run_visualization() -> Dict[str, Any]:
    """Statik görselleştirme çalıştır"""
    manager = AnalyzerManager()
    return manager.run_analyzer('visualization')

def run_web_map() -> Dict[str, Any]:
    """Etkileşimli web haritası oluşturma çalıştır"""
    manager = AnalyzerManager()
    return manager.run_analyzer('web_map')

def run_damage_labeling() -> Dict[str, Any]:
    """AI hasar değerlendirmesi çalıştır"""
    manager = AnalyzerManager()
    return manager.run_analyzer('damage_labeling')

def run_coordinate_extraction() -> Dict[str, Any]:
    """Koordinat çıkarma çalıştır"""
    manager = AnalyzerManager()
    return manager.run_analyzer('coordinates')

def run_full_analysis() -> Dict[str, Any]:
    """Tam analiz hattını çalıştır"""
    manager = AnalyzerManager()
    return manager.run_analyzer('full_analysis')


if __name__ == "__main__":
    # Demo usage
    print("Hatay Deprem Analizör Yöneticisi Demosu")
    print("=" * 50)
    
    manager = AnalyzerManager()
    
    # Check prerequisites
    print("Ön koşullar kontrol ediliyor...")
    prereqs = manager.check_prerequisites()
    
    for check, status in prereqs.items():
        status_icon = "BAŞARILI" if status else "BAŞARISIZ"
        print(f"  {status_icon} {check}: {status}")
    
    # List available analyzers
    print(f"\nMevcut analizörler:")
    for analyzer_id, info in manager.list_analyzers().items():
        print(f"  • {analyzer_id}: {info['name']}")
        print(f"    {info['description']}")
        print(f"    Tahmini süre: {info['estimated_time']}s")
        print()