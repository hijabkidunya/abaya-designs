"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts } from "@/lib/features/productsSlice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ProductCard from "@/components/ui/ProductCard"
import FullPageLoader from "@/components/ui/FullPageLoader"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"

export default function SaleProductsSection() {
    const dispatch = useDispatch()
    const { items: products, loading } = useSelector(state => state.products)

    useEffect(() => {
        dispatch(fetchProducts({ sale: true }))
    }, [dispatch])

    // Only show products with sale === true (in case of stale cache)
    const saleProducts = (products || []).filter(p => p.sale)
    const slides = []
    const perSlide = 4
    for (let i = 0; i < saleProducts.length; i += perSlide) {
        slides.push(saleProducts.slice(i, i + perSlide))
    }

    return (
        <section className="py-6 px-4 bg-muted/30" aria-labelledby="sale-heading">
            <div className="container mx-auto max-w-screen-xl px-4">
                <div className="text-center mb-12">
                    <Badge className="mb-4">On Sale</Badge>
                    <h2 id="sale-heading" className="text-3xl md:text-4xl font-bold mb-4">Hot Deals: Sale Products</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Shop our best deals on modest fashion. Limited time offers on select hijabs, abayas, and accessories!
                    </p>
                </div>
                {loading ? (
                    <FullPageLoader />
                ) : saleProducts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">No sale products available right now.</div>
                ) : (
                    <div className="relative">
                        <Carousel className="w-full">
                            <CarouselContent>
                                {slides.map((slide, idx) => (
                                    <CarouselItem key={idx} className="flex gap-8">
                                        {slide.map(product => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                )}
                <div className="text-center mt-4">
                    <Button size="lg" asChild>
                        <Link href="/products">Shop All Sale</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
} 