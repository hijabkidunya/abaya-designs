import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Upload } from "lucide-react"

// Image compression utility
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img
            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }

            canvas.width = width
            canvas.height = height

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height)
            canvas.toBlob(resolve, 'image/jpeg', quality)
        }

        img.src = URL.createObjectURL(file)
    })
}

// Minimal color picker using input type="color"
function ColorPicker({ colors, setColors }) {
    const [colorInput, setColorInput] = useState("#000000")
    return (
        <div className="space-y-2">
            <div className="flex gap-2 items-center">
                <input
                    type="color"
                    value={colorInput}
                    onChange={e => setColorInput(e.target.value)}
                    className="w-10 h-10 border border-border dark:border-zinc-700 rounded bg-background dark:bg-zinc-900"
                />
                <Button type="button" size="sm" onClick={() => {
                    if (!colors.includes(colorInput)) setColors([...colors, colorInput])
                }}>Add</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
                {colors.map((color, idx) => (
                    <span key={idx} className="relative inline-block">
                        <span
                            className="inline-block w-7 h-7 rounded-full border border-gray-300 dark:border-zinc-700"
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                            onClick={() => setColors(colors.filter((c, i) => i !== idx))}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function ProductModal({ open, onOpenChange, onSubmit, initialData, loading, error }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "maxi-dresses",
        price: "",
        originalPrice: "",
        inStock: true,
        stock: 0,
        tags: "",
        images: [],
        colors: [],
        sizes: "",
        featured: false,
        isNew: false,
        trending: false,
        sale: false,
    })
    const [imageFiles, setImageFiles] = useState([])
    const [formError, setFormError] = useState("")
    const fileInputRef = useRef()
    const [previewImage, setPreviewImage] = useState(null)
    const [compressingImages, setCompressingImages] = useState(false)

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name ?? "",
                description: initialData.description ?? "",
                category: initialData.category ?? "maxi-dresses",
                price: initialData.price ?? "",
                originalPrice: initialData.originalPrice ?? "",
                inStock: initialData.inStock === true,
                stock: initialData.stock ?? 0,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : (initialData.tags ?? ""),
                images: initialData.images ?? [],
                colors: initialData.colors ?? [],
                sizes: Array.isArray(initialData.sizes) ? initialData.sizes.join(", ") : (initialData.sizes ?? ""),
                featured: initialData.featured === true,
                isNew: initialData.isNew === true,
                trending: initialData.trending === true,
                sale: initialData.sale === true,
            })
            setImageFiles([])
            setFormError("")
        } else {
            setForm({
                name: "",
                description: "",
                category: "maxi-dresses",
                price: "",
                originalPrice: "",
                inStock: true,
                stock: 0,
                tags: "",
                images: [],
                colors: [],
                sizes: "",
                featured: false,
                isNew: false,
                trending: false,
                sale: false,
            })
            setImageFiles([])
            setFormError("")
        }
    }, [initialData, open])

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }

    const handleCategoryChange = (value) => {
        setForm((prev) => ({ ...prev, category: value }))
    }

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files)

        // Validate file count
        if (files.length > 5) {
            setFormError("You can upload up to 5 images.")
            return
        }

        // Validate file sizes (6MB per image, 30MB total)
        const maxFileSize = 6 * 1024 * 1024 // 6MB
        const maxTotalSize = 30 * 1024 * 1024 // 30MB

        let totalSize = 0
        for (const file of files) {
            if (file.size > maxFileSize) {
                setFormError(`File "${file.name}" is too large. Maximum size is 6MB.`)
                return
            }
            totalSize += file.size
        }

        if (totalSize > maxTotalSize) {
            setFormError("Total file size exceeds 30MB limit.")
            return
        }

        setCompressingImages(true)
        setFormError("")

        try {
            // Compress images
            const compressedFiles = await Promise.all(
                files.map(async (file) => {
                    const compressed = await compressImage(file)
                    return new File([compressed], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    })
                })
            )

            setImageFiles(compressedFiles)
        } catch (error) {
            setFormError("Failed to process images. Please try again.")
            console.error("Image compression error:", error)
        } finally {
            setCompressingImages(false)
        }
    }

    const removeImageFile = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleColorChange = (colors) => {
        setForm((prev) => ({ ...prev, colors }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setFormError("")
        // Validation
        if (!form.name.trim() || !form.description.trim() || !form.category || !form.price) {
            setFormError("All fields are required.")
            return
        }
        if (parseFloat(form.price) <= 0) {
            setFormError("Price must be greater than 0.")
            return
        }
        if (!initialData && imageFiles.length === 0) {
            setFormError("At least one image is required.")
            return
        }
        if (imageFiles.length > 5) {
            setFormError("You can upload up to 5 images.")
            return
        }
        // Pass form data to parent
        onSubmit({ ...form, imageFiles })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl w-full sm:w-[90vw] md:w-[700px] lg:w-[900px] xl:w-[1000px] max-h-[95vh] overflow-y-auto rounded-2xl p-8 bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-2xl md:text-3xl font-bold mb-2">{initialData ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" name="name" value={form.name} onChange={handleFormChange} placeholder="Enter product name" required className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={form.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="abayas">Abayas</SelectItem>
                                    <SelectItem value="maxi-dresses">Maxi Dresses</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea id="description" name="description" value={form.description} onChange={handleFormChange} placeholder="Enter product description" rows={3} required className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label htmlFor="price">Price (₨) *</Label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} placeholder="0.00" required className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="originalPrice">Original Price</Label>
                            <Input id="originalPrice" name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice} onChange={handleFormChange} placeholder="0.00" className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} placeholder="0" className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="sizes">Sizes (comma separated)</Label>
                            <Input id="sizes" name="sizes" value={form.sizes} onChange={handleFormChange} placeholder="e.g., S, M, L, XL" className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input id="tags" name="tags" value={form.tags} onChange={handleFormChange} placeholder="e.g., summer, casual, formal" className="border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox id="inStock" name="inStock" checked={form.inStock} onCheckedChange={(checked) => setForm(prev => ({ ...prev, inStock: checked }))} />
                            <Label htmlFor="inStock">Product is in stock</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="featured" name="featured" checked={form.featured} onCheckedChange={(checked) => setForm(prev => ({ ...prev, featured: checked }))} />
                            <Label htmlFor="featured">Featured</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="isNew" name="isNew" checked={form.isNew} onCheckedChange={(checked) => setForm(prev => ({ ...prev, isNew: checked }))} />
                            <Label htmlFor="isNew">New</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="trending" name="trending" checked={form.trending} onCheckedChange={(checked) => setForm(prev => ({ ...prev, trending: checked }))} />
                            <Label htmlFor="trending">Trending</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="sale" name="sale" checked={form.sale} onCheckedChange={(checked) => setForm(prev => ({ ...prev, sale: checked }))} />
                            <Label htmlFor="sale">Sale</Label>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label>Colors</Label>
                        <ColorPicker colors={form.colors} setColors={handleColorChange} />
                    </div>
                    <div className="space-y-4">
                        <Label>Product Images {!initialData && "*"}</Label>
                        <div className="border-2 border-dashed border-border dark:border-zinc-700 rounded-lg p-6 text-center bg-background dark:bg-zinc-900">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                className="hidden"
                            />
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Click to upload images (max 5, 6MB each, 30MB total)
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={compressingImages}
                            >
                                {compressingImages ? "Processing..." : "Choose Files"}
                            </Button>
                        </div>
                        {/* Image Previews */}
                        <div className="flex gap-2 flex-wrap mt-4">
                            {imageFiles.length > 0
                                ? imageFiles.map((file, idx) => (
                                    <div key={idx} className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="h-16 w-16 object-contain rounded-lg border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 cursor-pointer"
                                            onClick={() => setPreviewImage({ src: URL.createObjectURL(file), name: file.name })}
                                        />
                                        <Button type="button" size="sm" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full" onClick={() => removeImageFile(idx)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))
                                : form.images.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt="Current"
                                        className="h-16 w-16 object-contain rounded-lg border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 cursor-pointer"
                                        onClick={() => setPreviewImage({ src: url, name: `Image ${idx + 1}` })}
                                    />
                                ))}
                        </div>
                    </div>
                    {formError && (
                        <div className="flex items-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <span className="text-destructive text-sm">{formError}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <span className="text-destructive text-sm">{error}</span>
                        </div>
                    )}
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={loading || compressingImages}>{initialData ? "Update Product" : "Add Product"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            {/* Image Preview Modal */}
            {previewImage && (
                <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                    <DialogContent className="flex flex-col items-center justify-center max-w-lg w-full p-6 bg-background dark:bg-zinc-900 rounded-2xl border border-border dark:border-zinc-800">
                        {/* <div className="flex justify-end w-full">
                            <Button type="button" size="icon" variant="ghost" onClick={() => setPreviewImage(null)} aria-label="Close preview">
                                <X className="h-5 w-5" />
                            </Button>
                        </div> */}
                        <img
                            src={previewImage.src}
                            alt={previewImage.name}
                            className="max-h-[60vh] max-w-full object-contain rounded-lg border border-border dark:border-zinc-700 bg-background dark:bg-zinc-900 shadow-lg"
                        />
                        <div className="mt-2 text-sm text-muted-foreground text-center w-full truncate">{previewImage.name}</div>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    )
} 