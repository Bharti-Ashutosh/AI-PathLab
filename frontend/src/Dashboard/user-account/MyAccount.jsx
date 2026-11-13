import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "./../../context/AuthContext.jsx";
import defaultAvatar from "../../assets/images/avatar-icon.png";
import MyBookings from "./MyBookings.jsx";
import Profile from "./Profile.jsx";
import useGetProfile from "../../hooks/useFetchData.jsx";
import { BASE_URL, getToken } from "../../config.js";
import Loading from "../../components/Loader/Loading.jsx";
import Error from "../../components/Error/Error.jsx";
import { formateDate } from "../../utils/formatDate.js";
import { toast } from "react-toastify";

const LabBookingsPanel = () => {
  const {
    data: bookings = [],
    loading,
    error,
    refetch,
  } = useGetProfile(`${BASE_URL}/users/appointments/lab-bookings`);

  const handleStatusChange = async (bookingId, status) => {
    try {
      const res = await fetch(
        `${BASE_URL}/users/appointments/lab-bookings/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update status");
      }
      toast.success("Booking status updated");
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error errMessage={error} />;

  if (!bookings || bookings.length === 0) {
    return (
      <h2 className="mt-5 text-center leading-7 text-[18px] font-semibold text-primaryColor">
        No lab test bookings found yet.
      </h2>
    );
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full min-w-max bg-white border border-gray-200 rounded-md">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
            <th className="py-3 px-4 text-left">Patient</th>
            <th className="py-3 px-4 text-left">Doctor</th>
            <th className="py-3 px-4 text-left">Test / Service</th>
            <th className="py-3 px-4 text-left">Price</th>
            <th className="py-3 px-4 text-left">Paid</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {bookings.map((b) => (
            <tr key={b._id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 font-semibold">
                {b.user?.name || "Patient"}
              </td>
              <td className="py-3 px-4">{b.doctor?.name || "Doctor"}</td>
              <td className="py-3 px-4">
                {b.testName || "Lab Consultation"}
                {b.testResult ? ` (${b.testResult})` : ""}
              </td>
              <td className="py-3 px-4">${b.ticketPrice || "100"}</td>
              <td className="py-3 px-4">{b.isPaid ? "Yes" : "Pending"}</td>
              <td className="py-3 px-4">
                {formateDate(b.bookedOn || b.createdAt)}
              </td>
              <td className="py-3 px-4">
                <select
                  value={b.status || "pending"}
                  onChange={(e) => handleStatusChange(b._id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MyAccount = () => {
  const { dispatch, role } = useContext(authContext);
  const navigate = useNavigate();
  const isAssistant = role === "assistant";
  const [tab, setTab] = useState(isAssistant ? "lab-bookings" : "bookings");

  const {
    data: userData,
    loading,
    error,
    refetch,
  } = useGetProfile(`${BASE_URL}/users/profile/me`);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!userData?._id) return;
    if (!window.confirm("Are you sure you want to delete your account?")) {
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/users/${userData._id}`, {
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
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loading />}
        {error && !loading && <Error errMessage={error} />}
        {!loading && !error && (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="pb-[50px] px-[30px] rounded-md">
              <div className="flex items-center justify-center">
                <figure className="w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor overflow-hidden">
                  <img
                    src={userData?.photo || defaultAvatar}
                    alt={userData?.name || "User"}
                    className="w-full h-full object-cover rounded-full"
                  />
                </figure>
              </div>

              <div className="text-center mt-4">
                <span className="inline-block bg-[#CCF0F3] text-irisBlueColor text-xs font-bold px-3 py-1 rounded-full mb-2">
                  {isAssistant ? "Lab Assistant" : "Patient"}
                </span>
                <h3 className="text-[18px] leading-[30px] text-headingColor font-bold">
                  {userData?.name}
                </h3>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  {userData?.email}
                </p>
                {userData?.bloodType && (
                  <p className="text-textColor text-[15px] leading-6 font-medium">
                    Blood Type:{" "}
                    <span className="ml-2 text-irisBlueColor text-[16px] font-bold leading-8">
                      {userData.bloodType}
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-[50px] md:mt-[100px]">
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

            <div className="md:col-span-2 md:px-[30px]">
              <div className="flex flex-wrap gap-3">
                {isAssistant && (
                  <button
                    onClick={() => setTab("lab-bookings")}
                    className={`${
                      tab === "lab-bookings"
                        ? "bg-primaryColor text-white font-normal"
                        : "text-headingColor font-semibold"
                    } py-2 px-5 rounded-md text-[16px] leading-7 border border-solid border-primaryColor`}
                  >
                    Lab Bookings
                  </button>
                )}
                <button
                  onClick={() => setTab("bookings")}
                  className={`${
                    tab === "bookings"
                      ? "bg-primaryColor text-white font-normal"
                      : "text-headingColor font-semibold"
                  } py-2 px-5 rounded-md text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setTab("settings")}
                  className={`${
                    tab === "settings"
                      ? "bg-primaryColor text-white font-normal"
                      : "text-headingColor font-semibold"
                  } py-2 px-5 rounded-md text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  Profile Settings
                </button>
              </div>
              {tab === "lab-bookings" && isAssistant && <LabBookingsPanel />}
              {tab === "bookings" && <MyBookings />}
              {tab === "settings" && (
                <Profile
                  user={userData}
                  onUpdated={() => {
                    refetch();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
