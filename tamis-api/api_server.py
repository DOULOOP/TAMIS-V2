#!/usr/bin/env python3
"""
FastAPI Server for Hatay Earthquake Damage Assessment
Provides REST API endpoints for analysis data and processing
"""

from tracemalloc import start
from urllib import response
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, Path as ApiPath
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any, Tuple
import uvicorn
import os
import json
import asyncio
from datetime import datetime
import subprocess
import sys
from pathlib import Path
import requests
import queue
import threading
import time
import uuid
from typing import Dict, List

# Import our analysis modules
try:
    from analyzers.analyzer_manager import AnalyzerManager
    from analyzers.check_data_info import check_data_info
    from analyzers.disaster_labeling import DisasterLabeler
except ImportError as e:
    print(f"Warning: Could not import analysis modules: {e}")

app = FastAPI(
    title="Hatay Earthquake Damage Assessment API",
    description="REST API for analyzing earthquake damage using satellite imagery",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (for serving generated images and maps)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mount output files (generated analysis outputs)
os.makedirs("output", exist_ok=True)
app.mount("/output", StaticFiles(directory="output"), name="output")

# Analysis queue system
analysis_queue = queue.Queue()
analysis_history: Dict[str, Dict] = {}  # Store completed analysis info

# Initialize analyzer manager
try:
    analyzer_manager = AnalyzerManager()
    # Add progress callback for real-time updates
    analyzer_manager.add_progress_callback(lambda aid, progress, msg: update_progress(aid, progress, msg))
    print("Analyzer Manager initialized successfully")
except Exception as e:
    print(f"Failed to initialize Analyzer Manager: {e}")
    analyzer_manager = None

# Global variables for tracking analysis status
analysis_status = {
    "running": False,
    "current_task": None,
    "progress": 0,
    "last_updated": None,
    "queue_length": 0,
    "current_analysis_id": None,
    "estimated_completion": None
}

# Background worker thread
analysis_worker_running = False

def update_progress(task_name: str, progress: int, details: str = ""):
    """Update global analysis progress"""
    global analysis_status
    analysis_status["current_task"] = task_name
    analysis_status["progress"] = min(100, max(0, progress))
    analysis_status["last_updated"] = datetime.now().isoformat()
    if details:
        analysis_status["details"] = details
    print(f"Progress Update: {task_name} - {progress}% - {details}")

def analysis_worker():
    """Background worker to process analysis queue using AnalyzerManager"""
    global analysis_worker_running, analysis_status, analysis_queue, analysis_history, analyzer_manager
    
    while analysis_worker_running:
        try:
            if not analysis_queue.empty():
                # Get next analysis from queue
                analysis_request = analysis_queue.get()
                analysis_id = analysis_request["id"]
                analysis_type = analysis_request["type"]
                analyzer_id = analysis_request["analyzer_id"]
                task_name = analysis_request["task_name"]
                timestamp = analysis_request["timestamp"]
                
                # Update status
                analysis_status["running"] = True
                analysis_status["current_analysis_id"] = analysis_id
                analysis_status["queue_length"] = analysis_queue.qsize()
                
                update_progress(f"Starting {task_name}", 5)
                
                try:
                    # Use analyzer manager if available, fall back to script execution
                    if analyzer_manager:
                        result = analyzer_manager.run_analyzer(analyzer_id, analysis_id)
                        success = result['status'] == 'completed'
                    else:
                        # Fallback to old script method
                        success = run_analysis_with_progress_fallback(analyzer_id, task_name, analysis_id)
                    
                    # Store in history
                    analysis_history[analysis_id] = {
                        "type": analysis_type,
                        "task_name": task_name,
                        "started_at": timestamp,
                        "completed_at": datetime.now().isoformat(),
                        "success": success,
                        "duration_seconds": (datetime.now() - datetime.fromisoformat(timestamp)).total_seconds()
                    }
                    
                    if success:
                        update_progress(f"Completed {task_name}", 100, "Analysis finished successfully")
                    else:
                        update_progress(f"Failed {task_name}", 0, "Analysis failed")
                        
                except Exception as e:
                    print(f"Error in analysis worker: {e}")
                    analysis_history[analysis_id] = {
                        "type": analysis_type,
                        "task_name": task_name,
                        "started_at": timestamp,
                        "completed_at": datetime.now().isoformat(),
                        "success": False,
                        "error": str(e),
                        "duration_seconds": (datetime.now() - datetime.fromisoformat(timestamp)).total_seconds()
                    }
                    update_progress(f"Error in {task_name}", 0, f"Error: {str(e)}")
                
                finally:
                    # Reset status
                    analysis_status["running"] = False
                    analysis_status["current_analysis_id"] = None
                    analysis_status["queue_length"] = analysis_queue.qsize()
                    
                    # Wait a bit before checking queue again
                    time.sleep(2)
            else:
                # No work in queue, sleep briefly
                time.sleep(1)
                
        except Exception as e:
            print(f"Worker thread error: {e}")
            time.sleep(1)

def run_analysis_with_progress_fallback(analyzer_id: str, task_name: str, analysis_id: str) -> bool:
    """Fallback method using subprocess when AnalyzerManager is not available"""
    try:
        update_progress(task_name, 10, f"Initializing {analyzer_id}")
        
        # Map analyzer IDs to script paths (fallback)
        script_mapping = {
            "data_info": "analyzers/check_data_info.py",
            "visualization": "analyzers/visualize_hatay_data.py", 
            "web_map": "analyzers/create_web_map.py",
            "damage_labeling": "analyzers/disaster_labeling.py",
            "full_analysis": "analyzers/run_analysis.py --auto"
        }
        
        script_name = script_mapping.get(analyzer_id, f"analyzers/{analyzer_id}.py")
        
        # Parse script name and arguments
        script_parts = script_name.split()
        script_file = script_parts[0]
        script_args = script_parts[1:] if len(script_parts) > 1 else []
        
        # Prepare the process with timeout
        cmd = [sys.executable, script_file] + script_args
        timeout = 600  # 10 minutes max
        
        update_progress(task_name, 20, f"Running {script_file}")
        
        # Run the process with timeout
        process = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        # Check results
        if process.returncode == 0:
            update_progress(task_name, 90, "Processing completed successfully")
            
            # Check for specific progress indicators in output
            if "visualize_hatay_data.py" in script_name:
                if "comparison saved" in process.stdout.lower():
                    update_progress(task_name, 95, "Visualization files generated")
                    
            elif "disaster_labeling" in script_name:
                if "damage assessment" in process.stdout.lower():
                    update_progress(task_name, 95, "Damage assessment completed")
                    
            elif "create_web_map" in script_name:
                if "interactive map" in process.stdout.lower():
                    update_progress(task_name, 95, "Interactive map created")
            
            return True
        else:
            error_msg = process.stderr[:200] if process.stderr else f"Process failed with code {process.returncode}"
            update_progress(task_name, 0, f"Failed: {error_msg}")
            print(f"Analysis failed: {error_msg}")
            return False
            
    except subprocess.TimeoutExpired:
        update_progress(task_name, 0, f"Timeout after {timeout} seconds")
        print(f"Analysis timed out after {timeout} seconds")
        return False
    except Exception as e:
        update_progress(task_name, 0, f"Error: {str(e)}")
        print(f"Analysis error: {e}")
        return False

# Start the worker thread
analysis_worker_running = True
worker_thread = threading.Thread(target=analysis_worker, daemon=True)
worker_thread.start()

# Data models
class AnalysisRequest(BaseModel):
    analysis_type: str  # "data_info", "coordinates", "visualization", "web_map", "damage_labeling", "all"
    options: Optional[Dict[str, Any]] = {}

class AnalysisStatus(BaseModel):
    running: bool
    current_task: Optional[str]
    progress: int
    last_updated: Optional[str]
    queue_length: int
    current_analysis_id: Optional[str]
    estimated_completion: Optional[str]
    details: Optional[str] = ""

class DamageStats(BaseModel):
    region_count: int
    total_area_m2: float
    total_area_km2: float
    percentage_of_total_area: float
    percentage_of_damaged_area: float
    average_change_intensity: float

class DamageReport(BaseModel):
    analysis_metadata: Dict[str, Any]
    damage_assessment: Dict[str, DamageStats]
    field_statistics: Dict[str, Any]
    summary: Dict[str, Any]

# -----------------------------
# Closed road zones data models
# -----------------------------
class ClosedZoneBase(BaseModel):
    name: str = Field(..., description="Zone display name")
    # Polygon coordinates as list of [lat, lng]
    polygon: List[List[float]] = Field(..., description="Polygon vertices [lat, lng] in order, at least 3 points")
    notes: Optional[str] = None
    detour_points: Optional[List[List[float]]] = Field(default=None, description="Preferred detour waypoints [lat, lng] outside the closed area")

class ClosedZone(ClosedZoneBase):
    id: str

# Helper functions
def get_data_dir():
    """Get the data directory path"""
    return "1c__Hatay_Enkaz_Bina_Etiketleme"

def check_data_exists():
    """Check if required data files exist"""
    data_dir = get_data_dir()
    required_files = [
        "HATAY MERKEZ-2 2015.tif",
        "HATAY MERKEZ-2 2023.tif",
        "HATAY MERKEZ-2 SINIR.shp"
    ]
    
    for file in required_files:
        if not os.path.exists(os.path.join(data_dir, file)):
            return False, f"Missing required file: {file}"
    
    return True, "All required files found"

async def run_analysis_script(analyzer_id: str, task_name: str):
    """Legacy function - now redirects to queue system"""
    # This function is kept for compatibility but now uses the queue
    analysis_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    analysis_request = {
        "id": analysis_id,
        "type": analyzer_id,
        "analyzer_id": analyzer_id,
        "task_name": task_name,
        "timestamp": timestamp
    }
    
    analysis_queue.put(analysis_request)
    analysis_status["queue_length"] = analysis_queue.qsize()
    
    return {"success": True, "analysis_id": analysis_id, "queued": True}

# API Endpoints

@app.get("/api/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Hatay Earthquake Damage Assessment API",
        "version": "2.0.0",
        "features": [
            "Class-based Analyzer Infrastructure",
            "FIFO Analysis Queue System", 
            "Real-time Progress Tracking",
            "Background Processing",
            "Queue Management"
        ],
        "endpoints": {
            "GET /": "API information",
            "GET /health": "Health check",
            "GET /data/info": "Dataset information",
            "GET /data/status": "Data files status",
            "GET /analysis/status": "Current analysis status",
            "GET /analysis/queue": "Analysis queue status",
            "GET /analysis/history": "Analysis history",
            "POST /analysis/run": "Add analysis to queue",
            "DELETE /analysis/queue/{id}": "Cancel queued analysis",
            "GET /results/damage-report": "Get damage assessment report",
            "GET /results/field-analysis": "Get field analysis data",
            "GET /static/images/{filename}": "Get generated images",
            "GET /static/maps/{filename}": "Get generated maps"
        }
    }

# ---------------------------------
# Closed road zones helper functions
# ---------------------------------
ZONES_FILE = os.path.join("output", "closed_zones.json")

def load_closed_zones() -> List[ClosedZone]:
    try:
        if os.path.exists(ZONES_FILE):
            with open(ZONES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # ensure structure
                zones: List[ClosedZone] = [ClosedZone(**z) for z in data]
                return [z.dict() for z in zones]  # return as dicts
    except Exception as e:
        print(f"Failed to load zones: {e}")
    return []

def save_closed_zones(zones: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(ZONES_FILE), exist_ok=True)
    with open(ZONES_FILE, 'w', encoding='utf-8') as f:
        json.dump(zones, f, ensure_ascii=False, indent=2)

def point_in_polygon(lat: float, lng: float, polygon: List[List[float]]) -> bool:
    """Ray casting algorithm for point-in-polygon. Polygon: list of [lat, lng]."""
    inside = False
    n = len(polygon)
    if n < 3:
        return False
    for i in range(n):
        j = (i - 1) % n
        yi, xi = polygon[i][0], polygon[i][1]
        yj, xj = polygon[j][0], polygon[j][1]
        # check if point is between yi and yj in lat dimension
        intersect = ((yi > lat) != (yj > lat)) and (
            lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi
        )
        if intersect:
            inside = not inside
    return inside

def polygon_bbox(polygon: List[List[float]]) -> Tuple[float, float, float, float]:
    lats = [p[0] for p in polygon]
    lngs = [p[1] for p in polygon]
    return min(lats), min(lngs), max(lats), max(lngs)

def compute_detour_candidates(polygon: List[List[float]], margin: float = 0.001) -> List[List[float]]:
    """Return 4 candidate detour points slightly outside polygon bbox: [lat, lng]."""
    minLat, minLng, maxLat, maxLng = polygon_bbox(polygon)
    return [
        [minLat - margin, minLng - margin],
        [minLat - margin, maxLng + margin],
        [maxLat + margin, minLng - margin],
        [maxLat + margin, maxLng + margin],
    ]

def compute_bbox_corners(polygon: List[List[float]], margin: float = 0.001) -> List[List[float]]:
    """Return TL, TR, BR, BL corners of expanded bbox as [lat,lng]."""
    minLat, minLng, maxLat, maxLng = polygon_bbox(polygon)
    top = maxLat + margin
    bottom = minLat - margin
    left = minLng - margin
    right = maxLng + margin
    return [
        [top, left],   # TL
        [top, right],  # TR
        [bottom, right],  # BR
        [bottom, left],   # BL
    ]

def _orient(ax: float, ay: float, bx: float, by: float, cx: float, cy: float) -> float:
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)

def _on_segment(ax: float, ay: float, bx: float, by: float, cx: float, cy: float) -> bool:
    return min(ax, cx) - 1e-12 <= bx <= max(ax, cx) + 1e-12 and min(ay, cy) - 1e-12 <= by <= max(ay, cy) + 1e-12

def segments_intersect(p1: List[float], p2: List[float], q1: List[float], q2: List[float]) -> bool:
    """Segment intersection test using orientation, coordinates given as [lat,lng]."""
    # Convert to x=lng, y=lat
    ax, ay = p1[1], p1[0]
    bx, by = p2[1], p2[0]
    cx, cy = q1[1], q1[0]
    dx, dy = q2[1], q2[0]
    o1 = _orient(ax, ay, bx, by, cx, cy)
    o2 = _orient(ax, ay, bx, by, dx, dy)
    o3 = _orient(cx, cy, dx, dy, ax, ay)
    o4 = _orient(cx, cy, dx, dy, bx, by)
    if (o1 == 0 and _on_segment(ax, ay, cx, cy, bx, by)) or (o2 == 0 and _on_segment(ax, ay, dx, dy, bx, by)) or (o3 == 0 and _on_segment(cx, cy, ax, ay, dx, dy)) or (o4 == 0 and _on_segment(cx, cy, bx, by, dx, dy)):
        return True
    return (o1 > 0) != (o2 > 0) and (o3 > 0) != (o4 > 0)

def polyline_intersects_polygon(polyline: List[List[float]], polygon: List[List[float]]) -> bool:
    if len(polygon) < 3 or len(polyline) < 2:
        return False
    # Point-in-polygon quick check
    for pt in polyline:
        if point_in_polygon(pt[0], pt[1], polygon):
            return True
    # Segment vs polygon edges
    ring = polygon + [polygon[0]]
    for i in range(len(polyline) - 1):
        a = polyline[i]
        b = polyline[i+1]
        for j in range(len(ring) - 1):
            c = ring[j]
            d = ring[j+1]
            if segments_intersect(a, b, c, d):
                return True
    return False

def distance2(a: List[float], b: List[float]) -> float:
    return (a[0]-b[0])**2 + (a[1]-b[1])**2

def choose_zone_detours(polygon: List[List[float]], start: List[float], end: List[float], preferred: Optional[List[List[float]]] = None) -> List[List[float]]:
    candidates = (preferred or []) + compute_detour_candidates(polygon)
    if not candidates:
        candidates = compute_detour_candidates(polygon)
    # pick one near start and one near end
    near_start = min(candidates, key=lambda c: distance2(c, start))
    near_end = min(candidates, key=lambda c: distance2(c, end))
    # Deduplicate if same
    if near_start == near_end and len(candidates) > 1:
        # pick second best for end
        candidates_sorted = sorted(candidates, key=lambda c: distance2(c, end))
        near_end = candidates_sorted[1]
    return [near_start, near_end]

@app.get("/api/analyzers")
async def get_available_analyzers():
    """Get information about all available analyzers"""
    if analyzer_manager:
        analyzers = analyzer_manager.list_analyzers()
        prerequisites = analyzer_manager.check_prerequisites()
        
        return {
            "success": True,
            "analyzers": analyzers,
            "prerequisites": prerequisites,
            "system_ready": all(prerequisites.values())
        }
    else:
        return {
            "success": False,
            "error": "Analyzer manager not available",
            "analyzers": {},
            "prerequisites": {},
            "system_ready": False
        }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    data_exists, message = check_data_exists()
    return {
        "status": "healthy" if data_exists else "warning",
        "timestamp": datetime.now().isoformat(),
        "data_status": message
    }

@app.get("/api/data/info")
async def get_data_info():
    """Get comprehensive dataset information"""
    try:
        data_exists, message = check_data_exists()
        if not data_exists:
            raise HTTPException(status_code=404, detail=message)
        
        # Get basic file information
        data_dir = get_data_dir()
        file_info = {}
        
        for year in ['2015', '2023']:
            img_path = os.path.join(data_dir, f"HATAY MERKEZ-2 {year}.tif")
            if os.path.exists(img_path):
                try:
                    import rasterio
                    with rasterio.open(img_path) as src:
                        file_info[f"image_{year}"] = {
                            "file": f"HATAY MERKEZ-2 {year}.tif",
                            "size_gb": round(os.path.getsize(img_path) / (1024**3), 2),
                            "dimensions": [src.width, src.height],
                            "bands": src.count,
                            "data_type": str(src.dtypes[0]),
                            "crs": str(src.crs),
                            "resolution_meters": [abs(src.transform[0]), abs(src.transform[4])],
                            "bounds": {
                                "left": src.bounds.left,
                                "bottom": src.bounds.bottom,
                                "right": src.bounds.right,
                                "top": src.bounds.top
                            }
                        }
                except Exception as e:
                    file_info[f"image_{year}"] = {"error": str(e)}
        
        # Shapefile info
        shapefile_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
        if os.path.exists(shapefile_path):
            try:
                import geopandas as gpd
                gdf = gpd.read_file(shapefile_path)
                file_info["boundaries"] = {
                    "file": "HATAY MERKEZ-2 SINIR.shp",
                    "features": len(gdf),
                    "geometry_type": gdf.geom_type.iloc[0] if len(gdf) > 0 else None,
                    "crs": str(gdf.crs),
                    "columns": list(gdf.columns),
                    "bounds": gdf.total_bounds.tolist() if len(gdf) > 0 else None
                }
                
                if len(gdf) > 0 and gdf.crs and str(gdf.crs) != 'EPSG:4326':
                    area_sq_km = gdf.geometry.area.sum() / 1_000_000
                    file_info["boundaries"]["total_area_km2"] = round(area_sq_km, 2)
                    
            except Exception as e:
                file_info["boundaries"] = {"error": str(e)}
        
        return {
            "timestamp": datetime.now().isoformat(),
            "data_directory": data_dir,
            "files": file_info,
            "analysis_capabilities": [
                "Static visualization comparison",
                "Interactive web mapping",
                "AI-powered damage classification",
                "Field-level damage assessment",
                "Statistical analysis and reporting"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting data info: {str(e)}")

@app.get("/api/data/coordinates")
async def get_coordinates():
    """Extract and return coordinate information from the dataset"""
    try:
        if not analyzer_manager:
            raise HTTPException(status_code=500, detail="Analyzer Manager not available")
        
        # Check if coordinates have already been extracted
        coords_file = os.path.join("output", "hatay_coordinates.json")
        if os.path.exists(coords_file):
            with open(coords_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # Run coordinate extraction
        result = analyzer_manager.run_analyzer('coordinates')
        
        if result['status'] == 'completed' and 'analysis_result' in result:
            return result['analysis_result']
        else:
            raise HTTPException(status_code=500, detail=f"Coordinate extraction failed: {result.get('message', 'Unknown error')}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting coordinates: {str(e)}")

@app.get("/api/data/status")
async def get_data_status():
    """Get current status of data files"""
    data_dir = get_data_dir()
    
    files_status = {}
    required_files = [
        "HATAY MERKEZ-2 2015.tif",
        "HATAY MERKEZ-2 2023.tif", 
        "HATAY MERKEZ-2 SINIR.shp",
        "HATAY MERKEZ-2 SINIR.dbf",
        "HATAY MERKEZ-2 SINIR.shx",
        "HATAY MERKEZ-2 SINIR.prj"
    ]
    
    for file in required_files:
        file_path = os.path.join(data_dir, file)
        if os.path.exists(file_path):
            files_status[file] = {
                "exists": True,
                "size_bytes": os.path.getsize(file_path),
                "modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
            }
        else:
            files_status[file] = {"exists": False}
    
    # Check generated output files
    output_files = [
        "hatay_comparison.png",
        "hatay_interactive_map.html",
        "hatay_damage_assessment.png",
        "hatay_damage_report.json",
        "hatay_field_analysis.json"
    ]
    
    outputs_status = {}
    for file in output_files:
        file_path = os.path.join("output", file)
        if os.path.exists(file_path):
            outputs_status[file] = {
                "exists": True,
                "size_bytes": os.path.getsize(file_path),
                "modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
            }
        else:
            outputs_status[file] = {"exists": False}
    
    return {
        "timestamp": datetime.now().isoformat(),
        "required_files": files_status,
        "output_files": outputs_status,
        "ready_for_analysis": all(f["exists"] for f in files_status.values() if f)
    }

# --------------------------
# Closed road zones endpoints
# --------------------------

@app.get("/api/closed-zones")
async def list_closed_zones():
    return {"zones": load_closed_zones()}

@app.post("/api/closed-zones")
async def create_closed_zone(zone: ClosedZoneBase):
    zones = load_closed_zones()
    new_zone = {
        "id": str(uuid.uuid4()),
        **zone.dict(),
    }
    zones.append(new_zone)
    save_closed_zones(zones)
    return {"created": new_zone}

@app.delete("/api/closed-zones/{zone_id}")
async def delete_closed_zone(zone_id: str = ApiPath(..., description="Zone ID")):
    zones = load_closed_zones()
    new_zones = [z for z in zones if z.get("id") != zone_id]
    if len(new_zones) == len(zones):
        raise HTTPException(status_code=404, detail="Zone not found")
    save_closed_zones(new_zones)
    return {"deleted": zone_id}

@app.get("/api/analysis/status", response_model=AnalysisStatus)
async def get_analysis_status():
    """Get current analysis status"""
    return AnalysisStatus(**analysis_status)

@app.get("/api/analysis/queue")
async def get_analysis_queue():
    """Get current analysis queue status"""
    queue_list = []
    temp_queue = queue.Queue()
    
    # Extract items to examine them (then put them back)
    while not analysis_queue.empty():
        try:
            item = analysis_queue.get_nowait()
            queue_list.append({
                "id": item["id"],
                "type": item["type"],
                "task_name": item["task_name"],
                "queued_at": item["timestamp"]
            })
            temp_queue.put(item)
        except:
            break
    
    # Put items back in the queue
    while not temp_queue.empty():
        analysis_queue.put(temp_queue.get_nowait())
    
    return {
        "queue_length": len(queue_list),
        "currently_running": analysis_status["running"],
        "current_analysis": {
            "id": analysis_status.get("current_analysis_id"),
            "task": analysis_status.get("current_task"),
            "progress": analysis_status.get("progress", 0)
        } if analysis_status["running"] else None,
        "queued_analyses": queue_list
    }

@app.get("/api/analysis/history")
async def get_analysis_history(limit: int = Query(10, description="Number of recent analyses to return")):
    """Get history of completed analyses"""
    recent_history = list(analysis_history.items())[-limit:] if analysis_history else []
    
    return {
        "total_analyses": len(analysis_history),
        "recent_analyses": [
            {
                "id": analysis_id,
                **analysis_data
            } for analysis_id, analysis_data in recent_history
        ]
    }

@app.delete("/api/analysis/queue/{analysis_id}")
async def cancel_queued_analysis(analysis_id: str):
    """Cancel a queued analysis (cannot cancel running analysis)"""
    if analysis_status.get("current_analysis_id") == analysis_id:
        raise HTTPException(status_code=400, detail="Cannot cancel currently running analysis")
    
    # Find and remove from queue
    temp_queue = queue.Queue()
    found = False
    
    while not analysis_queue.empty():
        try:
            item = analysis_queue.get_nowait()
            if item["id"] == analysis_id:
                found = True
            else:
                temp_queue.put(item)
        except:
            break
    
    # Put remaining items back
    while not temp_queue.empty():
        analysis_queue.put(temp_queue.get_nowait())
    
    analysis_status["queue_length"] = analysis_queue.qsize()
    
    if not found:
        raise HTTPException(status_code=404, detail="Analysis not found in queue")
    
    return {
        "message": f"Analysis {analysis_id} cancelled",
        "remaining_queue_length": analysis_queue.qsize()
    }

@app.post("/api/analysis/run")
async def run_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Add analysis to queue for processing"""
    global analysis_status, analysis_queue
    
    data_exists, message = check_data_exists()
    if not data_exists:
        raise HTTPException(status_code=404, detail=message)
    
    analysis_type = request.analysis_type.lower()
    
    script_mapping = {
        "data_info": "data_info",
        "visualization": "visualization", 
        "web_map": "web_map",
        "damage_labeling": "damage_labeling",
        "all": "full_analysis"
    }
    
    if analysis_type not in script_mapping:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis type. Choose from: {list(script_mapping.keys())}"
        )
    
    analyzer_id = script_mapping[analysis_type]
    
    # Get analyzer info for task name
    if analyzer_manager:
        analyzer_info = analyzer_manager.get_analyzer_info(analyzer_id)
        task_name = analyzer_info['name'] if analyzer_info else f"Running {analysis_type} analysis"
    else:
        task_name = f"Running {analysis_type} analysis"
    analysis_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Add to queue
    analysis_request = {
        "id": analysis_id,
        "type": analysis_type,
        "analyzer_id": analyzer_id,
        "task_name": task_name,
        "timestamp": timestamp,
        "options": request.options if hasattr(request, 'options') else {}
    }
    
    analysis_queue.put(analysis_request)
    analysis_status["queue_length"] = analysis_queue.qsize()
    
    # Calculate estimated start time based on queue
    queue_position = analysis_queue.qsize()
    if analysis_status["running"]:
        queue_position += 1
    
    return {
        "message": f"Analysis queued: {task_name}",
        "analysis_id": analysis_id,
        "analysis_type": analysis_type,
        "queue_position": queue_position,
        "queue_length": analysis_queue.qsize(),
        "currently_running": analysis_status["running"],
        "timestamp": timestamp
    }

@app.get("/api/results/damage-report")
async def get_damage_report():
    """Get the generated damage assessment report"""
    report_path = os.path.join("output", "hatay_damage_report.json")
    
    if not os.path.exists(report_path):
        raise HTTPException(
            status_code=404,
            detail="Damage report not found. Run damage labeling analysis first."
        )
    
    try:
        with open(report_path, 'r') as f:
            report_data = json.load(f)
        return report_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading damage report: {str(e)}")

@app.get("/api/results/field-analysis")
async def get_field_analysis():
    """Get the field analysis data with coordinates"""
    analysis_path = os.path.join("output", "hatay_field_analysis.json")
    
    if not os.path.exists(analysis_path):
        raise HTTPException(
            status_code=404,
            detail="Field analysis not found. Run disaster labeling analysis first."
        )
    
    try:
        with open(analysis_path, 'r', encoding='utf-8') as f:
            analysis_data = json.load(f)
        return analysis_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading field analysis: {str(e)}")

@app.get("/api/results/summary")
async def get_analysis_summary():
    """Get a summary of all available analysis results"""
    summary = {
        "timestamp": datetime.now().isoformat(),
        "available_results": {},
        "statistics": {}
    }
    
    # Check damage report
    if os.path.exists(os.path.join("output", "hatay_damage_report.json")):
        try:
            with open(os.path.join("output", "hatay_damage_report.json"), 'r') as f:
                damage_data = json.load(f)
            summary["available_results"]["damage_report"] = True
            summary["statistics"]["total_area_km2"] = damage_data.get("analysis_metadata", {}).get("total_area_km2", 0)
            summary["statistics"]["damage_categories"] = list(damage_data.get("damage_assessment", {}).keys())
        except:
            summary["available_results"]["damage_report"] = False
    
    # Check field analysis
    if os.path.exists(os.path.join("output", "hatay_field_analysis.json")):
        try:
            with open(os.path.join("output", "hatay_field_analysis.json"), 'r') as f:
                field_data = json.load(f)
            summary["available_results"]["field_analysis"] = True
            if "fields" in field_data:
                summary["statistics"]["total_fields"] = len(field_data["fields"])
        except:
            summary["available_results"]["field_analysis"] = False
    
    # Check visual outputs
    visual_files = {
        "static_comparison": os.path.join("output", "hatay_comparison.png"),
        "damage_assessment": os.path.join("output", "hatay_damage_assessment.png"),
        "interactive_map": os.path.join("output", "hatay_interactive_map.html")
    }
    
    for key, filename in visual_files.items():
        summary["available_results"][key] = os.path.exists(filename)
    
    return summary

@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """Serve generated images"""
    file_path = os.path.join("output", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)

@app.get("/api/maps/{filename}")
async def get_map(filename: str):
    """Serve generated HTML maps"""
    file_path = os.path.join("output", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Map not found")
    
    return FileResponse(file_path)

# Advanced endpoints for specific data queries

@app.get("/api/damage/by-severity")
async def get_damage_by_severity():
    """Get damage statistics grouped by severity level"""
    if not os.path.exists(os.path.join("output", "hatay_damage_report.json")):
        raise HTTPException(status_code=404, detail="Damage report not found")
    
    try:
        with open(os.path.join("output", "hatay_damage_report.json"), 'r') as f:
            data = json.load(f)
        
        damage_assessment = data.get("damage_assessment", {})
        result = {}
        
        for severity, stats in damage_assessment.items():
            result[severity] = {
                "area_km2": stats.get("total_area_km2", 0),
                "percentage": stats.get("percentage_of_total_area", 0),
                "region_count": stats.get("region_count", 0),
                "change_intensity": stats.get("average_change_intensity", 0)
            }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing damage data: {str(e)}")

@app.get("/api/fields/search")
async def search_fields(
    min_area: Optional[float] = Query(None, description="Minimum field area in m2"),
    max_area: Optional[float] = Query(None, description="Maximum field area in m2"),
    damage_level: Optional[str] = Query(None, description="Damage level filter"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """Search and filter field analysis data"""
    if not os.path.exists(os.path.join("output", "hatay_field_analysis.json")):
        raise HTTPException(status_code=404, detail="Field analysis not found")
    
    try:
        with open(os.path.join("output", "hatay_field_analysis.json"), 'r') as f:
            data = json.load(f)
        
        fields = data.get("fields", [])
        filtered_fields = []
        
        for field in fields:
            # Apply filters
            if min_area and field.get("area_m2", 0) < min_area:
                continue
            if max_area and field.get("area_m2", 0) > max_area:
                continue
            if damage_level and field.get("damage_level", "").lower() != damage_level.lower():
                continue
            
            filtered_fields.append(field)
            
            if len(filtered_fields) >= limit:
                break
        
        return {
            "total_matching": len(filtered_fields),
            "fields": filtered_fields,
            "filters_applied": {
                "min_area": min_area,
                "max_area": max_area,
                "damage_level": damage_level,
                "limit": limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching fields: {str(e)}")
    
@app.get("/api/findOptimalRoute")
async def find_optimal_route(
    start_lat: str,
    start_lng: str,
    end_lat: str,
    end_lng: str,
    avoid_closed_zones: Optional[bool] = Query(False, description="If true, compute alternatives to avoid closed zones"),
    via: Optional[str] = Query(None, description="Pipe-separated additional waypoints 'lat,lng|lat,lng'")
):
    """Find the optimal route between two points.

    - If `via` is provided, it will be inserted between start and end when calling the routing service.
    - If `avoid_closed_zones` is true, we will check the base route against stored closed zones and compute
      alternative routes by inserting detour points outside intersected zones.
    """

    url = "https://route-and-directions.p.rapidapi.com/v1/routing"

    def call_service(waypoints_str: str) -> Dict[str, Any]:
        headers = {
            "x-rapidapi-key": "d6112b1e0dmsh15eef3375a831d2p1dc497jsneee5eb283733",
            "x-rapidapi-host": "route-and-directions.p.rapidapi.com"
        }
        qs = {"waypoints": waypoints_str, "mode": "drive"}
        resp = requests.get(url, headers=headers, params=qs)
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Error fetching route data ({resp.status_code})")
        return resp.json()

    base_waypoints = f"{start_lat},{start_lng}"
    if via:
        base_waypoints += f"|{via}"
    base_waypoints += f"|{end_lat},{end_lng}"

    base_data = call_service(base_waypoints)

    # Helper to extract a flat list of [lat, lng] from service response
    def extract_coords(route_json: Dict[str, Any]) -> List[List[float]]:
        coords: List[List[float]] = []
        routes0 = route_json.get("routes", [{}])[0] if isinstance(route_json.get("routes", None), list) else None
        if routes0 and isinstance(routes0, dict):
            geom = routes0.get("geometry")
            if geom and isinstance(geom, dict) and geom.get("coordinates"):
                c = geom["coordinates"]
                if isinstance(c, list) and len(c) and isinstance(c[0], list) and len(c[0]) == 2:
                    # service may return [lng, lat]; but our frontend expects [lng,lat]. For intersection we need [lat,lng]
                    # Many services use [lng,lat]; we'll try both shapes. Assume [lng,lat] and convert to [lat,lng]
                    coords = [[p[1], p[0]] for p in c]
        # GeoJSON FeatureCollection fallback
        if not coords and isinstance(route_json.get("features", None), list) and len(route_json["features"]) > 0:
            feat0 = route_json["features"][0]
            geom = feat0.get("geometry", {})
            if geom.get("type") == "LineString":
                coords = [[p[1], p[0]] for p in geom.get("coordinates", [])]
            elif geom.get("type") == "MultiLineString":
                flat = [pt for seg in geom.get("coordinates", []) for pt in seg]
                coords = [[p[1], p[0]] for p in flat]
        return coords

    base_coords = extract_coords(base_data)
    zones = load_closed_zones()
    hit_zones: List[Dict[str, Any]] = []
    if zones and base_coords:
        for z in zones:
            poly = z.get("polygon", [])
            if len(poly) >= 3:
                if polyline_intersects_polygon(base_coords, poly):
                    hit_zones.append(z)

    alternatives: List[Dict[str, Any]] = []
    if avoid_closed_zones and hit_zones:
        start_pt = [float(start_lat), float(start_lng)]
        end_pt = [float(end_lat), float(end_lng)]
        # For each hit zone build multiple candidate waypoint sequences and select those that avoid all zones
        candidates: List[List[List[float]]] = []
        for z in hit_zones:
            poly = z.get("polygon", [])
            corners = compute_bbox_corners(poly, margin=0.002)
            # single-point detours
            for c in corners:
                candidates.append([c])
            # adjacent corner pairs (cw path)
            tl, tr, br, bl = corners
            for pair in ([tl, tr], [tr, br], [br, bl], [bl, tl]):
                candidates.append(pair)
            # preferred near start/end
            det2 = choose_zone_detours(poly, start_pt, end_pt, z.get("detour_points"))
            if det2:
                candidates.append(det2)
        # Try candidates up to a reasonable limit
        kept = 0
        for wp in candidates:
            if kept >= 4:
                break
            wps = [f"{start_lat},{start_lng}"] + [f"{p[0]},{p[1]}" for p in wp] + [f"{end_lat},{end_lng}"]
            wp_str = "|".join(wps)
            try:
                alt_data = call_service(wp_str)
                alt_coords = extract_coords(alt_data)
                if not alt_coords:
                    continue
                # verify avoidance across all hit zones
                avoids_all = True
                for z in hit_zones:
                    if polyline_intersects_polygon(alt_coords, z.get("polygon", [])):
                        avoids_all = False
                        break
                if avoids_all:
                    alternatives.append({
                        "waypoints": wp_str,
                        "route": alt_data
                    })
                    kept += 1
            except HTTPException as e:
                print(f"Alternative candidate failed: {e.detail}")

    return {
        "start": {"lat": start_lat, "lon": start_lng},
        "end": {"lat": end_lat, "lon": end_lng},
        "route": base_data,
        "closed_zones_hit": [ {"id": z.get("id"), "name": z.get("name")} for z in hit_zones ],
        "alternatives": alternatives,
    }

if __name__ == "__main__":
    print("Starting Hatay Earthquake Damage Assessment API Server")
    print("=" * 60)
    print("[API] Documentation: http://127.0.0.1:8000/docs")
    print("[API] ReDoc: http://127.0.0.1:8000/redoc")
    print("[API] Health Check: http://127.0.0.1:8000/health")
    print("[API] Data Info: http://127.0.0.1:8000/data/info")
    print("=" * 60)
    
    uvicorn.run(
        "api_server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )