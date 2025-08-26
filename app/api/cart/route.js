import { auth } from "@/lib/authOptions"
import dbConnect from "@/lib/mongodb"
import Cart from "@/lib/models/Cart"
import Product from "@/lib/models/Product"

export async function GET(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const cart = await Cart.findOne({ user: session.user.id }).populate("items.product")
    return Response.json(cart || { items: [] })
}

export async function POST(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { productId, quantity = 1, size, color } = await req.json()
    const product = await Product.findById(productId)
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 })
    let cart = await Cart.findOne({ user: session.user.id })
    if (!cart) {
        cart = new Cart({ user: session.user.id, items: [] })
    }
    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId.toString() && item.size === size && item.color === color
    )
    if (existingItem) {
        existingItem.quantity += quantity
    } else {
        cart.items.push({ product: productId, quantity, size, color, price: product.price })
    }
    cart.updatedAt = new Date()
    await cart.save()
    // Re-fetch and populate product data before returning
    const updatedCart = await Cart.findOne({ user: session.user.id }).populate("items.product")
    return Response.json(updatedCart)
}

export async function PATCH(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { productId, size, color, quantity } = await req.json()
    let cart = await Cart.findOne({ user: session.user.id })
    if (!cart) return Response.json({ error: "Cart not found" }, { status: 404 })
    const item = cart.items.find(
        (item) => item.product.toString() === productId.toString() && item.size === size && item.color === color
    )
    if (!item) return Response.json({ error: "Item not found" }, { status: 404 })
    item.quantity = quantity
    if (item.quantity <= 0) {
        cart.items = cart.items.filter(
            (item) => !(item.product.toString() === productId.toString() && item.size === size && item.color === color)
        )
    }
    cart.updatedAt = new Date()
    await cart.save()
    // Re-fetch and populate product data before returning
    const updatedCart = await Cart.findOne({ user: session.user.id }).populate("items.product")
    return Response.json(updatedCart)
}

export async function DELETE(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const url = new URL(req.url, "http://localhost")
    const all = url.searchParams.get("all")
    if (all === "true") {
        // Clear all items from the cart
        let cart = await Cart.findOne({ user: session.user.id })
        if (!cart) return Response.json({ error: "Cart not found" }, { status: 404 })
        cart.items = []
        cart.updatedAt = new Date()
        await cart.save()
        return Response.json(cart)
    }
    const { productId, size, color } = await req.json()
    let cart = await Cart.findOne({ user: session.user.id })
    if (!cart) return Response.json({ error: "Cart not found" }, { status: 404 })
    cart.items = cart.items.filter(
        (item) => !(item.product.toString() === productId.toString() && item.size === size && item.color === color)
    )
    cart.updatedAt = new Date()
    await cart.save()
    // Re-fetch and populate product data before returning
    const updatedCart = await Cart.findOne({ user: session.user.id }).populate("items.product")
    return Response.json(updatedCart)
} 