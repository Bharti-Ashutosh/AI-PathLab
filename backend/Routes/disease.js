import express from "express";
import { spawn } from "child_process";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../public/uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/**
 * Spawn a Python prediction script, buffer stdout/stderr, and send JSON `{ prediction }`.
 * Returns HTTP 500 on non-zero exit code or empty output instead of masking failures.
 */
function runPythonPrediction(args, res) {
  let responseSent = false;

  try {
    const pythonProcess = spawn("python", args);
    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on("close", (code) => {
      if (responseSent) return;
      responseSent = true;

      const trimmed = stdoutData.trim();
      if (code !== 0 || !trimmed) {
        console.error(`Python script failed (code=${code}):`, stderrData || stdoutData);
        return res.status(500).json({
          success: false,
          message: stderrData.trim() || "Prediction failed. Please check your input values.",
        });
      }

      return res.json({ prediction: trimmed });
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process spawn error:", error);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error invoking Python script:", error);
    if (!responseSent) {
      responseSent = true;
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
}

const TABULAR_TESTS = [
  { route: "/diabetes", script: "../predict.py", model: "../aimodels/diabetes.pkl" },
  { route: "/heart", script: "../heart.py", model: "../aimodels/heart.pkl" },
  { route: "/kidney", script: "../kidney.py", model: "../aimodels/kidney.pkl" },
  { route: "/liver", script: "../liver.py", model: "../aimodels/liver.pkl" },
  { route: "/breast-cancer", script: "../breast-cancer.py", model: "../aimodels/breast_cancer.pkl" },
];

for (const { route, script, model } of TABULAR_TESTS) {
  const scriptPath = path.join(__dirname, script);
  const modelPath = path.join(__dirname, model);

  router.post(route, (req, res) => {
    const data = req.body?.data;
    if (!data || (typeof data !== "object")) {
      return res.status(400).json({ success: false, message: "Missing input data." });
    }
    return runPythonPrediction([scriptPath, "--loads", modelPath, JSON.stringify(data)], res);
  });
}

const IMAGE_TESTS = [
  { route: "/predict-pneumonia", script: "../pneumonia.py" },
  { route: "/predict-malaria", script: "../malaria.py" },
];

for (const { route, script } of IMAGE_TESTS) {
  const scriptPath = path.join(__dirname, script);

  router.post(route, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file." });
    }
    return runPythonPrediction([scriptPath, req.file.path], res);
  });
}

export default router;
