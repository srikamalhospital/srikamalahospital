import os
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from glob import glob
from dotenv import load_dotenv
import kaggle

# Load Environment Variables from current directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Set Kaggle Env Variables
if os.getenv('KAGGLE_USERNAME') and os.getenv('KAGGLE_KEY'):
    os.environ['KAGGLE_USERNAME'] = os.getenv('KAGGLE_USERNAME')
    os.environ['KAGGLE_KEY'] = os.getenv('KAGGLE_KEY')

def setup_and_train():
    # 🧠 Step 1: Download/Verify Dataset
    print("🚀 Verifying dataset (HAM10000)...")
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        
    try:
        if not os.path.exists(os.path.join(data_dir, 'HAM10000_metadata.csv')):
            print("📥 Downloading dataset via Kaggle API...")
            kaggle.api.dataset_download_files(
                'kmader/skin-cancer-mnist-ham10000',
                path=data_dir,
                unzip=True
            )
            print("✅ Downloaded and unzipped successfully.")
    except Exception as e:
        print(f"❌ Kaggle error: {e}")
        return

    # 🗺️ Step 2: Organize Data using CSV
    print("🗺️ Mapping images to metadata...")
    all_image_paths = {os.path.basename(x).split(".")[0]: x 
                      for x in glob(os.path.join(data_dir, '**', '*.jpg'), recursive=True)}

    metadata_path = os.path.join(data_dir, 'HAM10000_metadata.csv')
    df = pd.read_csv(metadata_path)
    
    # Map filenames to actual paths
    df['path'] = df['image_id'].map(all_image_paths.get)
    df = df.dropna(subset=['path'])  # Ensure all metadata has an image
    
    # Label mapping (dx column)
    # Target classes: akiec, bcc, bkl, df, mel, nv, vasc
    class_map = {
        'akiec': 'Actinic Keratosis',
        'bcc': 'Basal Cell Carcinoma',
        'bkl': 'Benign Keratosis',
        'df': 'Dermatofibroma',
        'mel': 'Melanoma',
        'nv': 'Melanocytic Nevi',
        'vasc': 'Vascular Lesions'
    }
    df['label'] = df['dx'].map(class_map)
    
    print(f"✅ Found {len(df)} images with valid metadata.")
    print(f"📊 Classes identified: {df['label'].unique()}")

    # 🧠 Step 3: Model Training
    print("🧠 Starting CNN Model Training...")
    
    datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

    # Note: Target size matches Step 2 (224, 224)
    train_gen = datagen.flow_from_dataframe(
        dataframe=df,
        x_col="path",
        y_col="label",
        target_size=(224, 224),
        batch_size=32,
        class_mode="categorical",
        subset="training"
    )

    val_gen = datagen.flow_from_dataframe(
        dataframe=df,
        x_col="path",
        y_col="label",
        target_size=(224, 224),
        batch_size=32,
        class_mode="categorical",
        subset="validation"
    )

    # 🏗️ Build Model with improved complexity for 7 classes
    model = tf.keras.Sequential([
        tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(128, (3,3), activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(7, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    # ⚖️ Step 4: Calculate Class Weights to fix "Melanocytic Nevi" bias
    from sklearn.utils import class_weight
    import numpy as np
    
    # Get class indices
    class_indices = train_gen.class_indices
    # Get the count of each class in the training data
    class_counts = df[df['path'].isin(train_gen.filepaths)]['label'].value_counts().to_dict()
    
    # Calculate weights: Rare classes get higher weight
    total_samples = len(df)
    n_classes = len(class_indices)
    weights_dict = {}
    for cls_name, cls_idx in class_indices.items():
        count = class_counts.get(cls_name, 1)
        weights_dict[cls_idx] = total_samples / (n_classes * count)
        
    print(f"⚖️ Calculated Class Weights: {weights_dict}")

    # Train for 8 epochs with weights (Better convergence)
    model.fit(train_gen, validation_data=val_gen, epochs=8, class_weight=weights_dict)
    
    model_path = os.path.join(os.path.dirname(__file__), "skin_model.h5")
    model.save(model_path)
    print("✅ Model trained and saved as 'skin_model.h5'!")

    # Export lightweight TFLite for fast production inference
    try:
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        tflite_bytes = converter.convert()
        tflite_path = os.path.join(os.path.dirname(__file__), "skin_model.tflite")
        with open(tflite_path, "wb") as f:
            f.write(tflite_bytes)
        print(f"✅ Exported TFLite model: {tflite_path}")
    except Exception as e:
        print(f"⚠️ TFLite export skipped: {e}")

if __name__ == "__main__":
    setup_and_train()
