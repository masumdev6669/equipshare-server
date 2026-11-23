import { Router } from "express";
import { Booking } from "../models/Booking";
import { verifyToken, verifyAdmin, AuthRequest } from "../middleware/auth";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

router.post(
  "/create-checkout-session",
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const {
        equipmentName,
        totalAmount,
        equipmentId,
        rentalStartDate,
        rentalEndDate,
        quantity,
        contactNumber,
        deliveryAddress,
        additionalNotes,
        ownerEmail,
      } = req.body;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "bdt",
              product_data: {
                name: equipmentName,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/equipment/${equipmentId}`,
        metadata: {
          equipmentId,
          equipmentName,
          customerEmail: req.user!.email,
          customerName: req.user!.name,
          rentalStartDate,
          rentalEndDate,
          quantity: quantity.toString(),
          contactNumber,
          deliveryAddress,
          additionalNotes: additionalNotes || "",
          ownerEmail,
          totalAmount: totalAmount.toString(),
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.post("/confirm-payment", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const metadata = session.metadata;

      const booking = await Booking.create({
        equipmentId: metadata?.equipmentId,
        equipmentName: metadata?.equipmentName,
        customerEmail: metadata?.customerEmail,
        customerName: metadata?.customerName,
        ownerEmail: metadata?.ownerEmail,
        rentalStartDate: new Date(metadata?.rentalStartDate as string),
        rentalEndDate: new Date(metadata?.rentalEndDate as string),
        quantity: Number(metadata?.quantity),
        contactNumber: metadata?.contactNumber,
        deliveryAddress: metadata?.deliveryAddress,
        additionalNotes: metadata?.additionalNotes,
        totalAmount: Number(metadata?.totalAmount),
        paymentStatus: "Paid",
        bookingStatus: "Pending",
      });

      res.status(201).json(booking);
    } else {
      res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
