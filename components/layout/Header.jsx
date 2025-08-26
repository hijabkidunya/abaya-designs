"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import { useSession, signOut } from "next-auth/react"
import { Search, ShoppingCart, Heart, User, Menu, Sun, Moon, ChevronDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { toggleTheme } from "@/lib/features/theme/themeSlice"
import { usePathname, useRouter } from "next/navigation"
import { Tooltip } from "@/components/ui/tooltip"
import Image from "next/image"
import { fetchWishlistAsync } from "@/lib/features/wishlist/wishlistSlice"
import { useRef } from "react"

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()
    const dispatch = useDispatch()
    const theme = useSelector((state) => state.theme.mode)
    // const cartItems = useSelector((state) => state.cart.itemCount)
    const cartItems = useSelector((state) => state.cart.items)
    const cartCount = useSelector((state) => state.cart.itemCount)
    const wishlistItems = useSelector((state) => state.wishlist.items)
    const wishlistCount = wishlistItems.length
    const pathname = usePathname()
    const router = useRouter()
    // const [cartCount, setCartCount] = useState(0)
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef(null)
    const debouncedQuery = useDebounce(searchQuery, 350)

    useEffect(() => {
        if (session) {
            dispatch(fetchWishlistAsync())
        }
    }, [session, dispatch])

    useEffect(() => {
        if (debouncedQuery.trim()) {
            setLoading(true)
            fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`)
                .then(res => res.json())
                .then(data => {
                    setSuggestions(data.products || [])
                    setShowSuggestions(true)
                })
                .finally(() => setLoading(false))
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [debouncedQuery])

    // Keyboard navigation for suggestions
    const [highlighted, setHighlighted] = useState(-1)
    useEffect(() => { setHighlighted(-1) }, [showSuggestions, debouncedQuery])
    const handleKeyDown = (e) => {
        if (!showSuggestions || !suggestions.length) return
        if (e.key === "ArrowDown") {
            setHighlighted((prev) => (prev + 1) % suggestions.length)
        } else if (e.key === "ArrowUp") {
            setHighlighted((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        } else if (e.key === "Enter") {
            if (highlighted >= 0 && suggestions[highlighted]) {
                router.push(`/products/${suggestions[highlighted].slug}`)
                setShowSuggestions(false)
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false)
        }
    }

    const categories = [
        { name: "Products", href: "/products" },
        { name: "Abayas", href: "/products?category=abayas" },
        { name: "Hijabs", href: "/products?category=hijabs" },
        { name: "Clothing", href: "/products?category=clothing" },
        { name: "Accessories", href: "/products?category=accessories" },
    ]

    const categoryDropdowns = {
        Abayas: [
            { name: "All Abayas", href: "/products/abayas", isSection: true },
            { name: "Embroidered Abayas", href: "/products?category=abayas&type=embroidered" },
            { name: "Classic Abayas", href: "/products?category=abayas&type=classic" },
            { name: "Open Abayas", href: "/products?category=abayas&type=open" },
            { name: "Maxi Abayas", href: "/products?category=abayas&type=maxi" },
            { name: "Plus Size Abayas", href: "/products?category=abayas&type=plus-size" },
        ],
        Hijabs: [
            { name: "All Hijabs", href: "/products/hijabs", isSection: true },
            { name: "Silk Hijabs", href: "/products?category=hijabs&type=silk" },
            { name: "Chiffon Hijabs", href: "/products?category=hijabs&type=chiffon" },
            { name: "Jersey Hijabs", href: "/products?category=hijabs&type=jersey" },
            { name: "Printed Hijabs", href: "/products?category=hijabs&type=printed" },
            { name: "Underscarves", href: "/products?category=hijabs&type=underscarf" },
        ],
        Clothing: [
            { name: "All Clothing", href: "/products/clothing", isSection: true },
            { name: "Maxi Dresses", href: "/products?category=clothing&type=maxi-dress" },
            { name: "Tunics & Tops", href: "/products?category=clothing&type=tunic" },
            { name: "Skirts & Pants", href: "/products?category=clothing&type=skirt-pants" },
            { name: "Modest Sets", href: "/products?category=clothing&type=set" },
        ],
        Accessories: [
            { name: "All Accessories", href: "/products/accessories", isSection: true },
            { name: "Brooches & Pins", href: "/products?category=accessories&type=brooch" },
            { name: "Bags & Purses", href: "/products?category=accessories&type=bag" },
            { name: "Jewelry", href: "/products?category=accessories&type=jewelry" },
            { name: "Belts & Scarves", href: "/products?category=accessories&type=belt-scarf" },
        ],
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/40">
            <div className="container mx-auto px-4">
                {/* Logo Row */}
                <div className="flex justify-center py-4 border-b border-border/20">
                    <Link href="/" className="group transition-transform duration-300 hover:scale-105" aria-label="Go to homepage">
                        <h1 className="logo text-xl sm:text-2xl md:text-3xl font-bold">Abaya Designs</h1>
                    </Link>
                </div>

                {/* Main Navigation Row */}
                <div className="flex items-center justify-between py-3 gap-4">
                    {/* Navigation Links - Desktop */}
                    <nav className="hidden lg:flex items-center">
                        <div className="flex items-center gap-1">
                            {categories.map((category) =>
                                categoryDropdowns[category.name] ? (
                                    <DropdownMenu key={category.name}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/80 ${pathname.includes(category.href.split("?")[1])
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-foreground/80 hover:text-foreground"
                                                    }`}
                                            >
                                                {category.name}
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="min-w-[200px] rounded-xl border-border/60 shadow-lg">
                                            {categoryDropdowns[category.name].map((item, idx) => (
                                                item.isSection ? (
                                                    <div key={item.name}>
                                                        {idx !== 0 && <DropdownMenuSeparator />}
                                                        <DropdownMenuItem asChild className="font-medium">
                                                            <Link href={item.href} className="block px-3 py-2">
                                                                {item.name}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </div>
                                                ) : (
                                                    <DropdownMenuItem asChild key={item.name}>
                                                        <Link href={item.href} className="block px-3 py-2 text-sm">
                                                            {item.name}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link
                                        key={category.name}
                                        href={category.href}
                                        className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${pathname.includes(category.href.split("?")[1])
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground/80 hover:text-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        {category.name}
                                    </Link>
                                )
                            )}
                        </div>
                    </nav>

                    {/* Search Bar - Center */}
                    <div className="flex-1 max-w-md mx-4 relative">
                        <form onSubmit={handleSearch} className="relative" autoComplete="off">
                            <div className="relative hidden sm:flex items-center bg-muted/50 rounded-full border border-border/60 focus-within:border-primary/50 focus-within:bg-background transition-all duration-200">
                                <Input
                                    ref={inputRef}
                                    type="search"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => { if (suggestions.length) setShowSuggestions(true) }}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-transparent border-0 rounded-full px-4 py-2 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/70"
                                    aria-autocomplete="list"
                                    aria-controls="search-suggestions"
                                    aria-activedescendant={highlighted >= 0 ? `suggestion-${highlighted}` : undefined}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-8 w-8 rounded-full mr-1 bg-primary hover:bg-primary/90"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                            {/* Suggestions Sheet/Dropdown */}
                            {showSuggestions && (
                                <div className="absolute left-0 right-0 mt-2 bg-background border border-border/60 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto" id="search-suggestions" role="listbox">
                                    {loading ? (
                                        <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
                                    ) : suggestions.length ? (
                                        <>
                                            {suggestions.slice(0, 8).map((product, idx) => (
                                                <div
                                                    key={product._id}
                                                    id={`suggestion-${idx}`}
                                                    role="option"
                                                    aria-selected={highlighted === idx}
                                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${highlighted === idx ? "bg-primary/10 text-primary" : "hover:bg-muted/80"}`}
                                                    onMouseDown={() => {
                                                        router.push(`/products/${product._id}`)
                                                        setShowSuggestions(false)
                                                    }}
                                                    onMouseEnter={() => setHighlighted(idx)}
                                                >
                                                    <img src={product.images?.[0] || "/logo_dark.png"} alt={product.name} className="h-10 w-10 object-cover rounded-md border" />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">{product.category}</div>
                                                    </div>
                                                    <div className="font-semibold text-primary text-sm">${product.price}</div>
                                                </div>
                                            ))}
                                            <div
                                                className="flex items-center justify-center px-4 py-3 cursor-pointer text-primary font-medium hover:underline border-t border-border/40 bg-muted/30"
                                                onMouseDown={() => {
                                                    router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
                                                    setShowSuggestions(false)
                                                }}
                                            >
                                                Show All Products
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground text-sm">No products found.</div>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <Tooltip content={theme === "light" ? "Dark mode" : "Light mode"}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch(toggleTheme())}
                                className="h-9 w-9 rounded-full hover:bg-muted/80"
                            >
                                {theme === "light" ? (
                                    <Moon className="h-4 w-4" />
                                ) : (
                                    <Sun className="h-4 w-4" />
                                )}
                            </Button>
                        </Tooltip>

                        {/* Wishlist */}
                        <Tooltip content="Wishlist">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full hover:bg-muted/80 relative">
                                <Link href="/wishlist">
                                    <Heart className="h-4 w-4" />
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive border border-background">
                                        {wishlistCount}
                                    </Badge>
                                </Link>
                            </Button>
                        </Tooltip>

                        {/* Cart */}
                        <Tooltip content="Cart">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full hover:bg-muted/80 relative">
                                <Link href="/cart">
                                    <ShoppingCart className="h-4 w-4" />
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary border border-background">
                                        {cartCount}
                                    </Badge>
                                </Link>
                            </Button>
                        </Tooltip>

                        {/* User Menu */}
                        {session ? (
                            <div className="flex items-center gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/80">
                                            {session.user.image ? (
                                                <img
                                                    src={session.user.image}
                                                    alt="User"
                                                    className="h-7 w-7 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                        <DropdownMenuItem asChild>
                                            <Link href="/client/profile" className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/client/orders" className="flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4" />
                                                Orders
                                            </Link>
                                        </DropdownMenuItem>
                                        {session.user.role === "admin" && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/admin" className="flex items-center gap-2">
                                                        <Star className="h-4 w-4" />
                                                        Admin Dashboard
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <span className="hidden md:block text-sm text-muted-foreground max-w-32 truncate">
                                    {session.user.name || session.user.email}
                                </span>
                            </div>
                        ) : (
                            <Button size="sm" asChild className="rounded-full px-4">
                                <Link href="/auth/signin">Sign In</Link>
                            </Button>
                        )}

                        {/* Mobile Menu */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full hover:bg-muted/80">
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl">
                                <div className="flex flex-col h-full overflow-hidden">
                                    {/* Mobile User Info */}
                                    {session ? (
                                        <div className="flex items-center gap-3 p-4 mb-4 border-b border-border/40">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                                {session.user.image ? (
                                                    <img
                                                        src={session.user.image}
                                                        alt="User"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium truncate">{session.user.name || "Welcome"}</p>
                                                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 mb-4 mt-4 border-b border-border/40">
                                            {/* <Button asChild className="w-full rounded-full">
                                                <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                                                    Sign In
                                                </Link>
                                            </Button> */}
                                        </div>
                                    )}

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-y-auto pb-4">
                                        {/* Mobile Search */}
                                        <div className="px-4 mb-6">
                                            <form onSubmit={(e) => {
                                                handleSearch(e)
                                                setIsOpen(false)
                                            }} className="relative">
                                                <div className="relative flex items-center bg-muted/50 rounded-full border border-border/60 focus-within:border-primary/50 focus-within:bg-background transition-all duration-200">
                                                    <Input
                                                        type="search"
                                                        placeholder="Search products..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="flex-1 bg-transparent border-0 rounded-full px-4 py-2 text-sm focus-visible:ring-0"
                                                    />
                                                    <Button type="submit" size="icon" className="h-8 w-8 rounded-full mr-1 bg-primary hover:bg-primary/90">
                                                        <Search className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Mobile Navigation */}
                                        <div className="px-4 mb-6">
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Categories</h3>
                                            <div className="flex flex-col gap-1">
                                                {categories.map((category) => (
                                                    categoryDropdowns[category.name] ? (
                                                        <div key={category.name} className="mb-2">
                                                            <div className={`text-base font-medium px-3 py-2 rounded-lg transition-all duration-200 mb-1 ${pathname.includes(category.href.split("?")[0])
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-muted/50 text-foreground/80"
                                                                }`}>
                                                                {category.name}
                                                            </div>
                                                            <div className="pl-4 border-l-2 border-border/40 ml-3 space-y-1">
                                                                {categoryDropdowns[category.name].map((item) => (
                                                                    <Link
                                                                        key={item.name}
                                                                        href={item.href}
                                                                        className={`block text-sm py-1.5 px-3 rounded-lg ${pathname === item.href
                                                                            ? "text-primary font-medium"
                                                                            : "text-muted-foreground hover:text-foreground"
                                                                            }`}
                                                                        onClick={() => setIsOpen(false)}
                                                                    >
                                                                        {item.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            key={category.name}
                                                            href={category.href}
                                                            className={`text-base font-medium px-3 py-2 rounded-lg transition-all duration-200 ${pathname.includes(category.href.split("?")[0])
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-muted/50 text-foreground/80"
                                                                }`}
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Links */}
                                        <div className="px-4 mb-6">
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quick Links</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link
                                                    href="/wishlist"
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    <span>Wishlist</span>
                                                    {wishlistCount > 0 && (
                                                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs bg-destructive border border-background">
                                                            {wishlistCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                                <Link
                                                    href="/cart"
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    <span>Cart</span>
                                                    {cartCount > 0 && (
                                                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs bg-primary border border-background">
                                                            {cartCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                                {session && (
                                                    <>
                                                        <Link
                                                            href="/client/profile"
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            <User className="h-4 w-4" />
                                                            <span>Profile</span>
                                                        </Link>
                                                        <Link
                                                            href="/client/orders"
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            <ShoppingCart className="h-4 w-4" />
                                                            <span>Orders</span>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Theme Toggle & Sign Out */}
                                    <div className="border-t border-border/40 p-4 mt-auto">
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => dispatch(toggleTheme())}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50"
                                            >
                                                {theme === "light" ? (
                                                    <>
                                                        <Moon className="h-4 w-4" />
                                                        <span>Dark Mode</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sun className="h-4 w-4" />
                                                        <span>Light Mode</span>
                                                    </>
                                                )}
                                            </Button>
                                            {session && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => signOut()}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg"
                                                >
                                                    Sign Out
                                                </Button>
                                            )}
                                        </div>
                                        {session?.user.role === "admin" && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors w-full justify-center"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Star className="h-4 w-4" />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}