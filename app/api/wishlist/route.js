import { auth } from "@/lib/authOptions"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import Product from "@/lib/models/Product"

export async function GET(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ wishlist: [] }, { status: 200 })
    const user = await User.findById(session.user.id).populate("wishlist")
    if (!user) return Response.json({ wishlist: [] }, { status: 200 })
    return Response.json({ wishlist: user.wishlist || [] })
}

export async function POST(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { productId } = await req.json()
    if (!productId) return Response.json({ error: "Product ID required" }, { status: 400 })
    const user = await User.findById(session.user.id)
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })
    if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId)
        await user.save()
    }
    const populatedUser = await User.findById(session.user.id).populate("wishlist")
    return Response.json({ wishlist: populatedUser.wishlist })
}

export async function DELETE(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    let productId = null
    try {
        const body = await req.json()
        productId = body.productId
    } catch { }
    const user = await User.findById(session.user.id)
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })
    if (productId) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
    } else {
        user.wishlist = []
    }
    await user.save()
    const populatedUser = await User.findById(session.user.id).populate("wishlist")
    return Response.json({ wishlist: populatedUser.wishlist })
} 