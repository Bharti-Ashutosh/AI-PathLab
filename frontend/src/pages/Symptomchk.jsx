import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

const POPULAR_SYMPTOMS = [
  "itching",
  "skin_rash",
  "continuous_sneezing",
  "chills",
  "joint_pain",
  "stomach_pain",
  "acidity",
  "vomiting",
  "fatigue",
  "cough",
  "high_fever",
  "breathlessness",
  "headache",
  "nausea",
  "loss_of_appetite",
  "chest_pain",
  "dizziness",
  "abdominal_pain",
  "yellowish_skin"
];

const ALL_SYMPTOMS = [
  "abdominal_pain", "abnormal_menstruation", "acidity", "acute_liver_failure",
  "altered_sensorium", "anxiety", "back_pain", "belly_pain", "blackheads",
  "bladder_discomfort", "blister", "blood_in_sputum", "bloody_stool",
  "blurred_and_distorted_vision", "breathlessness", "brittle_nails", "bruising",
  "burning_micturition", "chest_pain", "chills", "cold_hands_and_feets", "coma",
  "congestion", "constipation", "continuous_feel_of_urine", "continuous_sneezing",
  "cough", "cramps", "dark_urine", "dehydration", "depression", "diarrhoea",
  "dischromic_patches", "distention_of_abdomen", "dizziness",
  "drying_and_tingling_lips", "enlarged_thyroid", "excessive_hunger",
  "extra_marital_contacts", "family_history", "fast_heart_rate", "fatigue",
  "fluid_overload", "foul_smell_of_urine", "headache", "high_fever",
  "hip_joint_pain", "history_of_alcohol_consumption", "increased_appetite",
  "indigestion", "inflammatory_nails", "internal_itching", "irregular_sugar_level",
  "irritability", "irritation_in_anus", "itching", "joint_pain", "knee_pain",
  "lack_of_concentration", "lethargy", "loss_of_appetite", "loss_of_balance",
  "loss_of_smell", "malaise", "mild_fever", "mood_swings", "movement_stiffness",
  "mucoid_sputum", "muscle_pain", "muscle_wasting", "muscle_weakness", "nausea",
  "neck_pain", "nodal_skin_eruptions", "obesity", "pain_behind_the_eyes",
  "pain_during_bowel_movements", "pain_in_anal_region", "painful_walking",
  "palpitations", "passage_of_gases", "patches_in_throat", "phlegm", "polyuria",
  "prominent_veins_on_calf", "puffy_face_and_eyes", "pus_filled_pimples",
  "receiving_blood_transfusion", "receiving_unsterile_injections",
  "red_sore_around_nose", "red_spots_over_body", "redness_of_eyes",
  "restlessness", "runny_nose", "rusty_sputum", "scurring", "shivering",
  "silver_like_dusting", "sinus_pressure", "skin_peeling", "skin_rash",
  "slurred_speech", "small_dents_in_nails", "spinning_movements",
  "spotting_urination", "stiff_neck", "stomach_bleeding", "stomach_pain",
  "sunken_eyes", "sweating", "swelled_lymph_nodes", "swelling_joints",
  "swelling_of_stomach", "swollen_blood_vessels", "swollen_extremeties",
  "swollen_legs", "throat_irritation", "toxic_look_(typhos)",
  "ulcers_on_tongue", "unsteadiness", "visual_disturbances", "vomiting",
  "watering_from_eyes", "weakness_in_limbs", "weakness_of_one_body_side",
  "weight_gain", "weight_loss", "yellow_crust_ooze", "yellow_urine",
  "yellowing_of_eyes", "yellowish_skin"
];

const Symptomchk = () => {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [description, setDescription] = useState("");
  const [precaution, setPrecaution] = useState([]);
  const [medications, setMedications] = useState([]);
  const [workout, setWorkout] = useState([]);
  const [diets, setDiets] = useState([]);
  const [disease, setDisease] = useState("");
  const [matchedSymptoms, setMatchedSymptoms] = useState([]);

  const [isDesVisible, setIsDesVisible] = useState(true);
  const [isPrecautionVisible, setIsPrecautionVisible] = useState(true);
  const [isMedicationsVisible, setIsMedicationsVisible] = useState(true);
  const [isWorkoutVisible, setIsWorkoutVisible] = useState(true);
  const [isDietsVisible, setIsDietsVisible] = useState(true);
  const [isDiseaseVisible, setIsDiseaseVisible] = useState(true);

  const toggleDescriptionVisibility = () => setIsDesVisible(!isDesVisible);
  const togglePrecautionVisibility = () => setIsPrecautionVisible(!isPrecautionVisible);
  const toggleMedicationVisibility = () => setIsMedicationsVisible(!isMedicationsVisible);
  const toggleWorkoutVisibility = () => setIsWorkoutVisible(!isWorkoutVisible);
  const toggleDietsVisibility = () => setIsDietsVisible(!isDietsVisible);
  const toggleDiseaseVisibility = () => setIsDiseaseVisible(!isDiseaseVisible);

  const handleAddSymptom = (sym) => {
    const list = symptoms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list.includes(sym)) {
      list.push(sym);
      setSymptoms(list.join(", "));
    }
  };

  const handleClear = () => {
    setSymptoms("");
    setDisease("");
    setDescription("");
    setPrecaution([]);
    setMedications([]);
    setWorkout([]);
    setDiets([]);
    setErrorMessage("");
    setMatchedSymptoms([]);
  };

  const handlePrediction = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setErrorMessage("Please enter or select at least one symptom.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(`${BASE_URL}/symptoms`, {
        data: symptoms,
      });

      const resData = response.data.data;
      if (!resData) {
        throw new Error("No data returned from prediction service");
      }

      setDisease(resData.predicted_disease || resData.disease || "");
      setDescription(resData.dis_des || resData.description || "");
      setPrecaution(resData.my_precautions || resData.precautions || []);
      setMedications(resData.medications || []);
      setWorkout(resData.workout || resData.workouts || []);
      setDiets(resData.rec_diet || resData.diets || []);
      setMatchedSymptoms(resData.matched_symptoms || []);

      // Auto-open sections so user sees results immediately
      setIsDiseaseVisible(true);
      setIsDesVisible(true);
      setIsPrecautionVisible(true);
      setIsMedicationsVisible(true);
      setIsWorkoutVisible(true);
      setIsDietsVisible(true);
    } catch (error) {
      console.error("Prediction error:", error);
      const serverMsg = error.response?.data?.message;
      setErrorMessage(
        serverMsg || "Failed to fetch prediction. Please verify your symptoms and try again."
      );
    }

    setIsLoading(false);
  };

  const renderList = (data, fallbackMsg = "No specific items listed.") => {
    if (Array.isArray(data) && data.length > 0) {
      return (
        <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-800 text-lg">
          {data.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof data === "string" && data.trim()) {
      return <p className="mt-2 text-gray-800 text-lg">{data}</p>;
    }
    return <p className="mt-2 text-gray-500 italic text-base">{fallbackMsg}</p>;
  };

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="px-4 mx-auto max-w-screen-lg">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-extrabold text-headingColor tracking-tight">
            HealthPredict — AI Symptom Checker
          </h2>
          <p className="text-gray-600 text-lg mt-2 max-w-2xl mx-auto">
            Enter your symptoms separated by commas or select from popular symptoms below to receive an instant AI-powered health diagnosis with medical precautions, medications, diet, and workouts.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-8">
          <form onSubmit={handlePrediction}>
            <div className="mb-4">
              <label
                htmlFor="symptoms"
                className="block font-bold text-xl text-gray-800 mb-2"
              >
                Enter Symptoms:
              </label>
              <input
                type="text"
                list="symptoms-list"
                className="w-full p-4 rounded-xl text-lg font-medium border-2 border-gray-300 focus:border-primaryColor focus:outline-none transition shadow-sm"
                id="symptoms"
                name="symptoms"
                placeholder="e.g. itching, skin_rash, chills, continuous_sneezing, headache"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <datalist id="symptoms-list">
                {ALL_SYMPTOMS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Popular Symptoms Chips */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Click to add popular symptoms:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SYMPTOMS.map((sym) => {
                  const isSelected = symptoms.toLowerCase().includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleAddSymptom(sym)}
                      className={`text-sm px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
                        isSelected
                          ? "bg-primaryColor text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      + {sym.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                className="bg-primaryColor hover:bg-opacity-90 font-bold text-xl text-white py-3 px-8 rounded-xl transition shadow-md w-full sm:w-auto min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Predicting..." : "Predict Health"}
              </button>
              {symptoms && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-lg py-3 px-6 rounded-xl transition w-full sm:w-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium text-base">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        {/* Results Section */}
        {disease && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6">
            <div className="text-center border-b border-gray-200 pb-4">
              <span className="text-sm uppercase tracking-wider font-bold text-primaryColor">
                Diagnostic Assessment
              </span>
              <h3 className="text-3xl font-extrabold text-headingColor mt-1">
                Our AI System Results
              </h3>
              {matchedSymptoms.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-gray-500">
                    Matched Symptoms:
                  </span>
                  {matchedSymptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle control pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                style={{ background: isDiseaseVisible ? "#F39334" : "#e5e7eb" }}
                className="py-2 px-5 rounded-lg font-bold text-base transition shadow-sm cursor-pointer"
                onClick={toggleDiseaseVisibility}
              >
                Disease {isDiseaseVisible ? "▼" : "▶"}
              </button>
              <button
                type="button"
                style={{ background: isDesVisible ? "#268AF3" : "#e5e7eb", color: isDesVisible ? "white" : "black" }}
                className="py-2 px-5 rounded-lg font-bold text-base transition shadow-sm cursor-pointer"
                onClick={toggleDescriptionVisibility}
              >
                Description {isDesVisible ? "▼" : "▶"}
              </button>
              <button
                type="button"
                style={{ background: isPrecautionVisible ? "#F371F9" : "#e5e7eb" }}
                className="py-2 px-5 rounded-lg font-bold text-base transition shadow-sm cursor-pointer"
                onClick={togglePrecautionVisibility}
              >
                Precautions {isPrecautionVisible ? "▼" : "▶"}
              </button>
              <button
                type="button"
                style={{ background: isMedicationsVisible ? "#F8576F" : "#e5e7eb", color: isMedicationsVisible ? "white" : "black" }}
                className="py-2 px-5 rounded-lg font-bold text-base transition shadow-sm cursor-pointer"
                onClick={toggleMedicationVisibility}
              >
                Medications {isMedicationsVisible ? "▼" : "▶"}
              </button>
              <button
                type="button"
                style={{ background: isWorkoutVisible ? "#99F741" : "#e5e7eb" }}
                className="py-2 px-5 rounded-lg font-bold text-base transition shadow-sm cursor-pointer"
                onClick={toggleWorkoutVisibility}
              >
                Workouts {isWorkoutVisible ? "▼" : "▶"}
              </button>
              <button
                type="button"
                style={{ background: isDietsVisible ? "#E5E23D" : "#e5e7eb" }}
                className="py-2 px-5 rounded-lg font-bold text-base transition shadow-sm cursor-pointer"
                onClick={toggleDietsVisibility}
              >
                Diets {isDietsVisible ? "▼" : "▶"}
              </button>
            </div>

            {/* Disease Banner */}
            {isDiseaseVisible && (
              <div
                className="p-5 rounded-xl border-l-8 transition"
                style={{
                  backgroundColor: "rgba(243, 147, 52, 0.12)",
                  borderColor: "#F39334",
                }}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  Predicted Condition
                </span>
                <h4 className="text-3xl font-black text-gray-900 mt-1">
                  {disease}
                </h4>
              </div>
            )}

            {/* Description */}
            {isDesVisible && description && (
              <div
                className="p-5 rounded-xl border-l-8 transition"
                style={{
                  backgroundColor: "rgba(38, 138, 243, 0.10)",
                  borderColor: "#268AF3",
                }}
              >
                <h5 className="text-xl font-bold text-blue-900 mb-2">
                  Condition Overview
                </h5>
                <p className="text-gray-800 text-lg leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Precautions */}
            {isPrecautionVisible && (
              <div
                className="p-5 rounded-xl border-l-8 transition"
                style={{
                  backgroundColor: "rgba(243, 113, 249, 0.10)",
                  borderColor: "#F371F9",
                }}
              >
                <h5 className="text-xl font-bold text-purple-900 mb-2">
                  Recommended Precautions
                </h5>
                {renderList(precaution, "No specific precautions found.")}
              </div>
            )}

            {/* Medications */}
            {isMedicationsVisible && (
              <div
                className="p-5 rounded-xl border-l-8 transition"
                style={{
                  backgroundColor: "rgba(248, 87, 111, 0.10)",
                  borderColor: "#F8576F",
                }}
              >
                <h5 className="text-xl font-bold text-rose-900 mb-2">
                  Common Medications
                </h5>
                {renderList(medications, "Please consult a physician for prescription details.")}
              </div>
            )}

            {/* Workouts */}
            {isWorkoutVisible && (
              <div
                className="p-5 rounded-xl border-l-8 transition"
                style={{
                  backgroundColor: "rgba(153, 247, 65, 0.15)",
                  borderColor: "#78c928",
                }}
              >
                <h5 className="text-xl font-bold text-green-900 mb-2">
                  Exercise & Physical Care
                </h5>
                {renderList(workout, "Follow light rest and consult your healthcare provider.")}
              </div>
            )}

            {/* Diets */}
            {isDietsVisible && (
              <div
                className="p-5 rounded-xl border-l-8 transition"
                style={{
                  backgroundColor: "rgba(229, 226, 61, 0.15)",
                  borderColor: "#d1cc19",
                }}
              >
                <h5 className="text-xl font-bold text-yellow-900 mb-2">
                  Dietary Recommendations
                </h5>
                {renderList(diets, "Maintain a balanced, nutritious diet with adequate hydration.")}
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500 text-sm">
              ℹ️ <strong>Medical Disclaimer:</strong> This AI tool is for preliminary educational and screening purposes only and should not replace professional medical diagnosis or consultation.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Symptomchk;
