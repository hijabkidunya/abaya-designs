"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";

export default function SignupPage() {
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError("")
        setSuccess("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            setError("Passwords do not match.");
            return;
        }
        setLoading(true)
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Signup failed")
            toast.success("Account created! Redirecting to sign in...");
            setSuccess("Account created! Redirecting to sign in...");
            setTimeout(() => router.push("/auth/signin"), 1500)
        } catch (err) {
            toast.error(err.message);
            setError(err.message);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-96 flex items-center justify-center px-4 py-12 bg-muted/30">
            <Card className="w-full max-w-md border border-border dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-black-500 to-[#7F22FE]" />
                    </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <p className="text-muted-foreground">Sign up for a new HijabKiDunya account</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded dark:bg-red-900/30 dark:border-red-700">{error}</div>}
                    {success && <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded dark:bg-green-900/30 dark:border-green-700">{success}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="mb-2 block">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="mb-2 block">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="mb-2 block">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</Button>
                    </form>
                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/auth/signin" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 