"use client"

import { useSelector, useDispatch } from "react-redux"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/ui/ProductCard"
import { clearWishlistAsync } from "@/lib/features/wishlist/wishlistSlice"
import { useEffect } from "react"
import { fetchWishlistAsync } from "@/lib/features/wishlist/wishlistSlice"

export default function WishlistPage() {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)

  useEffect(() => {
    dispatch(fetchWishlistAsync())
  }, [dispatch])

  const handleClearWishlist = () => {
    dispatch(clearWishlistAsync())
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">Save items you love to your wishlist and shop them later.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <Button variant="outline" onClick={handleClearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {wishlistItems.map((product, index) => (
          <div
            key={product._id || product.id || index}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
