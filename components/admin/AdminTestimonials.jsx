import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Star } from "lucide-react";

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
}

export default function AdminTestimonials({ products }) {
    const [serviceReviews, setServiceReviews] = useState([]);
    const [productReviews, setProductReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch("/api/reviews")
            .then((res) => res.json())
            .then((data) => {
                const allReviews = data.reviews || [];
                // Split reviews
                const service = allReviews.filter(r => !r.product);
                const productR = allReviews.filter(r => r.product);
                // Join product reviews with product name
                const productReviewsWithName = productR.map((review) => {
                    const prod = products?.find(p => String(p._id || p.id) === String(review.product?._id || review.product || ""));
                    return {
                        ...review,
                        productName: prod?.name || "Unknown Product",
                        productId: prod?._id || prod?.id || review.product || "",
                        user: review.user?.name || "Anonymous",
                        date: review.createdAt || review.date,
                    };
                });
                setServiceReviews(service);
                setProductReviews(productReviewsWithName);
                setError("");
            })
            .catch(() => setError("Failed to fetch reviews."))
            .finally(() => setLoading(false));
    }, [products]);

    return (
        <div className="space-y-12">
            {/* Service Reviews Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Service Reviews / Testimonials</h2>
                <Card className="shadow-lg">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center min-h-[20vh] py-8">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center min-h-[20vh] py-8 text-destructive">
                                <AlertCircle className="h-6 w-6 mr-2" /> {error}
                            </div>
                        ) : serviceReviews.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No service reviews found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border rounded-xl bg-background">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left">Name</th>
                                            <th className="p-3 text-left">Email</th>
                                            <th className="p-3 text-left">Rating</th>
                                            <th className="p-3 text-left">Comment</th>
                                            <th className="p-3 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceReviews.map((review, idx) => (
                                            <tr key={review._id || idx} className="border-b hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-medium">{review.user?.name || "Anonymous"}</td>
                                                <td className="p-3 text-xs">{review.user?.email || <span className="text-muted-foreground">-</span>}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1">
                                                        <StarRating rating={review.rating || 0} />
                                                        <span className="ml-2 text-xs">{review.rating}/5</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-muted-foreground max-w-xs truncate">{review.comment}</td>
                                                <td className="p-3 text-xs">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
            <Separator className="my-8" />
            {/* Product Reviews Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Product Reviews</h2>
                <Card className="shadow-lg">
                    <CardContent className="p-0">
                        {products && productReviews.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No product reviews found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border rounded-xl bg-background">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left">Product</th>
                                            <th className="p-3 text-left">User</th>
                                            <th className="p-3 text-left">Rating</th>
                                            <th className="p-3 text-left">Comment</th>
                                            <th className="p-3 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productReviews.map((review, idx) => (
                                            <tr key={review.productId + "-" + (review._id || idx)} className="border-b hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-medium">{review.productName}</td>
                                                <td className="p-3">{review.user}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1">
                                                        <StarRating rating={review.rating || 0} />
                                                        <span className="ml-2 text-xs">{review.rating}/5</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-muted-foreground max-w-xs truncate">{review.comment}</td>
                                                <td className="p-3 text-xs">{review.date ? new Date(review.date).toLocaleDateString() : ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
} 