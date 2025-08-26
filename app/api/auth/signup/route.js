import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST(req) {
    try {
        await dbConnect()
        const { name, email, password } = await req.json()
        if (!name || !email || !password) {
            return Response.json({ error: "All fields are required." }, { status: 400 })
        }
        if (password.length < 6) {
            return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 })
        }
        const existing = await User.findOne({ email })
        if (existing) {
            return Response.json({ error: "Email already in use." }, { status: 409 })
        }
        const hashed = await bcrypt.hash(password, 10)
        const user = new User({ name, email, password: hashed, role: "user" })
        await user.save()
        return Response.json({ message: "User registered successfully." }, { status: 201 })
    } catch (error) {
        console.error("Signup error:", error)
        return Response.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 