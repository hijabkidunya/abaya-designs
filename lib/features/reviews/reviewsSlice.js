import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchReviews = createAsyncThunk('reviews/fetchReviews', async () => {
    const res = await fetch('/api/reviews')
    if (!res.ok) throw new Error('Failed to fetch reviews')
    const data = await res.json()
    return data.reviews
})

export const fetchProductReviews = createAsyncThunk('reviews/fetchProductReviews', async (productId) => {
    const res = await fetch(`/api/reviews?product=${productId}`)
    if (!res.ok) throw new Error('Failed to fetch product reviews')
    const data = await res.json()
    return data.reviews
})

export const submitReview = createAsyncThunk('reviews/submitReview', async (review) => {
    const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
    })
    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit review')
    }
    const data = await res.json()
    return data.review
})

export const submitProductReview = createAsyncThunk('reviews/submitProductReview', async (formData) => {
    const res = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
    })
    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit product review')
    }
    const data = await res.json()
    return data.review
})

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        reviews: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false
                state.reviews = action.payload
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            .addCase(fetchProductReviews.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProductReviews.fulfilled, (state, action) => {
                state.loading = false
                state.reviews = action.payload
            })
            .addCase(fetchProductReviews.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            .addCase(submitReview.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(submitReview.fulfilled, (state, action) => {
                state.loading = false
                state.reviews = [action.payload, ...state.reviews]
            })
            .addCase(submitReview.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            .addCase(submitProductReview.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(submitProductReview.fulfilled, (state, action) => {
                state.loading = false
                state.reviews = [action.payload, ...state.reviews]
            })
            .addCase(submitProductReview.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
    },
})

export default reviewsSlice.reducer 