import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

export const updateUser = async (req, res) => {
  const id = req.params.id;
  try {
    const updatePayload = { ...req.body };

    if (updatePayload.password && String(updatePayload.password).trim()) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
    } else {
      delete updatePayload.password;
    }

    if (updatePayload.gender === "select") {
      delete updatePayload.gender;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
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

export const getSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "User Found",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Failed to find user",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Users Found",
      data: users,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "No users found",
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get profile",
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId });
    const doctorIds = bookings
      .filter((el) => el.doctor)
      .map((el) => el.doctor._id || el.doctor.id);
    const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select(
      "-password"
    );
    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get appointments",
    });
  }
};

export const getAllLabBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "All lab bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load lab bookings",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "approved", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, ...appointmentData } = req.body;
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "This Doctor is not available now",
      });
    }

    const bookedOn =
      appointmentData.bookedOn || new Date().toLocaleDateString();
    const price = appointmentData.price || String(doctor.ticketPrice || 100);
    const payment = appointmentData.payment || "Pending";

    const appointment = {
      patientName: appointmentData.patientName,
      patientGender: appointmentData.patientGender,
      payment,
      price,
      bookedOn,
      testName: appointmentData.testName,
      testResult: appointmentData.testResult,
    };
    doctor.appointments.push(appointment);
    await doctor.save();

    // Also create a Booking record so Patient MyBookings & Doctor Appointments stay in sync
    if (req.userId) {
      const booking = new Booking({
        doctor: doctor._id,
        user: req.userId,
        ticketPrice: price,
        status: payment.toLowerCase() === "paid" ? "approved" : "pending",
        isPaid: payment.toLowerCase() === "paid",
        testName: appointmentData.testName || "Lab Test Consultation",
        testResult: appointmentData.testResult || "",
        bookedOn,
      });
      await booking.save();
    }

    return res.status(200).json({
      success: true,
      data: doctor,
      message: "Appointment booking done",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
