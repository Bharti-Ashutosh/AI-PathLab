import React from "react";
import ImageDiseasePredictor from "./ImageDiseasePredictor";

const PneumoniaDiseaseTest = () => (
  <ImageDiseasePredictor
    title="Pneumonia Predictor"
    uploadPrompt="Please upload the Chest X-Ray image"
    endpoint="/predict-pneumonia"
    positiveMessage="This X-Ray is predicted to have Pneumonia, Please Consult Doctor."
    negativeMessage="This X-Ray does not have Pneumonia."
    testName="Pneumonia Disease Predictor"
  />
);

export default PneumoniaDiseaseTest;
