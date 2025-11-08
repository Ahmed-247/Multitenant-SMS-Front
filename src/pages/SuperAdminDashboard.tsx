import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import dashboardService, { type DashboardStats } from '../services/SuperAdmin/dashboard.service'
import { handleError } from '../utils/errorUtils'
import { formatCurrency } from '../utils/currencyUtils'

const SuperAdminDashboard: React.FC = () => {
  const [selectedSchool, setSelectedSchool] = useState<string>('all')
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch dashboard data
  const fetchDashboardData = async (schoolId: string = 'all') => {
    try {
      setLoading(true)
      setError('')
      const response = await dashboardService.getDashboardStats(schoolId)
      
      if (response.success) {
        const d: any = response.data
        const parsed: DashboardStats = {
          allowedStudents: Number(d.allowedStudents ?? 0), // From StudentLimit
          totalStudents: Number(d.totalStudents ?? 0), // From TotalStudents column
          activeStudents: Number(d.activeStudents ?? 0),
          totalRevenue: Number(d.totalRevenue ?? 0),
          averageRevenue: Number(d.averageRevenue ?? 0),
          contentDownloads: Number(d.contentDownloads ?? 0),
          sessions: Number(d.sessions ?? 0),
          duration: Number(d.duration ?? 0),
          schools: d.schools || []
        }
        setDashboardData(parsed)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Error fetching dashboard data', 'Failed to fetch dashboard data')
      )
    } finally {
      setLoading(false)
    }
  }

  // Load dashboard data on component mount and when school selection changes
  useEffect(() => {
    fetchDashboardData(selectedSchool)
  }, [selectedSchool])

  // Handle school selection change
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId)
  }


  // Calculate adoption rate: (Available seats * 100) / Total number of students in school
  const calculateAdoptionRate = () => {
    if (!dashboardData) return 0
    if (dashboardData.totalStudents === 0) return 0
    return Math.round((dashboardData.allowedStudents / dashboardData.totalStudents) * 100)
  }

  // Format duration in minutes to human-readable format
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0m'
    
    const days = Math.floor(minutes / (24 * 60))
    const hours = Math.floor((minutes % (24 * 60)) / 60)
    const mins = minutes % 60
    
    const parts: string[] = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (mins > 0 || parts.length === 0) parts.push(`${mins}m`)
    
    return parts.join(' ')
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white font-poppins">Super Admin Dashboard</h1>
          <p className="text-slate-400 mt-2 font-poppins">Overview of platform performance and school management</p>
          
          {/* School Selection Dropdown */}
          <div className="mt-4">
            <div className="relative inline-block">
              <select
                value={selectedSchool}
                onChange={(e) => handleSchoolChange(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 pr-8 text-white font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                disabled={loading}
              >
                <option value="all" className="bg-slate-800 text-white">All Schools</option>
                {dashboardData?.schools.map((school) => (
                  <option key={school.id} value={school.id} className="bg-slate-800 text-white">
                    {school.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4">
            <div className="text-sm text-red-400">{error}</div>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-300 hover:text-red-200 mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-400">Loading dashboard data...</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-cyan-600/20 rounded-xl">
                  <UserGroupIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Nombre total d’élèves (école)</p>
                  <p className="text-2xl font-bold text-white font-poppins">{dashboardData.totalStudents.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Across all schools' : 'This school'}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-600/20 rounded-xl">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Places disponible (limite actuelle)</p>
                  <p className="text-2xl font-bold text-white font-poppins">{dashboardData.allowedStudents.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Across all schools' : 'This school'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-600/20 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Nombre d'élèves actifs (Actuellement actifs)</p>
                  <p className="text-2xl font-bold text-white font-poppins">{dashboardData.activeStudents.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Across all schools' : 'This school'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-600/20 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Adoption Rate</p>
                  <p className="text-2xl font-bold text-white font-poppins">{calculateAdoptionRate()}%</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    Across all schools
                  </p>
                </div>
              </div>
            </div>

            
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-600/20 rounded-xl">
                  <DocumentArrowDownIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Content Downloads</p>
                  <p className="text-2xl font-bold text-white font-poppins">{dashboardData.contentDownloads.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Across all schools' : 'This school'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-orange-600/20 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Sessions</p>
                  <p className="text-2xl font-bold text-white font-poppins">{dashboardData.sessions.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Across all schools' : 'This school'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-pink-600/20 rounded-xl">
                  <PlayIcon className="h-6 w-6 text-pink-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Duration</p>
                  <p className="text-2xl font-bold text-white font-poppins">{formatDuration(dashboardData.duration)}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Total time' : 'This school'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Section */}
        {!loading && dashboardData && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Revenue Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-600/20 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'Total Platform Revenue' : 'School Revenue'}
                  </p>
                  <p className="text-2xl font-bold text-white font-poppins">{formatCurrency(dashboardData.totalRevenue)}</p>
                  <p className="text-sm text-slate-400 font-poppins">
                    {selectedSchool === 'all' ? 'All time' : 'This school'}
                  </p>
                </div>
              </div>
              
              {selectedSchool === 'all' && dashboardData.schools.length > 0 && (
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400 font-poppins">Average Revenue per School</p>
                    <p className="text-2xl font-bold text-white font-poppins">{formatCurrency(dashboardData.averageRevenue)}</p>
                    <p className="text-sm text-slate-400 font-poppins">Monthly average</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )} 
      </div>
    </Layout>
  )
}

export default SuperAdminDashboard
