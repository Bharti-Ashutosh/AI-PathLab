import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    let account = await User.findById(req.userId);
    if (!account) {
      account = await Doctor.findById(req.userId);
    }
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "User account not found. Please log in again." });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res
        .status(500)
        .json({ success: false, message: "Stripe is not configured on the server." });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const clientUrl = process.env.CLIENT_SITE_URL || "http://localhost:5173";
    const ticketPrice =
      Number(doctor.ticketPrice) > 0 ? Number(doctor.ticketPrice) : 100;

    const productData = {
      name: `Consultation with ${doctor.name}`,
    };
    if (doctor.bio && doctor.bio.trim()) {
      productData.description = doctor.bio.trim();
    }
    // Stripe requires valid public http(s) URLs for images
    if (doctor.photo && /^https?:\/\//i.test(doctor.photo)) {
      productData.images = [doctor.photo];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${clientUrl}/checkout-success`,
      cancel_url: `${clientUrl}/doctors/${doctor._id}`,
      customer_email: account.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(ticketPrice * 100),
            product_data: productData,
          },
          quantity: 1,
        },
      ],
    });

    const booking = new Booking({
      doctor: doctor._id,
      user: account._id,
      ticketPrice: String(ticketPrice),
      session: session.id,
      status: "approved",
      isPaid: true,
      testName: req.body?.testName || "Doctor Consultation",
      bookedOn: new Date().toLocaleDateString(),
    });
    await booking.save();

    res
      .status(200)
      .json({ success: true, message: "Checkout session created", session });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error creating checkout session",
    });
  }
};
