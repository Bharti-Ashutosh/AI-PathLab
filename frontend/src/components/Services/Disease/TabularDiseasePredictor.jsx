import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";
import DoctorsDropDown from "../../DoctorDropDown/DoctorDropDown";

const parseBinaryPrediction = (raw) => {
  if (typeof raw === "number") return raw === 1 ? 1 : 0;
  if (Array.isArray(raw)) return Number(raw[0]) === 1 ? 1 : 0;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed)) return Number(parsed[0]) === 1 ? 1 : 0;
      return Number(parsed) === 1 ? 1 : 0;
    } catch {
      return raw.includes("[1]") || raw.trim() === "1" ? 1 : 0;
    }
  }
  return 0;
};

const TabularDiseasePredictor = ({
  title,
  endpoint,
  testName,
  fields,
  healthySample,
  unhealthySample,
  gridColsClass = "grid-cols-1 md:grid-cols-3",
}) => {
  const buildInitialState = () =>
    fields.reduce((acc, f) => {
      acc[f.name] = "";
      return acc;
    }, {});

  const [inputData, setInputData] = useState(buildInitialState);
  const [prediction, setPrediction] = useState(null);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setPrediction(null);
  };

  const applySample = (sampleValues) => {
    const next = {};
    fields.forEach((f, idx) => {
      next[f.name] = String(sampleValues[idx] ?? "");
    });
    setInputData(next);
    setFormError("");
    setPrediction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormFilled = Object.values(inputData).every(
      (value) => String(value).trim() !== ""
    );
    if (!isFormFilled) {
      setFormError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setFormError("");

    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, {
        data: inputData,
      });
      const label = parseBinaryPrediction(response.data?.prediction);
      setPrediction(label);
    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction(null);
      setFormError(
        error.response?.data?.message ||
          "Failed to generate prediction. Please check your input values."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-5 flex flex-col items-center mb-32 px-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-3xl font-bold mb-4 text-gray-800">
          {title}
        </h1>

        {(healthySample || unhealthySample) && (
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {healthySample && (
              <button
                type="button"
                onClick={() => applySample(healthySample)}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-1.5 px-4 rounded-lg border border-green-300"
              >
                Fill Healthy Sample
              </button>
            )}
            {unhealthySample && (
              <button
                type="button"
                onClick={() => applySample(unhealthySample)}
                className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-4 rounded-lg border border-amber-300"
              >
                Fill High-Risk Sample
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setInputData(buildInitialState());
                setPrediction(null);
                setFormError("");
              }}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-4 rounded-lg border border-gray-300"
            >
              Clear
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-300 shadow-md rounded-xl p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <div className={`grid ${gridColsClass} gap-4`}>
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-xs font-semibold text-gray-700 mb-1"
                  >
                    {field.label || field.name}
                  </label>
                  {field.options ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={inputData[field.name]}
                      onChange={handleInputChange}
                      className="border border-gray-400 rounded-md p-2 w-full bg-white text-gray-800 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select --</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      className="border border-gray-400 rounded-md p-2 w-full text-gray-800 focus:border-blue-500 focus:outline-none"
                      type="number"
                      step="any"
                      name={field.name}
                      placeholder={field.placeholder || field.name}
                      value={inputData[field.name]}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg font-medium text-center">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-full w-full mt-6 transition disabled:opacity-60"
            >
              {isLoading ? "Predicting..." : "Predict"}
            </button>
          </form>

          {prediction !== null && (
            <div
              className={`mt-5 p-4 rounded-xl border text-center text-2xl font-bold ${
                prediction === 1
                  ? "bg-red-100 border-red-400 text-red-800"
                  : "bg-green-100 border-green-400 text-green-800"
              }`}
            >
              <h3>
                {prediction === 1
                  ? "Sorry! High risk detected — Please consult your doctor."
                  : "Great! You are HEALTHY."}
              </h3>
            </div>
          )}
        </div>
      </div>

      <DoctorsDropDown
        testName={testName}
        testResult={prediction === 1 ? "Unhealthy" : "Healthy"}
      />
    </div>
  );
};

export default TabularDiseasePredictor;
