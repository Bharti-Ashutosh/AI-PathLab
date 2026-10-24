import React, { useContext, useEffect } from "react";
import Layout from "./layout/Layout";
import Admin from "./layout/Admin-Layout.jsx";
import { authContext } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const { user, role, token } = useContext(authContext);

  useEffect(() => {
    console.log("User: ", user);
    console.log("role: ", role);
    console.log("token: ", token);
  }, [user, role, token]);

  return (
    <>
      {token && role === "admin" ? <Admin /> : <Layout />}
      <Analytics />
    </>
  );
}

export default App;
