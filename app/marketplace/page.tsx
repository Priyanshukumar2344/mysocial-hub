"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import SponsorSection from "@/components/SponsorSection"
import {
  Plus,
  Search,
  Tag,
  Book,
  Laptop,
  Pencil,
  Backpack,
  Calculator,
  Smartphone,
  Headphones,
  Archive,
  SlidersHorizontal,
  X,
} from "lucide-react"

// Import the useSectionUpdate hook
import { useSectionUpdate } from "@/hooks/use-section-update"

// Version tracking
const MARKETPLACE_VERSION = "2.0.0"

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: "new" | "like-new" | "good" | "fair"
  images: string[]
  seller: {
    id: string
    name: string
    verification: "none" | "blue" | "golden"
  }
  createdAt: string
  status: "available" | "sold" | "reserved"
  tags: string[]
  location: string
  negotiable: boolean
  views: number
  likes: number
}

const categories = [
  { id: "books", name: "Books", icon: Book },
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "stationery", name: "Stationery", icon: Pencil },
  { id: "bags", name: "Bags", icon: Backpack },
  { id: "calculators", name: "Calculators", icon: Calculator },
  { id: "phones", name: "Phones", icon: Smartphone },
  { id: "accessories", name: "Accessories", icon: Headphones },
  { id: "other", name: "Other", icon: Archive },
]

export default function MarketplacePage() {
  const { user } = useAuth()
  const { isMobile, isAndroid } = useMobileDetection()
  const [products, setProducts] = useState<Product[]>(
    () =>
      db.get("products") || [
        {
          id: "1",
          title: "Data Structures Textbook",
          description:
            "Slightly used textbook for CS301 Data Structures course. In excellent condition with no markings.",
          price: 450,
          category: "books",
          condition: "like-new",
          images: [
            "/placeholder.svg?height=300&width=300&text=Textbook",
            "/placeholder.svg?height=300&width=300&text=Textbook+Back",
          ],
          seller: {
            id: "user1",
            name: "Rahul Sharma",
            verification: "blue",
          },
          createdAt: "2024-02-15T09:00:00Z",
          status: "available",
          tags: ["textbook", "computer science", "data structures"],
          location: "North Campus",
          negotiable: true,
          views: 45,
          likes: 5,
        },
        {
          id: "2",
          title: "Scientific Calculator",
          description: "Casio FX-991EX scientific calculator. Used for one semester only.",
          price: 800,
          category: "calculators",
          condition: "good",
          images: [
            "/placeholder.svg?height=300&width=300&text=Calculator",
            "/placeholder.svg?height=300&width=300&text=Calculator+Side",
            "/placeholder.svg?height=300&width=300&text=Calculator+Back",
          ],
          seller: {
            id: "user2",
            name: "Priya Patel",
            verification: "none",
          },
          createdAt: "2024-02-18T14:30:00Z",
          status: "available",
          tags: ["calculator", "engineering", "math"],
          location: "South Campus",
          negotiable: false,
          views: 32,
          likes: 3,
        },
        {
          id: "3",
          title: "Laptop Cooling Pad",
          description: "5-fan cooling pad for laptops up to 17 inches. USB powered with adjustable height.",
          price: 650,
          category: "electronics",
          condition: "new",
          images: [
            "/placeholder.svg?height=300&width=300&text=Cooling+Pad",
            "/placeholder.svg?height=300&width=300&text=Cooling+Pad+Side",
          ],
          seller: {
            id: "user3",
            name: "Amit Kumar",
            verification: "blue",
          },
          createdAt: "2024-02-20T10:15:00Z",
          status: "available",
          tags: ["laptop", "cooling", "accessories"],
          location: "East Campus",
          negotiable: true,
          views: 28,
          likes: 7,
        },
        {
          id: "4",
          title: "Mechanical Engineering Notes",
          description: "Handwritten notes for ME302 Thermodynamics. Complete and well-organized.",
          price: 350,
          category: "books",
          condition: "good",
          images: [
            "/placeholder.svg?height=300&width=300&text=ME+Notes",
            "/placeholder.svg?height=300&width=300&text=ME+Notes+Sample",
          ],
          seller: {
            id: "user4",
            name: "Neha Singh",
            verification: "golden",
          },
          createdAt: "2024-02-22T16:45:00Z",
          status: "available",
          tags: ["notes", "mechanical", "thermodynamics"],
          location: "West Campus",
          negotiable: false,
          views: 19,
          likes: 4,
        },
      ],
  )
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high" | "popular">("recent")
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: "books",
    condition: "new",
    negotiable: true,
    tags: [],
    images: [],
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({})
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add this line to use the hook
  useSectionUpdate("marketplace", [products.length])

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateProduct = () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate upload delay
    setTimeout(() => {
      const product: Product = {
        id: Date.now().toString(),
        ...(newProduct as any),
        seller: {
          id: user!.id,
          name: user!.name,
          verification: user!.verification,
        },
        createdAt: new Date().toISOString(),
        status: "available",
        views: 0,
        likes: 0,
        images: uploadedImages,
      }

      const updatedProducts = [product, ...products]
      db.set("products", updatedProducts)
      setProducts(updatedProducts)
      setShowNewProduct(false)
      setNewProduct({
        category: "books",
        condition: "new",
        negotiable: true,
        tags: [],
        images: [],
      })
      setUploadedImages([])
      setIsSubmitting(false)

      toast({
        title: "Success",
        description: "Product listed successfully",
      })
    }, 1000)
  }

  const handleLike = (productId: string) => {
    const updatedProducts = products.map((p) => (p.id === productId ? { ...p, likes: p.likes + 1 } : p))
    db.set("products", updatedProducts)
    setProducts(updatedProducts)
  }

  const handleShare = (productId: string) => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share",
      description: "Sharing functionality would open here",
    })
  }

  const handleChatWithSeller = (product: Product) => {
    setSelectedProduct(product)
    setShowChat(true)
  }

  const handleImageUpload = () => {
    // Simulate file upload with placeholder images
    if (uploadedImages.length >= 4) {
      toast({
        title: "Error",
        description: "You can upload a maximum of 4 images",
        variant: "destructive",
      })
      return
    }

    // Generate a random placeholder image
    const placeholderText = `Product+${uploadedImages.length + 1}`
    const newImage = `/placeholder.svg?height=300&width=300&text=${placeholderText}`
    setUploadedImages([...uploadedImages, newImage])
  }

  const removeUploadedImage = (index: number) => {
    const newImages = [...uploadedImages]
    newImages.splice(index, 1)
    setUploadedImages(newImages)
  }

  const navigateImage = (productId: string, direction: "next" | "prev") => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const currentIndex = currentImageIndex[productId] || 0
    const totalImages = product.images.length

    let newIndex
    if (direction === "next") {
      newIndex = (currentIndex + 1) % totalImages
    } else {
      newIndex = (currentIndex - 1 + totalImages) % totalImages
    }

    setCurrentImageIndex({
      ...currentImageIndex,
      [productId]: newIndex,
    })
  }

  const filteredProducts = products
    .filter((product) => {
      if (activeCategory !== "all" && product.category !== activeCategory) return false
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !product.title.toLowerCase().includes(query) &&
          !product.description?.toLowerCase().includes(query) &&
          !product.tags?.some((tag) => tag.toLowerCase().includes(query))
        ) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "popular":
          return b.likes - a.likes
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              SellꨄBuy
              <span className="text-xs text-muted-foreground ml-2">v{MARKETPLACE_VERSION}</span>
            </CardTitle>
            <div className="flex gap-2">
              {showFilters && (
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} aria-label="Hide filters">
                  <X className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? "Hide filters" : "Show filters"}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNewProduct(true)} aria-label="List new product">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar (Conditional) */}
          {showSearch && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="container mx-auto py-4 pb-20 md:pb-6">
            {/* Categories */}
            <div className="mb-6">
              <Card className="w-full">
                <CardContent className="p-3">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-2 ">
                      <Button
                        variant={activeCategory === "all" ? "default" : "outline"}
                        className="flex items-center gap-2"
                        onClick={() => setActiveCategory("all")}
                      >
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={activeCategory === category.id ? "default" : "outline"}
                          className="flex items-center gap-2"
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <category.icon className="h-4 w-4" />
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Sponsors Section */}
            <SponsorSection section="marketplace" />

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.images[currentImageIndex[product.id] || 0]}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    {product.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-black/20 hover:bg-black/40 text-white"
                          onClick={() => navigateImage(product.id, "prev")}
                        >
                          ←
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-black/20 hover:bg-black/40 text-white"
                          onClick={() => navigateImage(product.id, "next")}
                        >
                          →
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                      <span className="text-sm text-muted-foreground capitalize">{product.condition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleLike(product.id)}>
                          ♥ {product.likes}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(product.id)}>
                          Share
                        </Button>
                      </div>
                      <Button size="sm" onClick={() => handleChatWithSeller(product)}>
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
