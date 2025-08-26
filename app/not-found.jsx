"use client"
import Link from "next/link";
import { useState } from "react";

export default function NotFound() {
    const [search, setSearch] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            window.location.href = `/products?page=1&query=${encodeURIComponent(search)}`;
        }
    };

    return (
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>404 - Page Not Found</h1>
            <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
                Oops! The page you are looking for does not exist.<br />
                Try searching for a product or return to the homepage.
            </p>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #ccc", minWidth: "200px" }}
                />
                <button type="submit" style={{ padding: "0.5rem 1.5rem", borderRadius: "4px", background: "#222", color: "#fff", border: "none", cursor: "pointer" }}>
                    Search
                </button>
            </form>
            <Link href="/">
                <button style={{ padding: "0.5rem 2rem", borderRadius: "4px", background: "#7F22FE", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                    Go to Homepage
                </button>
            </Link>
        </div>
    );
} 