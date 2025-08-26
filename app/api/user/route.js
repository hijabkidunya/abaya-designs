import { auth } from "@/lib/authOptions"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function GET(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const user = await User.findById(session.user.id)
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })
    // Only return safe fields
    return Response.json({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        addresses: user.addresses || [],
    })
}

export async function PUT(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const user = await User.findById(session.user.id)
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })
    const { name, email, phone, addresses } = await req.json()
    if (name) user.name = name
    if (email) user.email = email
    if (phone !== undefined) user.phone = phone
    if (addresses) user.addresses = addresses
    await user.save()
    return Response.json({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        addresses: user.addresses || [],
    })
}

export async function PATCH(req) {
    await dbConnect()
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const user = await User.findById(session.user.id)
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
        return Response.json({ error: "Current and new password are required." }, { status: 400 })
    }
    if (!user.password) {
        return Response.json({ error: "No password set for this account." }, { status: 400 })
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
        return Response.json({ error: "Current password is incorrect." }, { status: 400 })
    }
    if (newPassword.length < 6) {
        return Response.json({ error: "New password must be at least 6 characters." }, { status: 400 })
    }
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return Response.json({ message: "Password updated successfully." })
} 