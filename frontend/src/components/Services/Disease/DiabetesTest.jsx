import React from "react";
import TabularDiseasePredictor from "./TabularDiseasePredictor";

const FIELDS = [
  { name: "Number of Pregnancies eg. 0", label: "Pregnancies", placeholder: "e.g. 0" },
  { name: "Glucose (mg/dL) eg. 80", label: "Glucose (mg/dL)", placeholder: "e.g. 85" },
  { name: "Blood Pressure (mmHg) eg. 80", label: "Blood Pressure (mmHg)", placeholder: "e.g. 70" },
  { name: "Skin Thickness (mm) eg. 20", label: "Skin Thickness (mm)", placeholder: "e.g. 20" },
  { name: "Insulin Level (IU/mL) eg. 80", label: "Insulin Level (IU/mL)", placeholder: "e.g. 80" },
  { name: "Body Mass Index (kg/m²) eg. 23.1", label: "Body Mass Index (BMI kg/m²)", placeholder: "e.g. 23.1" },
  { name: "Diabetes Pedigree Function eg. 0.52", label: "Diabetes Pedigree Function", placeholder: "e.g. 0.52" },
  { name: "Age (years) eg. 34", label: "Age (years)", placeholder: "e.g. 34" },
];

const DiabetesTest = () => (
  <TabularDiseasePredictor
    title="Diabetes Predictor"
    endpoint="/diabetes"
    testName="Diabetes Disease Predictor"
    fields={FIELDS}
    gridColsClass="grid-cols-1 md:grid-cols-2"
    healthySample={[0, 85, 66, 29, 0, 26.6, 0.351, 31]}
    unhealthySample={[6, 180, 72, 35, 150, 36.6, 0.627, 50]}
  />
);

export default DiabetesTest;
