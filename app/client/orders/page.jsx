"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, RotateCcw, XCircle } from "lucide-react"
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

export default function OrdersPage() {
    const { data: session, status } = useSession()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true)
            setError("")
            try {
                const res = await fetch("/api/orders")
                const data = await res.json()
                if (res.ok && data.orders) {
                    setOrders(data.orders)
                } else {
                    setError(data.error || "Failed to fetch orders.")
                }
            } catch (err) {
                setError("Failed to fetch orders.")
            } finally {
                setLoading(false)
            }
        }
        if (status === "authenticated") {
            fetchOrders()
        } else if (status === "unauthenticated") {
            setLoading(false)
            setError("You must be signed in to view your orders.")
        }
    }, [status])

    const handleReorder = (order) => {
        // Placeholder for reorder logic
        alert("Reorder functionality coming soon!")
    }

    const handleCancel = (orderId) => {
        // Placeholder for cancel logic
        alert("Cancel functionality coming soon!")
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
                <XCircle className="h-8 w-8 mb-2" />
                <p className="text-lg font-semibold">{error}</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            {orders.length === 0 ? (
                <div className="text-center text-muted-foreground py-20">
                    <p className="text-lg">You have not placed any orders yet.</p>
                    <Link href="/products">
                        <Button className="mt-4">Shop Now</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="border rounded-xl p-6 shadow-sm bg-background">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Order #</span>
                                    <span className="font-mono text-base">{order._id.slice(-8).toUpperCase()}</span>
                                    <Badge className="ml-2" variant={statusBadgeVariant(order.orderStatus)}>
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 mb-2">
                                {order.items.map(item => (
                                    <div key={item._id} className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-muted/40">
                                        {item.product?.images?.[0] && (
                                            <img src={item.product.images[0]} alt={item.product.name} className="h-12 w-12 object-cover rounded" />
                                        )}
                                        <div>
                                            <div className="font-medium">{item.product?.name || "Product"}</div>
                                            <div className="text-xs text-muted-foreground">Qty: {item.quantity} | Size: {item.size || "-"} | Color: {item.color ? <span className='inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 align-middle mr-1' style={{ backgroundColor: item.color }} title={item.color} /> : "-"}</div>
                                            <div className="text-xs text-muted-foreground">Price: {formatPrice(item.price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
                                <div className="text-sm text-muted-foreground">
                                    <span>Payment: </span>
                                    <span className="font-medium">{order.paymentMethod}</span>
                                    <span className="ml-4">Status: </span>
                                    <span className="font-medium">{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</span>
                                </div>
                                <div className="text-lg font-bold">Total: {formatPrice(order.total)}</div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/client/orders/${order._id}`}><Eye className="h-4 w-4 mr-1" /> View Details</Link>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleReorder(order)}><RotateCcw className="h-4 w-4 mr-1" /> Reorder</Button>
                                {order.orderStatus === "pending" && (
                                    <Button size="sm" variant="destructive" onClick={() => handleCancel(order._id)}><XCircle className="h-4 w-4 mr-1" /> Cancel</Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 