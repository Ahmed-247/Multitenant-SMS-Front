import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import {
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const SchoolAdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Mock data - replace with actual API calls
  const stats = {
    totalStudents: 150,
    activeStudents: 125,
    contentDownloads: 450,
    adoptionRate: 83
  }



  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white font-poppins">School Dashboard</h1>
          <p className="text-slate-400 mt-2 font-poppins">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400 font-poppins">Total Students</p>
                <p className="text-2xl font-bold text-white font-poppins">{stats.totalStudents}</p>
                <p className="text-sm text-slate-400 font-poppins">Enrolled</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <AcademicCapIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400 font-poppins">Active Students</p>
                <p className="text-2xl font-bold text-white font-poppins">{stats.activeStudents}</p>
                <p className="text-sm text-slate-400 font-poppins">Currently active</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400 font-poppins">Content Downloads</p>
                <p className="text-2xl font-bold text-white font-poppins">{stats.contentDownloads}</p>
                <p className="text-sm text-slate-400 font-poppins">Total downloads</p>
              </div>
            </div>
          </div>
        </div>



      </div>
    </Layout>
  )
}

export default SchoolAdminDashboard