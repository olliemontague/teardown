
import os
import cv2
import json
import base64
import argparse
from google import genai
from google.genai import types

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def get_storyboard_data(video_path, api_key):
    """
    Connects to Gemini API to analyze video and extract 
    verbatim script and visual descriptions.
    """
    client = genai.Client(api_key=api_key)
    
    with open(video_path, "rb") as f:
        video_data = base64.b64encode(f.read()).decode('utf-8')

    prompt = """
    Analyze this video and provide a detailed storyboard.
    For each segment, I need:
    1. 'startTime': The start timestamp in seconds.
    2. 'endTime': The end timestamp in seconds.
    3. 'script': The EXACT verbatim spoken words from the audio.
    4. 'description': A short summary of the visual action in this segment.
    
    Return ONLY a JSON array of objects.
    """

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[
            types.Part.from_data(data=video_data, mime_type="video/mp4"),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        )
    )
    
    return json.loads(response.text)

def capture_frames(video_path, storyboard_data, output_dir):
    """
    Extracts high-quality frames at the midpoint of each storyboard segment.
    """
    cap = cv2.VideoCapture(video_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for i, item in enumerate(storyboard_data):
        # Use midpoint for the best visual context
        startTime = item.get('startTime', 0)
        endTime = item.get('endTime', startTime + 1)
        midpoint = startTime + (endTime - startTime) / 2
        
        cap.set(cv2.CAP_PROP_POS_MSEC, midpoint * 1000)
        success, frame = cap.read()
        
        if success:
            img_name = f"frame_{i:03d}.jpg"
            img_path = os.path.join(output_dir, img_name)
            cv2.imwrite(img_path, frame)
            script_snippet = item.get('script', '')[:30]
            print(f"[{i+1}/{len(storyboard_data)}] Captured frame at {midpoint:.2f}s: {script_snippet}...")
    
    cap.release()

def main():
    parser = argparse.ArgumentParser(description="Teardown: Video to Storyboard CLI")
    parser.add_argument("video", help="Path to the video file")
    parser.add_argument("--output", default="teardown_export", help="Output directory")
    args = parser.parse_args()

    api_key = os.getenv("API_KEY")
    if not api_key:
        print("Error: Please set your API_KEY environment variable.")
        return

    if not os.path.exists(args.video):
        print(f"Error: Video file not found at {args.video}")
        return

    print(f"--- Teardown: Starting Analysis for {args.video} ---")
    
    try:
        print("Step 1: AI Transcription & Visual Analysis...")
        storyboard = get_storyboard_data(args.video, api_key)
        
        print(f"Step 2: Processing {len(storyboard)} segments...")
        capture_frames(args.video, storyboard, args.output)
        
        # Save structured metadata
        metadata_path = os.path.join(args.output, "storyboard.json")
        with open(metadata_path, "w") as f:
            json.dump(storyboard, f, indent=2)
            
        print(f"\nTeardown complete!")
        print(f"Frames and metadata saved to: {args.output}/")
        print(f"Review the full script in: {metadata_path}")
        
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    main()
