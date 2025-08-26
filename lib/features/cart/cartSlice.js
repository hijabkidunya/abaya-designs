import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Helper functions for localStorage cart
const LOCAL_CART_KEY = "guest_cart";
function loadLocalCart() {
    try {
        const data = localStorage.getItem(LOCAL_CART_KEY);
        return data ? JSON.parse(data) : { items: [] };
    } catch {
        return { items: [] };
    }
}
function saveLocalCart(cart) {
    try {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch { }
}

// Async thunks
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
        // Guest: load from localStorage
        const localCart = loadLocalCart();
        return localCart;
    }
    try {
        const res = await fetch("/api/cart")
        if (!res.ok) {
            // If API fails, fall back to localStorage for guest users
            if (res.status === 401) {
                const localCart = loadLocalCart();
                return localCart;
            }
            throw new Error("Failed to fetch cart")
        }
        const data = await res.json()
        return data
    } catch (err) {
        // If any error occurs, fall back to localStorage
        const localCart = loadLocalCart();
        return localCart;
    }
})

export const addToCartAsync = createAsyncThunk(
    "cart/addToCartAsync",
    async ({ productId, quantity = 1, size, color, product }, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
            // Guest: update local cart
            dispatch(addToCartLocally({ productId, quantity, size, color, product }));
            return loadLocalCart();
        }
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity, size, color }),
            })
            if (!res.ok) throw new Error("Failed to add to cart")
            return await res.json()
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const updateCartItemAsync = createAsyncThunk(
    "cart/updateCartItemAsync",
    async ({ productId, size, color, quantity }, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
            // Guest: update local cart
            dispatch(updateCartItemLocally({ productId, size, color, quantity }));
            return loadLocalCart();
        }
        try {
            const res = await fetch("/api/cart", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, size, color, quantity }),
            })
            if (!res.ok) throw new Error("Failed to update cart item")
            return await res.json()
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const removeFromCartAsync = createAsyncThunk(
    "cart/removeFromCartAsync",
    async ({ productId, size, color }, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
            // Guest: update local cart
            dispatch(removeFromCartLocally({ productId, size, color }));
            return loadLocalCart();
        }
        try {
            const res = await fetch("/api/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, size, color }),
            })
            if (!res.ok) throw new Error("Failed to remove from cart")
            return await res.json()
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const clearCartAsync = createAsyncThunk(
    "cart/clearCartAsync",
    async (_, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
            // Guest: clear local cart
            dispatch(clearCartLocally());
            return { items: [] };
        }
        try {
            const res = await fetch("/api/cart?all=true", {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to clear cart")
            return await res.json()
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

const initialState = {
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
    loaded: false, // <-- add this
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCartLocally: (state, action) => {
            // Find if item exists (match by productId, size, color)
            const { productId, quantity = 1, size, color, product } = action.payload;
            let found = state.items.find(
                (item) => item.productId === productId && item.size === size && item.color === color
            );
            if (found) {
                found.quantity += quantity;
            } else {
                state.items.push({
                    productId,
                    quantity,
                    size,
                    color,
                    price: product?.price || 0,
                    product: product || {},
                });
            }
            state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
            state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
            saveLocalCart({ items: state.items });
        },
        updateCartItemLocally: (state, action) => {
            const { productId, size, color, quantity } = action.payload;
            let found = state.items.find(
                (item) => item.productId === productId && item.size === size && item.color === color
            );
            if (found) {
                found.quantity = quantity;
                if (found.quantity <= 0) {
                    state.items = state.items.filter(
                        (item) => !(item.productId === productId && item.size === size && item.color === color)
                    );
                }
            }
            state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
            state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
            saveLocalCart({ items: state.items });
        },
        removeFromCartLocally: (state, action) => {
            const { productId, size, color } = action.payload;
            state.items = state.items.filter(
                (item) => !(item.productId === productId && item.size === size && item.color === color)
            );
            state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
            state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
            saveLocalCart({ items: state.items });
        },
        clearCartLocally: (state) => {
            state.items = [];
            state.itemCount = 0;
            state.total = 0;
            saveLocalCart({ items: [] });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true
                state.error = null
                // don't set loaded here
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload?.items || []
                state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
                state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
                state.loaded = true // <-- set loaded here
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.loaded = true // <-- set loaded here too
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.items = action.payload?.items || []
                state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
                state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                state.items = action.payload?.items || []
                state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
                state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.items = action.payload?.items || []
                state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
                state.total = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(clearCartAsync.fulfilled, (state, action) => {
                state.items = []
                state.itemCount = 0
                state.total = 0
            })
            .addCase(clearCartAsync.rejected, (state, action) => {
                state.error = action.payload
            })
    },
})

export const { addToCartLocally, updateCartItemLocally, removeFromCartLocally, clearCartLocally, clearCart } = cartSlice.actions
export default cartSlice.reducer
