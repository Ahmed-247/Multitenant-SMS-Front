import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import {
  UserGroupIcon,
  AcademicCapIcon,ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import schoolAdminDashboardService, { type SchoolAdminStats } from '../services/schoolAdmin/dashboard.service'
import { getToken, parseJwt } from '../utils/tokenUtils'
import { handleError } from '../utils/errorUtils'

const SchoolAdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<SchoolAdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const getSchoolIdFromToken = (): number | null => {
    const token = getToken() as string | null
    if (!token) return null
    const decoded = parseJwt(token) as Record<string, any>
    const possible = ['schoolId', 'SchoolId', 'schoolID', 'SchoolID']
    for (const key of possible) {
      if (decoded && decoded[key] !== undefined && decoded[key] !== null) {
        const n = Number(decoded[key])
        return isNaN(n) ? null : n
      }
    }
    return null
  }

  // Fetch school admin statistics
  const fetchStats = async () => {
    try {
      setLoading(true)
      setError('')
      const schoolId = getSchoolIdFromToken()
      const response = schoolId !== null
        ? await schoolAdminDashboardService.getStudentStatsBySchool(schoolId)
        : await schoolAdminDashboardService.getSchoolAdminStats()
      
      if (response.success) {
        const d: any = response.data
        const school = d.school || {}

        let adoptionRate = 0
        if (school && school?.totalStudents > 0){
           adoptionRate = Math.round((school?.allowedStudents / school?.totalStudents) * 100)
        }

        const parsed: SchoolAdminStats = {
          allowedStudents: Number(school.allowedStudents ?? 0), // From StudentLimit
          totalStudents: Number(school.totalStudents ?? 0), // From TotalStudents
          activeStudents: Number(d.activeStudents ?? 0),
          inactiveStudents: Number(d.inactiveStudents ?? 0),
          contentDownloads: Number(school.contentDownloads ?? 0),
          sessions: Number(school.sessions ?? 0),
          duration: Number(school.duration ?? 0),
          adoptionRate: Number(adoptionRate ?? 0),
        }
        setStats(parsed)
      } else {
        setError('Failed to fetch statistics')
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Error fetching statistics', 'Failed to fetch statistics')
      )
    } finally {
      setLoading(false)
    }
  }

  // Load stats on component mount
  useEffect(() => {
    fetchStats()
  }, [])

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
          <h1 className="text-3xl font-bold text-white font-poppins">Tableau de Bord de l'École</h1>
          <p className="text-slate-400 mt-2 font-poppins">Bienvenue, {user?.name}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4">
            <div className="text-sm text-red-400">{error}</div>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-300 hover:text-red-200 mt-1"
            >
              Ignorer
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-400">Chargement des statistiques...</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-cyan-600/20 rounded-xl">
                  <UserGroupIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Nombre total d’élèves (école)</p>
                  <p className="text-2xl font-bold text-white font-poppins">{stats.totalStudents.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">Depuis le profil de l'école</p>
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
                  <p className="text-2xl font-bold text-white font-poppins">{stats.allowedStudents.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">Limite actuelle</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-600/20 rounded-xl">
                  <AcademicCapIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Nombre d'élèves actifs (Actuellement actifs)</p>
                  <p className="text-2xl font-bold text-white font-poppins">{stats.activeStudents.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">Actuellement actifs</p>
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
                  <p className="text-2xl font-bold text-white font-poppins">{stats.adoptionRate?.toLocaleString()}%</p>
                  
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-600/20 rounded-xl">
                  <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400 font-poppins">Téléchargements de Contenu</p>
                  <p className="text-2xl font-bold text-white font-poppins">{Number(stats.contentDownloads ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">Total des téléchargements</p>
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
                  <p className="text-2xl font-bold text-white font-poppins">{(stats.sessions ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-400 font-poppins">Total des sessions</p>
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
                  <p className="text-2xl font-bold text-white font-poppins">{formatDuration(stats.duration ?? 0)}</p>
                  <p className="text-sm text-slate-400 font-poppins">Temps total</p>
                </div>
              </div>
            </div>
          </div>
        )}



      </div>
    </Layout>
  )
}

export default SchoolAdminDashboard