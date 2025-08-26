"use client"

import { useRef, useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store } from "@/lib/store"
import { useSession } from "next-auth/react"
import { fetchCart } from "@/lib/features/cart/cartSlice"
import { setUser, clearUser } from "@/lib/features/auth/authSlice"

function CartInitializer() {
    const { data: session, status } = useSession()
    const dispatch = useDispatch()

    useEffect(() => {
        if (status === "loading") return; // Don't do anything while loading

        if (session) {
            // Set user in Redux auth state
            dispatch(setUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
                image: session.user.image,
            }));
            // Fetch cart from API
            dispatch(fetchCart());
        } else {
            // Clear user from Redux auth state
            dispatch(clearUser());
            // Load cart from localStorage
            dispatch(fetchCart());
        }
    }, [session, status, dispatch])

    return null
}

export default function StoreProvider({ children }) {
    const storeRef = useRef()
    if (!storeRef.current) {
        storeRef.current = store
    }

    return (
        <Provider store={storeRef.current}>
            <CartInitializer />
            {children}
        </Provider>
    )
}
