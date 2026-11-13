import React, { useState } from "react";
import convertTime from "../../utils/convertTime.js";
import { BASE_URL, getToken } from "./../../config.js";
import { toast } from "react-toastify";

const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
  const [loading, setLoading] = useState(false);

  const bookingHandler = async () => {
    const authToken = getToken();
    if (!authToken || authToken === "null" || authToken === "undefined") {
      toast.error("Please login first to book an appointment.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/bookings/checkout-session/${doctorId}`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment checkout failed. Please try again.");
      }

      if (data?.session?.url) {
        window.location.href = data.session.url;
      } else {
        throw new Error("Stripe checkout URL was not returned.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-panelShadow p-3 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Ticket Price</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
          {ticketPrice || 100} USD
        </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Available Time Slots:
        </p>

        {!timeSlots || timeSlots.length === 0 ? (
          <p className="text-sm text-textColor mt-2">
            Available by appointment daily (10:00 am - 05:00 pm)
          </p>
        ) : (
          <ul className="mt-3">
            {timeSlots.map((item, index) => {
              const day = item?.day || "Day";
              const start = item?.startingTime || item?.staringTime;
              const end = item?.endingTime;
              return (
                <li key={index} className="flex items-center justify-between mb-2">
                  <p className="text-[15px] leading-6 text-textColor font-semibold">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </p>
                  <p className="text-[15px] leading-6 text-textColor font-semibold">
                    {convertTime(start)} - {convertTime(end)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <button
        onClick={bookingHandler}
        disabled={loading}
        className="btn px-2 w-full rounded-md disabled:opacity-60"
      >
        {loading ? "Redirecting to Payment..." : "Book Appointment"}
      </button>
    </div>
  );
};

export default SidePanel;
