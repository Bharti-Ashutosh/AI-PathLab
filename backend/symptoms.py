import sys
import os
import re
import ast
import json
import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import pickle
import sklearn_compat  # patches old sklearn module paths for Python 3.13 compat

script_dir = os.path.dirname(os.path.abspath(__file__))
hp_dir = os.path.join(script_dir, 'HealthPredict')

# 132 Symptoms mapping from dataset
symptoms_dict = {
    'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3, 'shivering': 4,
    'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8, 'ulcers_on_tongue': 9,
    'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12, 'spotting_ urination': 13,
    'fatigue': 14, 'weight_gain': 15, 'anxiety': 16, 'cold_hands_and_feets': 17, 'mood_swings': 18,
    'weight_loss': 19, 'restlessness': 20, 'lethargy': 21, 'patches_in_throat': 22,
    'irregular_sugar_level': 23, 'cough': 24, 'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27,
    'sweating': 28, 'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32,
    'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36, 'back_pain': 37,
    'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40, 'mild_fever': 41, 'yellow_urine': 42,
    'yellowing_of_eyes': 43, 'acute_liver_failure': 44, 'fluid_overload': 45, 'swelling_of_stomach': 46,
    'swelled_lymph_nodes': 47, 'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50,
    'throat_irritation': 51, 'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54,
    'congestion': 55, 'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58,
    'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61,
    'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65, 'bruising': 66,
    'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70,
    'enlarged_thyroid': 71, 'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74,
    'extra_marital_contacts': 75, 'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78,
    'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81, 'swelling_joints': 82,
    'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85, 'unsteadiness': 86,
    'weakness_of_one_body_side': 87, 'loss_of_smell': 88, 'bladder_discomfort': 89,
    'foul_smell_of urine': 90, 'continuous_feel_of_urine': 91, 'passage_of_gases': 92,
    'internal_itching': 93, 'toxic_look_(typhos)': 94, 'depression': 95, 'irritability': 96,
    'muscle_pain': 97, 'altered_sensorium': 98, 'red_spots_over_body': 99, 'belly_pain': 100,
    'abnormal_menstruation': 101, 'dischromic _patches': 102, 'watering_from_eyes': 103,
    'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107,
    'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110,
    'receiving_blood_transfusion': 111, 'receiving_unsterile_injections': 112, 'coma': 113,
    'stomach_bleeding': 114, 'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116,
    'fluid_overload.1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119,
    'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123,
    'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127,
    'inflammatory_nails': 128, 'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131
}

diseases_list = {
    15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis', 14: 'Drug Reaction',
    33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes ', 17: 'Gastroenteritis', 6: 'Bronchial Asthma',
    23: 'Hypertension ', 30: 'Migraine', 7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)',
    28: 'Jaundice', 29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A',
    19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E', 3: 'Alcoholic hepatitis',
    36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia', 13: 'Dimorphic hemmorhoids(piles)',
    18: 'Heart attack', 39: 'Varicose veins', 26: 'Hypothyroidism', 24: 'Hyperthyroidism',
    25: 'Hypoglycemia', 31: 'Osteoarthristis', 5: 'Arthritis',
    0: '(vertigo) Paroymsal  Positional Vertigo', 2: 'Acne', 38: 'Urinary tract infection',
    35: 'Psoriasis', 27: 'Impetigo'
}

def clean_symptom_name(name):
    """Normalize symptom string for comparison."""
    s = str(name).strip().lower()
    s = re.sub(r'[\s\-]+', '_', s)
    s = re.sub(r'[^\w]', '', s)
    return s

# Build normalized symptom lookup
norm_symptoms_lookup = {}
for original_name, idx in symptoms_dict.items():
    norm_symptoms_lookup[clean_symptom_name(original_name)] = idx

def norm_disease(name):
    s = str(name).strip().lower()
    s = re.sub(r'\s+', ' ', s)
    s = s.replace('diseae', 'disease')
    return s

# Load CSV datasets
precautions = pd.read_csv(os.path.join(hp_dir, 'precautions_df.csv'))
workout = pd.read_csv(os.path.join(hp_dir, 'workout_df.csv'))
description = pd.read_csv(os.path.join(hp_dir, 'description.csv'))
medications = pd.read_csv(os.path.join(hp_dir, 'medications.csv'))
diets = pd.read_csv(os.path.join(hp_dir, 'diets.csv'))

# Pre-normalize disease column in each dataframe
description['norm'] = description['Disease'].apply(norm_disease)
precautions['norm'] = precautions['Disease'].apply(norm_disease)
workout['norm'] = workout['disease'].apply(norm_disease)
medications['norm'] = medications['Disease'].apply(norm_disease)
diets['norm'] = diets['Disease'].apply(norm_disease)

# Canonical clean disease names from description.csv
canonical_names = {row['norm']: row['Disease'] for _, row in description.iterrows()}

# Load model
model_path = os.path.join(script_dir, 'aimodels', 'svc.pkl')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

def predict_disease(input_symptoms_raw):
    # Parse input symptoms into list
    if isinstance(input_symptoms_raw, str):
        raw_list = re.split(r'[,;]+', input_symptoms_raw)
    elif isinstance(input_symptoms_raw, (list, tuple)):
        raw_list = input_symptoms_raw
    else:
        raw_list = []

    input_vector = np.zeros(len(symptoms_dict))
    matched = []
    unmatched = []

    for item in raw_list:
        item_str = str(item).strip()
        if not item_str:
            continue
        cleaned = clean_symptom_name(item_str)
        if cleaned in norm_symptoms_lookup:
            idx = norm_symptoms_lookup[cleaned]
            input_vector[idx] = 1
            matched.append(item_str)
        else:
            unmatched.append(item_str)

    if len(matched) == 0:
        return None, matched, unmatched

    pred = model.predict([input_vector])[0]
    if isinstance(pred, (int, np.integer)):
        pred_str = diseases_list.get(int(pred), str(pred))
    else:
        pred_str = str(pred)

    return pred_str, matched, unmatched

def get_disease_details(disease_raw):
    target_norm = norm_disease(disease_raw)

    clean_name = canonical_names.get(target_norm, disease_raw.strip())

    # Description
    d_rows = description[description['norm'] == target_norm]
    desc_text = d_rows['Description'].values[0] if len(d_rows) > 0 else f"{clean_name} is a medical condition requiring healthcare consultation."

    # Precautions
    p_rows = precautions[precautions['norm'] == target_norm]
    precautions_list = []
    if len(p_rows) > 0:
        row = p_rows.iloc[0]
        for col in ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']:
            val = str(row.get(col, '')).strip()
            if val and val.lower() != 'nan':
                precautions_list.append(val)

    # Medications
    m_rows = medications[medications['norm'] == target_norm]
    meds_list = []
    if len(m_rows) > 0:
        val = m_rows['Medication'].values[0]
        try:
            parsed = ast.literal_eval(val)
            if isinstance(parsed, list):
                meds_list = [str(x).strip() for x in parsed if str(x).strip()]
            else:
                meds_list = [str(parsed).strip()]
        except Exception:
            meds_list = [str(val).strip()]

    # Diet
    diet_rows = diets[diets['norm'] == target_norm]
    diet_list = []
    if len(diet_rows) > 0:
        val = diet_rows['Diet'].values[0]
        try:
            parsed = ast.literal_eval(val)
            if isinstance(parsed, list):
                diet_list = [str(x).strip() for x in parsed if str(x).strip()]
            else:
                diet_list = [str(parsed).strip()]
        except Exception:
            diet_list = [str(val).strip()]

    # Workout
    w_rows = workout[workout['norm'] == target_norm]
    workout_list = [str(w).strip() for w in w_rows['workout'].dropna().tolist() if str(w).strip()]

    return {
        'predicted_disease': clean_name,
        'disease': clean_name,
        'dis_des': desc_text,
        'description': desc_text,
        'my_precautions': precautions_list,
        'precautions': precautions_list,
        'medications': meds_list,
        'rec_diet': diet_list,
        'diets': diet_list,
        'workout': workout_list,
        'workouts': workout_list
    }

if __name__ == '__main__':
    raw_arg = ""
    if len(sys.argv) > 1:
        for arg in reversed(sys.argv[1:]):
            if arg.startswith('{') or arg.startswith('[') or (not arg.startswith('--') and not arg.endswith('.pkl')):
                raw_arg = arg
                break
        if not raw_arg:
            raw_arg = sys.argv[-1]

    try:
        data_payload = json.loads(raw_arg)
    except Exception:
        data_payload = {'data': raw_arg}

    if isinstance(data_payload, dict):
        input_data = data_payload.get('data') or data_payload.get('symptoms') or data_payload.get('input')
    else:
        input_data = data_payload

    predicted_disease_raw, matched, unmatched = predict_disease(input_data)

    if predicted_disease_raw is None:
        err_result = {
            'error': 'No recognized symptoms found. Please enter valid symptoms like itching, chills, fatigue, cough, headache, joint pain, etc.',
            'predicted_disease': 'No match',
            'disease': 'No match',
            'dis_des': 'Could not match any symptoms with our diagnostic database. Please check the spelling or select from common symptoms.',
            'description': 'Could not match any symptoms with our diagnostic database. Please check the spelling or select from common symptoms.',
            'my_precautions': ['Check symptom spelling', 'Enter common terms such as fever, cough, fatigue', 'Consult a healthcare professional for advice'],
            'precautions': ['Check symptom spelling', 'Enter common terms such as fever, cough, fatigue', 'Consult a healthcare professional for advice'],
            'medications': [],
            'rec_diet': ['Stay hydrated with plenty of water', 'Eat clean, balanced, nutritious meals'],
            'diets': ['Stay hydrated with plenty of water', 'Eat clean, balanced, nutritious meals'],
            'workout': ['Rest and avoid strenuous exercise until symptoms are evaluated'],
            'workouts': ['Rest and avoid strenuous exercise until symptoms are evaluated'],
            'matched_symptoms': [],
            'unmatched_symptoms': unmatched
        }
        print(json.dumps(err_result), flush=True)
        sys.exit(0)

    result = get_disease_details(predicted_disease_raw)
    result['matched_symptoms'] = matched
    result['unmatched_symptoms'] = unmatched

    print(json.dumps(result), flush=True)