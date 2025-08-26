import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Thank you for your order!</h1>
      <p className="mb-8 text-lg text-center">Your order has been placed successfully. We appreciate your business.</p>
      <div className="flex gap-4">
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
        <Link href="/client/orders">
          <Button variant="outline">View My Orders</Button>
        </Link>
      </div>
    </div>
  )
} 