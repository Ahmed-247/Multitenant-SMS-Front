import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { removeToken } from '../utils/tokenUtils'

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const logout = () => {
    removeToken() // This removes token, user, and refreshToken
    navigate('/login')
  }

  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white font-poppins">
              {user?.role === 'superadmin' ? 'Super Admin Dashboard' : 'School Admin Dashboard'}
            </h1>
            {user?.schoolName && (
              <p className="text-sm text-slate-400 mt-1 font-poppins">{user.schoolName}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-white font-poppins">{user?.name}</p>
                <p className="text-slate-400 capitalize font-poppins">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-poppins"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header