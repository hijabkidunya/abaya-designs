import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

const categories = [
  { name: "Products", href: "/products" },
  { name: "Abayas", href: "/products?category=abayas" },
  { name: "Hijabs", href: "/products?category=hijabs" },
  { name: "Clothing", href: "/products?category=clothing" },
  { name: "Accessories", href: "/products?category=accessories" },
]

export default function Footer() {
  return (
    <footer className="bg-background/95 border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center justify-start">
              <h1 className="logo text-2xl font-bold uppercase tracking-wide">Abaya Designs</h1>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted destination for modest fashion. Discover elegant abayas, hijabs, and accessories that celebrate your style and values.
            </p>
            <div className="flex space-x-4 mt-2">
              <Link href="https://www.instagram.com/hijabkidunya" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link href={cat.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2 text-sm">
              {/* <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hijabkidunya@gmail.com</span>
              </div> */}
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>0349-6098882</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Purina Hatiya Bazaar Metro Wali Gali, Printing Street Sector C 1, Mirpur Azad Kashmir</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AbayaDesigns. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
