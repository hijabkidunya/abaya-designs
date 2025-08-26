"use client"

import { useSelector, useDispatch } from "react-redux"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck, User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { updateField, validateForm, submitOrder, resetCheckout, markTouched } from "@/lib/features/checkoutSlice"
import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/utils"
import { clearCartAsync } from "@/lib/features/cart/cartSlice"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const dispatch = useDispatch()
  const { items, total, itemCount } = useSelector((state) => state.cart)
  const checkout = useSelector((state) => state.checkout)
  const { form, errors, submitting, submitError, submitSuccess, touched, submitAttempted } = checkout
  const [bankAttempted, setBankAttempted] = useState(false);

  // Step 0: Email required before proceeding
  const [emailStep, setEmailStep] = useState(!session)
  const [email, setEmail] = useState(session?.user?.email || "")
  const [emailError, setEmailError] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  // Read step from query param, fallback to 1
  const searchParams = useSearchParams()
  const initialStep = parseInt(searchParams.get("step"), 10) || 1;
  const [currentStep, setCurrentStep] = useState(initialStep)


  // Keep step in sync with query param
  useEffect(() => {
    const stepFromQuery = parseInt(searchParams.get("step"), 10) || 1;
    if (stepFromQuery !== currentStep) {
      setCurrentStep(stepFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Update query param when step changes
  const updateStepInUrl = (step) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", step);
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    if (session && form.email !== session.user.email) {
      dispatch(updateField({ field: "email", value: session.user.email }))
    }
  }, [session, dispatch])

  // Redirect to success page after successful checkout
  useEffect(() => {
    if (submitSuccess) {
      dispatch(clearCartAsync())
      dispatch(resetCheckout())
      router.push("/checkout/success")
    }
  }, [submitSuccess, dispatch, router])

  // Redirect to cart if cart is empty and not just after successful checkout
  // useEffect(() => {
  //   if (items.length === 0 && !submitSuccess && router.pathname !== "/checkout/success") {
  //     router.push("/cart");
  //   }
  // }, [items.length, submitSuccess, router]);

  const handleInputChange = (field, value) => {
    dispatch(updateField({ field, value }))
  }

  const handleBlur = (field) => {
    dispatch(markTouched(field))
  }

  const handleEmailContinue = async () => {
    setEmailError("")
    if (!email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      setEmailError("Please enter a valid email address.")
      return
    }
    setEmailLoading(true)
    try {
      const res = await fetch("/api/auth/guest-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailError(data.error || "Registration failed.")
        setEmailLoading(false)
        return
      }
      dispatch(updateField({ field: "email", value: data.email }))
      setEmailStep(false)
    } catch (err) {
      setEmailError("Something went wrong. Please try again.")
    } finally {
      setEmailLoading(false)
    }
  }

  const handleNextStep = (step) => {
    dispatch(validateForm())
    if (Object.keys(errors).length === 0) {
      setCurrentStep(step)
      updateStepInUrl(step)
    }
  }

  // Also update URL when user navigates back/forward between steps
  useEffect(() => {
    updateStepInUrl(currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const handleSubmit = () => {
    dispatch(validateForm())
    if (Object.keys(errors).length === 0) {
      // Map items to include productId as required by backend
      const orderItems = items.map(item => ({
        productId: item.product._id || item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      }));
      dispatch(submitOrder({ ...form, items: orderItems, total }))
    }
  }

  const steps = [
    { id: 1, name: "Shipping", icon: Truck },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: User },
  ]

  // Pricing logic
  const codCharge = 400; // Mandatory COD charge for all orders
  const finalTotal = total + codCharge;

  return (
    items.length === 0 ? null : (
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        {/* Stepper/Accordion */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-full max-w-2xl">
            {/* Email Step */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full">
                <Card className="mb-6 bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="h-5 w-5" />
                      {session ? "Registered Email" : "Enter your email to continue"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={emailStep ? email : form.email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full sm:w-80 border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                        disabled={!!session || !emailStep}
                        readOnly={!!session}
                      />
                      {!session && (
                        <Button
                          onClick={handleEmailContinue}
                          className="w-full sm:w-auto"
                          disabled={!emailStep || emailLoading}
                        >
                          {emailLoading ? "Processing..." : "Continue"}
                        </Button>
                      )}
                    </div>
                    {emailError && <div className="text-red-500 text-sm mt-2">{emailError}</div>}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Progress Steps */}
          {(!emailStep || !!session) && (
            <div className="flex items-center justify-center w-full max-w-2xl mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                      }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 hidden md:block ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {(!emailStep || !!session) ? (
              <>
                {currentStep === 1 && (
                  <Card className="bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 md:space-y-8 lg:space-y-10 p-4 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName" className="mb-2 block">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="Enter your first name"
                            value={form.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            onBlur={() => handleBlur("firstName")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.firstName || submitAttempted) && errors.firstName) && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="mb-2 block">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Enter your last name"
                            value={form.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            onBlur={() => handleBlur("lastName")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.lastName || submitAttempted) && errors.lastName) && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email" className="mb-2 block">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={form.email}
                            disabled
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 opacity-80 mb-1"
                          />
                          {((touched.email || submitAttempted) && errors.email) && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>
                        <div>
                          <Label htmlFor="phone" className="mb-2 block">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="03XXXXXXXXX"
                            value={form.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            onBlur={() => handleBlur("phone")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.phone || submitAttempted) && errors.phone) && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="address" className="mb-2 block">Address</Label>
                          <Input
                            id="address"
                            placeholder="Street address, house number, etc."
                            value={form.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            onBlur={() => handleBlur("address")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.address || submitAttempted) && errors.address) && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                        </div>
                        <div>
                          <Label htmlFor="city" className="mb-2 block">City</Label>
                          <Input
                            id="city"
                            placeholder="City name"
                            value={form.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            onBlur={() => handleBlur("city")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.city || submitAttempted) && errors.city) && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="province" className="mb-2 block">Province</Label>
                          <Input
                            id="province"
                            placeholder="Province/State"
                            value={form.province}
                            onChange={(e) => handleInputChange("province", e.target.value)}
                            onBlur={() => handleBlur("province")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.province || submitAttempted) && errors.province) && <div className="text-red-500 text-xs mt-1">{errors.province}</div>}
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="mb-2 block">Postal Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="Postal code"
                            value={form.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                            onBlur={() => handleBlur("zipCode")}
                            required
                            className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                          />
                          {((touched.zipCode || submitAttempted) && errors.zipCode) && <div className="text-red-500 text-xs mt-1">{errors.zipCode}</div>}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label htmlFor="country" className="mb-2 block">Country</Label>
                        <Input
                          id="country"
                          placeholder="Country"
                          value={form.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          onBlur={() => handleBlur("country")}
                          required
                          className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 mb-1"
                        />
                        {((touched.country || submitAttempted) && errors.country) && <div className="text-red-500 text-xs mt-1">{errors.country}</div>}
                      </div>
                      <Button onClick={() => handleNextStep(2)} className="w-full">
                        Continue to Payment
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {currentStep === 2 && (
                  <Card className="bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 md:space-y-8 lg:space-y-10 p-4 md:p-8">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="cod"
                            checked={form.paymentMethod === "cod"}
                            onChange={() => handleInputChange("paymentMethod", "cod")}
                            className="accent-primary h-5 w-5"
                          />
                          <Label htmlFor="cod" className="text-base cursor-pointer">Cash on Delivery (COD)</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            id="bank"
                            name="paymentMethod"
                            value="bank"
                            checked={form.paymentMethod === "bank"}
                            onChange={() => handleInputChange("paymentMethod", "bank")}
                            className="accent-primary h-5 w-5"
                          />
                          <Label htmlFor="bank" className="text-base cursor-pointer">Bank Transfer / Card Payment</Label>
                        </div>
                      </div>
                      {form.paymentMethod === "cod" && (
                        <div className="mt-6">
                          <p className="text-muted-foreground mb-4">You will pay in cash when your order is delivered to your address.</p>
                          <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                              Back to Shipping
                            </Button>
                            <Button onClick={() => handleNextStep(3)} className="flex-1">
                              Review Order
                            </Button>
                          </div>
                        </div>
                      )}
                      {form.paymentMethod === "bank" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-muted/40 rounded-lg p-4 border border-border dark:border-zinc-700">
                            <h4 className="font-semibold mb-2">Bank Account Details</h4>
                            <div className="text-sm">
                              <div><span className="font-medium">Bank Name:</span> United Bank Limited (UBL)</div>
                              <div><span className="font-medium">Account Title:</span> Ali Hassan</div>
                              <div><span className="font-medium">Account Number:</span> 0139297676263</div>
                              {/* <div><span className="font-medium">IBAN:</span> PK65MEZN0098200102356010</div> */}
                            </div>
                            <div className="h-[0.5px] bg-gray-300 w-full my-2"></div>
                            <div className="text-sm">
                              <div><span className="font-medium">Bank Name:</span> Easypaisa</div>
                              <div><span className="font-medium">Account Title:</span> Ali Hassan</div>
                              <div><span className="font-medium">Account Number:</span> 03496098882</div>
                              {/* <div><span className="font-medium">IBAN:</span> PK65MEZN0098200102356010</div> */}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">Please transfer the total amount to the above account and keep your payment receipt. Your order will be processed after payment confirmation.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="bankConfirmed"
                              checked={form.bankConfirmed}
                              onChange={e => handleInputChange("bankConfirmed", e.target.checked)}
                              className="accent-primary h-5 w-5"
                            />
                            <Label htmlFor="bankConfirmed" className="text-sm cursor-pointer">I have transferred the payment to the above account.</Label>
                          </div>
                          {bankAttempted && errors.bankConfirmed && <div className="text-red-500 text-xs mt-1">{errors.bankConfirmed}</div>}
                          <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                              Back to Shipping
                            </Button>
                            <Button onClick={() => { setBankAttempted(true); handleNextStep(3); }} className="flex-1" disabled={!form.bankConfirmed}>
                              Review Order
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                {currentStep === 3 && (
                  <Card className="bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {form.firstName} {form.lastName}
                          </p>
                          <p>{form.address}</p>
                          <p>
                            {form.city}, {form.province} {form.zipCode}
                          </p>
                          <p>{form.country}</p>
                        </div>
                      </div>
                      {/* Payment Method */}
                      <div>
                        <h3 className="font-semibold mb-2">Payment Method</h3>
                        <div className="text-sm text-muted-foreground">
                          {form.paymentMethod === "cod" ? (
                            <p>Cash on Delivery (COD)</p>
                          ) : (
                            <>
                              <p>Bank Transfer / Card Payment</p>
                              <div className="mt-2">
                                <div><span className="font-medium">Bank Name:</span> HBL</div>
                                <div><span className="font-medium">Account Title:</span> Abaya Designs</div>
                                <div><span className="font-medium">Account Number:</span> 1234-5678-9012-3456</div>
                                <div><span className="font-medium">IBAN:</span> PK12 HABB 0000 1234 5678 9012</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>
                          Back to Payment
                        </Button>
                        <Button onClick={handleSubmit} className="flex-1" disabled={submitting}>
                          {submitting ? "Placing Order..." : "Place Order"}
                        </Button>
                      </div>
                      {submitError && <div className="text-red-500 text-xs mt-2">{submitError}</div>}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>
          {/* Order Summary */}
          <div>
            <Card className="bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-md">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.cartId || idx} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={item.product?.images?.[0] || "/placeholder.svg?height=64&width=64"}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product?.name || "Product"}</h4>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.size}
                          </Badge>
                          {item.color && (
                            <span
                              className="inline-block w-5 h-5 rounded-full border border-gray-300 dark:border-zinc-700 shadow align-middle ml-1"
                              style={{ backgroundColor: item.color }}
                              title={item.color}
                            />
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="font-medium">₨ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COD Charges</span>
                    <span>{formatPrice(codCharge)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    Cash on Delivery (COD) charges apply to all orders
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  )
}
