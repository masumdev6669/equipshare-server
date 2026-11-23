import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  equipmentCondition: string;
  brand: string;
  model: string;
  image: string;
  terms: string;
  ownerEmail: string;
  ownerName: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  rentalPrice: { type: Number, required: true },
  rentalType: { type: String, required: true },
  availableQuantity: { type: Number, required: true },
  equipmentCondition: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  image: { type: String, required: true },
  terms: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  ownerName: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Equipment = mongoose.model<IEquipment>(
  "Equipment",
  EquipmentSchema,
);
