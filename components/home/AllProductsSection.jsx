"use client"
import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";

const categories = [
    { label: "All", value: "all" },
    { label: "Abayas", value: "abayas" },
    { label: "Hijabs", value: "hijabs" },
    { label: "Clothing", value: "clothing" },
    { label: "Accessories", value: "accessories" },
];

export default function AllProductsSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await fetch("/api/products?limit=20");
                const data = await res.json();
                setProducts(data.products || []);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const filteredProducts =
        selectedCategory === "all"
            ? products
            : products.filter((p) => p.category === selectedCategory);

    return (
        <section className="py-6 px-4 bg-muted/30" aria-labelledby="all-products-heading">
            <div className="container mx-auto max-w-screen-xl px-4">
                <div className="text-center mb-12">
                    <h2 id="all-products-heading" className="text-3xl md:text-4xl font-bold mb-4">Browse All Products</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover our full range of modest fashion, from abayas and hijabs to clothing and accessories. Use the filters to find your perfect style.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {categories.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? "default" : "outline"}
                            onClick={() => setSelectedCategory(cat.value)}
                            className="capitalize"
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">No products found.</div>
                )}
            </div>
        </section>
    );
} 