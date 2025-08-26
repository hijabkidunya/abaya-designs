import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function CategoriesSection({ categories }) {
    return (
        <section className="py-6 px-2 sm:px-4 md:py-10">
            <div className="container mx-auto max-w-screen-xl px-2 sm:px-4">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Shop by Category</h2>
                    <p className="text-muted-foreground max-w-xl md:max-w-2xl mx-auto text-sm sm:text-base">
                        Explore our carefully curated collections designed for the modern Muslim woman
                    </p>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {categories.map((category) => (
                        <Card
                            key={category.name}
                            className="group overflow-hidden hover:shadow-lg transition-all duration-300 p-1 sm:p-0 rounded-lg sm:rounded-xl mx-auto w-full max-w-xs sm:max-w-none"
                        >
                            <Link href={category.href} tabIndex={0} aria-label={`Shop ${category.name}`}>
                                <div className="relative aspect-square overflow-hidden rounded-md sm:rounded-xl">
                                    <Image
                                        src={category.image || "/placeholder.svg"}
                                        alt={category.name}
                                        fill
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        priority={false}
                                    />
                                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/80 transition-colors" aria-hidden="true" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center text-white px-1 sm:px-2">
                                            <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-1 md:mb-2 line-clamp-1">{category.name}</h3>
                                            <p className="text-xs sm:text-sm md:text-base opacity-90 line-clamp-2">{category.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
} 