"use client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ProductCard from "@/components/ui/ProductCard"
import FullPageLoader from "@/components/ui/FullPageLoader"

export default function NewArrivalsSection() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/products?isNew=true&sortBy=createdAt&sortOrder=desc&limit=4")
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || [])
                setLoading(false)
            })
    }, [])

    return (
        <section className="py-6 px-4" aria-labelledby="newarrivals-heading">
            <div className="container mx-auto max-w-screen-xl px-4">
                <div className="text-center mb-12">
                    <Badge className="mb-4">Just In</Badge>
                    <h2 id="newarrivals-heading" className="text-3xl md:text-4xl font-bold mb-4">New Arrivals: Latest Modest Fashion</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Stay ahead of the trends with our newest arrivals in hijabs, abayas, and modest wear—crafted for comfort and style.
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
                        <Link href="/products">Shop New Arrivals</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
} 