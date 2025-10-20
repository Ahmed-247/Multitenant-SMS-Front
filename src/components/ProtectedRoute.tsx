import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../utils/tokenUtils'
import { hasRouteAccess, getUserRoleFromToken } from '../utils/routeUtils'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[] // Made optional since we're using route-based access control
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const token = getToken()
    if (token) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const token = getToken()
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Check route access using token role
  const userRole = getUserRoleFromToken()
  // console.log(userRole)
  if (!userRole || !hasRouteAccess(location.pathname, userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}