import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";
import DoctorsDropDown from "../../DoctorDropDown/DoctorDropDown";

const ImageDiseasePredictor = ({
  title,
  uploadPrompt,
  endpoint,
  positiveMessage,
  negativeMessage,
  testName,
}) => {
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePreview = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormError("");
    setPrediction(null);
    setConfidence(null);
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setFormError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setFormError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let pred = response.data?.prediction;
      if (typeof pred === "string") {
        pred = JSON.parse(pred.trim());
      }

      if (!Array.isArray(pred) || pred.length < 2) {
        throw new Error("Invalid prediction response from model.");
      }

      // Softmax argmax: index 0 = Healthy/Normal/Uninfected, index 1 = Diseased/Infected
      const classification = Number(pred[1]) > Number(pred[0]) ? 1 : 0;
      const confPct = (Math.max(Number(pred[0]), Number(pred[1])) * 100).toFixed(1);

      setPrediction(classification);
      setConfidence(confPct);
    } catch (error) {
      console.error("Image prediction error:", error);
      setPrediction(null);
      setConfidence(null);
      setFormError(
        error.response?.data?.message ||
          "Prediction failed. Please upload a valid image and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-5 flex flex-col justify-center items-center min-h-screen py-8">
      <div className="w-full max-w-2xl px-4">
        <form
          className="bg-white shadow-lg rounded-xl border border-gray-200 px-8 pt-6 pb-8 mb-6"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <h1 className="text-center font-bold text-3xl mb-4 text-gray-800">
            {title}
          </h1>
          <div className="mb-4">
            <h3 className="text-center font-semibold text-xl mb-3 text-gray-600">
              {uploadPrompt}
            </h3>
            <input
              onChange={handleImagePreview}
              type="file"
              name="image"
              accept="image/*"
              className="py-2 px-4 w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {imagePreview && (
            <div className="mb-4 flex justify-center">
              <img
                className="rounded-lg border border-gray-300 object-contain"
                src={imagePreview}
                alt="Uploaded Preview"
                style={{ maxHeight: "300px", maxWidth: "100%" }}
              />
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-center font-medium">
              {formError}
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg focus:outline-none disabled:opacity-60"
            >
              {isLoading ? "Analyzing..." : "Predict"}
            </button>
          </div>
        </form>

        {prediction !== null && (
          <div className="mt-3 mb-6">
            <div
              className={`${
                prediction === 1
                  ? "bg-red-100 border border-red-400 text-red-800"
                  : "bg-green-100 border border-green-400 text-green-800"
              } rounded-xl p-5 shadow-sm text-center`}
            >
              <h3 className="text-2xl font-bold">
                {prediction === 1 ? positiveMessage : negativeMessage}
              </h3>
              {confidence !== null && (
                <p className="text-sm mt-1 opacity-80">
                  Model confidence: {confidence}%
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <DoctorsDropDown
          testName={testName}
          testResult={prediction === 1 ? "Unhealthy" : "Healthy"}
        />
      </div>
    </div>
  );
};

export default ImageDiseasePredictor;
