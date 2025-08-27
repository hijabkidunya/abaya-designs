import mongoose from "mongoose"

const ReviewSchema = new mongoose.Schema({
    user: { type: String, required: true }, // Could be user ID or name
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
})

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ["abayas", "maxi-dresses"] },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: {
        type: [String],
        required: true,
        validate: [arr => arr.length > 0 && arr.length <= 5, 'You must provide 1-5 images.']
    },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0 },
    sku: { type: String },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    sale: { type: Boolean, default: false },
    reviews: [ReviewSchema],
    inStock: { type: Boolean, default: true },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    rating: { type: Number, default: 0 }, // average rating
    reviewCount: { type: Number, default: 0 }, // number of reviews
})

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
