import React, { useContext, useState } from "react";
import { BiMenu } from "react-icons/bi";
import { authContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL, getToken } from "../../config";
import { toast } from "react-toastify";

const Tabs = ({ tab, setTab, doctorId }) => {
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!doctorId) return;
    if (!window.confirm("Are you sure you want to delete your doctor account?")) {
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to delete account");
      }
      toast.success("Account deleted");
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <span
        className="lg:hidden inline-flex items-center gap-2 mb-4 cursor-pointer"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <BiMenu className="w-6 h-6" />
        <span className="font-semibold">Menu</span>
      </span>
      <div
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } lg:flex flex-col p-[30px] bg-white shadow-panelShadow items-center h-max rounded-md`}
      >
        <button
          onClick={() => {
            setTab("overview");
            setMobileMenuOpen(false);
          }}
          className={`${
            tab === "overview"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          Overview
        </button>

        <button
          onClick={() => {
            setTab("appointments");
            setMobileMenuOpen(false);
          }}
          className={`${
            tab === "appointments"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          Appointments
        </button>

        <button
          onClick={() => {
            setTab("settings");
            setMobileMenuOpen(false);
          }}
          className={`${
            tab === "settings"
              ? "bg-indigo-100 text-primaryColor"
              : "bg-transparent text-headingColor"
          } w-full btn mt-0 rounded-md`}
        >
          Settings
        </button>

        <div className="mt-[100px] w-full">
          <button
            onClick={handleLogout}
            className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="mt-4 w-full bg-red-600 p-3 text-[16px] leading-7 rounded-md text-white"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
