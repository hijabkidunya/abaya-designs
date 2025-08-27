"use client"

import { useState } from "react"
import { X, Copy, Facebook, Twitter, MessageCircle, Mail, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function ShareModal({ isOpen, onClose, product }) {
    const [copied, setCopied] = useState(false)

    if (!isOpen || !product) return null

    const productUrl = typeof window !== 'undefined' ? window.location.href : ''
    const productName = product.name
    const productPrice = Number(product.price).toLocaleString("en-PK")

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this beautiful ${productName} for Rs ${productPrice}!`)}&url=${encodeURIComponent(productUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this beautiful ${productName} for Rs ${productPrice}! ${productUrl}`)}`,
        email: `mailto:?subject=${encodeURIComponent(`Check out this product: ${productName}`)}&body=${encodeURIComponent(`Hi! I found this beautiful product that you might like:\n\n${productName}\nPrice: Rs ${productPrice}\n\nView it here: ${productUrl}`)}`
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(productUrl)
            setCopied(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Failed to copy link")
        }
    }

    const handleShare = (platform) => {
        const url = shareUrls[platform]
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-semibold">Share Product</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleCopyLink}
                        >
                            <Copy className="h-4 w-4" />
                            {copied ? "Copied!" : "Copy Link"}
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                            onClick={() => handleShare('facebook')}
                        >
                            <Facebook className="h-4 w-4" />
                            Facebook
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700"
                            onClick={() => handleShare('twitter')}
                        >
                            <Twitter className="h-4 w-4" />
                            Twitter
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                            onClick={() => handleShare('whatsapp')}
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                            onClick={() => handleShare('email')}
                        >
                            <Mail className="h-4 w-4" />
                            Email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
