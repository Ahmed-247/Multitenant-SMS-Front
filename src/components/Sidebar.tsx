import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

const Sidebar: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const superAdminNavItems = [
    { name: 'Dashboard', href: '/super-admin', icon: HomeIcon },
    { name: 'Schools', href: '/super-admin/schools', icon: BuildingOfficeIcon },
    { name: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCardIcon },
    { name: 'Content', href: '/super-admin/content', icon: DocumentTextIcon },
  ]

  const schoolAdminNavItems = [
    { name: 'Dashboard', href: '/school-admin', icon: HomeIcon },
    { name: 'Students', href: '/school-admin/students', icon: UserGroupIcon },
    { name: 'Profile', href: '/school-admin/profile', icon: CogIcon },
    { name: 'Billing', href: '/school-admin/billing', icon: CreditCardIcon },
    { name: 'Content', href: '/school-admin/content', icon: DocumentTextIcon },
  ]

  const navItems = user?.role === 'superadmin' ? superAdminNavItems : schoolAdminNavItems

  return (
    <div className="w-64 bg-slate-800 shadow-xl border-r border-slate-700 min-h-screen flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <AcademicCapIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-poppins">School System</h2>
            <p className="text-xs text-slate-400 font-poppins">Management Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 font-poppins ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Sidebar