import React from "react";
import TabularDiseasePredictor from "./TabularDiseasePredictor";

const FIELDS = [
  { name: "Age", label: "Age (years)", placeholder: "e.g. 45" },
  {
    name: "Sex (Male:1, Female:0)",
    label: "Sex",
    options: [
      { value: "1", label: "Male (1)" },
      { value: "0", label: "Female (0)" },
    ],
  },
  {
    name: "Chest Pain Type",
    label: "Chest Pain Type",
    options: [
      { value: "1", label: "Typical Angina (1)" },
      { value: "2", label: "Atypical Angina (2)" },
      { value: "3", label: "Non-Anginal Pain (3)" },
      { value: "4", label: "Asymptomatic (4)" },
    ],
  },
  { name: "Resting Blood Pressure (mm Hg)", label: "Resting Blood Pressure (mm Hg)", placeholder: "e.g. 120" },
  { name: "Serum Cholestoral (mg/dl)", label: "Serum Cholesterol (mg/dl)", placeholder: "e.g. 210" },
  {
    name: "Fasting Blood Sugar (1 = true; 0 = false)",
    label: "Fasting Blood Sugar > 120 mg/dl",
    options: [
      { value: "0", label: "False / <= 120 (0)" },
      { value: "1", label: "True / > 120 (1)" },
    ],
  },
  {
    name: "Resting Electrocardiographic Results",
    label: "Resting ECG Results",
    options: [
      { value: "0", label: "Normal (0)" },
      { value: "1", label: "ST-T Wave Abnormality (1)" },
      { value: "2", label: "Left Ventricular Hypertrophy (2)" },
    ],
  },
  { name: "Maximum heart rate achieved", label: "Max Heart Rate Achieved", placeholder: "e.g. 165" },
  {
    name: "Exercise Induced Angina (1 = yes; 0 = no)",
    label: "Exercise Induced Angina",
    options: [
      { value: "0", label: "No (0)" },
      { value: "1", label: "Yes (1)" },
    ],
  },
  { name: "ST Depression Induced by Exercise Relative to Rest", label: "ST Depression (Oldpeak)", placeholder: "e.g. 0.8" },
  {
    name: "Slope of the Peak Exercise ST Segment",
    label: "Slope of Peak Exercise ST",
    options: [
      { value: "1", label: "Upsloping (1)" },
      { value: "2", label: "Flat (2)" },
      { value: "3", label: "Downsloping (3)" },
    ],
  },
  {
    name: "Number of Major Vessels (0-3) Colored by Flourosopy",
    label: "Major Vessels (0-3)",
    options: [
      { value: "0", label: "0" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
    ],
  },
  {
    name: "3 = Normal; 6 = Fixed Defect; 7 = Reversable Defect",
    label: "Thalassemia (Thal)",
    options: [
      { value: "3", label: "Normal (3)" },
      { value: "6", label: "Fixed Defect (6)" },
      { value: "7", label: "Reversible Defect (7)" },
    ],
  },
];

const HeartDiseaseTest = () => (
  <TabularDiseasePredictor
    title="Heart Disease Predictor"
    endpoint="/heart"
    testName="Heart Disease Predictor"
    fields={FIELDS}
    healthySample={[37, 1, 3, 130, 250, 0, 0, 187, 0, 3.5, 3, 0, 3]}
    unhealthySample={[67, 1, 4, 160, 286, 0, 2, 108, 1, 1.5, 2, 3, 3]}
  />
);

export default HeartDiseaseTest;
