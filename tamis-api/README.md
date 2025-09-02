# Hatay Earthquake Damage Assessment Data Visualization

This repository contains tools to visualize and analyze satellite imagery and geographic data from Hatay, Turkey for earthquake damage assessment. The dataset compares pre-earthquake (2015) and post-earthquake (2023) conditions.

## Dataset Overview

The dataset contains:
- **2015 Satellite Imagery**: Pre-earthquake baseline imagery (675MB)
- **2023 Satellite Imagery**: Post-earthquake imagery for damage assessment (2.5GB)
- **Study Area Boundaries**: Shapefile defining the analysis area
- **Coordinate System**: WGS84 Transverse Mercator (Central Meridian: 36°)

## Setup Instructions

### 1. Install Required Packages

```bash
pip install -r requirements.txt
```

Required packages:
- `rasterio` - For reading satellite imagery
- `geopandas` - For handling geographic vector data
- `matplotlib` - For creating static visualizations
- `folium` - For interactive web maps
- `numpy`, `pandas`, `pillow` - Supporting libraries

### 2. Verify Your Data

First, check that your data is properly formatted:

```bash
python check_data_info.py
```

This will display:
- File sizes and dimensions
- Coordinate system information
- Attribute data preview
- Coverage areas

## Usage

### Option 1: Static Visualization (Recommended)

Create side-by-side comparison plots:

```bash
python visualize_hatay_data.py
```

**Output:**
- High-resolution comparison image (`hatay_comparison.png`)
- Console output with technical details
- Boundary overlays on both images

**Features:**
- Pre/post earthquake imagery comparison
- Study area boundary overlay
- Technical metadata display
- Publication-ready output

### Option 2: Interactive Web Map

Create an interactive web-based map:

```bash
python create_web_map.py
```

**Output:**
- Interactive HTML map (`hatay_interactive_map.html`)
- Multiple base map layers
- Clickable features with information

**Features:**
- Multiple base maps (Street, Satellite)
- Interactive boundary visualization
- Imagery extent indicators
- Key location markers
- Earthquake information popup

### Option 3: Data Inspection Only

Quick overview of dataset properties:

```bash
python check_data_info.py
```

## Understanding the Data

### File Structure
```
1c__Hatay_Enkaz_Bina_Etiketleme/
├── HATAY MERKEZ-2 2015.tif        # Pre-earthquake imagery
├── HATAY MERKEZ-2 2023.tif        # Post-earthquake imagery
├── HATAY MERKEZ-2 SINIR.shp       # Boundary shapefile
├── HATAY MERKEZ-2 SINIR.shx       # Shapefile index
├── HATAY MERKEZ-2 SINIR.dbf       # Attribute database
├── HATAY MERKEZ-2 SINIR.prj       # Projection information
└── HATAY MERKEZ-2 SINIR.cpg       # Character encoding
```

### Technical Specifications
- **Imagery Format**: GeoTIFF
- **Vector Format**: ESRI Shapefile
- **Coordinate System**: WGS84 Transverse Mercator
- **Encoding**: UTF-8

## Analysis Applications

This dataset can be used for:

### 🏗️ **Building Damage Assessment**
- Compare building conditions before/after earthquake
- Identify collapsed or severely damaged structures
- Quantify damage extent

### 🛣️ **Infrastructure Impact Analysis**
- Assess road network damage
- Identify blocked or destroyed transportation routes
- Plan emergency access routes

### 🏘️ **Urban Planning Support**
- Guide reconstruction efforts
- Identify safe zones for temporary housing
- Plan future development with seismic considerations

### 📊 **Statistical Analysis**
- Calculate damage statistics by area
- Generate damage density maps
- Support insurance and relief planning

## Tips for Analysis

### Visual Comparison
- Look for changes in building rooflines
- Notice debris patterns and collapsed structures
- Identify changes in vegetation and open spaces
- Observe new tent camps or emergency structures

### Geographic Analysis
- Use the boundary data to focus on specific districts
- Compare damage patterns across different elevation zones
- Analyze proximity to fault lines or geological features

### Temporal Analysis
- The 8-year gap (2015-2023) shows both earthquake damage and natural urban development
- Distinguish between earthquake damage and normal urban change

## Troubleshooting

### Common Issues

**File Not Found Errors:**
- Ensure the data directory path is correct
- Check that all required files are present
- Verify file permissions

**Memory Issues:**
- Large imagery files may require substantial RAM
- Consider processing smaller areas if memory is limited
- Close other applications to free memory

**Display Issues:**
- Ensure your system supports matplotlib display
- For headless systems, modify scripts to save without displaying
- Check graphics drivers for rendering issues

**Coordinate System Errors:**
- All files should use the same coordinate system
- The scripts handle coordinate system conversion automatically

## Output Files

After running the scripts, you'll have:
- `hatay_comparison.png` - Static comparison visualization
- `hatay_interactive_map.html` - Interactive web map

## Context: February 2023 Earthquakes

This dataset relates to the devastating earthquakes that struck Turkey and Syria on February 6, 2023:
- **Magnitude 7.8** earthquake at 04:17 local time
- **Magnitude 7.5** earthquake at 13:24 local time
- Hatay Province was among the most severely affected areas
- The imagery comparison helps assess the earthquake's impact on the built environment

## Support

For technical issues:
1. Check that all dependencies are installed correctly
2. Verify data file integrity and location
3. Review console output for specific error messages
4. Ensure sufficient disk space for processing large files

---

*This analysis tool was created to support earthquake damage assessment and recovery planning efforts in Hatay Province, Turkey.*
