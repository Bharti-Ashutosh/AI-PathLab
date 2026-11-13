import React from "react";
import { formateDate } from "../../utils/formatDate.js";

const Appointments = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-md text-textColor">
        No appointments booked yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max bg-white border-gray-300 border rounded-md">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-xs leading-4 uppercase">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Gender</th>
            <th className="py-3 px-6 text-left">Payment / Status</th>
            <th className="py-3 px-6 text-left">Price</th>
            <th className="py-3 px-6 text-left">Booked on</th>
            <th className="py-3 px-6 text-left">Test / Service</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {appointments.map((item, idx) => (
            <tr
              key={item._id || idx}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="text-sm font-semibold">
                  {item.user?.name || item.patientName || "Patient"}
                </div>
              </td>
              <td className="py-3 px-6 text-left">
                {item.user?.gender || item.patientGender || "N/A"}
              </td>
              <td className="py-3 px-6 text-left">
                {item.isPaid ? "Paid" : item.status || item.payment || "Pending"}
              </td>
              <td className="py-3 px-6 text-left">
                ${item.ticketPrice || item.price || "100"}
              </td>
              <td className="py-3 px-6 text-left">
                {formateDate(item.updatedAt || item.createdAt || item.bookedOn)}
              </td>
              <td className="py-3 px-6 text-left">
                {item.testName || "Doctor Consultation"}
                {item.testResult ? ` (${item.testResult})` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;
