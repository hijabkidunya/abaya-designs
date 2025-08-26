import mongoose from "mongoose"

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // One cart per user
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            size: String,
            color: String,
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema) 