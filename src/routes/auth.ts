import { Router } from "express";
import jwt from "jsonwebtoken";
import { ObjectId, MongoClient } from "mongodb";
import { verifyToken, verifyAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/token", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const client = new MongoClient(process.env.MONGO_URI as string);
    await client.connect();
    const db = client.db("equipshare");

    const user = await db.collection("user").findOne({ email });
    const role = user?.role || "Customer";

    const token = jwt.sign(
      { email, name, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate token" });
  }
});

router.get("/users", verifyToken, verifyAdmin, async (_req, res) => {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();
  const db = client.db("equipshare");
  const users = await db.collection("user").find().toArray();
  res.json(users);
});

router.put(
  "/users/:id/role",
  verifyToken,
  verifyAdmin,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.params.id as string;
      const client = new MongoClient(process.env.MONGO_URI as string);
      await client.connect();
      const db = client.db("equipshare");

      const result = await db
        .collection("user")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: req.body.role } },
        );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Role updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  },
);

export default router;
