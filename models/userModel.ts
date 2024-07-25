import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    require: [true, "auth0Id is reqired"],
  },
  email: {
    type: String,
    require: [true, "email is reqired"],
  },
  name: {
    type: String,
  },

  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
});

const User = mongoose.model("user", userSchema);

export default User;
