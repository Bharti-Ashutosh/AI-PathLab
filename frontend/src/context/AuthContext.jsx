import { createContext, useEffect, useReducer } from "react";

const parseJSON = (value) => {
  if (!value || value === "null" || value === "undefined") return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

const getCleanString = (key) => {
  const val = localStorage.getItem(key);
  if (!val || val === "null" || val === "undefined") return null;
  return val;
};

const initialState = {
  user: parseJSON(localStorage.getItem("user")),
  role: getCleanString("role"),
  token: getCleanString("token"),
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        role: null,
        token: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        role: null,
        token: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }

    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }

    if (state.role) {
      localStorage.setItem("role", state.role);
    } else {
      localStorage.removeItem("role");
    }
  }, [state]);

  return (
    <authContext.Provider
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        dispatch,
      }}
    >
      {children}
    </authContext.Provider>
  );
};
