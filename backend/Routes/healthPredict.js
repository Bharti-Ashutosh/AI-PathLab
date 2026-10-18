import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router({ mergeParams: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pythonScriptPathForSymptoms = path.join(__dirname, "../symptoms.py");
const symptomsModel = path.join(__dirname, "../aimodels/svc.pkl");

router.post("/symptoms", (req, res) => {
  let responseSent = false;

  try {
    const data = req.body.data;

    if (!data || (typeof data === "string" && !data.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter at least one symptom.",
      });
    }

    const pythonProcess = spawn("python", [
      pythonScriptPathForSymptoms,
      "--loads",
      symptomsModel,
      JSON.stringify({ data }),
    ]);

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

      if (code !== 0) {
        console.error("Symptoms python script error (exit code " + code + "):", stderrData);
        responseSent = true;
        return res.status(500).json({
          success: false,
          message: "Prediction process failed. Please try again.",
        });
      }

      try {
        const trimmed = stdoutData.trim();
        const jsonStart = trimmed.indexOf("{");
        const jsonEnd = trimmed.lastIndexOf("}");

        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("No JSON object in script output");
        }

        const jsonStr = trimmed.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);

        responseSent = true;
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (parseErr) {
        console.error("Failed to parse symptoms output:", parseErr, "Output was:", stdoutData);
        responseSent = true;
        return res.status(500).json({
          success: false,
          message: "Failed to parse prediction result.",
        });
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Symptoms process spawn error:", error);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({
          success: false,
          message: "Internal server error starting prediction engine.",
        });
      }
    });
  } catch (error) {
    console.error("Symptoms route catch error:", error);
    if (!responseSent) {
      responseSent = true;
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
});

export default router;