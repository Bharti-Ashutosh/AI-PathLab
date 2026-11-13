import React from "react";
import ImageDiseasePredictor from "./ImageDiseasePredictor";

const MalariaDiseaseTest = () => (
  <ImageDiseasePredictor
    title="Malaria Predictor"
    uploadPrompt="Please upload the blood cell image"
    endpoint="/predict-malaria"
    positiveMessage="This cell is an Infected Malarial Cell."
    negativeMessage="This cell is not Infected."
    testName="Malaria Disease"
  />
);

export default MalariaDiseaseTest;
