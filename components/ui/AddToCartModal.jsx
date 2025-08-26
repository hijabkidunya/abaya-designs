import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function AddToCartModal({ product, open, onClose, onConfirm, loading }) {
    const [size, setSize] = useState("");
    const [color, setColor] = useState("");
    const [error, setError] = useState("");
    const [attempted, setAttempted] = useState(false);

    const handleConfirm = () => {
        setAttempted(true);
        if ((product.sizes?.length > 0 && !size) || (product.colors?.length > 0 && !color)) {
            setError("Please select both size and color.");
            return;
        }
        setError("");
        onConfirm({ size: size || product.sizes?.[0] || "One Size", color: color || product.colors?.[0] || "Default" });
    };

    // Reset on open/close
    React.useEffect(() => {
        if (open) {
            setSize("");
            setColor("");
            setError("");
            setAttempted(false);
        }
    }, [open, product]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full">
                <DialogHeader>
                    <DialogTitle>Select Size & Color</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-20 h-20 object-cover rounded border" />
                        <div>
                            <div className="font-semibold text-lg">{product.name}</div>
                            <Badge variant="secondary" className="capitalize mt-1">{product.category}</Badge>
                        </div>
                    </div>
                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Size</label>
                            <Select value={size} onValueChange={setSize}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {product.sizes.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Color</label>
                            <Select value={color} onValueChange={setColor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {product.colors.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            <span className="inline-block w-4 h-4 rounded-full border border-gray-300 align-middle mr-2" style={{ backgroundColor: c }} />
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {attempted && error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
                        {loading ? "Adding..." : "Add to Cart"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 