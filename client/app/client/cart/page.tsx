'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null)
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login first')
        router.push('/')
        return
      }

      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setCartItems(response.data.data || [])
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login first')
        router.push('/')
      } else {
        toast.error('Failed to fetch cart')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdatingQuantity(itemId)
      const token = localStorage.getItem('token')
      
      await axios.put(`http://localhost:8080/api/cart/${itemId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Quantity updated')
      fetchCart()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update quantity')
    } finally {
      setUpdatingQuantity(null)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      await axios.delete(`http://localhost:8080/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Item removed from cart')
      fetchCart()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove item')
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const token = localStorage.getItem('token')
      
      await axios.delete('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Cart cleared')
      fetchCart()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clear cart')
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
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
              <h1 className="text-2xl font-bold text-primary-600">Shopping Cart</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/client/products')}
                  className="btn-secondary"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push('/client/orders')}
                  className="btn-secondary"
                >
                  My Orders
                </button>
                <button
                  onClick={logout}
                  className="btn-danger"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <button
                onClick={() => router.push('/client/products')}
                className="btn-primary"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items ({totalItems})</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                            <p className="text-gray-600">${item.product.price}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingQuantity === item.id}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            
                            <span className="w-12 text-center font-medium">
                              {updatingQuantity === item.id ? '...' : item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingQuantity === item.id}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 border-t border-gray-200">
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items ({totalItems})</span>
                      <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-semibold text-primary-600">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push('/client/checkout')}
                    className="w-full btn-primary"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
