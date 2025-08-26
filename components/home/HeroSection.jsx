"use client"
import { useState, useEffect } from "react"

const banners = [
    {
        image: "https://alsanaya.com/wp-content/uploads/2021/09/1-Hero-Banner-1300x542.png",
        title: "Elegant Abayas",
        subtitle: "Discover our collection of elegant and modest abayas.",
    },
    {
        image: "https://chowdhurydresses.com/cdn/shop/files/Hijabs_banner.jpg?v=1734308768&width=3200",
        title: "Premium Hijabs",
        subtitle: "Premium quality hijabs in a variety of styles and colors.",
    },
    {
        image: "https://www.sadabahar.com.pk/cdn/shop/files/Banners_2_1.png?v=1745175203&width=3840",
        title: "Modest Clothing",
        subtitle: "Fashion-forward modest clothing for the modern woman.",
    },
]

export default function HeroSection() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section
            className="relative h-[40vh] sm:h-[50vh] md:h-[70vh] flex items-center justify-center overflow-hidden"
            aria-label="Hero banners"
        >
            {banners.map((banner, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    aria-hidden={idx !== current}
                >
                    <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                        draggable={false}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 sm:px-4">
                        <h1
                            className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg"
                            aria-live={idx === current ? "polite" : undefined}
                        >
                            {banner.title}
                        </h1>
                        <p className="text-sm xs:text-base sm:text-lg md:text-2xl text-white max-w-xs sm:max-w-2xl mx-auto drop-shadow-md">
                            {banner.subtitle}
                        </p>
                    </div>
                </div>
            ))}
            {/* Dots for navigation */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        className={`w-4 h-4 rounded-full border-2 border-white focus:outline-none focus:ring-2 focus:ring-white/70 transition-all ${idx === current ? 'bg-white' : 'bg-white/40'}`}
                        aria-label={`Go to banner ${idx + 1}`}
                        aria-current={idx === current ? "true" : undefined}
                        tabIndex={0}
                        onClick={() => setCurrent(idx)}
                        style={{ minWidth: 16, minHeight: 16 }}
                    />
                ))}
            </div>
        </section>
    )
} 