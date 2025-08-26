import { NextResponse } from "next/server"
import { auth } from "@/lib/authOptions"
import dbConnect from "@/lib/mongodb"
import Order from "@/lib/models/Order"
import { sendMail } from "@/lib/server/mail"

function getOrderStatusEmail({ name, email, orderId, newStatus }) {
    // Professional, status-specific subject and body
    const statusMap = {
        processing: {
            subject: `Your order #${orderId} is now being processed`,
            body: `Dear ${name || "Customer"},<br/><br/>We have started processing your order <b>#${orderId}</b>. We will notify you once it is shipped.<br/><br/>Thank you for shopping with us!<br/><br/>Best regards,<br/>Abaya Designs Team`
        },
        shipped: {
            subject: `Your order #${orderId} has shipped!`,
            body: `Dear ${name || "Customer"},<br/><br/>Good news! Your order <b>#${orderId}</b> has been shipped and is on its way. You will receive another update when it is delivered.<br/><br/>Thank you for choosing us!<br/><br/>Best regards,<br/>Abaya Designs Team`
        },
        delivered: {
            subject: `Your order #${orderId} has been delivered`,
            body: `Dear ${name || "Customer"},<br/><br/>We are pleased to inform you that your order <b>#${orderId}</b> has been delivered. We hope you enjoy your purchase!<br/><br/>If you have any questions, feel free to contact our support.<br/><br/>Best regards,<br/>Abaya Designs Team`
        },
        cancelled: {
            subject: `Your order #${orderId} has been cancelled`,
            body: `Dear ${name || "Customer"},<br/><br/>We regret to inform you that your order <b>#${orderId}</b> has been cancelled. If you have any questions, please contact our support team.<br/><br/>Best regards,<br/>Abaya Designs Team`
        },
        pending: {
            subject: `Your order #${orderId} is pending`,
            body: `Dear ${name || "Customer"},<br/><br/>Your order <b>#${orderId}</b> is currently pending. We will update you as soon as its status changes.<br/><br/>Best regards,<br/>Abaya Designs Team`
        }
    }
    const { subject, body } = statusMap[newStatus] || statusMap["pending"];
    return { subject, html: body };
}

export async function GET(req, { params }) {
    await dbConnect()
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const order = await Order.findOne({ _id: params.id, user: session.user.id }).populate("items.product")
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
        return NextResponse.json({ order })
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }
}

export async function PATCH(req, { params }) {
    await dbConnect()
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        let order
        if (session.user.role === "admin") {
            order = await Order.findOne({ _id: params.id })
        } else {
            order = await Order.findOne({ _id: params.id, user: session.user.id })
        }
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
        const data = await req.json()
        // Store old status for comparison
        const oldStatus = order.orderStatus
        // Allow admin to update orderStatus and paymentStatus
        if (data.orderStatus && ["pending", "processing", "shipped", "delivered", "cancelled"].includes(data.orderStatus)) {
            order.orderStatus = data.orderStatus
        }
        if (data.paymentStatus && ["pending", "paid", "failed"].includes(data.paymentStatus)) {
            order.paymentStatus = data.paymentStatus
        }
        await order.save()
        await order.populate("user", "email name")
        await order.populate("items.product")
        // Send email if status changed and user has email
        if (
            data.orderStatus &&
            data.orderStatus !== oldStatus &&
            order.user && order.user.email
        ) {
            const orderId = order._id.toString().slice(-8).toUpperCase()
            const { subject, html } = getOrderStatusEmail({
                name: order.user.name,
                email: order.user.email,
                orderId,
                newStatus: data.orderStatus
            })
            sendMail({ to: order.user.email, subject, html })
                .catch(err => console.error("Order status email failed:", err))
        }
        return NextResponse.json({ order })
    } catch (err) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
} 