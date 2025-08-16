'use client'

import axios from 'axios'
import { ArrowLeft, DollarSign, Package, ShoppingCart } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ProtectedRoute from '../../../components/ProtectedRoute'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
  stockQuantity: number
  imageUrl: string
  status: string
  totalValue: number
  createdAt: string
}

export default function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login first')
        router.push('/')
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setProduct(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login first')
        router.push('/')
      } else if (error.response?.status === 404) {
        toast.error('Product not found')
        router.push('/client/products')
      } else {
        toast.error('Failed to fetch product')
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!product || !product.inStock) return

    try {
      setAddingToCart(true)
      const token = localStorage.getItem('token')

      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/cart`, {
        productId: product.id,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Product not found</p>
          <button
            onClick={() => router.push('/client/products')}
            className="btn-primary mt-4"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/client/products')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-primary-600">Product Details</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/client/cart')}
                  className="btn-secondary"
                >
                  View Cart
                </button>
                <button
                  onClick={() => router.push('/client/orders')}
                  className="btn-secondary"
                >
                  My Orders
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="p-8">
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* Price and Status */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-bold text-primary-600">${product.price}</span>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Package size={16} />
                      <span>Stock: {product.stockQuantity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} />
                      <span>Total Value: ${product.totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Category and Status */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 text-gray-900 capitalize">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 text-gray-900 capitalize">{product.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Section */}
                {product.inStock && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                        Quantity:
                      </label>
                      <select
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {Array.from({ length: Math.min(10, product.stockQuantity) }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={addToCart}
                      disabled={addingToCart}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      {addingToCart ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <ShoppingCart size={20} />
                      )}
                      <span>
                        {addingToCart ? 'Adding...' : `Add ${quantity} ${quantity === 1 ? 'item' : 'items'} to Cart`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Product Details */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Added:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
                    <p><strong>Product ID:</strong> {product.id}</p>
                    <p><strong>Availability:</strong> {product.inStock ? 'Available for purchase' : 'Currently unavailable'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
