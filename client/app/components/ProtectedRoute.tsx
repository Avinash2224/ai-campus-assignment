'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'client'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, validateToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check if token is valid
      if (!validateToken()) {
        router.push('/')
        return
      }

      // Check if user exists
      if (!user) {
        router.push('/')
        return
      }

      // Check role if required
      if (requiredRole && user.role !== requiredRole) {
        router.push('/')
        return
      }
    }
  }, [user, isLoading, validateToken, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!validateToken() || !user || (requiredRole && user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
