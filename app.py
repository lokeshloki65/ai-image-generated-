import os
import base64
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# --- NEW: Define absolute paths for reliability ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # <-- ADDED
IMAGE_DIR = os.path.join(BASE_DIR, 'generated_images') # <-- ADDED

# 2. --- IMPORTANT: PUT YOUR STABILITY AI KEY HERE ---
# Get your key from https://platform.stability.ai/
STABILITY_API_KEY = 'sk-ASxHeYH9gDVRHQRXWerwcRPJNIZlslO4oejsXuxkK3LHDore'

# 3. Create a folder to save the generated images if it doesn't already exist
if not os.path.exists(IMAGE_DIR): # <-- CHANGED to use absolute path
    os.makedirs(IMAGE_DIR)        # <-- CHANGED to use absolute path

# 4. This is the main API endpoint that your website calls to generate an image
@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    # Get the text prompt sent from the website
    data = request.get_json()
    text_prompt = data.get('text')

    # Check if the prompt is empty
    if not text_prompt:
        return jsonify({'success': False, 'error': 'Text prompt is required'}), 400

    print(f"🎨 Generating image with prompt: {text_prompt}")

    try:
        # --- Calling the Stability AI API ---
        # Using the new, correct SDXL model URL
        api_url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {STABILITY_API_KEY}"
        }

        # Using the correct data structure and dimensions for the SDXL model
        body = {
            "steps": 40,
            "width": 1024,
            "height": 1024,
            "seed": 0,
            "cfg_scale": 5,
            "samples": 1,
            "text_prompts": [
                {"text": text_prompt, "weight": 1}
            ],
        }

        response = requests.post(api_url, headers=headers, json=body)

        # Check if the API call was successful
        if not response.ok:
            error_text = response.text
            print(f"❌ Stability AI Error: {error_text}")
            return jsonify({'success': False, 'error': f'API Error: {error_text}'}), response.status_code

        # --- Saving the received image ---
        result_data = response.json()
        image_base64 = result_data["artifacts"][0]["base64"]
        
        filename = f"{uuid.uuid4()}.png"
        image_path = os.path.join(IMAGE_DIR, filename) # <-- CHANGED to use absolute path

        with open(image_path, "wb") as f:
            f.write(base64.b64decode(image_base64))
        
        image_url = f"/generated_images/{filename}"

        print("✅ Image generated and saved successfully")
        return jsonify({'success': True, 'imageUrl': image_url})

    except Exception as e:
        print(f"❌ Server Error: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

# 5. This new route is required to serve the images we save in the 'generated_images' folder
@app.route('/generated_images/<path:filename>')
def serve_generated_image(filename):
    return send_from_directory(IMAGE_DIR, filename) # <-- CHANGED to use absolute path

# 6. These routes serve your HTML, CSS, and JS files
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Server is running'})

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# 7. Start the Flask server
if __name__ == '__main__':
    print('🚀 Starting Python Flask server for Stability AI...')

    app.run(port=5500, debug=True)

