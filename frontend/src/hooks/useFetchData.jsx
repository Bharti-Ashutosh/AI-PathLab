import { useCallback, useEffect, useState } from "react";

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const refetch = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!url) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
          headers["Authorization"] = `Bearer ${token.trim()}`;
        }

        const res = await fetch(url, { headers });
        const result = await res.json();

        if (!res.ok) {
          if (
            res.status === 401 &&
            (result.message === "Invalid token" ||
              result.message === "Token is expired" ||
              result.message?.toLowerCase().includes("token"))
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
          }
          throw new Error(result.message || "Something went wrong");
        }
        setData(result.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message);
      }
    };
    fetchData();
  }, [url, reloadTick]);

  return { data, loading, error, refetch };
};

export default useFetchData;
