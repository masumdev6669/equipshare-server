import { Router } from "express";
import { Equipment } from "../models/Equipment";
import { verifyToken, verifyAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, category, rentalType, sort } = req.query;
    let query: any = { status: "Approved" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (rentalType) query.rentalType = rentalType;

    let sortOption: any = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { rentalPrice: 1 };
    if (sort === "price_desc") sortOption = { rentalPrice: -1 };

    const equipment = await Equipment.find(query).sort(sortOption);
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch equipment" });
  }
});

router.get("/recent", async (_req, res) => {
  const equipment = await Equipment.find({ status: "Approved" })
    .sort({ createdAt: -1 })
    .limit(6);
  res.json(equipment);
});

router.get("/admin/all", verifyToken, verifyAdmin, async (_req, res) => {
  const equipment = await Equipment.find().sort({ createdAt: -1 });
  res.json(equipment);
});

router.get("/owner/mine", verifyToken, async (req: AuthRequest, res) => {
  const equipment = await Equipment.find({ ownerEmail: req.user!.email }).sort({
    createdAt: -1,
  });
  res.json(equipment);
});

router.put("/admin/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Equipment not found" });

    item.status = req.body.status;
    await item.save();
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Equipment not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid equipment id" });
  }
});

router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const payload = {
      ...req.body,
      ownerEmail: req.user!.email,
      ownerName: req.user!.name,
      status: "Pending",
    };
    const equipment = await Equipment.create(payload);
    res.status(201).json(equipment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Equipment not found" });
    if (item.ownerEmail !== req.user!.email && req.user!.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "You can only update your own equipment" });
    }
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Equipment not found" });
    if (item.ownerEmail !== req.user!.email && req.user!.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "You can only delete your own equipment" });
    }
    await item.deleteOne();
    res.json({ message: "Equipment deleted" });
  } catch {
    res.status(400).json({ message: "Invalid equipment id" });
  }
});

export default router;
