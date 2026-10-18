import sys
import os
import sklearn_compat  # patches old sklearn module paths for Python 3.13 compat
import numpy as np
import pickle
import json

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'aimodels', 'kidney.pkl')

with open(model_path, 'rb') as f:
    model = pickle.load(f)

data = list(json.loads(sys.argv[3]).values())
data_array = np.array(data).reshape(1, -1)
prediction = model.predict(data_array)
print(json.dumps(prediction.tolist()), flush=True)