'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Package, User, Calendar, MapPin, CreditCard, Eye } from 'lucide-react'
import ProtectedRoute from '../../../components/ProtectedRoute'

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    imageUrl: string
    price: number
  }
  quantity: number
  price: number
}

interface Order {
  id: string
  userId: string
  user?: {
    username: string
    email: string
  }
  items: OrderItem[]
  totalAmount: number
  status: string
  shippingAddress: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export default function AdminOrderDetail() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login first')
        router.push('/')
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setOrder(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login first')
        router.push('/')
      } else if (error.response?.status === 404) {
        toast.error('Order not found')
        router.push('/admin/dashboard')
      } else {
        toast.error('Failed to fetch order')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true)
      const token = localStorage.getItem('token')

      await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Order status updated successfully')
      fetchOrder() // Refresh order data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Order not found</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="btn-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-primary-600">Order Details</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="btn-secondary"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{order.id.slice(-6)}
                  </h2>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-gray-400" />
                    <span className="text-gray-600">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">${item.product.price} each</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-medium text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User size={20} />
                  <span>Customer Information</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Username:</span>
                    <p className="text-gray-900 font-medium">{order.user?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="text-gray-900 font-medium">{order.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Customer ID:</span>
                    <p className="text-gray-900 font-medium">{order.userId}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin size={20} />
                  <span>Shipping Information</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <p className="text-gray-900">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard size={20} />
                  <span>Payment Information</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <p className="text-gray-900 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="text-gray-900 font-medium">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Status Update */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                
                <div className="space-y-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  {updatingStatus && (
                    <div className="text-center text-sm text-gray-600">
                      Updating status...
                    </div>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="w-full btn-secondary"
                  >
                    Back to Dashboard
                  </button>
                  
                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="w-full btn-secondary"
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
