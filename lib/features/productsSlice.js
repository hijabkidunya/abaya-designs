import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks for CRUD operations
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (options = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            // Support multi-select category
            if (options.category && Array.isArray(options.category) && options.category.length) {
                options.category.forEach((cat) => params.append("category", cat));
            } else if (options.category) {
                params.append("category", options.category);
            }
            if (options.search) params.append("search", options.search);
            if (options.minPrice) params.append("minPrice", options.minPrice);
            if (options.maxPrice) params.append("maxPrice", options.maxPrice);
            if (options.featured) params.append("featured", options.featured);
            if (options.colors && options.colors.length)
                options.colors.forEach((color) => params.append("colors", color));
            if (options.sizes && options.sizes.length)
                options.sizes.forEach((size) => params.append("sizes", size));
            if (options.sortBy) params.append("sortBy", options.sortBy);
            if (options.sortOrder) params.append("sortOrder", options.sortOrder);
            if (options.page) params.append("page", options.page);
            if (options.limit) params.append("limit", options.limit);

            let url = "/api/products";
            if ([...params].length) url += `?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch products");
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const addProduct = createAsyncThunk(
    "products/addProduct",
    async (product, { rejectWithValue }) => {
        try {
            let options = { method: "POST" };
            if (product instanceof FormData) {
                options.body = product;
            } else {
                options.headers = { "Content-Type": "application/json" };
                options.body = JSON.stringify(product);
            }
            const res = await fetch("/api/products", options);
            if (!res.ok) throw new Error("Failed to add product");
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    "products/updateProduct",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            let options = { method: "PUT" };
            if (updates instanceof FormData) {
                options.body = updates;
            } else {
                options.headers = { "Content-Type": "application/json" };
                options.body = JSON.stringify(updates);
            }
            const res = await fetch(`/api/products?id=${id}`, options);
            if (!res.ok) throw new Error("Failed to update product");
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "products/deleteProduct",
    async (id, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete product");
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const productsSlice = createSlice({
    name: "products",
    initialState: {
        items: [],
        loading: false,
        error: null,
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 12,
        loaded: false, // <-- add this
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                // don't set loaded here
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.products || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.limit = action.payload.limit || 12;
                state.loaded = true; // <-- set loaded here
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.loaded = true; // <-- set loaded here too
            })
            // Add
            .addCase(addProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.items.findIndex((p) => p._id === action.payload._id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter((p) => p._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default productsSlice.reducer;

// Selector to get products by category
export const selectProductsByCategory = (state, category) =>
    state.products.items.filter((product) => product.category === category); 