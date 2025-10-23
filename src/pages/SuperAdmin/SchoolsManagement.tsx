import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PowerIcon
} from '@heroicons/react/24/outline'
import schoolService, { School, CreateSchoolRequest } from '../../services/SuperAdmin/school.service'

interface SchoolUI {
  id: string
  name: string
  address: string
  phone: string
  email: string
  adminName: string
  adminEmail: string
  adminPassword: string
  totalStudents: number
  activeStudents: number
  studentLimit: number
  paymentAmount: number
  planExpiryDate: string
  plan: string
  status: 'Active' | 'InActive'
  createdAt: string
}

const SchoolsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<SchoolUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Prevent body scrolling when modals are open
  useEffect(() => {
    if (showAddModal || showEditModal || showViewModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showAddModal, showEditModal, showViewModal])

  const [schools, setSchools] = useState<SchoolUI[]>([])

  // Fetch schools from API
  const fetchSchools = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await schoolService.getSchoolsWithAdmins()
      
      if (response.success) {
        // Transform API data to UI format
        const transformedSchools: SchoolUI[] = response.data.map((school: School) => ({
          id: school.SchoolId.toString(),
          name: school.SchoolName,
          address: school.SchoolAddress || '',
          phone: school.SchoolPhone || '',
          email: school.SchoolEmail || '',
          adminName: school.users?.[0]?.UserName || 'No Admin',
          adminEmail: school.users?.[0]?.Email || '',
          adminPassword: '', // Not returned from API for security
          totalStudents: 0, // Mock data - would need separate API
          activeStudents: 0, // Mock data - would need separate API
          studentLimit: school.StudentLimit || 0,
          paymentAmount: school.PaymentAmount || 0,
          planExpiryDate: school.PlanExpiryDate || '',
          plan: 'Standard', // Mock data - would need separate API
          status: school.SchoolStatus ? 'Active' : 'InActive',
          createdAt: new Date().toISOString().split('T')[0] // Mock data
        }))
        setSchools(transformedSchools)
      } else {
        setError('Failed to fetch schools')
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
      setError('Failed to fetch schools')
    } finally {
      setLoading(false)
    }
  }

  // Load schools on component mount
  useEffect(() => {
    fetchSchools()
  }, [])

  const filteredSchools = schools.filter(school =>
    (school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || school.status === selectedStatus)
  )

  const handleEditSchool = (school: SchoolUI) => {
    setSelectedSchool(school)
    setShowEditModal(true)
  }

  const handleViewSchool = async (school: SchoolUI) => {
    try {
      setLoading(true)
      const response = await schoolService.getSchoolById(parseInt(school.id))
      
      if (response.success) {
        // Transform API data to UI format for viewing
        const schoolData: SchoolUI = {
          id: response.data.SchoolId.toString(),
          name: response.data.SchoolName,
          address: response.data.SchoolAddress || '',
          phone: response.data.SchoolPhone || '',
          email: response.data.SchoolEmail || '',
          adminName: response.data.users?.[0]?.UserName || 'No Admin',
          adminEmail: response.data.users?.[0]?.Email || '',
          adminPassword: '', // Not returned from API for security
          totalStudents: 0, // Mock data - would need separate API
          activeStudents: 0, // Mock data - would need separate API
          studentLimit: response.data.StudentLimit || 0,
          paymentAmount: response.data.PaymentAmount || 0,
          planExpiryDate: response.data.PlanExpiryDate || '',
          plan: 'Standard', // Mock data - would need separate API
          status: 'Active' as const, // Mock data - would need separate API
          createdAt: new Date().toISOString().split('T')[0] // Mock data
        }
        setSelectedSchool(schoolData)
        setShowViewModal(true)
      } else {
        setError('Failed to fetch school details')
      }
    } catch (error) {
      console.error('Error fetching school details:', error)
      setError('Failed to fetch school details')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSchool = async (schoolId: string) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        setLoading(true)
        const response = await schoolService.deleteSchool(parseInt(schoolId))
        
        if (response.success) {
          setSchools(schools.filter(school => school.id !== schoolId))
        } else {
          setError('Failed to delete school')
        }
      } catch (error) {
        console.error('Error deleting school:', error)
        setError('Failed to delete school')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleStatus = async (schoolId: string) => {
    try {
      setLoading(true)
      const response = await schoolService.toggleSchoolStatus(parseInt(schoolId))
      
      if (response.success) {
        // Update the school status in the local state
        setSchools(schools.map(school => 
          school.id === schoolId 
            ? { ...school, status: response.data.schoolStatus ? 'Active' : 'InActive' }
            : school
        ))
      } else {
        setError('Failed to toggle school status')
      }
    } catch (error) {
      console.error('Error toggling school status:', error)
      setError('Failed to toggle school status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/30 text-green-400 border border-green-500/30'
      case 'InActive':
        return 'bg-red-900/30 text-red-400 border border-red-500/30'
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Schools Management</h1>
            <p className="text-slate-400 mt-2 font-poppins">Manage all schools and their administrators</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add School</span>
          </button>
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

        {/* Search and Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search schools by name, admin, or email..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="input-field w-48"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="InActive">InActive</option>
            </select>
          </div>
        </div>

        {/* Schools Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-400">Loading schools...</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Administrator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Plan Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">{school.name}</div>
                        <div className="text-sm text-slate-400 font-poppins">{school.email}</div>
                        <div className="text-sm text-slate-400 font-poppins">{school.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">{school.adminName}</div>
                        <div className="text-sm text-slate-400 font-poppins">{school.adminEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">
                          ${school.paymentAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-400 font-poppins">
                          Student Limit: {school.studentLimit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-poppins">
                        {school.planExpiryDate ? new Date(school.planExpiryDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(school.status)}`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSchool(school)}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                          title="Edit School"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewSchool(school)}
                          className="text-green-400 hover:text-green-300 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(school.id)}
                          className={`${school.status === 'Active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-blue-400 hover:text-blue-300'} transition-colors duration-200`}
                          title={school.status === 'Active' ? 'Deactivate School' : 'Activate School'}
                        >
                          <PowerIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(school.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Delete School"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add School Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Add New School</h3>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSubmitting(true)
                    
                    try {
                      const formData = new FormData(e.target as HTMLFormElement)
                      const schoolData: CreateSchoolRequest = {
                        SchoolName: formData.get('name') as string,
                        SchoolAddress: formData.get('address') as string,
                        SchoolPhone: formData.get('phone') as string,
                        SchoolEmail: formData.get('email') as string,
                        AdminName: formData.get('adminName') as string,
                        AdminEmail: formData.get('adminEmail') as string,
                        AdminPassword: formData.get('adminPassword') as string,
                        StudentLimit: parseInt(formData.get('studentLimit') as string),
                        PaymentAmount: parseFloat(formData.get('paymentAmount') as string) || undefined,
                        PlanExpiryDate: formData.get('planExpiryDate') as string || undefined
                      }

                      const response = await schoolService.createSchoolWithAdmin(schoolData)
                      
                      if (response.success) {
                        // Refresh the schools list
                        await fetchSchools()
                        setShowAddModal(false)
                        // Reset form
                        ;(e.target as HTMLFormElement).reset()
                      } else {
                        setError('Failed to create school')
                      }
                    } catch (error) {
                      console.error('Error creating school:', error)
                      setError('Failed to create school')
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">School Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="Enter school name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Address</label>
                    <textarea
                      name="address"
                      className="input-field h-20 resize-none"
                      placeholder="Enter school address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="input-field"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="input-field"
                        placeholder="Enter school email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Admin Name</label>
                    <input
                      type="text"
                      name="adminName"
                      className="input-field"
                      placeholder="Enter admin name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Admin Email</label>
                    <input
                      type="email"
                      name="adminEmail"
                      className="input-field"
                      placeholder="Enter admin email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Admin Password</label>
                    <input
                      type="password"
                      name="adminPassword"
                      className="input-field"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Total Student Per School Limit</label>
                    <input
                      type="number"
                      name="studentLimit"
                      className="input-field"
                      placeholder="Enter student limit"
                      min="1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Payment Amount</label>
                      <input
                        type="number"
                        name="paymentAmount"
                        className="input-field"
                        placeholder="Enter payment amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Plan Expiry Date</label>
                      <input
                        type="date"
                        name="planExpiryDate"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn-secondary"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Add School'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit School Modal */}
        {showEditModal && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Edit School</h3>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSubmitting(true)
                    
                    try {
                      const formData = new FormData(e.target as HTMLFormElement)
                      const schoolData = {
                        SchoolName: formData.get('name') as string,
                        SchoolAddress: formData.get('address') as string,
                        SchoolPhone: formData.get('phone') as string,
                        SchoolEmail: formData.get('email') as string,
                        StudentLimit: parseInt(formData.get('studentLimit') as string),
                        PaymentAmount: parseFloat(formData.get('paymentAmount') as string) || undefined,
                        PlanExpiryDate: formData.get('planExpiryDate') as string || undefined
                      }

                      const response = await schoolService.updateSchool(parseInt(selectedSchool.id), schoolData)
                      
                      if (response.success) {
                        // Refresh the schools list
                        await fetchSchools()
                        setShowEditModal(false)
                        setSelectedSchool(null)
                      } else {
                        setError('Failed to update school')
                      }
                    } catch (error) {
                      console.error('Error updating school:', error)
                      setError('Failed to update school')
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">School Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="Enter school name"
                      defaultValue={selectedSchool.name}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Address</label>
                    <textarea
                      name="address"
                      className="input-field h-20 resize-none"
                      placeholder="Enter school address"
                      defaultValue={selectedSchool.address}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="input-field"
                        placeholder="Enter phone number"
                        defaultValue={selectedSchool.phone}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="input-field"
                        placeholder="Enter school email"
                        defaultValue={selectedSchool.email}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Total Student Per School Limit</label>
                    <input
                      type="number"
                      name="studentLimit"
                      className="input-field"
                      placeholder="Enter student limit"
                      defaultValue={selectedSchool.studentLimit}
                      min="1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Payment Amount</label>
                      <input
                        type="number"
                        name="paymentAmount"
                        className="input-field"
                        placeholder="Enter payment amount"
                        defaultValue={selectedSchool.paymentAmount}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Plan Expiry Date</label>
                      <input
                        type="date"
                        name="planExpiryDate"
                        className="input-field"
                        defaultValue={selectedSchool.planExpiryDate ? new Date(selectedSchool.planExpiryDate).toISOString().split('T')[0] : ''}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedSchool(null)
                      }}
                      className="btn-secondary"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Update School'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View School Modal */}
        {showViewModal && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white font-poppins">School Details</h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedSchool(null)
                    }}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* School Information */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">School Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">School Name</label>
                        <p className="text-white font-poppins">{selectedSchool.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Email</label>
                        <p className="text-white font-poppins">{selectedSchool.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Phone</label>
                        <p className="text-white font-poppins">{selectedSchool.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Student Limit</label>
                        <p className="text-white font-poppins">{selectedSchool.studentLimit}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Payment Amount</label>
                        <p className="text-white font-poppins">${selectedSchool.paymentAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Plan Expiry Date</label>
                        <p className="text-white font-poppins">
                          {selectedSchool.planExpiryDate ? new Date(selectedSchool.planExpiryDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Address</label>
                        <p className="text-white font-poppins">{selectedSchool.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Administrator Information */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">Administrator Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Admin Name</label>
                        <p className="text-white font-poppins">{selectedSchool.adminName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Admin Email</label>
                        <p className="text-white font-poppins">{selectedSchool.adminEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  {/* <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">Statistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Total Students</label>
                        <p className="text-white font-poppins">{selectedSchool.totalStudents}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Active Students</label>
                        <p className="text-white font-poppins">{selectedSchool.activeStudents}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Plan</label>
                        <p className="text-white font-poppins">{selectedSchool.plan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  {/* <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">Status</h4>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedSchool.status)}`}>
                        {selectedSchool.status}
                      </span>
                      <span className="text-slate-400 text-sm font-poppins">
                        Created: {selectedSchool.createdAt}
                      </span>
                    </div>
                  </div> */}
                </div> 

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedSchool(null)
                    }}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      handleEditSchool(selectedSchool)
                    }}
                    className="btn-primary"
                  >
                    Edit School
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SchoolsManagement