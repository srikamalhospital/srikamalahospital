from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image, ImageOps
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Render sets PORT; local dev uses SKIN_AI_PORT
SKIN_AI_PORT = int(os.getenv('PORT', os.getenv('SKIN_AI_PORT', 5005)))

app = Flask(__name__)
CORS(app)

interpreter = None
input_details = None
output_details = None

MODEL_PATH = os.path.join(os.path.dirname(__file__), "skin_model.tflite")
H5_PATH = os.path.join(os.path.dirname(__file__), "skin_model.h5")

# Must match Keras flow_from_dataframe alphabetical label order
CLASS_META = [
    {"dx": "akiec", "condition": "Actinic Keratosis", "risk": "Medium"},
    {"dx": "bcc", "condition": "Basal Cell Carcinoma", "risk": "High"},
    {"dx": "bkl", "condition": "Benign Keratosis", "risk": "Low"},
    {"dx": "df", "condition": "Dermatofibroma", "risk": "Low"},
    {"dx": "nv", "condition": "Melanocytic Nevi", "risk": "Low"},
    {"dx": "mel", "condition": "Melanoma", "risk": "Critically High"},
    {"dx": "vasc", "condition": "Vascular Lesions", "risk": "Low"},
]

INPUT_SIZE = 224


def load_interpreter():
    global interpreter, input_details, output_details
    if os.path.exists(MODEL_PATH):
        try:
            import tflite_runtime.interpreter as tflite
            interpreter = tflite.Interpreter(model_path=MODEL_PATH, num_threads=4)
        except ImportError:
            import tensorflow as tf
            interpreter = tf.lite.Interpreter(model_path=MODEL_PATH, num_threads=4)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print(f"✅ Loaded TFLite model: {MODEL_PATH}")
        return True
    if os.path.exists(H5_PATH):
        try:
            import tensorflow as tf
            model = tf.keras.models.load_model(H5_PATH)
            converter = tf.lite.TFLiteConverter.from_keras_model(model)
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
            tflite_model = converter.convert()
            with open(MODEL_PATH, 'wb') as f:
                f.write(tflite_model)
            return load_interpreter()
        except Exception as e:
            print(f"⚠️ Could not convert H5 to TFLite: {e}")
    print(f"❌ No model at {MODEL_PATH} or {H5_PATH}")
    return False


def preprocess_image(file):
    img = Image.open(file).convert('RGB')
    img = ImageOps.exif_transpose(img)
    # Center square crop (lesion-focused framing)
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((INPUT_SIZE, INPUT_SIZE), Image.Resampling.BILINEAR)
    arr = np.asarray(img, dtype=np.float32) / 255.0
    return arr.reshape(1, INPUT_SIZE, INPUT_SIZE, 3)


def predict_probs(arr):
    interpreter.set_tensor(input_details[0]['index'], arr)
    interpreter.invoke()
    return interpreter.get_tensor(output_details[0]['index'])[0]


def format_response(class_id, confidence, uncertain=False):
    meta = CLASS_META[class_id]
    conf_pct = round(float(confidence) * 100, 1)
    return {
        "success": True,
        "prediction": class_id,
        "dx": meta["dx"],
        "condition": meta["condition"],
        "risk": meta["risk"],
        "confidence": conf_pct,
        "uncertain": uncertain,
        "model": "HAM10000-CNN-TFLite"
    }


@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "Skin AI Server is Up",
        "model_loaded": interpreter is not None,
        "classes": len(CLASS_META),
        "input_size": INPUT_SIZE
    })


@app.route("/predict", methods=["POST"])
def predict():
    if interpreter is None:
        return jsonify({"success": False, "error": "Model not loaded. Train with ham10000_analyzer.py"}), 503

    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image uploaded"}), 400

    try:
        file = request.files['image']
        arr = preprocess_image(file)
        probs = predict_probs(arr)

        class_id = int(np.argmax(probs))
        confidence = float(probs[class_id])

        # Low confidence → flag for clinician review (avoids false certainty)
        uncertain = confidence < 0.42

        # Melanoma safety: if mel probability is meaningful, boost review
        mel_idx = next(i for i, m in enumerate(CLASS_META) if m["dx"] == "mel")
        if probs[mel_idx] >= 0.28 and class_id != mel_idx:
            uncertain = True

        return jsonify(format_response(class_id, confidence, uncertain))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


load_interpreter()
if interpreter is not None:
    try:
        dummy = np.zeros((1, INPUT_SIZE, INPUT_SIZE, 3), dtype=np.float32)
        predict_probs(dummy)
    except Exception:
        pass

if __name__ == "__main__":
    print(f"🚀 Skin AI Server on port {SKIN_AI_PORT}")
    app.run(host="0.0.0.0", port=SKIN_AI_PORT)
