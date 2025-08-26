import { Inter } from "next/font/google"
import { Outfit } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import StoreProvider from "@/components/providers/StoreProvider"
import ThemeProvider from "@/components/providers/ThemeProvider"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner";
import AppHydrationLoader from "@/components/ui/AppHydrationLoader";

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "AbayaDesigns - Modest Fashion & Clothing",
  description:
    "Discover elegant abayas, hijabs, modest clothing, and accessories. Your trusted destination for fashion that celebrates style and values.",
  keywords: "hijab, abaya, modest fashion, clothing, muslim fashion, hijab online, abaya online",
  authors: [{ name: "AbayaDesigns" }],
  creator: "AbayaDesigns",
  publisher: "AbayaDesigns",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://abayadesigns.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AbayaDesigns - Modest Fashion & Clothing",
    description: "Discover elegant abayas, hijabs, modest clothing, and accessories.",
    url: "https://abayadesigns.com",
    siteName: "AbayaDesigns",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AbayaDesigns - Modest Fashion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AbayaDesigns - Modest Fashion & Clothing",
    description: "Discover elegant abayas, hijabs, modest clothing, and accessories.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <SessionProvider>
          <StoreProvider>
            <ThemeProvider>
              <AppHydrationLoader>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster />
              </AppHydrationLoader>
            </ThemeProvider>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
