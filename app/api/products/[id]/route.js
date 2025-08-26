import dbConnect from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET(request, { params }) {
    try {
        await dbConnect()
        const { id } = params
        if (!id) {
            return Response.json({ error: "Product ID is required" }, { status: 400 })
        }
        // Fetch the product by ID
        const product = await Product.findById(id).lean()
        if (!product) {
            return Response.json({ error: "Product not found" }, { status: 404 })
        }
        // Use summary fields from the Product document
        const reviewCount = typeof product.reviewCount === "number" ? product.reviewCount : 0;
        const rating = typeof product.rating === "number" ? product.rating : 0;
        // Fetch related products (same category, exclude current product)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
        })
            .limit(3)
            .select("_id name price originalPrice images category reviews sizes colors stock sku rating reviewCount")
            .lean()
        // Use summary fields for related products
        const related = relatedProducts.map(rp => {
            const rc = typeof rp.reviewCount === "number" ? rp.reviewCount : 0;
            const rt = typeof rp.rating === "number" ? rp.rating : 0;
            return { ...rp, reviewCount: rc, rating: rt };
        })
        return Response.json({
            product: {
                ...product,
                reviewCount,
                rating,
            },
            relatedProducts: related,
        })
    } catch (error) {
        console.error("Product detail API error:", error)
        return Response.json({ error: "Failed to fetch product" }, { status: 500 })
    }
} 