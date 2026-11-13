import React from "react";
import TabularDiseasePredictor from "./TabularDiseasePredictor";

const FIELDS = [
  { name: "radius_mean", label: "Radius Mean", placeholder: "e.g. 13.54" },
  { name: "texture_mean", label: "Texture Mean", placeholder: "e.g. 14.36" },
  { name: "perimeter_mean", label: "Perimeter Mean", placeholder: "e.g. 87.46" },
  { name: "area_mean", label: "Area Mean", placeholder: "e.g. 566.3" },
  { name: "smoothness_mean", label: "Smoothness Mean", placeholder: "e.g. 0.0978" },
  { name: "compactness_mean", label: "Compactness Mean", placeholder: "e.g. 0.0813" },
  { name: "concavity_mean", label: "Concavity Mean", placeholder: "e.g. 0.0666" },
  { name: "concave_points_mean", label: "Concave Points Mean", placeholder: "e.g. 0.0478" },
  { name: "symmetry_mean", label: "Symmetry Mean", placeholder: "e.g. 0.1885" },
  { name: "radius_se", label: "Radius SE", placeholder: "e.g. 0.2699" },
  { name: "perimeter_se", label: "Perimeter SE", placeholder: "e.g. 2.058" },
  { name: "area_se", label: "Area SE", placeholder: "e.g. 23.56" },
  { name: "compactness_se", label: "Compactness SE", placeholder: "e.g. 0.0146" },
  { name: "concavity_se", label: "Concavity SE", placeholder: "e.g. 0.0239" },
  { name: "concave_points_se", label: "Concave Points SE", placeholder: "e.g. 0.0132" },
  { name: "fractal_dimension_se", label: "Fractal Dimension SE", placeholder: "e.g. 0.0023" },
  { name: "radius_worst", label: "Radius Worst", placeholder: "e.g. 15.11" },
  { name: "texture_worst", label: "Texture Worst", placeholder: "e.g. 19.26" },
  { name: "perimeter_worst", label: "Perimeter Worst", placeholder: "e.g. 99.7" },
  { name: "area_worst", label: "Area Worst", placeholder: "e.g. 711.2" },
  { name: "smoothness_worst", label: "Smoothness Worst", placeholder: "e.g. 0.144" },
  { name: "compactness_worst", label: "Compactness Worst", placeholder: "e.g. 0.1773" },
  { name: "concavity_worst", label: "Concavity Worst", placeholder: "e.g. 0.239" },
  { name: "concave_points_worst", label: "Concave Points Worst", placeholder: "e.g. 0.1288" },
  { name: "symmetry_worst", label: "Symmetry Worst", placeholder: "e.g. 0.2977" },
  { name: "fractal_dimension_worst", label: "Fractal Dimension Worst", placeholder: "e.g. 0.0726" },
];

const BreastCancerPredictor = () => (
  <TabularDiseasePredictor
    title="Breast Cancer Disease Predictor"
    endpoint="/breast-cancer"
    testName="Breast Cancer Predictor"
    fields={FIELDS}
    healthySample={[
      13.54, 14.36, 87.46, 566.3, 0.0978, 0.0813, 0.0666, 0.0478, 0.1885,
      0.2699, 2.058, 23.56, 0.0146, 0.0239, 0.0132, 0.0023,
      15.11, 19.26, 99.7, 711.2, 0.144, 0.1773, 0.239, 0.1288, 0.2977, 0.0726,
    ]}
    unhealthySample={[
      17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419,
      1.095, 8.589, 153.4, 0.049, 0.0537, 0.0159, 0.0062,
      25.38, 17.33, 184.6, 2019.0, 0.1622, 0.6656, 0.7119, 0.2654, 0.4601, 0.1189,
    ]}
  />
);

export default BreastCancerPredictor;
