# Hatay Earthquake Damage Assessment Project

## 🌍 Project Overview

This project provides a comprehensive suite of tools for analyzing and visualizing earthquake damage in Hatay Province, Turkey, using satellite imagery from before (2015) and after (2023) the devastating February 2023 earthquakes. The system employs advanced AI and image processing techniques to automatically detect, classify, and quantify damage across the urban landscape.

## 📊 Dataset Description

### Satellite Imagery
- **Pre-Earthquake (2015)**
  - Size: 0.66 GB
  - Resolution: 10 cm/pixel
  - Dimensions: 25,063 × 19,956 pixels
  - Format: GeoTIFF (4-band: RGB + Alpha/IR)
  - Coverage: 5.00 km²

- **Post-Earthquake (2023)**
  - Size: 2.48 GB
  - Resolution: 5.5 cm/pixel
  - Dimensions: 45,289 × 36,060 pixels
  - Format: GeoTIFF (4-band: RGB + Alpha/IR)
  - Coverage: 5.00 km²

### Geographic Data
- **Coordinate System:** WGS84 Transverse Mercator (Central Meridian: 36°)
- **Study Area:** Central Hatay (Antakya)
- **Bounds:** 36.136884°E to 36.164790°E, 36.200889°N to 36.218908°N

## 🛠️ Technical Architecture

### 1. Core Components
- **Data Processing Pipeline**
  - Image alignment and registration
  - Multi-scale change detection
  - Damage classification
  - Field-level analysis
  - Statistical reporting

- **Analysis Methods**
  - SSIM (Structural Similarity Index)
  - Color difference analysis
  - Edge detection
  - Shape analysis
  - Connected component labeling

### 2. Performance Optimizations
- **Memory Management**
  - Tile-based processing (512×512 pixels)
  - Automatic downsampling for large images
  - Parallel processing with 4 threads
  - Efficient data structures

- **Processing Pipeline**
  - Multi-threaded tile processing
  - Progressive image loading
  - Optimized change detection
  - Efficient field analysis

## 🔬 Analysis Capabilities

### 1. Damage Assessment
- **Classification Levels:**
  - Minimal (< 10% change)
  - Moderate (10-30% change)
  - Severe (30-60% change)
  - Catastrophic (> 60% change)

- **Analysis Metrics:**
  - Change intensity
  - Structural damage
  - Area affected
  - Pattern recognition

### 2. Field-Level Analysis
- **Geometric Properties:**
  - Field boundaries
  - Area calculation
  - Perimeter measurement
  - Centroid location
  - Shape characteristics

- **Shape Analysis:**
  - Compactness ratio
  - Aspect ratio
  - Regularity
  - Elongation

### 3. Statistical Analysis
- **Damage Statistics:**
  - Total affected area
  - Damage distribution
  - Field size distribution
  - Shape metrics

## 📈 Output Products

### 1. Visualizations
- **Static Comparison (`hatay_comparison.png`)**
  - Side-by-side imagery comparison
  - Boundary overlays
  - Technical metadata

- **Damage Assessment (`hatay_damage_assessment.png`)**
  - Color-coded damage levels
  - Field boundaries
  - Severity indicators

- **Interactive Web Map (`hatay_interactive_map.html`)**
  - Multiple base layers
  - Dynamic overlays
  - Clickable features
  - Information popups

### 2. Analysis Reports
- **Damage Report (`hatay_damage_report.json`)**
  - Overall statistics
  - Damage summaries
  - Area calculations
  - Change metrics

- **Field Analysis (`hatay_field_analysis.json`)**
  - Field-by-field data
  - Geometric properties
  - Damage assessments
  - Shape characteristics

## 🔧 Implementation Details

### 1. Change Detection Algorithm
```python
# Multi-method change detection
- SSIM (50% weight): Structural changes
- Color difference (30% weight): Material changes
- Edge detection (20% weight): Boundary changes
- Gaussian smoothing for noise reduction
- Adaptive thresholding for classification
```

### 2. Field Analysis Pipeline
```python
# For each field:
1. Extract boundaries
2. Calculate geometric properties
3. Compute shape metrics
4. Assess damage intensity
5. Classify damage level
6. Generate field metadata
```

### 3. Performance Metrics
- **Processing Speed:** ~5-10 minutes for full analysis
- **Memory Usage:** Optimized for 2.48GB imagery
- **Accuracy:** Multi-algorithm validation
- **Resolution:** Down to 5.5cm/pixel detail

## 📊 Sample Results

### Overall Statistics
- Total Area Analyzed: 5.002 km²
- Total Damaged Area: 2.817 km² (56.32%)
- Total Fields Analyzed: 41,076

### Damage Distribution
- Minimal: 1,704 fields (0.64% area)
- Moderate: 9,791 fields (0.94% area)
- Severe: 23,174 fields (35.58% area)
- Catastrophic: 6,407 fields (19.17% area)

### Field Metrics
- Average Field Size: 1,399.7 pixels
- Size Range: 10 to 172,171 pixels
- Average Compactness: 1,430.358
- Average Regularity: 0.177

## 🚀 Usage Instructions

### 1. Basic Analysis
```bash
python run_analysis.py
# Select from menu options:
1. Check Data Information
2. Create Static Visualization
3. Create Interactive Web Map
4. AI Disaster Size Labeling
5. Run All Analysis
```

### 2. Advanced Usage
```python
# Direct script execution
python check_data_info.py      # Data overview
python visualize_hatay_data.py # Static comparison
python create_web_map.py       # Interactive map
python disaster_labeling.py    # AI analysis
```

## 🔍 Technical Requirements

### Software Dependencies
```
rasterio>=1.3.0      # Satellite imagery handling
geopandas>=0.12.0    # Geographic data processing
matplotlib>=3.5.0    # Visualization
folium>=0.14.0       # Web mapping
numpy>=1.21.0        # Numerical processing
opencv-python>=4.6.0 # Image processing
scikit-image>=0.19.0 # Advanced image analysis
scikit-learn>=1.1.0  # Machine learning
```

### Hardware Requirements
- RAM: 8GB minimum, 16GB recommended
- Storage: 5GB free space
- CPU: Multi-core processor recommended
- GPU: Optional, CPU-optimized processing

## 📚 References

### Earthquake Context
- Date: February 6, 2023
- Magnitude: 7.8 (04:17 local) and 7.5 (13:24 local)
- Location: Hatay Province, Turkey
- Impact: Severe damage to urban infrastructure

### Technical References
- SSIM: Wang et al. (2004)
- Change Detection: Coppin et al. (2004)
- Damage Assessment: UNITAR guidelines
- Image Processing: OpenCV documentation

## 👥 Contributors
This analysis tool was created to support earthquake damage assessment and recovery planning efforts in Hatay Province, Turkey.

---

*Last Updated: 2025-08-28*
