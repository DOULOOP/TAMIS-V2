# Hatay Earthquake Assessment - Complete Integration Guide

## 🌍 Overview

This guide shows you how to set up and run the complete Hatay Earthquake Damage Assessment system with both the FastAPI backend and Next.js frontend.

## 📦 System Components

### 1. **Python Analysis Backend** (`api_server.py`)
- FastAPI REST API server
- Satellite imagery processing
- AI damage classification
- Analysis result generation

### 2. **Next.js Web Dashboard** (`nextjs-client-example/`)
- React-based user interface
- Real-time analysis monitoring
- Interactive damage visualizations
- Responsive design

## 🚀 Complete Setup Instructions

### Step 1: Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd "C:\Users\furka\Downloads\1c__Hatay_Enkaz_Bina_Etiketleme"
   pip install -r requirements.txt
   ```

2. **Start the API server:**
   ```bash
   python start_api_server.py
   # or
   python api_server.py
   ```

3. **Verify API is running:**
   - Open: http://127.0.0.1:8000/health
   - Check: http://127.0.0.1:8000/docs (API documentation)

### Step 2: Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd nextjs-client-example
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

4. **Open the dashboard:**
   - Navigate to: http://localhost:3000

### Step 3: Test the Integration

1. **Check system health:**
   - Dashboard should show dataset information
   - Green status indicators for API connection

2. **Run analysis:**
   - Click "AI Damage Analysis" button
   - Monitor progress in real-time
   - View results when complete

## 💻 Usage Workflow

### 1. **Data Overview** 📊
- View satellite imagery metadata
- Check dataset availability
- See analysis capabilities

### 2. **Run Analysis** 🤖
- **Static Comparison**: Creates side-by-side imagery
- **AI Damage Assessment**: Classifies damage severity
- **Interactive Map**: Generates web-based map
- **Complete Analysis**: Runs all tools

### 3. **View Results** 📈
- Real-time progress monitoring
- Damage statistics by severity
- Generated visualizations
- Downloadable reports

## 🛠️ API Integration Examples

### Basic JavaScript Integration
```javascript
// Connect to API
const apiUrl = 'http://127.0.0.1:8000';

// Check health
const health = await fetch(`${apiUrl}/health`);
console.log(await health.json());

// Start analysis
const analysis = await fetch(`${apiUrl}/analysis/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_type: 'damage_labeling'
  })
});

// Get results
const results = await fetch(`${apiUrl}/results/damage-report`);
const damageData = await results.json();
```

### React Hook Example
```jsx
import { useState, useEffect } from 'react';

function useAnalysis() {
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('http://127.0.0.1:8000/analysis/status');
      const statusData = await response.json();
      setStatus(statusData);
      
      if (!statusData.running && statusData.last_updated) {
        // Load results when analysis completes
        try {
          const resultsResponse = await fetch('http://127.0.0.1:8000/results/damage-report');
          const resultsData = await resultsResponse.json();
          setResults(resultsData);
        } catch (error) {
          console.log('No results available yet');
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { status, results };
}
```

## 📊 Data Structure Examples

### Dataset Information Response
```json
{
  "timestamp": "2025-08-28T...",
  "files": {
    "image_2015": {
      "file": "HATAY MERKEZ-2 2015.tif",
      "size_gb": 0.66,
      "dimensions": [25063, 19956],
      "resolution_meters": [0.10, 0.10]
    },
    "image_2023": {
      "file": "HATAY MERKEZ-2 2023.tif", 
      "size_gb": 2.48,
      "dimensions": [45289, 36060],
      "resolution_meters": [0.055, 0.055]
    }
  }
}
```

### Damage Assessment Results
```json
{
  "analysis_metadata": {
    "total_area_km2": 5.002,
    "analysis_method": "Multi-method change detection"
  },
  "damage_assessment": {
    "minimal": {
      "total_area_km2": 0.032,
      "percentage_of_total_area": 0.64
    },
    "severe": {
      "total_area_km2": 1.779,
      "percentage_of_total_area": 35.58
    }
  }
}
```

## 🎨 UI Components Available

### Dashboard Components
- **DataInfoCard**: Displays satellite imagery metadata
- **AnalysisControls**: Buttons to start different analyses
- **StatusMonitor**: Real-time progress tracking
- **DamageVisualization**: Color-coded damage severity display
- **ImageGallery**: Generated comparison and assessment images

### Styling Features
- **Responsive Design**: Mobile-first layout
- **Loading States**: Smooth user feedback
- **Error Handling**: Graceful error messages
- **Color Coding**: Damage severity visualization
- **Real-time Updates**: Live status monitoring

## 🔧 Advanced Configuration

### Custom Analysis Parameters
```javascript
// Start analysis with custom options
await fetch('http://127.0.0.1:8000/analysis/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_type: 'damage_labeling',
    options: {
      tile_size: 256,
      downsample_factor: 2,
      damage_threshold: 0.5
    }
  })
});
```

### Environment Configuration
```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_POLLING_INTERVAL=3000

# Python environment
export HATAY_DATA_DIR="custom/path/to/data"
export HATAY_OUTPUT_DIR="custom/output/path"
```

## 🚀 Production Deployment

### Backend Deployment
```bash
# Using Uvicorn in production
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4

# Using Docker
docker build -t hatay-api .
docker run -p 8000:8000 hatay-api
```

### Frontend Deployment
```bash
# Build Next.js app
npm run build
npm run start

# Using PM2
pm2 start npm --name "hatay-dashboard" -- start
```

### Nginx Configuration
```nginx
# API proxy
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Frontend
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 📈 Performance Optimization

### Backend Optimizations
- **Memory Management**: Tile-based processing for large images
- **Parallel Processing**: Multi-threaded analysis
- **Caching**: Results caching for repeated requests
- **Background Tasks**: Non-blocking analysis execution

### Frontend Optimizations
- **Code Splitting**: Lazy loading components
- **Image Optimization**: Next.js image optimization
- **API Caching**: Cache analysis results
- **Polling Optimization**: Efficient status checking

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   # Check if API server is running
   curl http://127.0.0.1:8000/health
   
   # Check CORS configuration
   # Verify Next.js is running on port 3000
   ```

2. **Analysis Fails**
   ```bash
   # Check data directory
   ls -la 1c__Hatay_Enkaz_Bina_Etiketleme/
   
   # Check Python dependencies
   pip list | grep rasterio
   
   # View API logs
   python api_server.py --log-level debug
   ```

3. **Images Not Loading**
   ```javascript
   // Check image URLs
   console.log(apiService.getImageUrl('hatay_comparison.png'));
   
   // Verify in browser network tab
   // Check file permissions
   ```

### Development Tips

1. **Use API Documentation**: http://127.0.0.1:8000/docs
2. **Monitor Browser Console**: Check for JavaScript errors
3. **Check Network Tab**: Verify API requests
4. **Use React DevTools**: Inspect component state
5. **Check API Logs**: Monitor backend processing

## 🔒 Security Considerations

### Development
- CORS configured for localhost only
- No authentication required
- File serving from specific directories

### Production
```python
# Update CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Add API authentication
# Implement rate limiting
# Use HTTPS
```

## 📚 Next Steps

### Extending the System

1. **Add Authentication**: JWT tokens, user management
2. **Database Integration**: PostgreSQL, user data storage
3. **Real-time Features**: WebSocket notifications
4. **File Upload**: Allow users to upload imagery
5. **Export Features**: PDF reports, data downloads
6. **Batch Processing**: Multiple area analysis
7. **Historical Tracking**: Analysis version history

### Integration with Other Systems

1. **GIS Integration**: ArcGIS, QGIS plugins
2. **Emergency Response**: Alert systems
3. **Insurance Systems**: Damage assessment APIs
4. **Government Portals**: Public data sharing
5. **Mobile Apps**: React Native version

---

This integration provides a complete, production-ready earthquake damage assessment system with web-based interface and comprehensive API access. The system is designed for scalability, reliability, and ease of use.
