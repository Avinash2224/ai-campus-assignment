'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stockQuantity: number
  imageUrl: string
  status: string
}

export default function EditProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'electronics',
    stockQuantity: '',
    imageUrl: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login first')
        router.push('/')
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const product = response.data
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stockQuantity: product.stockQuantity.toString(),
        imageUrl: product.imageUrl,
        status: product.status
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch product')
      router.push('/admin/dashboard')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login first')
        router.push('/')
        return
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity)
      }

      await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Product updated successfully!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
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
              <h1 className="text-2xl font-bold text-primary-600">Edit Product</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                required
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home</option>
                  <option value="sports">Sports</option>
                  <option value="beauty">Beauty</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">Leave empty to use default image</p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                <span>{loading ? 'Updating...' : 'Update Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
