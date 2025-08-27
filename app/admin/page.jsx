"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams, usePathname, useRouter as useNextRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, addProduct, updateProduct, deleteProduct } from "@/lib/features/productsSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Edit, Trash2, Image as ImageIcon, Loader2, Plus, Upload, ShoppingBag, Package, Tag, DollarSign, AlertCircle, ChevronDown, Menu as MenuIcon } from "lucide-react"
import ProductModal from "@/components/admin/ProductModal"
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/utils"
import OrderDetailsModal from "@/components/admin/OrderDetailsModal"
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { ChevronDown } from "lucide-react"

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const nextRouter = useNextRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const dispatch = useDispatch()
    const { items: products, loading, error, loaded } = useSelector((state) => state.products)

    // --- Tab state with query param ---
    const tabParam = searchParams.get("tab")
    const [tab, setTab] = useState(tabParam || "products")
    // Admin mobile menu state
    const [adminMenuOpen, setAdminMenuOpen] = useState(false)

    useEffect(() => {
        if (tab !== tabParam) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("tab", tab)
            nextRouter.replace(`${pathname}?${params.toString()}`, { scroll: false })
        }
        // eslint-disable-next-line
    }, [tab])
    useEffect(() => {
        if (tabParam && tabParam !== tab) setTab(tabParam)
        // eslint-disable-next-line
    }, [tabParam])
    // --- End tab state with query param ---

    const [showModal, setShowModal] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [modalLoading, setModalLoading] = useState(false)
    const [modalError, setModalError] = useState("")
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [ordersError, setOrdersError] = useState("")
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderModalOpen, setOrderModalOpen] = useState(false)
    const [orderActionLoading, setOrderActionLoading] = useState(false)
    const [orderActionError, setOrderActionError] = useState("")

    // Admin tab items
    const adminTabs = [
        { id: "products", label: "Products" },
        { id: "orders", label: "Orders" },
        { id: "testimonials", label: "Testimonials / Reviews" },
        { id: "support", label: "Support" }
    ]

    const handleTabChange = (value) => {
        setTab(value);
        setAdminMenuOpen(false); // Close the menu after selection
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        } else if (session?.user?.role !== "admin") {
            router.push("/")
        }
    }, [session, status, router])

    useEffect(() => {
        if (session?.user?.role === "admin" && !loaded) {
            dispatch(fetchProducts())
        }
        // eslint-disable-next-line
    }, [dispatch, session, loaded])

    useEffect(() => {
        if (session?.user?.role === "admin") {
            setOrdersLoading(true)
            fetch("/api/orders/all")
                .then(res => res.json())
                .then(data => {
                    if (data.orders) setOrders(data.orders)
                    else setOrdersError(data.error || "Failed to fetch orders.")
                })
                .catch(() => setOrdersError("Failed to fetch orders."))
                .finally(() => setOrdersLoading(false))
        }
    }, [session])

    const openAddModal = () => {
        setEditProduct(null)
        setShowModal(true)
    }

    const openEditModal = (product) => {
        setEditProduct(product)
        setShowModal(true)
    }

    const handleModalSubmit = async (formData) => {
        setModalLoading(true)
        setModalError("")
        try {
            // Prepare FormData for API
            const fd = new FormData()
            fd.append("name", formData.name)
            fd.append("description", formData.description)
            fd.append("category", formData.category)
            fd.append("price", formData.price)
            fd.append("originalPrice", formData.originalPrice)
            fd.append("inStock", formData.inStock)
            fd.append("stock", formData.stock)
            fd.append("tags", formData.tags)
            fd.append("featured", formData.featured)
            fd.append("isNew", formData.isNew)
            fd.append("trending", formData.trending)
            fd.append("sale", formData.sale)
            // Colors and sizes as JSON
            fd.append("colors", JSON.stringify(formData.colors))
            fd.append("sizes", JSON.stringify(formData.sizes.split(",").map(s => s.trim()).filter(Boolean)))

            // Images
            if (formData.imageFiles && formData.imageFiles.length > 0) {
                formData.imageFiles.forEach((file, idx) => {
                    fd.append(`image${idx}`, file)
                })
                console.log("Uploading new images:", formData.imageFiles.length)
            } else if (editProduct && formData.images && formData.images.length > 0) {
                // If no new images uploaded but we have existing images, pass them back
                fd.append("images", JSON.stringify(formData.images))
                console.log("Using existing images:", formData.images.length)
            }

            console.log("Form data being submitted:", {
                name: formData.name,
                category: formData.category,
                featured: formData.featured,
                isNew: formData.isNew,
                trending: formData.trending,
                colors: formData.colors,
                hasImages: formData.images && formData.images.length > 0,
                hasNewImages: formData.imageFiles && formData.imageFiles.length > 0
            })

            if (editProduct) {
                await dispatch(updateProduct({ id: editProduct._id, updates: fd }))
                toast.success("Product updated successfully!");
            } else {
                await dispatch(addProduct(fd))
                toast.success("Product added successfully!");
            }
            dispatch(fetchProducts())
            setShowModal(false)
        } catch (error) {
            setModalError("Failed to save product. Please try again.")
            toast.error("Failed to save product. Please try again.");
            console.error("Product save error:", error)
        } finally {
            setModalLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteProduct(id))
            dispatch(fetchProducts())
            toast.success("Product deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete product");
            console.error("Failed to delete product:", error)
        }
    }

    const removeImageFile = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const openOrderModal = (order) => {
        setSelectedOrder(order)
        setOrderModalOpen(true)
        setOrderActionError("")
    }
    const closeOrderModal = () => {
        setOrderModalOpen(false)
        setSelectedOrder(null)
        setOrderActionError("")
    }
    const handleOrderStatusChange = async (status) => {
        if (!selectedOrder) return
        setOrderActionLoading(true)
        setOrderActionError("")
        try {
            const res = await fetch(`/api/orders/${selectedOrder._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderStatus: status })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update order status.")
            setSelectedOrder(data.order)
            setOrders(orders => orders.map(o => o._id === data.order._id ? data.order : o))
            toast.success("Order status updated!")
        } catch (err) {
            setOrderActionError(err.message)
            toast.error(err.message)
        } finally {
            setOrderActionLoading(false)
        }
    }
    const handlePaymentStatusChange = async (status) => {
        if (!selectedOrder) return
        setOrderActionLoading(true)
        setOrderActionError("")
        try {
            const res = await fetch(`/api/orders/${selectedOrder._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: status })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update payment status.")
            setSelectedOrder(data.order)
            setOrders(orders => orders.map(o => o._id === data.order._id ? data.order : o))
            toast.success("Payment status updated!")
        } catch (err) {
            setOrderActionError(err.message)
            toast.error(err.message)
        } finally {
            setOrderActionLoading(false)
        }
    }

    // Add this helper for badge variants
    const statusBadgeVariant = (status) => {
        switch (status) {
            case "delivered": return "success"
            case "shipped": return "default"
            case "processing": return "outline"
            case "cancelled": return "destructive"
            case "pending": return "secondary"
            default: return "outline"
        }
    }

    if (status === "loading" || (loading && !loaded)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (session?.user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">You don't have permission to access this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Tabs value={tab} onValueChange={setTab}>
                {/* Desktop Tabs */}
                <div className="flex justify-between items-center mb-8">
                    <TabsList className="hidden md:flex">
                        {adminTabs.map(tabItem => (
                            <TabsTrigger key={tabItem.id} value={tabItem.id}>{tabItem.label}</TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Mobile Admin Dropdown */}
                    <div className="flex md:hidden w-full justify-between items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2 px-4 py-2 text-base font-semibold">
                                    {adminTabs.find(t => t.id === tab)?.label || "Dashboard"}
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 mt-2">
                                {adminTabs.map(tabItem => (
                                    <DropdownMenuItem
                                        key={tabItem.id}
                                        onSelect={() => handleTabChange(tabItem.id)}
                                        className={tab === tabItem.id ? "bg-primary/10 text-primary font-semibold" : ""}
                                    >
                                        {tabItem.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <TabsContent value="products">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage your products and inventory</p>
                        </div>
                        <Button onClick={openAddModal} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Product
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="flex items-center p-6">
                                <Package className="h-8 w-8 text-primary mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                                    <p className="text-2xl font-bold">{products.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center p-6">
                                <ShoppingBag className="h-8 w-8 text-green-600 mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                                    <p className="text-2xl font-bold">{products.filter(p => p.stock > 0).length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center p-6">
                                <AlertCircle className="h-8 w-8 text-destructive mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                                    <p className="text-2xl font-bold">{products.filter(p => p.stock === 0).length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                                <p className="text-destructive font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                All Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {products.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No products yet</h3>
                                    <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
                                    <Button onClick={openAddModal}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-semibold">Image</th>
                                                <th className="text-left p-4 font-semibold">Name</th>
                                                <th className="text-left p-4 font-semibold">Category</th>
                                                <th className="text-left p-4 font-semibold">Price</th>
                                                <th className="text-left p-4 font-semibold">Stock</th>
                                                <th className="text-left p-4 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product._id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="p-4">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="h-16 w-16 object-cover rounded-lg border shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center border">
                                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                            {product.description}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="secondary" className="capitalize">
                                                            {product.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 font-semibold">
                                                        ₨{Number(product.price).toLocaleString("en-PK")}
                                                    </td>
                                                    <td className="p-4">
                                                        {product.stock === 0 ? (
                                                            <Badge variant="destructive">Out of Stock</Badge>
                                                        ) : product.stock < 10 ? (
                                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock ({product.stock})</Badge>
                                                        ) : (
                                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock ({product.stock})</Badge>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openEditModal(product)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the product "{product.name}".
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(product._id)}
                                                                            className="bg-destructive hover:bg-destructive/90"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="orders">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">All Orders</h2>
                        {ordersLoading ? (
                            <div className="flex items-center justify-center min-h-[30vh]">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            </div>
                        ) : ordersError ? (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{ordersError}</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border rounded-xl bg-background">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left">Order #</th>
                                            <th className="p-3 text-left">User</th>
                                            <th className="p-3 text-left">Date</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Payment</th>
                                            <th className="p-3 text-left">Total</th>
                                            <th className="p-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</td></tr>
                                        ) : orders.map(order => (
                                            <tr key={order._id} className="border-b hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-mono">{order._id.slice(-8).toUpperCase()}</td>
                                                <td className="p-3">{order.user?.email || order.user}</td>
                                                <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
                                                <td className="p-3"><Badge variant={statusBadgeVariant(order.orderStatus)}>{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</Badge></td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "destructive" : "secondary"}
                                                        className={order.paymentStatus === "paid" ? "bg-green-100 text-green-800 hover:bg-green-100" : order.paymentStatus === "failed" ? "bg-red-100 text-red-800 hover:bg-red-100" : ""}
                                                    >
                                                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 font-semibold">{formatPrice(order.total)}</td>
                                                <td className="p-3">
                                                    <Button size="sm" variant="outline" onClick={() => openOrderModal(order)}>View</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <OrderDetailsModal
                        open={orderModalOpen}
                        onOpenChange={setOrderModalOpen}
                        order={selectedOrder}
                        onOrderStatusChange={handleOrderStatusChange}
                        onPaymentStatusChange={handlePaymentStatusChange}
                        loading={orderActionLoading}
                        error={orderActionError}
                        onClose={closeOrderModal}
                    />
                </TabsContent>
                <TabsContent value="testimonials">
                    <AdminTestimonials products={products} />
                </TabsContent>
                <TabsContent value="support">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Support</h2>
                        <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/30">
                            No support tickets yet. (This section is coming soon.)
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            {/* Add/Edit Product Modal remains outside tabs for global access */}
            <ProductModal
                open={showModal}
                onOpenChange={setShowModal}
                onSubmit={handleModalSubmit}
                initialData={editProduct}
                loading={modalLoading}
                error={modalError}
            />
        </div>
    )
}