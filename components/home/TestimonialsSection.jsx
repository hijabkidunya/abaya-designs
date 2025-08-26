"use client"
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReviews } from '@/lib/features/reviews/reviewsSlice'
import Link from 'next/link'
import FullPageLoader from "@/components/ui/FullPageLoader"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            ))}
        </div>
    )
}

export default function TestimonialsSection() {
    const dispatch = useDispatch()
    const { reviews, loading } = useSelector((state) => state.reviews)

    useEffect(() => {
        dispatch(fetchReviews())
    }, [dispatch])

    return (
        <section className="py-6 px-4 bg-muted/30" aria-labelledby="testimonials-heading">
            <div className="container mx-auto max-w-screen-xl px-4">
                <div className="text-center mb-12">
                    <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Real feedback from our valued customers. Your satisfaction is our priority.
                    </p>
                </div>
                {loading ? (
                    <FullPageLoader />
                ) : (
                    <div className="relative">
                        <Carousel className="w-full" aria-label="Testimonials carousel">
                            <CarouselContent className="grid-cols-1 md:grid-cols-3">
                                {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, slideIdx) => (
                                    <CarouselItem key={slideIdx} className="flex gap-8">
                                        {reviews.slice(slideIdx * 3, slideIdx * 3 + 3).map((review, idx) => (
                                            <Card key={review._id || idx} className="flex-1 min-w-0 max-w-md mx-auto flex flex-col h-full shadow-md border bg-card">
                                                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                                    <CardTitle className="text-lg font-semibold truncate max-w-[120px]">
                                                        {review.user?.name || 'Anonymous'}
                                                    </CardTitle>
                                                    <StarRating rating={review.rating || 0} />
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col gap-4">
                                                    <p className="text-muted-foreground italic line-clamp-4">"{review.comment || 'No comment provided.'}"</p>
                                                    <div className="mt-auto text-xs text-gray-400 flex items-center gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {review.createdAt ? new Date(review.createdAt).toLocaleString() : ''}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                )}
                <div className="flex justify-center mt-4">
                    <Link href="/reviews" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition font-semibold">Read All Reviews & Share Yours</Link>
                </div>
            </div>
        </section>
    )
} 