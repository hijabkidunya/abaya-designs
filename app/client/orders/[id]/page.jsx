"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RotateCcw, XCircle, ArrowLeft } from "lucide-react"
import { formatPrice } from "@/lib/utils"

const statusBadgeVariant = (status) => {
    switch (status) {
        case "delivered": return "success"
        case "shipped": return "default"
        case "processing": return "outline"
        case "cancelled": return "destructive"
        case "pending": return "secondary"
        default: return "outline"
    }
}

export default function OrderDetailsPage() {
    const router = useRouter()
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        setError("")
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.order) setOrder(data.order)
                else setError(data.error || "Order not found.")
            })
            .catch(() => setError("Failed to fetch order."))
            .finally(() => setLoading(false))
    }, [id])

    const handleReorder = async () => {
        if (!order) return
        setActionLoading(true)
        try {
            // Add all items to cart (call API or dispatch Redux action)
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: order.items.map(item => ({
                        productId: item.product._id,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                    }))
                })
            })
            if (!res.ok) throw new Error("Failed to reorder.")
            router.push("/cart")
        } catch {
            alert("Failed to reorder. Please try again.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancel = async () => {
        if (!order) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/orders/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderStatus: "cancelled" })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to cancel order.")
            setOrder(data.order)
        } catch {
            alert("Failed to cancel order. Please try again.")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    }
    if (error) {
        return <div className="flex flex-col items-center justify-center h-64 text-destructive"><XCircle className="h-8 w-8 mb-2" /><p className="text-lg font-semibold">{error}</p></div>
    }
    if (!order) return null

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            <h1 className="text-2xl font-bold mb-2">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <Badge className="mb-4" variant={statusBadgeVariant(order.orderStatus)}>{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</Badge>
            <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Placed on: {new Date(order.createdAt).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mb-1">Payment: <span className="font-medium">{order.paymentMethod}</span></div>
                <div className="text-sm text-muted-foreground mb-1">Status: <span className="font-medium">{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</span></div>
                <div className="text-sm text-muted-foreground mb-1">Total: <span className="font-bold">{formatPrice(order.total)}</span></div>
            </div>
            <div className="mb-6">
                <h2 className="font-semibold mb-2">Shipping Address</h2>
                <div className="text-sm text-muted-foreground">
                    <div>{order.shippingAddress.street}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                    <div>{order.shippingAddress.country}</div>
                </div>
            </div>
            <div className="mb-6">
                <h2 className="font-semibold mb-2">Items</h2>
                <div className="space-y-3">
                    {order.items.map(item => (
                        <div key={item._id} className="flex items-center gap-3 border rounded-lg px-3 py-2 bg-muted/40">
                            {item.product?.images?.[0] && (
                                <img src={item.product.images[0]} alt={item.product.name} className="h-12 w-12 object-cover rounded" />
                            )}
                            <div className="flex-1">
                                <div className="font-medium">{item.product?.name || "Product"}</div>
                                <div className="text-xs text-muted-foreground">Qty: {item.quantity} | Size: {item.size || "-"} | Color: {item.color ? <span className='inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 align-middle mr-1' style={{ backgroundColor: item.color }} title={item.color} /> : "-"}</div>
                                <div className="text-xs text-muted-foreground">Price: {formatPrice(item.price)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Button size="sm" variant="ghost" onClick={handleReorder} disabled={actionLoading}><RotateCcw className="h-4 w-4 mr-1" /> Reorder</Button>
                {order.orderStatus === "pending" && (
                    <Button size="sm" variant="destructive" onClick={handleCancel} disabled={actionLoading}><XCircle className="h-4 w-4 mr-1" /> Cancel</Button>
                )}
            </div>
        </div>
    )
} 