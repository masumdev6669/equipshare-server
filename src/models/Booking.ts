import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  equipmentId: Types.ObjectId;
  equipmentName: string;
  customerEmail: string;
  customerName: string;
  ownerEmail: string;
  rentalStartDate: Date;
  rentalEndDate: Date;
  quantity: number;
  contactNumber: string;
  deliveryAddress: string;
  additionalNotes?: string;
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  bookingStatus: "Pending" | "Approved" | "Completed" | "Cancelled";
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  equipmentId: {
    type: Schema.Types.ObjectId,
    ref: "Equipment",
    required: true,
  },
  equipmentName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  rentalStartDate: { type: Date, required: true },
  rentalEndDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  additionalNotes: { type: String },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
