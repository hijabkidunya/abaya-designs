import React from "react"
import { Instagram } from "lucide-react"

export default function InstagramSection() {
    return (
        <section className="w-full py-12 flex justify-center items-center transition-colors duration-300">
            <div className="max-w-5xl w-full flex flex-col items-center gap-6 px-4">
                <div className="flex items-center gap-3">
                    {/* Lucide Instagram Icon */}
                    <Instagram size={48} className="text-black dark:text-white" />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white">
                        <span className="text-black dark:text-white">#abayadesigns</span> <span className="font-normal text-zinc-800 dark:text-zinc-200">ON INSTAGRAM</span>
                    </h2>
                </div>
                <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 text-center max-w-2xl">
                    Explore our exquisite collection of Abayas and all on Instagram
                </p>
                <a
                    href="https://www.instagram.com/hijabkidunya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2"
                >
                    <button
                        className="px-8 py-3 rounded-lg text-lg font-bold text-white shadow-md transition-transform transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:ring-offset-background cursor-pointer"
                        style={{
                            background: "linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #E1306C 100%)",
                        }}
                    >
                        View Gallery
                    </button>
                </a>
            </div>
        </section>
    )
} 