import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchWishlistAsync = createAsyncThunk(
  "wishlist/fetchWishlistAsync",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/wishlist")
      if (!res.ok) throw new Error("Failed to fetch wishlist")
      const data = await res.json()
      return data.wishlist || [] // now product objects
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addToWishlistAsync",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) throw new Error("Failed to add to wishlist")
      const data = await res.json()
      return data.wishlist || [] // now product objects
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeFromWishlistAsync",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) throw new Error("Failed to remove from wishlist")
      const data = await res.json()
      return data.wishlist || [] // now product objects
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const clearWishlistAsync = createAsyncThunk(
  "wishlist/clearWishlistAsync",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error("Failed to clear wishlist")
      const data = await res.json()
      return data.wishlist || []
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // clearWishlist: (state) => {
    //   state.items = []
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlistAsync.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlistAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(clearWishlistAsync.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
