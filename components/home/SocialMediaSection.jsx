import React from "react"
import { FaTiktok, FaInstagram } from "react-icons/fa"

export default function SocialMediaSection() {
    return (
        <section className="w-full py-16 flex justify-center items-center transition-colors duration-300">
            <div className="max-w-6xl w-full flex flex-col items-center gap-8 px-4">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                        Follow Us on Social Media
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl">
                        Join our community and discover the latest trends in Abayas and Maxi Dresses
                    </p>
                </div>

                {/* Social Media Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Instagram Card */}
                    <div className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                                    <FaInstagram size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Instagram</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">@abaya__design00</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                                    Explore our exquisite collection of Abayas and Maxi Dresses with stunning visuals and behind-the-scenes content.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <span className="font-semibold">Latest:</span>
                                    <span>New arrivals, styling tips, and fashion inspiration</span>
                                </div>
                            </div>

                            <a
                                href="https://www.instagram.com/abaya__design00?igsh=MWszdmYydXUzNjM0Zg%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <button
                                    className="w-full px-6 py-3 rounded-xl text-white font-semibold shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:ring-offset-background"
                                    style={{
                                        background: "linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #E1306C 100%)",
                                    }}
                                >
                                    View Gallery
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* TikTok Card */}
                    <div className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-full bg-gradient-to-br from-black via-cyan-400 to-pink-500">
                                    <FaTiktok size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">TikTok</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">@abaya.design0</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                                    Join our community of 65,000+ followers and discover the latest trends with engaging video content.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="font-semibold">Followers:</span>
                                        <span className="text-lg font-bold text-black dark:text-white">65K+</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="font-semibold">Content:</span>
                                        <span>Trending videos & styling tips</span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="https://www.tiktok.com/@abaya.design0?_t=ZS-8zDf2vlrNAY&_r=1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <button
                                    className="w-full px-6 py-3 rounded-xl text-white font-semibold shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white focus:ring-offset-background"
                                    style={{
                                        background: "linear-gradient(90deg, #000000 0%, #25F4EE 50%, #FE2C55 100%)",
                                    }}
                                >
                                    Follow Us
                                </button>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-8">
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                        Stay updated with our latest collections, styling tips, and exclusive offers
                    </p>
                </div>
            </div>
        </section>
    )
}
