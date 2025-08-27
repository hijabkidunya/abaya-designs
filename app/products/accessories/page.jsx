// ACCESSORIES PAGE - DISABLED - REPLACED WITH MAXI DRESSES
// This page is kept for reference but disabled

export default function AccessoriesPage() {
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Accessories Page</h1>
                <p className="text-muted-foreground mb-8">This page has been replaced with Maxi Dresses.</p>
                <a href="/products/maxi-dresses" className="text-primary hover:underline">
                    Go to Maxi Dresses →
                </a>
            </div>
        </div>
    )
}

// Original accessories page content (commented out for reference):
/*
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts } from "@/lib/features/productsSlice"
import ProductCard from "@/components/ui/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { Filter, Search, X } from "lucide-react"

const categories = ["accessories"]
const colors = [
    "Black", "Navy", "White", "Rose Gold", "Blue", "Green", "Pink", "Brown", "Gray", "Silver", "Gold", "Pearl", "Cream", "Beige"
]
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"]

export default function AccessoriesPage() {
    const dispatch = useDispatch()
    const { items: products, loading, error, total, page, totalPages, limit } = useSelector((state) => state.products)
    const [filters, setFilters] = useState({
        category: ["accessories"], // now an array for multi-select
        search: "",
        priceRange: [0, 50000],
        colors: [],
        sizes: [],
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
        limit: 12,
    })
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        // Only send category if not empty
        const fetchOptions = { ...filters }
        if (!filters.category.length) delete fetchOptions.category
        dispatch(fetchProducts(fetchOptions))
    }, [dispatch, filters])

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
    }

    const handleArrayFilterChange = (key, value, checked) => {
        setFilters((prev) => ({
            ...prev,
            [key]: checked ? [...prev[key], value] : prev[key].filter((item) => item !== value),
            page: 1,
        }))
    }

    // New: handle multi-select for category
    const handleCategoryChange = (category, checked) => {
        setFilters((prev) => ({
            ...prev,
            category: checked ? [...prev.category, category] : prev.category.filter((c) => c !== category),
            page: 1,
        }))
    }

    const clearFilters = () => {
        setFilters({
            category: ["accessories"],
            search: "",
            priceRange: [0, 50000],
            colors: [],
            sizes: [],
            sortBy: "createdAt",
            sortOrder: "desc",
            page: 1,
            limit: 12,
        })
    }

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }))
    }

    return (
        <main className="container mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className={`lg:w-80 ${showFilters ? "block fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 overflow-y-auto lg:static lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:z-auto" : "hidden lg:block"}`}>
                    <div className="lg:sticky lg:top-36">
                        <div className="flex items-center justify-between mb-4 lg:hidden">
                            <h2 className="text-xl font-semibold">Filters</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Filters
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search products..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange("search", e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <div className="mt-2 space-y-2">
                                        {categories.map((category) => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={category}
                                                    checked={filters.category.includes(category)}
                                                    onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                                                />
                                                <Label htmlFor={category} className="capitalize">
                                                    {category}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>
                                        Price Range: ₨{filters.priceRange[0].toLocaleString("en-PK")} - ₨{filters.priceRange[1].toLocaleString("en-PK")}
                                    </Label>
                                    <div className="mt-2">
                                        <Slider
                                            value={filters.priceRange}
                                            onValueChange={(value) => handleFilterChange("priceRange", value)}
                                            max={50000}
                                            step={5}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Colors</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {colors.map((color) => (
                                            <div key={color} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={color}
                                                    checked={filters.colors.includes(color)}
                                                    onCheckedChange={(checked) => handleArrayFilterChange("colors", color, checked)}
                                                />
                                                <Label htmlFor={color} className="text-sm">
                                                    {color}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>Sizes</Label>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {sizes.map((size) => (
                                            <div key={size} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={size}
                                                    checked={filters.sizes.includes(size)}
                                                    onCheckedChange={(checked) => handleArrayFilterChange("sizes", size, checked)}
                                                />
                                                <Label htmlFor={size} className="text-sm">
                                                    {size}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 lg:hidden">
                                    <Button className="w-full" onClick={() => setShowFilters(false)}>
                                        Apply Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Accessories</h1>
                            <p className="text-muted-foreground">
                                Showing {products.length} of {total} products
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                            <div className="flex flex-wrap gap-2">
                                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                                    <SelectTrigger className="w-[120px] sm:w-[160px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Newest</SelectItem>
                                        <SelectItem value="name">Name A-Z</SelectItem>
                                        <SelectItem value="price">Price</SelectItem>
                                        <SelectItem value="rating">Highest Rated</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
                                    <SelectTrigger className="w-[130px] sm:w-[130px]">
                                        <SelectValue placeholder="Order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Descending</SelectItem>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {(filters.category.length > 0 || filters.search || filters.colors.length > 0 || filters.sizes.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.category.length > 0 && filters.category.map((cat) => (
                                <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                                    Category: {cat}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(cat, false)} />
                                </Badge>
                            ))}
                            {filters.search && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Search: {filters.search}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("search", "")} />
                                </Badge>
                            )}
                            {filters.colors.map((color) => (
                                <Badge key={color} variant="secondary" className="flex items-center gap-1">
                                    {color}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleArrayFilterChange("colors", color, false)}
                                    />
                                </Badge>
                            ))}
                            {filters.sizes.map((size) => (
                                <Badge key={size} variant="secondary" className="flex items-center gap-1">
                                    {size}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleArrayFilterChange("sizes", size, false)} />
                                </Badge>
                            ))}
                        </div>
                    )}
                    {loading ? (
                        <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                                {products.map((product) => (
                                    <ProductCard key={product._id || product.id} product={product} />
                                ))}
                            </div>
                            <div className="mt-8 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                                aria-disabled={page === 1}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === page}
                                                    onClick={() => handlePageChange(p)}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                                aria-disabled={page === totalPages}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                            <Button onClick={clearFilters}>Clear Filters</Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
*/ 