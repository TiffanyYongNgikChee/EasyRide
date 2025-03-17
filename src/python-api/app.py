# app.py
from flask import Flask, request, jsonify
import os
import face_recognition
import numpy as np
import json
import tempfile
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/encode-face', methods=['POST'])
def encode_face():
    """
    Endpoint to generate face encoding from uploaded image
    """
    # Check if image is in request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    
    # Save the file temporarily
    temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(temp_path)
    
    try:
        # Load the image
        image = face_recognition.load_image_file(temp_path)
        
        # Find all faces in the image
        face_locations = face_recognition.face_locations(image)
        
        if len(face_locations) == 0:
            # No face found
            return jsonify({"error": "No face detected in the image"}), 400
        
        if len(face_locations) > 1:
            # Multiple faces found - use the largest face (assumed to be closest)
            areas = [(right-left)*(bottom-top) for top, right, bottom, left in face_locations]
            largest_face_idx = areas.index(max(areas))
            face_location = [face_locations[largest_face_idx]]
        else:
            # One face found
            face_location = face_locations
        
        # Generate the face encoding
        face_encodings = face_recognition.face_encodings(image, face_location)
        
        if not face_encodings:
            return jsonify({"error": "Could not generate encoding for detected face"}), 400
        
        # Convert numpy array to list for JSON serialization
        encoding_list = face_encodings[0].tolist()
        
        return jsonify({"encoding": encoding_list}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Clean up - remove the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/compare-faces', methods=['POST'])
def compare_faces():
    try:
        print("Received request for face verification")

        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        if 'encodings' not in request.form or 'userIds' not in request.form:
            return jsonify({"error": "Missing encodings or user IDs"}), 400

        # Load stored encodings from request
        stored_encodings_json = request.form['encodings']
        stored_user_ids_json = request.form['userIds']
        
        print(f"Received encodings JSON length: {len(stored_encodings_json)}")
        print(f"Received userIds JSON length: {len(stored_user_ids_json)}")
        
        stored_encodings = json.loads(stored_encodings_json)
        stored_user_ids = json.loads(stored_user_ids_json)
        
        print(f"Number of encodings after parsing: {len(stored_encodings)}")
        print(f"Number of user IDs after parsing: {len(stored_user_ids)}")
        
        if len(stored_encodings) == 0:
            return jsonify({"error": "No encodings provided"}), 400
            
        # Validate and convert stored encodings to NumPy arrays
        valid_encodings = []
        valid_user_ids = []
        
        for i, (encoding, user_id) in enumerate(zip(stored_encodings, stored_user_ids)):
            # Ensure encoding is a list with 128 elements
            if isinstance(encoding, list) and len(encoding) == 128:
                try:
                    enc_array = np.array(encoding, dtype=np.float64)
                    valid_encodings.append(enc_array)
                    valid_user_ids.append(user_id)
                except Exception as e:
                    print(f"Error converting encoding {i}: {str(e)}")
            else:
                print(f"Skipping invalid encoding format at index {i}: {type(encoding)}, length: {len(encoding) if isinstance(encoding, list) else 'not a list'}")
        
        print(f"Valid encodings: {len(valid_encodings)}/{len(stored_encodings)}")
        
        if not valid_encodings:
            return jsonify({"error": "No valid encodings to compare"}), 400

        # Read uploaded image
        file = request.files['image']
        image = face_recognition.load_image_file(file)

        # Generate encoding for the uploaded image
        face_locations = face_recognition.face_locations(image)
        print(f"Detected {len(face_locations)} faces in uploaded image")
        
        if not face_locations:
            return jsonify({"error": "No face detected in the uploaded image"}), 400
            
        uploaded_encodings = face_recognition.face_encodings(image, face_locations)
        
        if not uploaded_encodings:
            return jsonify({"error": "Could not generate encoding for detected face"}), 400
        
        uploaded_encoding = uploaded_encodings[0]
        print(f"Generated uploaded encoding with shape: {uploaded_encoding.shape}")

        # Compare the uploaded encoding with stored encodings using face distance
        face_distances = face_recognition.face_distance(valid_encodings, uploaded_encoding)
        print(f"Calculated face distances: {face_distances}")

        # Find the closest match based on face distance
        min_distance = min(face_distances)
        match_index = face_distances.argmin()

        # Set a threshold to determine if the faces match
        threshold = 0.4  # You can adjust this threshold
        if min_distance < threshold:
            matched_user_id = valid_user_ids[match_index]
            print(f"Match found! User ID: {matched_user_id}, Distance: {min_distance}")
            return jsonify({
                "match": True,
                "userId": matched_user_id,
                "distance": min_distance
            })
        else:
            print(f"No match found. Best distance: {min_distance}")
            return jsonify({"match": False, "distance": min_distance})

    except Exception as e:
        print("Error occurred:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)# app.py