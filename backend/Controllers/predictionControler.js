import path from "path";
import { fileURLToPath } from "url";
import PythonShell from "python-shell";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const predictDiabetes = (req, res) => {
  const data = req.body;

  console.log("Diabetes input:", data);

  const options = {
    mode: "text",
    args: [JSON.stringify(data)],
    pythonOptions: ["-u"],
  };

  const pythonScript = path.join(__dirname, "../predict.py");

  console.log("Python script:", pythonScript);

  PythonShell.run(pythonScript, options, (err, result) => {
    if (err) {
      console.error("Python error:", err);
      return res.status(500).json({
        success: false,
        message: "Python prediction failed",
      });
    }

    try {
      console.log("Python result:", result);

      const prediction = JSON.parse(result[0]);

      return res.status(200).json({
        success: true,
        prediction,
      });
    } catch (error) {
      console.error("Prediction parsing error:", error);

      return res.status(500).json({
        success: false,
        message: "Invalid prediction returned by Python",
      });
    }
  });
};

export const predictCancer = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Cancer prediction not implemented yet",
  });
};

export const predictHeart = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Heart prediction not implemented yet",
  });
};

export const predictKidney = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Kidney prediction not implemented yet",
  });
};

export const predictLiver = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Liver prediction not implemented yet",
  });
};

export const predictMalaria = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Malaria prediction not implemented yet",
  });
};

export const predictPneumonia = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Pneumonia prediction not implemented yet",
  });
};