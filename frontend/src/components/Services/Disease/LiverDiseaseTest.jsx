import React from "react";
import TabularDiseasePredictor from "./TabularDiseasePredictor";

const FIELDS = [
  { name: "Age", label: "Age (years)", placeholder: "e.g. 35" },
  { name: "Total Bilirubin", label: "Total Bilirubin (mg/dL)", placeholder: "e.g. 0.7" },
  { name: "Direct Bilirubin", label: "Direct Bilirubin (mg/dL)", placeholder: "e.g. 0.2" },
  { name: "Alkaline Phosphotase", label: "Alkaline Phosphatase (IU/L)", placeholder: "e.g. 160" },
  { name: "Alamine Aminotransferase", label: "Alamine Aminotransferase / ALT (IU/L)", placeholder: "e.g. 22" },
  { name: "Aspartate Aminotransferase", label: "Aspartate Aminotransferase / AST (IU/L)", placeholder: "e.g. 24" },
  { name: "Total Protiens", label: "Total Proteins (g/dL)", placeholder: "e.g. 7.0" },
  { name: "Albumin", label: "Albumin (g/dL)", placeholder: "e.g. 4.1" },
  { name: "Albumin and Globulin Ratio", label: "Albumin / Globulin Ratio", placeholder: "e.g. 1.4" },
  {
    name: "Gender(Male: 1, Female: 0)",
    label: "Gender",
    options: [
      { value: "1", label: "Male (1)" },
      { value: "0", label: "Female (0)" },
    ],
  },
];

const LiverDiseaseTest = () => (
  <TabularDiseasePredictor
    title="Liver Disease Predictor"
    endpoint="/liver"
    testName="Liver Disease Predictor"
    fields={FIELDS}
    healthySample={[28, 0.7, 0.2, 160, 22, 24, 7.0, 4.1, 1.4, 1]}
    unhealthySample={[62, 10.9, 5.5, 699, 64, 100, 7.5, 3.2, 0.74, 1]}
  />
);

export default LiverDiseaseTest;
