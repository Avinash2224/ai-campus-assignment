'use client'

import axios from 'axios'
import { Eye, Search, ShoppingCart, SortAsc } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'

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
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ClientProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [inStock, setInStock] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [cartCount, setCartCount] = useState(0)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    fetchProducts()
    fetchCartCount()
  }, [pagination.page, pagination.limit, search, category, status, inStock, sortBy, sortOrder])

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const totalItems = (response.data.data || []).reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(totalItems)
    } catch (error) {
      // Silently fail for cart count
      console.error('Failed to fetch cart count:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (!token) {
        toast.error('Please login first')
        router.push('/')
        return
      }

      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      if (status) params.append('status', status)
      if (inStock !== undefined) params.append('inStock', inStock.toString())
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setProducts(response.data.data || [])
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev
      }))
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login first')
        router.push('/')
      } else {
        toast.error('Failed to fetch products')
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      setAddingToCart(productId)
      const token = localStorage.getItem('token')

      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/cart`, {
        productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Added to cart!')
      fetchCartCount() // Refresh cart count after successful add
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const clearFilters = () => {
  setSearch('')
  setSearchInput('')
    setCategory('')
    setStatus('')
    setInStock(undefined)
    setSortBy('name')
    setSortOrder('asc')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
              <h1 className="text-2xl font-bold text-primary-600">Products</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/client/cart')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>View Cart ({cartCount})</span>
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
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearch(searchInput)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* In Stock Filter */}
              <div>
                <select
                  value={inStock === undefined ? '' : inStock.toString()}
                  onChange={(e) => setInStock(e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Stock</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="createdAt">Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <SortAsc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Stock: {product.stockQuantity}</span>
                      <span>Total Value: ${product.totalValue.toFixed(2)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={!product.inStock || addingToCart === product.id}
                        className={`flex-1 btn-primary flex items-center justify-center space-x-2 ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {addingToCart === product.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                        <span>{addingToCart === product.id ? 'Adding...' : 'Add to Cart'}</span>
                      </button>

                      <button
                        onClick={() => router.push(`/client/products/${product.id}`)}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md ${page === pagination.page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
