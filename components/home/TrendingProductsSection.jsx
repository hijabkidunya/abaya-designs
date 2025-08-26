"use client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ProductCard from "@/components/ui/ProductCard"
import FullPageLoader from "@/components/ui/FullPageLoader"

export default function TrendingProductsSection() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/products?trending=true")
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || [])
                setLoading(false)
            })
    }, [])

    return (
        <section className="py-6 px-4 bg-muted/30" aria-labelledby="trending-heading">
            <div className="container mx-auto max-w-screen-xl px-4">
                <div className="text-center mb-12">
                    <Badge className="mb-4">Most Demanding</Badge>
                    <h2 id="trending-heading" className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover our most popular pieces loved by customers worldwide
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        <FullPageLoader />
                    ) : (
                        products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>
                <div className="text-center mt-4">
                    <Button size="lg" asChild>
                        <Link href="/products">View All Products</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
} 