import dbConnect from '@/lib/mongodb'
import Review from '@/lib/models/Review'
import Product from '@/lib/models/Product'
import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(req) {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product')
    let reviews
    if (productId) {
        reviews = await Review.find({ product: productId }).sort({ createdAt: -1 })
    } else {
        // Return all reviews (global and product reviews)
        reviews = await Review.find({}).sort({ createdAt: -1 })
    }
    return NextResponse.json({ reviews })
}

export async function POST(req) {
    await dbConnect()
    const contentType = req.headers.get('content-type')
    try {
        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle product review with image
            const formData = await req.formData()
            const rating = Number(formData.get('rating'))
            const comment = formData.get('comment') || ''
            const name = formData.get('name') || 'Anonymous'
            const email = formData.get('email') || ''
            const product = formData.get('product')
            let imageUrl = ''
            const imageFile = formData.get('image')
            if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
                // Convert file to base64 data URI for Cloudinary upload
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const mimeType = imageFile.type || "image/jpeg";
                const base64 = buffer.toString("base64");
                const dataUri = `data:${mimeType};base64,${base64}`;
                imageUrl = await uploadImage(dataUri);
            }
            if (!rating || rating < 1 || rating > 5) {
                return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
            }
            if (!product) {
                return NextResponse.json({ error: 'Product is required for product reviews' }, { status: 400 })
            }
            // comment is optional for product reviews
            const review = await Review.create({
                user: { name, email },
                rating,
                comment,
                product,
                image: imageUrl,
                createdAt: new Date(),
            })
            // Update product's rating and reviewCount
            const allProductReviews = await Review.find({ product });
            const newReviewCount = allProductReviews.length;
            const newAverageRating = newReviewCount > 0 ? (allProductReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / newReviewCount) : 0;
            await Product.findByIdAndUpdate(product, {
                rating: newAverageRating,
                reviewCount: newReviewCount,
            });
            return NextResponse.json({ review })
        } else {
            // Handle global review (testimonial)
            const { rating, comment, name, email } = await req.json()
            if (!rating || !comment || rating < 1 || rating > 5) {
                return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
            }
            // Allow anonymous reviews, but save name/email if provided
            const review = await Review.create({
                user: {
                    name: name || 'Anonymous',
                    email: email || '',
                },
                rating,
                comment,
                createdAt: new Date(),
            })
            return NextResponse.json({ review })
        }
    } catch (err) {
        return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 })
    }
} 