import dbConnect from "./mongodb.js"
import Product from "./models/Product.js"

async function migrateCategories() {
    try {
        await dbConnect()
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
        process.exit(0)
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateCategories()
}

export default migrateCategories
