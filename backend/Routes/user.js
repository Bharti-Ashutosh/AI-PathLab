import express from "express";
import {
  updateUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getUserProfile,
  getMyAppointments,
  getAllLabBookings,
  updateBookingStatus,
  createAppointment,
} from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

// Specific static routes BEFORE /:id parameter routes
router.get(
  "/profile/me",
  authenticate,
  restrict(["patient", "assistant"]),
  getUserProfile
);
router.get(
  "/appointments/my-appointments",
  authenticate,
  restrict(["patient", "assistant"]),
  getMyAppointments
);
router.get(
  "/appointments/lab-bookings",
  authenticate,
  restrict(["assistant", "admin"]),
  getAllLabBookings
);
router.put(
  "/appointments/lab-bookings/:id",
  authenticate,
  restrict(["assistant", "admin"]),
  updateBookingStatus
);
router.post(
  "/appointments/create-appointment",
  authenticate,
  restrict(["patient", "assistant"]),
  createAppointment
);

router.get("/", authenticate, restrict(["admin"]), getAllUsers);
router.get("/:id", authenticate, restrict(["patient", "assistant"]), getSingleUser);
router.put("/:id", authenticate, restrict(["patient", "assistant"]), updateUser);
router.delete("/:id", authenticate, restrict(["patient", "assistant"]), deleteUser);

export default router;
