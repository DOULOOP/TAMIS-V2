# Hatay Earthquake Damage Assessment API

## 🌍 Overview

This FastAPI server provides REST API endpoints to access the Hatay earthquake damage assessment functionality. It exposes all analysis capabilities through HTTP endpoints, making it easy to integrate with web applications like Next.js.

## 🚀 Quick Start

### Installation & Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python start_api_server.py
   # or
   python api_server.py
   # or (Windows PowerShell)
   .\start_api_server.ps1
   ```

3. **Access the API:**
   - API Documentation: http://127.0.0.1:8000/docs
   - Alternative Docs: http://127.0.0.1:8000/redoc
   - Health Check: http://127.0.0.1:8000/health

## 📡 API Endpoints

### 🔧 System Endpoints

#### `GET /`
- **Description**: API information and available endpoints
- **Response**: JSON with API metadata and endpoint list

#### `GET /health`
- **Description**: Health check and data status
- **Response**: 
  ```json
  {
    "status": "healthy|warning",
    "timestamp": "2025-08-28T...",
    "data_status": "All required files found"
  }
  ```

#### `GET /data/status`
- **Description**: Detailed status of all data files
- **Response**: JSON with file existence, sizes, and modification dates

### 📊 Data Information

#### `GET /data/info`
- **Description**: Comprehensive dataset information
- **Response**: JSON with imagery metadata, file sizes, coordinate systems, etc.
- **Example Response**:
  ```json
  {
    "timestamp": "2025-08-28T...",
    "data_directory": "1c__Hatay_Enkaz_Bina_Etiketleme",
    "files": {
      "image_2015": {
        "file": "HATAY MERKEZ-2 2015.tif",
        "size_gb": 0.66,
        "dimensions": [25063, 19956],
        "bands": 4,
        "crs": "EPSG:32636",
        "resolution_meters": [0.10, 0.10]
      },
      "image_2023": {
        "file": "HATAY MERKEZ-2 2023.tif", 
        "size_gb": 2.48,
        "dimensions": [45289, 36060],
        "bands": 4,
        "crs": "EPSG:32636", 
        "resolution_meters": [0.055, 0.055]
      }
    }
  }
  ```

### 🤖 Analysis Execution

#### `GET /analysis/status`
- **Description**: Current analysis status
- **Response**:
  ```json
  {
    "running": false,
    "current_task": null,
    "progress": 0,
    "last_updated": "2025-08-28T..."
  }
  ```

#### `POST /analysis/run`
- **Description**: Start analysis process
- **Request Body**:
  ```json
  {
    "analysis_type": "data_info|visualization|web_map|damage_labeling|all",
    "options": {}
  }
  ```
- **Analysis Types**:
  - `data_info`: Quick data overview
  - `visualization`: Static comparison image
  - `web_map`: Interactive HTML map
  - `damage_labeling`: AI damage classification
  - `all`: Complete analysis pipeline

### 📈 Results & Reports

#### `GET /results/damage-report`
- **Description**: Get AI damage assessment report
- **Response**: Complete damage analysis with statistics
- **Example Response**:
  ```json
  {
    "analysis_metadata": {
      "timestamp": "2025-08-28T...",
      "image_dimensions": "11323 x 9015",
      "total_area_km2": 5.002,
      "analysis_method": "Multi-method change detection"
    },
    "damage_assessment": {
      "minimal": {
        "region_count": 1,
        "total_area_km2": 0.032,
        "percentage_of_total_area": 0.64,
        "average_change_intensity": 0.077
      },
      "severe": {
        "region_count": 1,
        "total_area_km2": 1.779,
        "percentage_of_total_area": 35.58,
        "average_change_intensity": 0.45
      }
    }
  }
  ```

#### `GET /results/field-analysis`
- **Description**: Get field-level analysis data
- **Response**: Individual field statistics and damage assessments

#### `GET /results/summary`
- **Description**: Summary of all available analysis results
- **Response**: Overview of generated outputs and key statistics

### 🎨 Visual Outputs

#### `GET /images/{filename}`
- **Description**: Serve generated images
- **Parameters**: 
  - `filename`: Image filename (e.g., "hatay_comparison.png")
- **Response**: Image file

#### `GET /maps/{filename}` 
- **Description**: Serve generated HTML maps
- **Parameters**:
  - `filename`: Map filename (e.g., "hatay_interactive_map.html")
- **Response**: HTML file

### 🔍 Advanced Queries

#### `GET /damage/by-severity`
- **Description**: Get damage statistics grouped by severity
- **Response**: 
  ```json
  {
    "minimal": {
      "area_km2": 0.032,
      "percentage": 0.64,
      "region_count": 1,
      "change_intensity": 0.077
    },
    "severe": {
      "area_km2": 1.779, 
      "percentage": 35.58,
      "region_count": 1,
      "change_intensity": 0.45
    }
  }
  ```

#### `GET /fields/search`
- **Description**: Search and filter field data
- **Query Parameters**:
  - `min_area`: Minimum field area in m²
  - `max_area`: Maximum field area in m²
  - `damage_level`: Filter by damage level
  - `limit`: Maximum results (default: 100)
- **Example**: `/fields/search?damage_level=severe&min_area=1000&limit=50`

## 🔧 Integration with Next.js

### Basic Setup

```javascript
// lib/api.js
const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = {
  // Get system health
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // Get dataset information
  async getDataInfo() {
    const response = await fetch(`${API_BASE_URL}/data/info`);
    return response.json();
  },

  // Start analysis
  async startAnalysis(analysisType, options = {}) {
    const response = await fetch(`${API_BASE_URL}/analysis/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_type: analysisType,
        options: options
      })
    });
    return response.json();
  },

  // Get analysis status
  async getAnalysisStatus() {
    const response = await fetch(`${API_BASE_URL}/analysis/status`);
    return response.json();
  },

  // Get damage report
  async getDamageReport() {
    const response = await fetch(`${API_BASE_URL}/results/damage-report`);
    return response.json();
  },

  // Get damage by severity
  async getDamageBySeverity() {
    const response = await fetch(`${API_BASE_URL}/damage/by-severity`);
    return response.json();
  },

  // Search fields
  async searchFields(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/fields/search?${params}`);
    return response.json();
  }
};
```

### React Component Example

```jsx
// components/DashboardComponent.jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function DashboardComponent() {
  const [dataInfo, setDataInfo] = useState(null);
  const [damageReport, setDamageReport] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  useEffect(() => {
    // Load initial data
    api.getDataInfo().then(setDataInfo);
    api.getDamageReport().then(setDamageReport).catch(() => {});
    
    // Poll analysis status
    const interval = setInterval(() => {
      api.getAnalysisStatus().then(setAnalysisStatus);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startAnalysis = async (type) => {
    try {
      await api.startAnalysis(type);
      // Status will be updated by polling
    } catch (error) {
      console.error('Failed to start analysis:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Hatay Earthquake Damage Assessment</h1>
      
      {/* Data Info Section */}
      {dataInfo && (
        <div className="data-info">
          <h2>Dataset Information</h2>
          <p>Total Area: {dataInfo.files?.boundaries?.total_area_km2} km²</p>
          <p>2015 Image: {dataInfo.files?.image_2015?.size_gb} GB</p>
          <p>2023 Image: {dataInfo.files?.image_2023?.size_gb} GB</p>
        </div>
      )}

      {/* Analysis Controls */}
      <div className="analysis-controls">
        <h2>Analysis Tools</h2>
        <button onClick={() => startAnalysis('visualization')}>
          Create Comparison
        </button>
        <button onClick={() => startAnalysis('damage_labeling')}>
          Run AI Analysis
        </button>
        <button onClick={() => startAnalysis('web_map')}>
          Generate Map
        </button>
      </div>

      {/* Analysis Status */}
      {analysisStatus?.running && (
        <div className="analysis-status">
          <h3>Analysis Running...</h3>
          <p>Task: {analysisStatus.current_task}</p>
          <p>Progress: {analysisStatus.progress}%</p>
        </div>
      )}

      {/* Damage Report */}
      {damageReport && (
        <div className="damage-report">
          <h2>Damage Assessment Results</h2>
          <p>Total Area Analyzed: {damageReport.analysis_metadata.total_area_km2} km²</p>
          
          {Object.entries(damageReport.damage_assessment).map(([severity, stats]) => (
            <div key={severity} className={`damage-${severity}`}>
              <h3>{severity.charAt(0).toUpperCase() + severity.slice(1)} Damage</h3>
              <p>Area: {stats.total_area_km2} km² ({stats.percentage_of_total_area}%)</p>
              <p>Regions: {stats.region_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## ⚡ Performance Considerations

### Server Optimization
- Analysis runs in background tasks to avoid blocking
- Large images processed in memory-efficient tiles
- Progress tracking for long-running operations
- Proper error handling and status reporting

### Client Integration
- Use polling for analysis status updates
- Implement loading states during analysis
- Cache results to avoid repeated API calls
- Handle errors gracefully with user feedback

## 🔒 CORS Configuration

The API is configured with CORS for local development:
- Allowed origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- All HTTP methods and headers allowed
- Credentials supported

For production, update the CORS settings in `api_server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   - Change port in `api_server.py`: `uvicorn.run(..., port=8001)`

2. **Missing dependencies**
   - Run: `pip install -r requirements.txt`

3. **Data files not found**
   - Ensure data directory exists: `1c__Hatay_Enkaz_Bina_Etiketleme/`
   - Check file paths in API responses

4. **CORS errors in browser**
   - Verify Next.js is running on allowed ports (3000)
   - Check browser console for specific CORS messages

5. **Analysis fails**
   - Check server logs for specific errors
   - Verify all input files are accessible
   - Ensure sufficient disk space and memory

### API Testing

Use the built-in documentation:
- Interactive API docs: http://127.0.0.1:8000/docs
- Try endpoints directly in the browser
- Use curl or Postman for testing:

```bash
# Health check
curl http://127.0.0.1:8000/health

# Get data info
curl http://127.0.0.1:8000/data/info

# Start analysis
curl -X POST http://127.0.0.1:8000/analysis/run \
  -H "Content-Type: application/json" \
  -d '{"analysis_type": "visualization"}'
```

## 📚 Next Steps

1. **Integrate with Next.js**: Use the provided code examples
2. **Add authentication**: Implement API keys or JWT tokens if needed
3. **Deploy to production**: Consider Docker containerization
4. **Add rate limiting**: Prevent API abuse
5. **Implement caching**: Redis for frequently accessed data
6. **Add monitoring**: Logging and metrics collection

---

*The API server provides a complete REST interface to all earthquake damage assessment capabilities, making it easy to build interactive web applications.*
