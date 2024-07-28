import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const myRestaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Refers to the User model
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, require: true },
  deliveryPrice: { type: Number, required: true }, 
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdate: { type: Date, default: Date.now }, // Automatically set to the current date
});

const Restaurant = mongoose.model("Restaurant", myRestaurantSchema);

export default Restaurant;
