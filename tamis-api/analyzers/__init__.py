"""
Hatay Deprem Hasar Değerlendirmesi için Analizörler Paketi

Bu paket, uydu görüntülerini işlemek ve Hatay deprem analizi için
hasar değerlendirmeleri oluşturmak üzere tüm analiz araçlarını içerir.

Mevcut analizörler:
- analyzer_manager: Tüm analiz araçları için merkezi yönetici (YENİ!)
- check_data_info: Veri bilgileri ve doğrulama
- visualize_hatay_data: Statik görselleştirme oluşturma  
- create_web_map: Etkileşimli web haritası oluşturma
- disaster_labeling: Gelişmiş AI hasar sınıflandırması
- run_analysis: Tam analiz orkestratörü
"""

__version__ = "2.0.0"
__author__ = "Hatay Deprem Analiz Ekibi"

# Import main analyzer manager and classes for easy access
try:
    from .analyzer_manager import AnalyzerManager
    from .disaster_labeling import DisasterLabeler
    from .analyzer_manager import (
        run_data_info_check,
        run_visualization,
        run_web_map,
        run_damage_labeling,
        run_full_analysis
    )
except ImportError as e:
    print(f"Uyarı: Bazı analizörler içe aktarılamadı: {e}")
    # Handle import errors gracefully
    pass

# Available analyzer IDs
AVAILABLE_ANALYZERS = [
    "data_info",
    "visualization", 
    "web_map",
    "damage_labeling",
    "full_analysis"
]

__all__ = [
    'AnalyzerManager',
    'DisasterLabeler',
    'AVAILABLE_ANALYZERS',
    'run_data_info_check',
    'run_visualization',
    'run_web_map',
    'run_damage_labeling',
    'run_full_analysis'
]
