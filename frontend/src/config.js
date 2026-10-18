export const BASE_URL = "http://localhost:5000/api/v1";

export const getToken = () => localStorage.getItem("token") || "";

export const token = {
  toString() {
    return localStorage.getItem("token") || "";
  },
  valueOf() {
    return localStorage.getItem("token") || "";
  },
  [Symbol.toPrimitive]() {
    return localStorage.getItem("token") || "";
  },
};
