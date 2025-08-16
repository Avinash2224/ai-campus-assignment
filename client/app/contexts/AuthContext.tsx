'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  role: 'admin' | 'client'
  email: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User, token: string) => void
  logout: () => void
  isLoading: boolean
  validateToken: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const validateToken = (): boolean => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      return false
    }
    
    try {
      // Check if token is expired (basic check)
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      if (tokenData.exp * 1000 < Date.now()) {
        // Token expired
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return false
      }
      
      return true
    } catch (error) {
      // Invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return false
    }
  }

  useEffect(() => {
    // Check if user is logged in on app load
    if (validateToken()) {
      const userData = localStorage.getItem('user')
      try {
        const parsedUser = JSON.parse(userData!)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    validateToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
