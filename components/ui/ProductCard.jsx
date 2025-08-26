"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Heart, ShoppingCart, Star, Flame, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { addToCartAsync } from "@/lib/features/cart/cartSlice"
import { addToWishlistAsync, removeFromWishlistAsync } from "@/lib/features/wishlist/wishlistSlice"
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils"
import AddToCartModal from "@/components/ui/AddToCartModal";

export default function ProductCard({ product }) {
    const [imageLoading, setImageLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const dispatch = useDispatch()
    const wishlistItems = useSelector((state) => state.wishlist.items)
    // Use _id for MongoDB-based products, fallback to id for legacy/mock
    const productId = product._id || product.id
    const isInWishlist = wishlistItems.some((item) => (item._id || item.id)?.toString() === productId.toString())

    const handleAddToCart = (e) => {
        e.preventDefault()
        setModalOpen(true)
    }

    const handleModalConfirm = async ({ size, color }) => {
        setAdding(true)
        try {
            await dispatch(
                addToCartAsync({
                    productId,
                    quantity: 1,
                    size,
                    color,
                    product, // Pass full product object for guests
                })
            ).unwrap()
            setModalOpen(false)
            toast.success("Added to cart!");
        } catch (err) {
            toast.error("Failed to add to cart");
        } finally {
            setAdding(false)
        }
    }

    const handleWishlistToggle = async (e) => {
        e.preventDefault()
        try {
            if (isInWishlist) {
                await dispatch(removeFromWishlistAsync(productId)).unwrap()
                toast("Removed from wishlist")
            } else {
                await dispatch(addToWishlistAsync(productId)).unwrap()
                toast.success("Added to wishlist!")
            }
        } catch {
            toast.error("Wishlist action failed")
        }
    }

    return (
        <Card className="group overflow-hidden transition-all duration-300 w-full max-w-xs border-0 bg-inherit rounded-xl border-none shadow-none mx-auto p-2">
            <Link href={`/products/${productId}`} className="block focus:outline-none ">
                <div className="relative aspect-[4/5] overflow-hidden bg-inherit rounded-xl">
                    <Image
                        src={
                            product.images?.[0]
                                ? product.images[0].includes('cloudinary')
                                    ? product.images[0].replace('/upload/', '/upload/ar_4:5,c_fill,g_auto,q_auto,f_auto,w_400,h_500/')
                                    : product.images[0]
                                : "/placeholder-portrait.svg?height=500&width=400"
                        }
                        alt={product.name}
                        fill
                        className={`object-cover rounded-xl transition-all duration-700 group-hover:scale-105 ${imageLoading ? "blur-sm" : "blur-0"}`}
                        onLoad={() => setImageLoading(false)}
                        sizes="(max-width: 600px) 100vw, 400px"
                        priority={false}
                    />
                    {/* Wishlist button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-900 shadow"
                        onClick={handleWishlistToggle}
                        tabIndex={0}
                    >
                        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    {/* Featured, New, Trending badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {product.stock === 0 && (
                            <Badge className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">Out of Stock</Badge>
                        )}
                        {product.sale && <Badge className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">SALE!</Badge>}
                        {product.featured && <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white flex items-center gap-1"><Sparkles className="h-3 w-3" /> Featured</Badge>}
                        {product.isNew && <Badge className="bg-blue-500 dark:bg-blue-600 text-white flex items-center gap-1"><Flame className="h-3 w-3" /> New</Badge>}
                        {product.trending && <Badge className="bg-pink-500 dark:bg-pink-600 text-white flex items-center gap-1"><Flame className="h-3 w-3" /> Trending</Badge>}

                    </div>
                    {/* Quick add to cart */}
                    <div className="absolute bottom-2 right-2 opacity-100 lg:opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100">
                        <Button size="sm" className="w-full" onClick={handleAddToCart} disabled={!product.inStock || adding}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            <span className="hidden lg:block">{adding ? "Adding..." : "Add to Cart"}</span>
                        </Button>
                    </div>
                </div>
            </Link>
            <CardContent className="p-0 py-4 bg-inherit -mt-8">
                <Link href={`/products/${productId}`}>
                    <h3 className="font-semibold text-base mb-1 line-clamp-2 min-h-12 hover:text-primary transition-colors dark:text-white">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center mb-2 gap-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-zinc-700"}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                        ({typeof product.reviewCount === "number" ? product.reviewCount : 0})
                    </span>
                </div>
                {/* Colors as circles */}
                {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        {product.colors.map((color, idx) => (
                            <span
                                key={idx}
                                title={color}
                                className="inline-block w-5 h-5 rounded-full border border-gray-300 dark:border-zinc-700 shadow"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-xl text-primary flex items-center gap-2">
                        {formatPrice(product.price)}
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize dark:bg-zinc-800 dark:text-zinc-200">
                        {product.category}
                    </Badge>
                </div>
            </CardContent>
            <AddToCartModal
                product={product}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleModalConfirm}
                loading={adding}
            />
        </Card>
    )
}
