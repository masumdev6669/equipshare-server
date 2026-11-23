import { Router } from "express";
import { Booking } from "../models/Booking";
import { verifyToken, verifyAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const payload = {
      ...req.body,
      customerEmail: req.user!.email,
      customerName: req.user!.name,
      paymentStatus: "Pending",
      bookingStatus: "Pending",
    };
    const booking = await Booking.create(payload);
    res.status(201).json(booking);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/mine", verifyToken, async (req: AuthRequest, res) => {
  const bookings = await Booking.find({ customerEmail: req.user!.email }).sort({
    createdAt: -1,
  });
  res.json(bookings);
});

router.get("/owner", verifyToken, async (req: AuthRequest, res) => {
  const bookings = await Booking.find({ ownerEmail: req.user!.email }).sort({
    createdAt: -1,
  });
  res.json(bookings);
});

router.get("/admin", verifyToken, verifyAdmin, async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

export default router;
