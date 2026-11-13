"""Shared inference helper for tabular disease classification scripts."""

import json
import os
import pickle
import sys
import warnings

warnings.filterwarnings("ignore")

import numpy as np
import sklearn_compat  # noqa: F401 - patches old sklearn module paths for Python 3.13 compat

_TEXT_CATEGORY_MAP = {
    "normal": 0.0,
    "abnormal": 1.0,
    "notpresent": 0.0,
    "not_present": 0.0,
    "not present": 0.0,
    "present": 1.0,
    "no": 0.0,
    "yes": 1.0,
    "false": 0.0,
    "true": 1.0,
    "female": 0.0,
    "f": 0.0,
    "male": 1.0,
    "m": 1.0,
}


def _to_float(val):
    """Convert numeric string, number, or common clinical category text to float."""
    if isinstance(val, (int, float)):
        return float(val)
    text = str(val).strip()
    lower = text.lower()
    if lower in _TEXT_CATEGORY_MAP:
        return _TEXT_CATEGORY_MAP[lower]
    return float(text)


def run_tabular_prediction(model_filename):
    """Load `aimodels/<model_filename>`, parse CLI JSON payload, and print JSON list to stdout."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "aimodels", model_filename)

    if len(sys.argv) < 2:
        print("Missing input JSON argument", file=sys.stderr)
        sys.exit(1)

    raw_arg = sys.argv[3] if len(sys.argv) >= 4 else sys.argv[-1]
    try:
        payload = json.loads(raw_arg)
    except Exception as exc:
        print(f"Invalid JSON input: {exc}", file=sys.stderr)
        sys.exit(1)

    raw_values = list(payload.values()) if isinstance(payload, dict) else list(payload)
    try:
        numeric_values = [_to_float(v) for v in raw_values]
    except ValueError as exc:
        print(f"All input fields must be valid numbers: {exc}", file=sys.stderr)
        sys.exit(1)

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    data_array = np.array(numeric_values, dtype=np.float64).reshape(1, -1)
    expected = getattr(model, "n_features_in_", None)
    if expected is not None and data_array.shape[1] != expected:
        print(
            f"Expected {expected} features for {model_filename}, got {data_array.shape[1]}",
            file=sys.stderr,
        )
        sys.exit(1)

    prediction = model.predict(data_array)
    print(json.dumps(prediction.tolist()), flush=True)
