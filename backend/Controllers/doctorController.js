import bcrypt from "bcryptjs";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const updatePayload = { ...req.body };

    // Prevent overwriting hashed password with empty/undefined string
    if (updatePayload.password && String(updatePayload.password).trim()) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
    } else {
      delete updatePayload.password;
    }

    // Normalize timeSlots (fix legacy typo `staringTime` -> `startingTime`)
    if (Array.isArray(updatePayload.timeSlots)) {
      updatePayload.timeSlots = updatePayload.timeSlots.map((slot) => ({
        day: slot.day === "select" ? "Sunday" : slot.day,
        startingTime: slot.startingTime || slot.staringTime || "10:00",
        endingTime: slot.endingTime || "16:30",
      }));
    }

    // Normalize gender/specialization select placeholders
    if (updatePayload.gender === "select") delete updatePayload.gender;
    if (updatePayload.specialization === "select") delete updatePayload.specialization;

    const existing = await Doctor.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Ensure pending doctors become visible once they save their profile
    if (existing.isApproved === "pending" && !updatePayload.isApproved) {
      updatePayload.isApproved = "approved";
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating Doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Doctor.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete",
    });
  }
};

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Doctor Found",
      data: doctor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Failed to find Doctor",
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    let doctors;

    if (query && query.trim()) {
      const q = query.trim();
      doctors = await Doctor.find({
        isApproved: "approved",
        $or: [
          { name: { $regex: q, $options: "i" } },
          { specialization: { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },
          { "experiences.hospital": { $regex: q, $options: "i" } },
        ],
      }).select("-password");
    } else {
      doctors = await Doctor.find({ isApproved: "approved" }).select("-password");
    }

    res.status(200).json({
      success: true,
      message: "Doctors Found",
      data: doctors,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "No Doctors found",
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.doctorId;

  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const { password, appointments: legacyAppointments = [], ...rest } = doctor._doc;
    const bookingRecords = await Booking.find({ doctor: doctorId }).sort({ createdAt: -1 });

    // Normalize legacy embedded appointments (from DoctorDropDown before Booking sync)
    const normalizedLegacy = legacyAppointments.map((a) => ({
      _id: a._id,
      user: {
        name: a.patientName || "Patient",
        gender: a.patientGender || "other",
      },
      status: a.payment || "Pending",
      ticketPrice: a.price || doctor.ticketPrice || "100",
      updatedAt: a.bookedOn,
      testName: a.testName || "Consultation",
      testResult: a.testResult || "",
    }));

    // Merge without duplicating entries that already have a corresponding Booking
    const existingKeys = new Set(
      bookingRecords.map(
        (b) => `${b.user?.name || ""}|${b.testName || ""}|${b.bookedOn || ""}`
      )
    );
    const mergedAppointments = [
      ...bookingRecords,
      ...normalizedLegacy.filter(
        (leg) =>
          !existingKeys.has(
            `${leg.user.name}|${leg.testName}|${leg.updatedAt || ""}`
          )
      ),
    ];

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest, appointments: mergedAppointments },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get profile",
      error: error.message,
    });
  }
};
