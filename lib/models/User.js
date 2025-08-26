import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Password is not required for guest users
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  guestDetails: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    city: String,
    province: String,
    zipCode: String,
    country: String,
    lastOrderDate: Date,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
