import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import authService from '../services/auth.service'
import { setToken } from '../utils/tokenUtils'
import { handleError } from '../utils/errorUtils'
import bonecoleLogo from '../assets/bonecoleLogo.svg'

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
          <div className="flex items-center justify-center">
            <img src={bonecoleLogo} alt="Bonecole Logo" className="h-16" />
          </div>
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

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Se connecter'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/contact-registration')}
              className="w-full py-3 px-4 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600 hover:border-slate-500 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              <svg className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-poppins text-sm sm:text-base text-center">Nous contacter pour inscrire votre école</span>
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