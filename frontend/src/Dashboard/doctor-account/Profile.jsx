import { useContext, useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL, getToken } from "../../config.js";
import { toast } from "react-toastify";
import { authContext } from "../../context/AuthContext.jsx";

const Profile = ({ doctorData, onProfileUpdated }) => {
  const { dispatch } = useContext(authContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    gender: "male",
    specialization: "",
    ticketPrice: 100,
    qualifications: [],
    experiences: [],
    timeSlots: [],
    about: "",
    photo: "",
  });

  useEffect(() => {
    if (!doctorData) return;
    setFormData({
      name: doctorData.name || "",
      email: doctorData.email || "",
      phone: doctorData.phone || "",
      bio: doctorData.bio || "",
      gender: doctorData.gender || "male",
      specialization: doctorData.specialization || "",
      ticketPrice: doctorData.ticketPrice || 100,
      qualifications: Array.isArray(doctorData.qualifications)
        ? doctorData.qualifications
        : [],
      experiences: Array.isArray(doctorData.experiences)
        ? doctorData.experiences
        : [],
      timeSlots: Array.isArray(doctorData.timeSlots)
        ? doctorData.timeSlots.map((slot) => ({
            day: slot.day || "monday",
            startingTime: slot.startingTime || slot.staringTime || "10:00",
            endingTime: slot.endingTime || "16:30",
          }))
        : [],
      about: doctorData.about || "",
      photo: doctorData.photo || "",
    });
  }, [doctorData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadImageToCloudinary(file);
      if (data?.url) {
        setFormData((prev) => ({ ...prev, photo: data.url }));
      }
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Update failed");
      }

      if (result.data) {
        dispatch({ type: "UPDATE_USER", payload: result.data });
      }
      toast.success("Profile updated successfully!");
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (key, item) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: [...(prevFormData[key] || []), item],
    }));
  };

  const handleReuseableInputChange = (key, index, event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => {
      const updateItems = [...(prevFormData[key] || [])];
      updateItems[index] = { ...updateItems[index], [name]: value };
      return {
        ...prevFormData,
        [key]: updateItems,
      };
    });
  };

  const deleteItem = (key, index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: (prevFormData[key] || []).filter((_, i) => i !== index),
    }));
  };

  const addQualification = (e) => {
    e.preventDefault();
    addItem("qualifications", {
      startingDate: "",
      endingDate: "",
      degree: "MBBS",
      university: "AIIMS",
    });
  };

  const addExperience = (e) => {
    e.preventDefault();
    addItem("experiences", {
      startingDate: "",
      endingDate: "",
      position: "Senior Consultant",
      hospital: "City Hospital",
    });
  };

  const addTimeSlot = (e) => {
    e.preventDefault();
    addItem("timeSlots", {
      day: "monday",
      startingTime: "10:00",
      endingTime: "16:30",
    });
  };

  return (
    <div>
      <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">
        Profile Information
      </h2>

      <form onSubmit={handleUpdateProfile}>
        <div className="mb-5">
          <p className="form__label">Name*</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="form__input"
          />
        </div>

        <div className="mb-5">
          <p className="form__label">Email*</p>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="form__input"
            readOnly
            aria-readonly
            disabled={true}
          />
        </div>

        <div className="mb-5">
          <p className="form__label">Phone*</p>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="form__input"
          />
        </div>

        <div className="mb-5">
          <p className="form__label">Bio*</p>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Short medical bio"
            className="form__input"
            maxLength={200}
          />
        </div>

        <div className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-[30px]">
            <div>
              <p className="form__label">Gender*</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <p className="form__label">Specialization*</p>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="">Select</option>
                <option value="Surgeon">Surgeon</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pathologist">Pathologist</option>
                <option value="General Physician">General Physician</option>
                <option value="Pulmonologist">Pulmonologist</option>
              </select>
            </div>

            <div>
              <p className="form__label">Ticket Price (USD)</p>
              <input
                type="number"
                placeholder="100"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
                className="form__input"
              />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="form__label">Qualifications*</p>
          {formData.qualifications?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="form__label">Starting Date*</p>
                    <input
                      type="date"
                      name="startingDate"
                      value={item.startingDate || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("qualifications", index, e)
                      }
                    />
                  </div>

                  <div>
                    <p className="form__label">Ending Date*</p>
                    <input
                      type="date"
                      name="endingDate"
                      value={item.endingDate || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("qualifications", index, e)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div>
                    <p className="form__label">Degree*</p>
                    <input
                      type="text"
                      name="degree"
                      value={item.degree || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("qualifications", index, e)
                      }
                    />
                  </div>

                  <div>
                    <p className="form__label">University*</p>
                    <input
                      type="text"
                      name="university"
                      value={item.university || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("qualifications", index, e)
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem("qualifications", index)}
                  className="bg-red-500 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px]"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQualification}
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add Qualification
          </button>
        </div>

        <div className="mb-5">
          <p className="form__label">Experiences (Clinics & Hospitals)*</p>
          {formData.experiences?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="form__label">Starting Date*</p>
                    <input
                      type="date"
                      name="startingDate"
                      value={item.startingDate || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("experiences", index, e)
                      }
                    />
                  </div>

                  <div>
                    <p className="form__label">Ending Date*</p>
                    <input
                      type="date"
                      name="endingDate"
                      value={item.endingDate || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("experiences", index, e)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div>
                    <p className="form__label">Position*</p>
                    <input
                      type="text"
                      name="position"
                      value={item.position || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("experiences", index, e)
                      }
                    />
                  </div>

                  <div>
                    <p className="form__label">Hospital / Location*</p>
                    <input
                      type="text"
                      name="hospital"
                      value={item.hospital || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("experiences", index, e)
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem("experiences", index)}
                  className="bg-red-500 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px]"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addExperience}
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add Experience
          </button>
        </div>

        <div className="mb-5">
          <p className="form__label">Time Slots*</p>
          {formData.timeSlots?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 mb-[30px] gap-5">
                  <div>
                    <p className="form__label">Day*</p>
                    <select
                      name="day"
                      value={item.day || "monday"}
                      className="form__input py-3.5"
                      onChange={(e) =>
                        handleReuseableInputChange("timeSlots", index, e)
                      }
                    >
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                    </select>
                  </div>

                  <div>
                    <p className="form__label">Starting Time*</p>
                    <input
                      type="time"
                      name="startingTime"
                      value={item.startingTime || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("timeSlots", index, e)
                      }
                    />
                  </div>

                  <div>
                    <p className="form__label">Ending Time*</p>
                    <input
                      type="time"
                      name="endingTime"
                      value={item.endingTime || ""}
                      className="form__input"
                      onChange={(e) =>
                        handleReuseableInputChange("timeSlots", index, e)
                      }
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => deleteItem("timeSlots", index)}
                      className="bg-red-500 p-2 rounded-full text-white text-[18px] cursor-pointer mt-6"
                    >
                      <AiOutlineDelete />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTimeSlot}
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add TimeSlot
          </button>
        </div>

        <div className="mb-5">
          <p className="form__label">About*</p>
          <textarea
            name="about"
            rows={5}
            value={formData.about}
            placeholder="Write about yourself..."
            onChange={handleInputChange}
            className="form__input"
          ></textarea>
        </div>

        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center overflow-hidden">
              <img
                src={formData.photo}
                className="w-full h-full object-cover rounded-full"
                alt="Doctor avatar"
              />
            </figure>
          )}

          <div className="relative w-[130px] h-[50px]">
            <input
              type="file"
              name="photo"
              id="customFile"
              accept=".jpg,.jpeg,.png"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInputChange}
            />
            <label
              htmlFor="customFile"
              className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
            >
              Upload Photo
            </label>
          </div>
        </div>

        <div className="mt-7">
          <button
            type="submit"
            disabled={loading}
            className="bg-primaryColor text-white text-[18px] leading-[30px] w-full py-3 px-4 rounded-lg disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
