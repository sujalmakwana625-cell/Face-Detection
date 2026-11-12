
from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)

# Load Face Detection Model
model_path = os.path.join(
    app.root_path,
    "haarcascade_frontalface_default.xml"
)

face_cascade = cv2.CascadeClassifier(model_path)

if face_cascade.empty():
    raise RuntimeError("Face detection XML file not found!")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/detect", methods=["POST"])
def detect():
    file = request.files.get("frame")

    if not file:
        return jsonify({"error": "No image received"}), 400

    image_bytes = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Invalid image"}), 400

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    for (x, y, w, h) in faces:
        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            3
        )

    _, buffer = cv2.imencode(".jpg", frame)

    encoded_image = base64.b64encode(
        buffer
    ).decode("utf-8")

    return jsonify({"image": encoded_image})

if __name__ == "__main__":
    app.run(debug=True)

