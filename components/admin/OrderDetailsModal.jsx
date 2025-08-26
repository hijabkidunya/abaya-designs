import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"

export default function OrderDetailsModal({ open, onOpenChange, order, onOrderStatusChange, onPaymentStatusChange, loading, error, onClose }) {
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
    const [previewImage, setPreviewImage] = useState(null)
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8" style={{ overscrollBehavior: 'contain' }}>
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    {order && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                <div>
                                    <div className="font-mono text-lg font-bold mb-1">Order #{order._id.slice(-8).toUpperCase()}</div>
                                    <div className="text-sm text-muted-foreground">Placed: {new Date(order.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={statusBadgeVariant(order.orderStatus)}>{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</Badge>
                                    <Badge variant="secondary">{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</Badge>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="font-semibold">User:</div>
                                <div className="text-sm text-muted-foreground">{order.user?.email || order.user}</div>
                                {(order.firstName || order.lastName) && (
                                    <div className="text-sm">{order.firstName} {order.lastName}</div>
                                )}
                                {order.phone && (
                                    <div className="text-sm">{order.phone}</div>
                                )}
                            </div>
                            <div className="mb-2">
                                <div className="font-semibold">Shipping Address:</div>
                                <div className="text-sm text-muted-foreground">
                                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="font-semibold">Items:</div>
                                <div className="space-y-2">
                                    {order.items.map(item => (
                                        <div key={item._id} className="flex items-center gap-3 border rounded-lg px-3 py-2 bg-muted/40">
                                            {item.product?.images?.[0] && (
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="h-10 w-10 object-cover rounded cursor-pointer transition-transform duration-200 hover:scale-110 border border-gray-300"
                                                    onClick={() => setPreviewImage(item.product.images[0])}
                                                />
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
                            <div className="mb-2">
                                <div className="font-semibold">Total:</div>
                                <div className="text-lg font-bold">{formatPrice(order.total)}</div>
                            </div>
                            <div className="mb-2 flex flex-col md:flex-row gap-4">
                                <div>
                                    <div className="font-semibold mb-1">Order Status</div>
                                    <Select value={order.orderStatus} onValueChange={onOrderStatusChange} disabled={loading}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <div className="font-semibold mb-1">Payment Status</div>
                                    <Select value={order.paymentStatus} onValueChange={onPaymentStatusChange} disabled={loading}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {error && <div className="text-destructive text-sm mt-2">{error}</div>}
                        </div>
                    )}
                    <DialogFooter className="sticky hidden md:block bottom-0 bg-background pt-4 pb-2 z-10">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="flex flex-col items-center justify-center max-w-lg w-full max-h-[90vh] p-4">
                    <img src={previewImage} alt="Preview" className="max-h-[70vh] w-auto rounded shadow-lg border border-gray-200" />
                    <Button className="mt-4" variant="outline" onClick={() => setPreviewImage(null)}>Close Preview</Button>
                </DialogContent>
            </Dialog>
        </>
    )
} 