import dbConnect from "@/lib/mongodb"
import Product from "@/lib/models/Product"
import { uploadImage } from "@/lib/cloudinary"

export async function GET(request) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        // Support multi-select category
        const categories = searchParams.getAll("category")
        const search = searchParams.get("search")
        const minPrice = searchParams.get("minPrice")
        const maxPrice = searchParams.get("maxPrice")
        const featured = searchParams.get("featured")
        const trending = searchParams.get("trending")
        const colors = searchParams.getAll("colors")
        const sizes = searchParams.getAll("sizes")
        const isNew = searchParams.get("isNew")
        const sale = searchParams.get("sale")
        const sortBy = searchParams.get("sortBy") || "createdAt"
        const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1
        const page = parseInt(searchParams.get("page") || "1", 10)
        const limit = parseInt(searchParams.get("limit") || "12", 10)

        const query = {}

        if (categories.length > 0) {
            query.category = { $in: categories }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        }

        if (minPrice || maxPrice) {
            query.price = {}
            if (minPrice) query.price.$gte = Number.parseFloat(minPrice)
            if (maxPrice) query.price.$lte = Number.parseFloat(maxPrice)
        }

        if (featured === "true") {
            query.featured = true
        }
        if (trending === "true") {
            query.trending = true
        }

        if (colors && colors.length > 0) {
            query.colors = { $in: colors }
        }

        if (sizes && sizes.length > 0) {
            query.sizes = { $in: sizes }
        }
        if (isNew === "true") {
            query.isNew = true
        }
        if (sale === "true") {
            query.sale = true
        }

        const total = await Product.countDocuments(query)
        const products = await Product.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)

        return Response.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit,
        })
    } catch (error) {
        console.error("Products API error:", error)
        return Response.json({ error: "Failed to fetch products" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await dbConnect()

        // Support both JSON and multipart/form-data
        const contentType = request.headers.get("content-type") || ""
        let data
        let images = []

        if (contentType.includes("application/json")) {
            data = await request.json()
            images = data.images || []
        } else if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData()
            data = Object.fromEntries(formData.entries())
            // Handle up to 5 images
            for (let i = 0; i < 5; i++) {
                const file = formData.get(`image${i}`)
                if (file && typeof file === "object" && file.arrayBuffer) {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
                    const url = await uploadImage(base64)
                    images.push(url)
                }
            }
        }

        // Validate category
        const validCategories = ["abayas", "maxi-dresses"]
        if (!data.category || !validCategories.includes(data.category)) {
            return Response.json({
                error: `Invalid category. Must be one of: ${validCategories.join(", ")}`
            }, { status: 400 })
        }

        if (!images.length) {
            return Response.json({ error: "At least one image is required." }, { status: 400 })
        }
        data.images = images
        // Parse/convert new fields
        if (typeof data.colors === "string") {
            try { data.colors = JSON.parse(data.colors) } catch { data.colors = [] }
        }
        if (typeof data.sizes === "string") {
            try { data.sizes = JSON.parse(data.sizes) } catch { data.sizes = [] }
        }
        if (typeof data.tags === "string") {
            data.tags = data.tags.split(",").map(t => t.trim()).filter(Boolean)
        }
        data.featured = data.featured === "true" || data.featured === true
        data.isNew = data.isNew === "true" || data.isNew === true
        data.trending = data.trending === "true" || data.trending === true
        data.sale = data.sale === "true" || data.sale === true
        data.inStock = data.inStock === "true" || data.inStock === true
        data.stock = Number(data.stock) || 0
        data.price = Number(data.price)
        data.originalPrice = data.originalPrice ? Number(data.originalPrice) : undefined
        const product = await Product.create(data)
        return Response.json(product, { status: 201 })
    } catch (error) {
        console.error("Create product error:", error)
        return Response.json({ error: "Failed to create product" }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return Response.json({ error: "Product ID required" }, { status: 400 })
        const contentType = request.headers.get("content-type") || ""
        let updates
        let images = []
        if (contentType.includes("application/json")) {
            updates = await request.json()
            images = updates.images || []
        } else if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData()
            updates = Object.fromEntries(formData.entries())

            // Handle images passed as JSON string (from existing product)
            if (updates.images && typeof updates.images === 'string') {
                try {
                    images = JSON.parse(updates.images)
                } catch (e) {
                    console.error("Error parsing images JSON:", e)
                }
            }

            // Handle newly uploaded image files
            for (let i = 0; i < 5; i++) {
                const file = formData.get(`image${i}`)
                if (file && typeof file === "object" && file.arrayBuffer) {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
                    const url = await uploadImage(base64)
                    images.push(url)
                }
            }
        }

        // Validate category if it's being updated
        if (updates.category) {
            const validCategories = ["abayas", "maxi-dresses"]
            if (!validCategories.includes(updates.category)) {
                return Response.json({
                    error: `Invalid category. Must be one of: ${validCategories.join(", ")}`
                }, { status: 400 })
            }
        }

        if (images.length) updates.images = images
        // Parse/convert new fields
        if (typeof updates.colors === "string") {
            try { updates.colors = JSON.parse(updates.colors) } catch { updates.colors = [] }
        }
        if (typeof updates.sizes === "string") {
            try { updates.sizes = JSON.parse(updates.sizes) } catch { updates.sizes = [] }
        }
        if (typeof updates.tags === "string") {
            updates.tags = updates.tags.split(",").map(t => t.trim()).filter(Boolean)
        }
        updates.featured = updates.featured === "true" || updates.featured === true
        updates.isNew = updates.isNew === "true" || updates.isNew === true
        if (typeof updates.trending !== "undefined") {
            updates.trending = updates.trending === "true" || updates.trending === true
        }
        if (typeof updates.sale !== "undefined") {
            updates.sale = updates.sale === "true" || updates.sale === true
        }
        updates.inStock = updates.inStock === "true" || updates.inStock === true
        updates.stock = Number(updates.stock) || 0
        updates.price = Number(updates.price)
        updates.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : undefined
        const product = await Product.findByIdAndUpdate(id, updates, { new: true })
        if (!product) return Response.json({ error: "Product not found" }, { status: 404 })
        return Response.json(product)
    } catch (error) {
        console.error("Update product error:", error)
        return Response.json({ error: "Failed to update product" }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return Response.json({ error: "Product ID required" }, { status: 400 })
        const product = await Product.findByIdAndDelete(id)
        if (!product) return Response.json({ error: "Product not found" }, { status: 404 })
        return Response.json({ message: "Product deleted", id })
    } catch (error) {
        console.error("Delete product error:", error)
        return Response.json({ error: "Failed to delete product" }, { status: 500 })
    }
}
