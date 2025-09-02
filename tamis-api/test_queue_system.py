#!/usr/bin/env python3
"""
Test script to demonstrate the analysis queue system
This script will submit multiple analysis requests to test the FIFO queue
"""

import requests
import time
import json

API_BASE_URL = "http://127.0.0.1:8000"

def test_queue_system():
    """Test the analysis queue system by submitting multiple analyses"""
    
    print("Testing Hatay Earthquake Analysis Queue System")
    print("=" * 60)
    
    # Check API health
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        health = response.json()
        print(f"API Health: {health['status']}")
    except Exception as e:
        print(f"API connection failed: {e}")
        return
    
    # Get initial queue status
    response = requests.get(f"{API_BASE_URL}/analysis/queue")
    initial_queue = response.json()
    print(f"Initial queue length: {initial_queue['queue_length']}")
    print(f"🔄 Currently running: {initial_queue['currently_running']}")
    
    # Submit multiple analysis requests
    analysis_types = [
        ("visualization", "Static Visualization"),
        ("web_map", "Interactive Web Map"),
        ("damage_labeling", "AI Damage Assessment")
    ]
    
    submitted_analyses = []
    
    for analysis_type, description in analysis_types:
        try:
            print(f"\nSubmitting: {description}")
            response = requests.post(f"{API_BASE_URL}/analysis/run", json={
                "analysis_type": analysis_type,
                "options": {}
            })
            
            if response.status_code == 200:
                result = response.json()
                submitted_analyses.append(result)
                print(f"Queued: {result['message']}")
                print(f"   📍 Analysis ID: {result['analysis_id']}")
                print(f"   Queue position: {result['queue_position']}")
                print(f"   📏 Total queue length: {result['queue_length']}")
            else:
                print(f"Failed: {response.text}")
        except Exception as e:
            print(f"Error submitting {analysis_type}: {e}")
        
        time.sleep(1)  # Small delay between submissions
    
    # Monitor queue status
    print(f"\nMonitoring queue status...")
    print("Press Ctrl+C to stop monitoring\n")
    
    try:
        while True:
            # Get current status
            status_response = requests.get(f"{API_BASE_URL}/analysis/status")
            queue_response = requests.get(f"{API_BASE_URL}/analysis/queue")
            
            if status_response.status_code == 200 and queue_response.status_code == 200:
                status = status_response.json()
                queue = queue_response.json()
                
                # Clear previous line and show current status
                print(f"\rRunning: {status['running']} | "
                      f"Current: {status['current_task'] or 'None'} | "
                      f"Progress: {status['progress']}% | "
                      f"Queue: {queue['queue_length']}", end="", flush=True)
                
                # Show detailed info every 10 iterations
                if status['running'] and status['progress'] % 10 == 0:
                    print(f"\nProgress Update: {status['current_task']} - {status['progress']}%")
                    if status.get('details'):
                        print(f"   Details: {status['details']}")
                
                # If no more analyses running or queued, break
                if not status['running'] and queue['queue_length'] == 0:
                    print(f"\nAll analyses completed!")
                    break
            
            time.sleep(2)  # Update every 2 seconds
            
    except KeyboardInterrupt:
        print(f"\n\n👋 Monitoring stopped by user")
    
    # Final status
    print(f"\nFinal Status:")
    try:
        history_response = requests.get(f"{API_BASE_URL}/analysis/history?limit=5")
        if history_response.status_code == 200:
            history = history_response.json()
            print(f"Total analyses completed: {history['total_analyses']}")
            
            if history['recent_analyses']:
                print(f"Recent analyses:")
                for analysis in history['recent_analyses'][-3:]:  # Show last 3
                    status_icon = "PASS" if analysis['success'] else "FAIL"
                    duration = f"{analysis['duration_seconds']:.1f}s"
                    print(f"   {status_icon} {analysis['task_name']} ({duration})")
    except Exception as e:
        print(f"Error getting history: {e}")
    
    print(f"\nQueue system test completed!")

if __name__ == "__main__":
    test_queue_system()
