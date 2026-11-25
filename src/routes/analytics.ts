import { Router } from "express";
import { verifyToken, verifyAdmin, AuthRequest } from "../middleware/auth";
import { MongoClient } from "mongodb";

const router = Router();

router.get("/admin/analytics", verifyToken, verifyAdmin, async (_req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI as string);
    await client.connect();
    const db = client.db("equipshare");

    const totalUsers = await db.collection("user").countDocuments();
    const totalEquipment = await db.collection("equipment").countDocuments();
    const pendingEquipment = await db
      .collection("equipment")
      .countDocuments({ status: "Pending" });
    const totalBookings = await db.collection("bookings").countDocuments();

    const revenueResult = await db
      .collection("bookings")
      .aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalUsers,
      totalEquipment,
      pendingEquipment,
      totalBookings,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load admin analytics" });
  }
});

router.get("/owner/analytics", verifyToken, async (req: AuthRequest, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI as string);
    await client.connect();
    const db = client.db("equipshare");

    const totalEquipment = await db
      .collection("equipment")
      .countDocuments({ ownerEmail: req.user!.email });

    const earningsResult = await db
      .collection("bookings")
      .aggregate([
        { $match: { ownerEmail: req.user!.email, paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    const totalEarnings =
      earningsResult.length > 0 ? earningsResult[0].total : 0;

    res.json({
      totalEquipment,
      totalEarnings,
      completedRentals: 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load owner analytics" });
  }
});

export default router;
