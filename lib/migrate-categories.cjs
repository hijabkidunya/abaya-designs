const mongoose = require('mongoose')

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abaya-designs')
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

// Product Schema (simplified for migration)
const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    price: Number,
    originalPrice: Number,
    images: [String],
    sizes: [String],
    colors: [String],
    stock: Number,
    sku: String,
    featured: Boolean,
    isNew: Boolean,
    trending: Boolean,
    sale: Boolean,
    reviews: [{
        user: String,
        rating: Number,
        comment: String,
        date: Date
    }],
    inStock: Boolean,
    tags: [String],
    createdAt: Date,
    rating: Number,
    reviewCount: Number
})

const Product = mongoose.model('Product', ProductSchema)

async function migrateCategories() {
    try {
        await connectDB()
        console.log("Connected to database")

        // Find products with old categories
        const oldCategories = ["hijabs", "clothing", "accessories"]
        const productsToUpdate = await Product.find({
            category: { $in: oldCategories }
        })

        console.log(`Found ${productsToUpdate.length} products with old categories`)

        if (productsToUpdate.length === 0) {
            console.log("No products need migration")
            return
        }

        // Update products with old categories to maxi-dresses
        const updateResult = await Product.updateMany(
            { category: { $in: oldCategories } },
            { $set: { category: "maxi-dresses" } }
        )

        console.log(`Updated ${updateResult.modifiedCount} products to maxi-dresses category`)
        console.log("Migration completed successfully")

    } catch (error) {
        console.error("Migration error:", error)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

// Run migration
migrateCategories()
