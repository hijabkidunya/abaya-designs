import { configureStore } from "@reduxjs/toolkit"
import cartSlice from "./features/cart/cartSlice"
import wishlistSlice from "./features/wishlist/wishlistSlice"
import themeSlice from "./features/theme/themeSlice"
import authSlice from "./features/auth/authSlice"
import productsSlice from "./features/productsSlice"
import checkoutReducer from "./features/checkoutSlice"
import reviewsReducer from './features/reviews/reviewsSlice'

export const store = configureStore({
    reducer: {
        cart: cartSlice,
        wishlist: wishlistSlice,
        theme: themeSlice,
        auth: authSlice,
        products: productsSlice,
        checkout: checkoutReducer,
        reviews: reviewsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST"],
            },
        }),
})
