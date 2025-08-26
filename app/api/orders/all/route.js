import { NextResponse } from "next/server"
import { auth } from "@/lib/authOptions"
import dbConnect from "@/lib/mongodb"
import Order from "@/lib/models/Order"

export async function GET(req) {
    await dbConnect()
    const session = await auth()
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate("user", "email name")
            .populate("items.product")
        return NextResponse.json({ orders })
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
} 