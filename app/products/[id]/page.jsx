"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { Star, Heart, ShoppingCart, Minus, Plus, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { addToCartAsync } from "@/lib/features/cart/cartSlice"
import { addToWishlistAsync, removeFromWishlistAsync } from "@/lib/features/wishlist/wishlistSlice"
import ProductCard from "@/components/ui/ProductCard"
import { toast } from "sonner";
import AddToCartModal from "@/components/ui/AddToCartModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { fetchProductReviews, submitProductReview } from "@/lib/features/reviews/reviewsSlice";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params?.id;
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState("")
    const [selectedColor, setSelectedColor] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [modalOpen, setModalOpen] = useState(false);

    const dispatch = useDispatch()
    const wishlistItems = useSelector((state) => state.wishlist.items)
    const isInWishlist = product && wishlistItems.some((item) => (item._id || item.id)?.toString() === product._id.toString())
    const { reviews, loading: reviewsLoading, error: reviewsError } = useSelector((state) => state.reviews);

    useEffect(() => {
        if (!productId || productId === "undefined") {
            setError("Invalid product ID.");
            setLoading(false);
            return;
        }
        async function fetchProduct() {
            setLoading(true)
            setError("")
            try {
                const res = await fetch(`/api/products/${productId}`)
                if (!res.ok) throw new Error("Product not found")
                const data = await res.json()
                setProduct(data.product)
                setRelatedProducts(data.relatedProducts)
                setSelectedImage(0)
                setSelectedSize("")
                setSelectedColor("")
                setQuantity(1)
            } catch (err) {
                setError(err.message || "Failed to load product")
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [productId])

    // Fetch product reviews on mount or when productId changes
    useEffect(() => {
        if (productId && productId !== "undefined") {
            dispatch(fetchProductReviews(productId));
        }
    }, [dispatch, productId]);

    // Calculate average rating from product reviews
    const productReviews = reviews || [];
    const averageRating = productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / productReviews.length).toFixed(1) : "0.0";

    // Review form state
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");
    const [selectedReviewImage, setSelectedReviewImage] = useState(null);
    const [starRating, setStarRating] = useState(0);
    const fileInputRef = useRef();

    // Watch for file input changes
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedReviewImage(file || null);
    };

    // Handle star rating click
    const handleStarClick = (rating) => {
        setStarRating(rating);
        setValue("rating", rating, { shouldValidate: true });
    };

    // Submit review
    const onSubmitReview = async (data) => {
        setReviewLoading(true);
        setReviewError("");
        setReviewSuccess("");
        try {
            const formData = new FormData();
            formData.append("product", productId);
            formData.append("rating", starRating);
            if (data.comment) formData.append("comment", data.comment);
            if (data.name) formData.append("name", data.name);
            if (data.email) formData.append("email", data.email);
            if (selectedReviewImage) formData.append("image", selectedReviewImage);
            await dispatch(submitProductReview(formData)).unwrap();
            setReviewSuccess("Review submitted successfully!");
            reset();
            setStarRating(0);
            setSelectedReviewImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            // Refetch product data to update rating and reviewCount
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data.product);
            }
        } catch (err) {
            setReviewError(err.message || "Failed to submit review");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleAddToCart = () => {
        if ((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
            setModalOpen(true);
            return;
        }
        dispatch(
            addToCartAsync({
                productId: product._id || product.id,
                quantity,
                size: selectedSize,
                color: selectedColor,
                product: product, // Pass the full product data
            })
        );
        toast.success("Added to cart!");
    }

    const handleModalConfirm = ({ size, color }) => {
        setSelectedSize(size);
        setSelectedColor(color);
        dispatch(
            addToCartAsync({
                productId: product._id || product.id,
                quantity,
                size,
                color,
                product: product, // Pass the full product data
            })
        );
        setModalOpen(false);
        toast.success("Added to cart!");
    };

    const handleWishlistToggle = async () => {
        if (!product) return;
        try {
            if (isInWishlist) {
                await dispatch(removeFromWishlistAsync(product._id)).unwrap();
                toast("Removed from wishlist");
            } else {
                await dispatch(addToWishlistAsync(product._id)).unwrap();
                toast.success("Added to wishlist!");
            }
        } catch {
            toast.error("Wishlist action failed");
        }
    }

    if (loading) {
        return <div className="container mx-auto px-4 py-16 text-center text-lg">Loading...</div>
    }
    if (error || !product) {
        toast.error(error || "Product not found");
        return <div className="container mx-auto px-4 py-16 text-center text-red-500 text-lg">{error || "Product not found"}</div>
    }

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="relative w-full h-[500px] overflow-hidden rounded-lg border">
                        <Image
                            src={product.images[selectedImage] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain"
                        />
                        {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-500">-{discount}%</Badge>}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {product.images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative w-full h-24 overflow-hidden rounded border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-muted"}`}
                            >
                                <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`${product.name} ${index + 1}`}
                                    fill
                                    className="object-contain"
                                />
                            </button>
                        ))}
                    </div>
                </div>
                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <Badge className="mb-2 capitalize">{product.category}</Badge>
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {typeof product.rating === "number" ? product.rating.toFixed(1) : "0.0"} ({typeof product.reviewCount === "number" ? product.reviewCount : 0} reviews)
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold">₨{Number(product.price).toLocaleString("en-PK")}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-xl text-muted-foreground line-through">₨{Number(product.originalPrice).toLocaleString("en-PK")}</span>
                        )}
                    </div>
                    <p className="text-muted-foreground">{product.description}</p>
                    {/* Size Selection */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <label className="text-sm font-medium mb-2 block">Size</label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {product.sizes.map((size) => (
                                        <SelectItem key={size} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {/* Color Selection */}
                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <label className="text-sm font-medium mb-2 block">Color</label>
                            <Select value={selectedColor} onValueChange={setSelectedColor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {product.colors.map((color) => (
                                        <SelectItem key={color} value={color}>
                                            <span className="inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 align-middle mr-2" style={{ backgroundColor: color }} title={color} />
                                            {color}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {/* Quantity */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Quantity</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1 || product.stock === 0}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center">{quantity}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={quantity >= product.stock || product.stock === 0}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {product.stock > 0 ? (
                            product.stock < 10 ? (
                                <p className="text-sm text-yellow-600 mt-1 font-semibold">Low stock: {product.stock} left</p>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-1">{product.stock} items in stock</p>
                            )
                        ) : (
                            <p className="text-sm text-red-500 mt-1 font-semibold">Out of stock</p>
                        )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleWishlistToggle}>
                            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button variant="outline" size="lg">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* Features */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-primary" />
                                    <span>Free shipping on orders over Rs 10,000</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span>Secure payment options</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4 text-primary" />
                                    <span>3-day return policy</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Product Details */}
                    {/* <div className="text-sm text-muted-foreground">
                        <p>SKU: {product.sku}</p>
                        <p>Category: {product.category}</p>
                    </div> */}
                </div>
            </div>
            {/* Product Details Tabs */}
            <div className="mt-16">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
                        <TabsTrigger value="shipping">Shipping</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Product Features</h3>
                                <ul className="space-y-2">
                                    {product.features && product.features.length > 0 ? (
                                        product.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                                {feature}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-muted-foreground">No features listed.</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-base text-muted-foreground">{averageRating} ({productReviews.length} reviews)</span>
                                </div>
                                {/* Review Form */}
                                <Card className="mb-8 bg-muted/50 border-none shadow-none">
                                    <CardContent className="p-6">
                                        <form className="space-y-6" onSubmit={handleSubmit(onSubmitReview)}>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                                                <Label className="mb-1 sm:mb-0 font-semibold text-base text-foreground">Rating <span className="text-red-500 text-base">*</span></Label>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => handleStarClick(star)}
                                                            className={`focus:outline-none rounded-full p-1 transition-colors ${starRating >= star ? "bg-yellow-100 dark:bg-yellow-900" : "hover:bg-muted"}`}
                                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                                        >
                                                            <Star className={`h-7 w-7 transition-colors ${starRating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-400 dark:text-zinc-600"}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {errors.rating && <span className="text-red-500 text-xs">Rating is required.</span>}
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="comment" className="font-semibold text-base text-foreground">Comment</Label>
                                                <Textarea id="comment" {...register("comment")} placeholder="Share your experience (optional)" maxLength={500} className="bg-card border border-border rounded-lg px-4 py-3 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors placeholder:text-muted-foreground dark:bg-zinc-900 dark:border-zinc-700" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="image" className="font-semibold text-base text-foreground">Photo (optional)</Label>
                                                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="bg-card border border-border rounded-lg px-4 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors file:bg-muted file:border-none file:rounded file:px-3 file:py-1.5 file:text-sm file:font-medium dark:bg-zinc-900 dark:border-zinc-700" />
                                                {selectedReviewImage && (
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="relative w-20 h-20">
                                                            <Image
                                                                src={URL.createObjectURL(selectedReviewImage)}
                                                                alt="Preview"
                                                                fill
                                                                className="object-contain rounded border bg-background"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setSelectedReviewImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                            className="text-xs text-red-500 underline hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 flex flex-col gap-2">
                                                    <Label htmlFor="name" className="font-semibold text-base text-foreground">Name</Label>
                                                    <Input id="name" {...register("name")} placeholder="Your name (optional)" className="bg-card border border-border rounded-lg px-4 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors placeholder:text-muted-foreground dark:bg-zinc-900 dark:border-zinc-700" />
                                                </div>
                                                <div className="flex-1 flex flex-col gap-2">
                                                    <Label htmlFor="email" className="font-semibold text-base text-foreground">Email</Label>
                                                    <Input id="email" type="email" {...register("email")} placeholder="Your email (optional)" className="bg-card border border-border rounded-lg px-4 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors placeholder:text-muted-foreground dark:bg-zinc-900 dark:border-zinc-700" />
                                                </div>
                                            </div>
                                            {reviewError && <div className="text-red-500 text-sm font-medium">{reviewError}</div>}
                                            {reviewSuccess && <div className="text-green-600 text-sm font-medium">{reviewSuccess}</div>}
                                            <div className="flex justify-end">
                                                <Button type="submit" size="lg" disabled={reviewLoading || !starRating} className="mt-2 min-w-[160px]">
                                                    {reviewLoading ? "Submitting..." : "Submit Review"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                                {/* Reviews List */}
                                <div className="space-y-6">
                                    {reviewsLoading ? (
                                        <div>Loading reviews...</div>
                                    ) : reviewsError ? (
                                        <div className="text-red-500">{reviewsError}</div>
                                    ) : productReviews.length > 0 ? (
                                        productReviews.map((review) => (
                                            <div key={review._id || review.date} className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span>
                                                </div>
                                                {review.comment && <p className="text-muted-foreground mb-2">{review.comment}</p>}
                                                {review.image && (
                                                    <div className="mb-2">
                                                        <Image src={review.image} alt="Review photo" width={120} height={120} className="rounded border object-cover" />
                                                    </div>
                                                )}
                                                <Separator className="mt-4" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground">No reviews yet.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="shipping" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Shipping Information</h3>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            <li>• Free shipping on orders over Rs 10,000</li>
                                            <li>• Standard delivery: 3-5 business days</li>
                                            <li>• International shipping available</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Return Policy</h3>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            <li>• 3-day return window from delivery date</li>
                                            <li>• Items must be in original condition</li>
                                            <li>• Return shipping costs may apply</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            {/* Related Products */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedProducts.map((relatedProduct) => (
                        <ProductCard key={relatedProduct._id} product={relatedProduct} />
                    ))}
                </div>
            </div>
            <AddToCartModal
                product={product}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleModalConfirm}
                loading={false}
            />
        </div>
    )
}
