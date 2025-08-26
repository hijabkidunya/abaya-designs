import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    await dbConnect()
    if (!q.trim()) {
        return NextResponse.json({ products: [] })
    }
    const regex = new RegExp(q, "i")
    const products = await Product.find({
        $or: [
            { name: regex },
            { description: regex },
            { category: regex },
        ],
    })
        .limit(8)
        .select("_id name images slug price category")
        .lean()
    return NextResponse.json({ products })
} 