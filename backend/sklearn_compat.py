"""
sklearn_compat.py
-----------------
Compatibility shim for loading scikit-learn pickle models trained with
scikit-learn 0.21.x on modern scikit-learn (1.x+).

Between 0.21 and 1.x, sklearn moved many internal modules from public
paths (e.g. sklearn.ensemble.forest) to private ones (sklearn.ensemble._forest).
Pickle stores the full module path, so loading on 1.x raises ModuleNotFoundError.

Import this module BEFORE loading any .pkl file to patch sys.modules.
"""

import sys
import sklearn.ensemble._forest
import sklearn.ensemble._gb
import sklearn.ensemble._bagging
import sklearn.ensemble._voting
import sklearn.tree._classes
import sklearn.tree._tree
import sklearn.linear_model._logistic
import sklearn.linear_model._base
import sklearn.linear_model._ridge
import sklearn.svm._base
import sklearn.svm._classes
import sklearn.neighbors._base
import sklearn.neighbors._classification
import sklearn.neighbors._regression
import sklearn.naive_bayes
import sklearn.preprocessing._data
import sklearn.preprocessing._label
import sklearn.preprocessing._encoders

# Map old public module paths → new private module paths
_COMPAT_MAP = {
    # ensemble
    "sklearn.ensemble.forest":         sklearn.ensemble._forest,
    "sklearn.ensemble.gradient_boosting": sklearn.ensemble._gb,
    "sklearn.ensemble.bagging":        sklearn.ensemble._bagging,
    "sklearn.ensemble.voting_classifier": sklearn.ensemble._voting,
    "sklearn.ensemble.weight_boosting": sklearn.ensemble._weight_boosting,
    # tree
    "sklearn.tree.tree":               sklearn.tree._classes,
    "sklearn.tree._tree":              sklearn.tree._tree,
    # linear_model
    "sklearn.linear_model.logistic":   sklearn.linear_model._logistic,
    "sklearn.linear_model.base":       sklearn.linear_model._base,
    "sklearn.linear_model.ridge":      sklearn.linear_model._ridge,
    # svm
    "sklearn.svm.base":                sklearn.svm._base,
    "sklearn.svm.classes":             sklearn.svm._classes,
    # neighbors
    "sklearn.neighbors.base":          sklearn.neighbors._base,
    "sklearn.neighbors.classification": sklearn.neighbors._classification,
    "sklearn.neighbors.regression":    sklearn.neighbors._regression,
    # preprocessing
    "sklearn.preprocessing.data":      sklearn.preprocessing._data,
    "sklearn.preprocessing.label":     sklearn.preprocessing._label,
    "sklearn.preprocessing":           sklearn.preprocessing,
}

# Also try to import weight_boosting (may not exist in all versions)
try:
    import sklearn.ensemble._weight_boosting
    _COMPAT_MAP["sklearn.ensemble.weight_boosting"] = sklearn.ensemble._weight_boosting
except ImportError:
    pass

for old_path, module in _COMPAT_MAP.items():
    sys.modules.setdefault(old_path, module)

