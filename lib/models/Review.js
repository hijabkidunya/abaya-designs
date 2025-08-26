import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
    user: {
        name: { type: String }, // not required
        email: { type: String }, // not required
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false }, // optional, for per-product reviews
    image: { type: String, required: false }, // optional, for review image URL
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema) 