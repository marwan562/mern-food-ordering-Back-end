import mongoose, { Schema } from "mongoose";

const menuItemSchema = new mongoose.Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// Exporting the type
export type TMenuItem = mongoose.InferSchemaType<typeof menuItemSchema>;

const myRestaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, require: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdate: { type: Date, default: Date.now },
});

const Restaurant = mongoose.model("Restaurant", myRestaurantSchema);

export default Restaurant;
