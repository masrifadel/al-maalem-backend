import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtPurchase: { type: Number, required: true },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    governorate: {
      type: String,
      enum: ["Beirut", "Mount Lebanon"],
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    building: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    directions: String,
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
