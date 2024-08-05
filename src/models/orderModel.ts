import mongoose from "mongoose";

const cartItem = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  name: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
  },
  cartItems: [cartItem],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
  },
  created_At: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
