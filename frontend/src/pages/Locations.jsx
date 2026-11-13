import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useFetchData from "../hooks/useFetchData";
import { BASE_URL } from "../config";
import Loader from "../components/Loader/Loading";
import Error from "../components/Error/Error";
import { BsArrowRight } from "react-icons/bs";

const CLINIC_CENTERS = [
  {
    name: "AI-PathLab Central Diagnostic Center",
    address: "120 Medical Plaza, Sector 14, New Delhi",
    hours: "Mon - Sun: 7:00 AM - 9:00 PM",
    phone: "+91 11-4000-1122",
    services: ["Blood Tests", "X-Ray & Radiology", "AI Screening", "Specialist Consultation"],
  },
  {
    name: "City Hospital & Pathology Wing",
    address: "45 Health Avenue, Civil Lines, Raipur",
    hours: "Mon - Sat: 8:00 AM - 8:00 PM",
    phone: "+91 771-402-3344",
    services: ["Kidney & Liver Panel", "Cardiac Screening", "Malaria & Blood Smear Lab"],
  },
  {
    name: "AIIMS Partner Diagnostics & Clinic",
    address: "88 Ring Road, Ansari Nagar East, Delhi",
    hours: "Mon - Sat: 8:00 AM - 7:00 PM",
    phone: "+91 11-2658-8500",
    services: ["Oncology Diagnostics", "Pulmonology & Chest X-Ray", "Doctor Consultation"],
  },
];

const Locations = () => {
  const [search, setSearch] = useState("");
  const { data: doctors = [], loading, error } = useFetchData(`${BASE_URL}/doctors`);

  const locations = useMemo(() => {
    const map = new Map();

    CLINIC_CENTERS.forEach((center) => {
      map.set(center.name.toLowerCase(), {
        ...center,
        doctors: [],
      });
    });

    if (Array.isArray(doctors)) {
      doctors.forEach((doc) => {
        const expList = Array.isArray(doc.experiences) && doc.experiences.length > 0
          ? doc.experiences
          : [{ hospital: "AI-PathLab Central Diagnostic Center", position: doc.specialization || "Doctor" }];

        expList.forEach((exp) => {
          const hospitalName = exp?.hospital?.trim();
          if (!hospitalName) return;
          const key = hospitalName.toLowerCase();
          if (!map.has(key)) {
            map.set(key, {
              name: hospitalName,
              address: "Partner Clinic & Diagnostic Center",
              hours: "Mon - Sat: 9:00 AM - 6:00 PM",
              phone: "Book online for clinic desk contact",
              services: [doc.specialization || "General Consultation"],
              doctors: [],
            });
          }
          const entry = map.get(key);
          if (!entry.doctors.some((d) => d._id === doc._id)) {
            entry.doctors.push(doc);
          }
        });
      });
    }

    return Array.from(map.values());
  }, [doctors]);

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.services.some((s) => s.toLowerCase().includes(q)) ||
        loc.doctors.some(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.specialization?.toLowerCase().includes(q)
        )
    );
  }, [locations, search]);

  return (
    <>
      <section className="bg-[#fff9ea]">
        <div className="container text-center">
          <h2 className="heading">Find a Location</h2>
          <p className="text__para max-w-[600px] mx-auto mt-3">
            Locate AI-PathLab diagnostic centers and partner hospitals to visit or book an appointment with our doctors.
          </p>
          <div className="max-w-[570px] mt-[30px] mx-auto bg-[#0066ff2c] rounded-md flex items-center justify-between">
            <input
              type="search"
              className="py-4 pl-4 pr-2 bg-transparent w-full focus:outline-none placeholder:text-textColor"
              placeholder="Search by hospital, city, doctor, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setSearch(search.trim())}
              className="btn mt-0 rounded-[0px] rounded-r-md"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          {loading && <Loader />}
          {error && <Error errMessage={error} />}
          {!loading && !error && (
            <>
              {filteredLocations.length === 0 ? (
                <p className="text-center text-textColor text-lg">
                  No clinic locations matched &quot;{search}&quot;.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-[20px] font-bold text-headingColor">
                          {loc.name}
                        </h3>
                        <p className="text-sm text-textColor mt-2">
                          <span className="font-semibold">Address:</span> {loc.address}
                        </p>
                        <p className="text-sm text-textColor mt-1">
                          <span className="font-semibold">Hours:</span> {loc.hours}
                        </p>
                        <p className="text-sm text-textColor mt-1">
                          <span className="font-semibold">Contact:</span> {loc.phone}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {loc.services.map((srv, sIdx) => (
                            <span
                              key={sIdx}
                              className="bg-[#CCF0F3] text-irisBlueColor text-xs font-semibold px-2.5 py-1 rounded"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>

                        {loc.doctors.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                              Available Doctors ({loc.doctors.length})
                            </p>
                            <ul className="space-y-1.5">
                              {loc.doctors.map((doc) => (
                                <li key={doc._id}>
                                  <Link
                                    to={`/doctors/${doc._id}`}
                                    className="text-sm font-semibold text-primaryColor hover:underline flex items-center justify-between"
                                  >
                                    <span>
                                      {doc.name}{" "}
                                      {doc.specialization ? `(${doc.specialization})` : ""}
                                    </span>
                                    <BsArrowRight />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <Link
                          to="/doctors"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primaryColor px-4 py-2 rounded-lg hover:bg-opacity-90"
                        >
                          Browse Doctors <BsArrowRight />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Locations;
