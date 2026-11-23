import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/token", (req, res) => {
  const { email, name, role } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const token = jwt.sign(
    { email, name, role: role || "Customer" },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );
  res.json({ token });
});

export default router;
