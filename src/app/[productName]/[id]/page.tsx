"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus,
  MapPin,
  Star,
  Check,
  X,
  CheckCircle
} from 'lucide-react';
import { usePublicProducts } from '@/hooks/usePublic';
import { useCart } from '@/hooks/useCart';
import Cart from '@/components/food/Cart';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
  } | string;
  stock: number;
  images?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Extract product ID from URL - it's the second parameter after the product name
  const productId = params?.id as string;
  
  const { getProductById } = usePublicProducts();
  const { addToCart, cartItems, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const data = await getProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const productImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : '/assets/images/trending/trending.png';

    // Add items based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        image: productImage,
        price: product.price
      });
    }

    // Show notification
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 3000);

    // Optional: Reset quantity to 1 after adding
    setQuantity(1);

    // Optional: Open cart sidebar
    setTimeout(() => setIsCartOpen(true), 500);
  };

  const handleBuyNow = () => {
    if (!product) return;

    const productImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : '/assets/images/trending/trending.png';

    // Add to cart first
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        image: productImage,
        price: product.price
      });
    }

    // Navigate to checkout
    router.push('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-20 bg-[#f8f5e6] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f47a45] dark:border-[#f7a16b] mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen mt-20 bg-[#f8f5e6] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The product you are looking for does not exist.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#f47a45] dark:bg-[#f7a16b] text-white rounded-lg hover:bg-[#f89b64] dark:hover:bg-[#f89b64] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category.name;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/images/trending/trending.png'];

  // Check if product is in cart
  const isInCart = cartItems.some(item => item.id === product._id);
  const cartQuantity = cartItems.find(item => item.id === product._id)?.quantity || 0;

  return (
    <div className="min-h-screen mt-20 bg-[#f8f5e6] dark:bg-gray-900 pb-12">
      {/* Success Notification */}
      {showAddedNotification && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Added to Cart!</p>
            <p className="text-sm">{quantity} item(s) added successfully</p>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        items={cartItems}
        totalPrice={totalPrice}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        orderType="food"
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8">
        {/* Breadcrumb & Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#f47a45] dark:hover:text-[#f7a16b] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="hover:text-[#f47a45] dark:hover:text-[#f7a16b] cursor-pointer">Home</span>
              <span>/</span>
              <span className="hover:text-[#f47a45] dark:hover:text-[#f7a16b] cursor-pointer">{categoryName}</span>
              <span>/</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-xs">
                {product.name}
              </span>
            </div>
          </div>

          {/* View Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-[#f58c55] hover:bg-[#f47a45] text-white rounded-lg font-medium transition-all hover:scale-105"
          >

            <span className="hidden sm:inline">View Orders </span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === idx
                        ? 'ring-4 ring-[#f47a45] dark:ring-[#f7a16b]'
                        : 'hover:opacity-75'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
                  {product.name}
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-full transition-all ${
                      isFavorite
                        ? 'bg-red-100 text-red-500 dark:bg-red-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    } hover:scale-110`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:scale-110 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rating & Category */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    (4.0)
                  </span>
                </div>
                <span className="text-sm px-3 py-1 bg-[#f47a45]/10 dark:bg-[#f7a16b]/10 text-[#f47a45] dark:text-[#f7a16b] rounded-full font-medium">
                  {categoryName}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-[#f89b64]/20 to-[#f47a45]/20 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
              <p className="text-4xl md:text-5xl font-bold text-[#f47a45] dark:text-[#f7a16b]">
                ₦{product.price.toLocaleString()}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Specifications
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <span className="px-6 py-2 text-lg font-bold text-gray-800 dark:text-gray-200 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total: <span className="font-bold text-[#f47a45] dark:text-[#f7a16b]">
                      ₦{(product.price * quantity).toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Cart Status Badge */}
              {isInCart && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">{cartQuantity} in cart</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-[#f47a45] dark:border-[#f7a16b] rounded-xl font-bold hover:bg-[#f47a45]/10 dark:hover:bg-[#f7a16b]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
              
                  Order
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  disabled={product.stock === 0}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#f89b64] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f47a45] text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay
                </button>
              </div>
            </div>

            {/* Location Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Delivery Information
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Available for delivery across Nigeria. Estimated delivery: 3-5 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}