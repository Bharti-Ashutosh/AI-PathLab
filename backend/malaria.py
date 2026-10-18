import os
import sys
import json
import warnings

# Suppress TensorFlow logging to keep stdout clean for node child_process
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

import numpy as np
from PIL import Image
from tensorflow.keras import layers, models

def build_malaria_model():
    model = models.Sequential([
        layers.Input(shape=(36, 36, 3)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),
        layers.Conv2D(256, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),
        layers.Conv2D(512, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),
        layers.Flatten(),
        layers.Dense(96, activation='relu'),
        layers.Dense(2, activation='softmax')
    ])
    return model

def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((36, 36))
    img_array = np.asarray(img)
    img_array = img_array.reshape((1, 36, 36, 3))
    img_array = img_array / 255.0
    return img_array

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python malaria.py <image_path>", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "aimodels", "malaria.h5")
        model = build_malaria_model()
        model.load_weights(model_path)
        img_array = preprocess_image(image_path)
        prediction = model.predict(img_array, verbose=0)[0]
        print(json.dumps(prediction.tolist()), flush=True)
    except Exception as e:
        print("Error:", e, file=sys.stderr)
        sys.exit(1)
