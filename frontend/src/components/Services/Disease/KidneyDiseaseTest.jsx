import React from "react";
import TabularDiseasePredictor from "./TabularDiseasePredictor";

const YES_NO_OPTIONS = [
  { value: "0", label: "No (0)" },
  { value: "1", label: "Yes (1)" },
];

const NORMAL_ABNORMAL_OPTIONS = [
  { value: "0", label: "Normal (0)" },
  { value: "1", label: "Abnormal (1)" },
];

const PRESENT_OPTIONS = [
  { value: "0", label: "Not Present (0)" },
  { value: "1", label: "Present (1)" },
];

const FIELDS = [
  { name: "Age", label: "Age (years)", placeholder: "e.g. 40" },
  { name: "BP", label: "Blood Pressure (mm/Hg)", placeholder: "e.g. 80" },
  { name: "AL", label: "Albumin (0 - 5)", placeholder: "e.g. 0" },
  { name: "SU", label: "Sugar (0 - 5)", placeholder: "e.g. 0" },
  { name: "RBC", label: "Red Blood Cells (RBC)", options: NORMAL_ABNORMAL_OPTIONS },
  { name: "PC", label: "Pus Cell (PC)", options: NORMAL_ABNORMAL_OPTIONS },
  { name: "PCC", label: "Pus Cell Clumps (PCC)", options: PRESENT_OPTIONS },
  { name: "BA", label: "Bacteria (BA)", options: PRESENT_OPTIONS },
  { name: "BGR", label: "Blood Glucose Random (mg/dL)", placeholder: "e.g. 95" },
  { name: "BU", label: "Blood Urea (mg/dL)", placeholder: "e.g. 25" },
  { name: "SC", label: "Serum Creatinine (mg/dL)", placeholder: "e.g. 0.9" },
  { name: "POT", label: "Potassium (mEq/L)", placeholder: "e.g. 4.2" },
  { name: "WC", label: "White Blood Cell Count (cells/cumm)", placeholder: "e.g. 7500" },
  { name: "HTN", label: "Hypertension (HTN)", options: YES_NO_OPTIONS },
  { name: "DM", label: "Diabetes Mellitus (DM)", options: YES_NO_OPTIONS },
  { name: "CAD", label: "Coronary Artery Disease (CAD)", options: YES_NO_OPTIONS },
  { name: "PE", label: "Pedal Edema (PE)", options: YES_NO_OPTIONS },
  { name: "ANE", label: "Anemia (ANE)", options: YES_NO_OPTIONS },
];

const KidneyDiseaseTest = () => (
  <TabularDiseasePredictor
    title="Kidney Disease Predictor"
    endpoint="/kidney"
    testName="Kidney Disease Predictor"
    fields={FIELDS}
    healthySample={[40, 80, 0, 0, 0, 0, 0, 0, 95, 25, 0.9, 4.2, 7500, 0, 0, 0, 0, 0]}
    unhealthySample={[62, 80, 2, 3, 0, 0, 0, 0, 423, 53, 1.8, 4.5, 7500, 1, 1, 0, 0, 1]}
  />
);

export default KidneyDiseaseTest;
