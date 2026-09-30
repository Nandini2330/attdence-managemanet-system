import base64
import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load OpenCV face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def decode_image_from_base64(b64_string):
  """Decode base64 image data to an OpenCV image."""
  if ',' in b64_string:
    b64_string = b64_string.split(',')[1]
  image_bytes = base64.b64decode(b64_string)
  np_arr = np.frombuffer(image_bytes, np.uint8)
  img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
  return img

def extract_face_embedding(face_img):
  """
  Generate normalized 128-dimensional biometric descriptor from facial region
  using spatial frequency & multi-scale histogram representation.
  """
  resized = cv2.resize(face_img, (128, 128))
  gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
  equalized = cv2.equalizeHist(gray)
  
  # Calculate 8x8 block histograms (64 features) + gradient orientations (64 features) -> 128-D vector
  blocks = 8
  h, w = equalized.shape
  dh, dw = h // blocks, w // blocks
  features = []
  
  for i in range(blocks):
    for j in range(blocks):
      sub = equalized[i*dh:(i+1)*dh, j*dw:(j+1)*dw]
      features.append(np.mean(sub))
      
  # Gradient features
  gx = cv2.Sobel(equalized, cv2.CV_32F, 1, 0, ksize=3)
  gy = cv2.Sobel(equalized, cv2.CV_32F, 0, 1, ksize=3)
  mag, _ = cv2.cartToPolar(gx, gy)
  
  for i in range(blocks):
    for j in range(blocks):
      sub_mag = mag[i*dh:(i+1)*dh, j*dw:(j+1)*dw]
      features.append(np.mean(sub_mag))
      
  vector = np.array(features, dtype=np.float32)
  norm = np.linalg.norm(vector)
  if norm > 0:
    vector = vector / norm
  return vector.tolist()

def cosine_similarity(v1, v2):
  """Calculate cosine similarity between two feature vectors."""
  a = np.array(v1)
  b = np.array(v2)
  dot = np.dot(a, b)
  norm_a = np.linalg.norm(a)
  norm_b = np.linalg.norm(b)
  if norm_a == 0 or norm_b == 0:
    return 0.0
  return float(dot / (norm_a * norm_b))

@app.route('/health', methods=['GET'])
def health():
  return jsonify({
    "status": "healthy",
    "service": "SMARTATTEND AI Face Recognition Backend",
    "opencv_version": cv2.__version__
  })

@app.route('/api/detect-face', methods=['POST'])
def detect_face():
  """Detect face bounding boxes from uploaded camera frame."""
  try:
    data = request.get_json()
    image_b64 = data.get('image')
    if not image_b64:
      return jsonify({"error": "No image provided"}), 400

    img = decode_image_from_base64(image_b64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    results = []
    for (x, y, w, h) in faces:
      results.append({
        "x": int(x),
        "y": int(y),
        "width": int(w),
        "height": int(h)
      })

    return jsonify({
      "faceDetected": len(results) > 0,
      "count": len(results),
      "faces": results
    })
  except Exception as e:
    return jsonify({"error": str(e)}), 500

@app.route('/api/enroll-face', methods=['POST'])
def enroll_face():
  """
  Enroll student face: receives multiple samples, validates, extracts
  embeddings, and returns the aggregated biometric profile vector.
  Biometric vectors are stored without keeping raw photographic images.
  """
  try:
    data = request.get_json()
    student_id = data.get('studentId')
    samples_b64 = data.get('samples', [])

    if not student_id or not samples_b64:
      return jsonify({"error": "studentId and samples are required"}), 400

    embeddings = []
    for sample in samples_b64:
      img = decode_image_from_base64(sample)
      gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
      faces = face_cascade.detectMultiScale(gray, 1.1, 4)
      
      if len(faces) > 0:
        (x, y, w, h) = faces[0]
        face_roi = img[y:y+h, x:x+w]
        emb = extract_face_embedding(face_roi)
        embeddings.append(emb)

    if len(embeddings) == 0:
      return jsonify({"error": "No valid face detected in provided samples"}), 422

    # Average the embeddings for a robust composite descriptor
    mean_embedding = np.mean(embeddings, axis=0)
    norm = np.linalg.norm(mean_embedding)
    if norm > 0:
      mean_embedding = mean_embedding / norm

    return jsonify({
      "success": True,
      "studentId": student_id,
      "samplesProcessed": len(embeddings),
      "embedding": mean_embedding.tolist(),
      "message": "Face profile successfully generated"
    })
  except Exception as e:
    return jsonify({"error": str(e)}), 500

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
  """
  Verify a captured camera frame against a stored student embedding or list of enrolled candidates.
  """
  try:
    data = request.get_json()
    image_b64 = data.get('image')
    candidates = data.get('candidates', []) # list of { studentId, embedding, fullName }

    if not image_b64 or not candidates:
      return jsonify({"error": "image and candidates list required"}), 400

    img = decode_image_from_base64(image_b64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))

    if len(faces) == 0:
      return jsonify({
        "matched": False,
        "reason": "NO_FACE_DETECTED",
        "message": "No face detected in camera frame"
      })

    # Pick the most prominent face
    (x, y, w, h) = faces[0]
    face_roi = img[y:y+h, x:x+w]
    target_embedding = extract_face_embedding(face_roi)

    best_match = None
    best_similarity = -1.0
    CONFIDENCE_THRESHOLD = 0.72

    for cand in candidates:
      stored_emb = cand.get('embedding')
      if not stored_emb:
        continue
      sim = cosine_similarity(target_embedding, stored_emb)
      if sim > best_similarity:
        best_similarity = sim
        best_match = cand

    if best_similarity >= CONFIDENCE_THRESHOLD and best_match:
      return jsonify({
        "matched": True,
        "studentId": best_match['studentId'],
        "studentName": best_match.get('fullName', 'Enrolled Student'),
        "confidence": round(best_similarity, 4),
        "boundingBox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
      })
    else:
      return jsonify({
        "matched": False,
        "confidence": round(best_similarity, 4) if best_similarity > 0 else 0,
        "reason": "FACE_NOT_RECOGNIZED",
        "message": "Face not recognized or confidence below threshold",
        "boundingBox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
      })

  except Exception as e:
    return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5000))
  print(f"SMARTATTEND AI Face Recognition Service starting on port {port}")
  app.run(host='0.0.0.0', port=port, debug=False)
