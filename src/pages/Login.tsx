import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import authService from '../services/auth.service'
import { setToken } from '../utils/tokenUtils'
import { handleError } from '../utils/errorUtils'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (user) {
    const redirectPath = user.role === 'superadmin' ? '/super-admin' : '/school-admin'
    return <Navigate to={redirectPath} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authService.loginUser({
        Email: email,
        Password: password
      })
      
      // Debug: Log the actual API response
      console.log('API Response:', response)
      
      // Check if login was successful
      if (response.success && response.data) {
        // Transform API user data to match our User interface
        const userData = {
          id: response.data.user.UserId,
          email: response.data.user.Email,
          role: response.data.user.Role,
          name: response.data.user.UserName
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Store token using utility function
        setToken(response.data.token)
        
        // Set user state and redirect
        setUser(userData)
        const redirectPath = response.data.user.Role === 'superadmin' ? '/super-admin' : '/school-admin'
        navigate(redirectPath)
      } else {
        setError('Invalid email or password. Please check your credentials and try again.')
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Login error', 'Login failed. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/25">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-poppins">
            School Management System
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 font-poppins">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-field pr-12"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-400 font-poppins">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-400 space-y-2 font-poppins">
              <p><strong className="text-white">Super Admin:</strong> superadmin@schoolsystem.com / admin123</p>
              <p><strong className="text-white">School Admin:</strong> schooladmin@example.com / school123</p>
            </div>
          </div> */}
        </form>
      </div>
    </div>
  )
}

export default Login