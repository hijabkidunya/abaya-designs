"use client"

import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { removeFromCartAsync, updateCartItemAsync, clearCartAsync, fetchCart } from "@/lib/features/cart/cartSlice"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
    const dispatch = useDispatch()
    const { items, total, itemCount, loading, error, loaded } = useSelector((state) => state.cart)
    const { isAuthenticated } = useSelector((state) => state.auth)
    // Removed paymentMethod state

    useEffect(() => {
        dispatch(fetchCart())
    }, [dispatch])

    // Debug logging
    useEffect(() => {
        console.log('Cart state:', { items, total, itemCount, loading, error, loaded, isAuthenticated })
    }, [items, total, itemCount, loading, error, loaded, isAuthenticated])

    const handleQuantityChange = (item, newQuantity) => {
        const productId = item.product._id || item.product.id || item.productId;
        if (newQuantity <= 0) {
            dispatch(removeFromCartAsync({ productId, size: item.size, color: item.color }))
        } else {
            dispatch(updateCartItemAsync({ productId, size: item.size, color: item.color, quantity: newQuantity }))
        }
    }

    const handleRemoveItem = (item) => {
        const productId = item.product._id || item.product.id || item.productId;
        dispatch(removeFromCartAsync({ productId, size: item.size, color: item.color }))
    }

    const handleClearCart = () => {
        dispatch(clearCartAsync())
    }

    // COD charge: mandatory 400 Rupees for all orders
    const codCharge = 400
    // Final total
    const finalTotal = total + codCharge

    if (loading && !loaded) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold mb-2">Loading your cart...</h1>
                    <p className="text-muted-foreground">Please wait while we load your shopping cart.</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <ShoppingBag className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2 text-red-500">Error loading cart</h1>
                    <p className="text-muted-foreground mb-6">There was an issue loading your cart. Please try refreshing the page.</p>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            </div>
        )
    }

    if (loaded && (!items || items.length === 0)) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center max-w-md mx-auto">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
                    <Button asChild>
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <Button variant="outline" onClick={handleClearCart}>
                    Clear Cart
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.filter(item => item.product && (item.product._id || item.product.id || item.productId)).map((item) => (
                        <Card key={`${item.product._id || item.product.id || item.productId}-${item.size || 'default'}-${item.color || 'default'}`}>
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                                        <Image
                                            src={
                                                item.product?.images?.[0] && item.product.images[0] !== ""
                                                    ? item.product.images[0]
                                                    : "/placeholder.svg"
                                            }
                                            alt={item.product?.name || "Product image"}
                                            fill
                                            sizes="96px"
                                            className="object-contain"
                                            onError={(e) => {
                                                e.target.src = "/placeholder.svg";
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">{item.product?.name || "Product"}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    {item.size && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {item.size}
                                                        </Badge>
                                                    )}
                                                    {item.color && (
                                                        <span
                                                            className="inline-block w-5 h-5 rounded-full border border-gray-300 dark:border-zinc-700 shadow align-middle"
                                                            style={{ backgroundColor: item.color }}
                                                            title={item.color}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal ({itemCount} items)</span>
                                <span>{formatPrice(total)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>COD Charges</span>
                                <span>{formatPrice(codCharge)}</span>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>

                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                Cash on Delivery (COD) charges apply to all orders
                            </div>

                            <Button className="w-full" size="lg" asChild>
                                <Link href="/checkout">Proceed to Checkout</Link>
                            </Button>

                            <Button variant="outline" className="w-full bg-transparent" asChild>
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
