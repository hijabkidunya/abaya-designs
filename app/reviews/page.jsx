"use client"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchReviews, submitReview } from "@/lib/features/reviews/reviewsSlice"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Star } from "lucide-react"

function StarRating({ rating, setRating, editable }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                    className={
                        (editable ? 'hover:scale-110 transition-transform ' : '') +
                        (i <= rating ? 'text-yellow-400' : 'text-muted-foreground') +
                        " text-xl focus:outline-none"
                    }
                    onClick={editable ? () => setRating(i) : undefined}
                    disabled={!editable}
                ><span><Star/></span></button>
            ))}
        </div>
    )
}

export default function ReviewsPage() {
    const dispatch = useDispatch()
    const { reviews, loading, error } = useSelector((state) => state.reviews)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [formError, setFormError] = useState("")
    const [formSuccess, setFormSuccess] = useState("")

    useEffect(() => {
        dispatch(fetchReviews())
    }, [dispatch])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError("")
        setFormSuccess("")
        if (!rating || !comment.trim()) {
            setFormError("Please provide a rating and comment.")
            toast.error("Please provide a rating and comment.")
            return
        }
        try {
            await dispatch(submitReview({ rating, comment, name, email })).unwrap()
            setFormSuccess("Thank you for your review!")
            toast.success("Thank you for your review!")
            setRating(0)
            setComment("")
            setName("")
            setEmail("")
        } catch (err) {
            setFormError(err.message || "Failed to submit review.")
            toast.error(err.message || "Failed to submit review.")
        }
    }

    return (
        <div className="container mx-auto px-4 py-4 min-h-screen">
            <Toaster position="top-center" richColors />
            <h1 className="text-4xl font-bold mb-8 text-center">Customer Reviews</h1>
            <Card className="max-w-xl mx-auto mb-10 bg-background/80 dark:bg-background/60 shadow-lg border border-border">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-2xl">Share Your Experience</CardTitle>
                        <CardDescription>We value your feedback. Your review may be displayed publicly.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Name (optional)</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email (optional, never shown)</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Rating</Label>
                            <StarRating rating={rating} setRating={setRating} editable />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} required minLength={5} maxLength={500} placeholder="Share your experience..." />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 items-stretch">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Review"}
                        </Button>
                        {formError && <span className="text-destructive text-sm text-center">{formError}</span>}
                        {formSuccess && <span className="text-green-600 dark:text-green-400 text-sm text-center">{formSuccess}</span>}
                    </CardFooter>
                </form>
            </Card>
            <Separator className="my-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(loading ? Array(6).fill({}) : reviews).map((review, idx) => (
                    <Card key={review._id || idx} className="bg-background/80 dark:bg-background/60 border border-border shadow-sm flex flex-col h-full">
                        <CardHeader className="flex-row items-center gap-2 pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span>{review.user?.name || "Anonymous"}</span>
                                {review.user?.email && <Badge variant="secondary">Verified</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <StarRating rating={review.rating || 0} />
                                <span className="text-xs text-muted-foreground">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                            <p className="text-foreground/90 dark:text-foreground/80 italic">"{review.comment || "Loading..."}"</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {error && <div className="text-destructive text-center mt-6">{error}</div>}
        </div>
    )
} 