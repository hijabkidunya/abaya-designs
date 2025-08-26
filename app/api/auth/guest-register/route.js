import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(req) {
  try {
    await dbConnect()
    const { email } = await req.json()

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: "Valid email is required." }, { status: 400 })
    }

    // Check if user exists
    let user = await User.findOne({ email })
    let created = false

    if (!user) {
      // Create a new guest user
      user = new User({
        email,
        name: email.split('@')[0], // Use part of email as name
        isGuest: true,
        role: "user"
      })
      await user.save()
      created = true
    } else if (!user.isGuest && !user.password) {
      // If it's an incomplete account (no password), mark as guest
      user.isGuest = true;
      await user.save();
    }

    return Response.json({
      email: user.email,
      isGuest: user.isGuest,
      created
    })
  } catch (error) {
    console.error("Guest registration error:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 