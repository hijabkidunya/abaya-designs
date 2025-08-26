import CategoriesSection from "@/components/home/CategoriesSection"
import HeroSection from "@/components/home/HeroSection"
import FeaturesSection from "@/components/home/FeaturesSection"
import InstagramSection from "@/components/home/InstagramSection"
import TrendingProductsSection from "@/components/home/TrendingProductsSection"
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection"
import NewArrivalsSection from "@/components/home/NewArrivalsSection"
import TestimonialsSection from '@/components/home/TestimonialsSection'
import SaleProductsSection from "@/components/home/SaleProductsSection"
import AllProductsSection from "@/components/home/AllProductsSection"

async function fetchCategories() {
  // Categories are static in the Product model's enum
  return [
    {
      name: "Abayas",
      description: "Elegant and modest abayas",
      image: "/images/abayas.jpg",
      href: "/products/abayas",
      value: "abayas",
    },
    {
      name: "Hijabs",
      description: "Premium quality hijabs in various styles",
      image: "/images/hijabs.jpg",
      href: "/products/hijabs",
      value: "hijabs",
    },
    {
      name: "Clothing",
      description: "Modest fashion for the modern woman",
      image: "/images/clothing.jpg",
      href: "/products/clothing",
      value: "clothing",
    },
    {
      name: "Accessories",
      description: "Complete your look with our accessories",
      image: "/images/accessories.jpg",
      href: "/products/accessories",
      value: "accessories",
    },
  ]
}

async function fetchFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products?featured=true&limit=8`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Failed to fetch featured products")
    const data = await res.json()
    return data.products || []
  } catch (e) {
    return []
  }
}

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    fetchCategories(),
    fetchFeaturedProducts(),
  ])

  return (
    <div className="min-h-screen flex flex-col gap-0 bg-background">
      <HeroSection />
      <CategoriesSection categories={categories} />
      <SaleProductsSection />
      <NewArrivalsSection />
      <TrendingProductsSection featuredProducts={featuredProducts} />
      <FeaturedProductsSection />
      <AllProductsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <InstagramSection />
    </div>
  )
}
