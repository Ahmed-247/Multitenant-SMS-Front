import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import studentService, { type Student } from '../../services/schoolAdmin/student.service'
import { getToken, parseJwt } from '../../utils/tokenUtils'
import { handleError } from '../../utils/errorUtils'

// UI interface for display purposes
interface StudentUI {
  id: string
  studentId: string
  firstName: string
  lastName: string
  grade: string
  email: string
  phone: string
  password: string
  parentName: string
  parentPhone: string
  status: 'Active' | 'Inactive' | 'Suspended'
  lastLogin: string
  totalDownloads: number
  createdAt: string
}

const StudentsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentUI | null>(null)
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

  const [students, setStudents] = useState<StudentUI[]>([])
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0)
  const [totalStudentsFromSchool, setTotalStudentsFromSchool] = useState<number>(0) // TotalStudents from school

  // Transform API student data to UI format
  const transformStudentToUI = (student: Student): StudentUI => ({
    id: student.StId.toString(),
    studentId: student.StudentId,
    firstName: student.FirstName,
    lastName: student.LastName,
    grade: student.Grade || 'Not assigned',
    email: student.StudentEmail,
    phone: student.StudentPhoneNo || 'Not provided',
    password: '', // Not returned from API for security
    parentName: student.ParentName || 'Not provided',
    parentPhone: student.ParentPhoneNo || 'Not provided',
    // Map boolean StudentStatus from API to UI strings
    status: student.StudentStatus === true ? 'Active' : (student.StudentStatus === false ? 'Inactive' : 'Inactive'),
    lastLogin: new Date().toISOString().split('T')[0], // Mock data
    totalDownloads: 0, // Mock data - would need separate API
    createdAt: new Date().toISOString().split('T')[0] // Mock data
  })

  // Resolve SchoolId from JWT token (handles different casings)
  const getSchoolIdFromToken = (): number | null => {
    const token = getToken() as string | null
    if (!token) return null
    const decoded = parseJwt(token) as Record<string, any>
    const possibleKeys = ['schoolId', 'SchoolId', 'schoolID', 'SchoolID']
    for (const key of possibleKeys) {
      if (decoded && decoded[key] !== undefined && decoded[key] !== null) {
        const n = Number(decoded[key])
        return isNaN(n) ? null : n
      }
    }
    return null
  }

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const schoolId = getSchoolIdFromToken()
      const response = schoolId
        ? await studentService.getStudentsBySchool(schoolId)
        : await studentService.getAllStudents()
      
      if (response.success) {
        const transformedStudents = response.data.map(transformStudentToUI)
        setStudents(transformedStudents)
        const respAny: any = response
        const possibleCount =
          respAny?.count ??
          respAny?.data?.count ??
          respAny?.data?.total ??
          transformedStudents.length
        setTotalStudentsCount(Number(possibleCount) || 0)
        
        // Extract TotalStudents from API response
        const totalStudents = respAny?.totalStudents ?? respAny?.data?.totalStudents ?? 0
        setTotalStudentsFromSchool(Number(totalStudents) || 0)
      } else {
        setError('Failed to fetch students')
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Error fetching students', 'Failed to fetch students')
      )
    } finally {
      setLoading(false)
    }
  }

  // Load students on component mount
  useEffect(() => {
    fetchStudents()
  }, [])

  const grades = ['6ème Année', '10ème Année', 'TSE', 'TSM', 'TSS']

  const filteredStudents = students.filter(student =>
    (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedGrade === '' || student.grade === selectedGrade) &&
    (selectedStatus === '' || student.status === selectedStatus)
  )

  const activeStudents = students.filter(s => s.status === 'Active').length
  const totalStudents = totalStudentsCount

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/30 text-green-400 border border-green-500/30'
      case 'Inactive':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
      case 'Suspended':
        return 'bg-red-900/30 text-red-400 border border-red-500/30'
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600'
    }
  }

  const handleEditStudent = (student: StudentUI) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const handleViewStudent = async (student: StudentUI) => {
    try {
      setLoading(true)
      const response = await studentService.getStudentById(parseInt(student.id))
      
      if (response.success) {
        const studentData = transformStudentToUI(response.data)
        setSelectedStudent(studentData)
        setShowViewModal(true)
      } else {
        setError('Failed to fetch student details')
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Error fetching student details', 'Failed to fetch student details')
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      try {
        setLoading(true)
        const response = await studentService.deleteStudent(parseInt(studentId))
        
        if (response.success) {
          setStudents(students.filter(student => student.id !== studentId))
        } else {
          setError('Failed to delete student')
        }
      } catch (error: any) {
        setError(
          handleError(error, 'Error deleting student', 'Failed to delete student')
        )
      } finally {
        setLoading(false)
      }
    }
  }

  

  // const generateStudentId = () => {
  //   const lastId = students.length > 0 ? parseInt(students[students.length - 1].studentId.replace('STU', '')) : 0
  //   return `STU${String(lastId + 1).padStart(3, '0')}`
  // }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Gestion des Élèves</h1>
            <p className="text-slate-400 mt-2 font-poppins">Gérez l'inscription et l'accès des Élèves</p>
          </div>
          <button
            onClick={() => {
              console.log('Add Student button clicked')
              setShowAddModal(true)
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter un Élèves </span>
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
              Ignorer
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-400">Chargement des Élèves...</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-600/20 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400 font-poppins">Nombre total d’élèves (école)</p>
                <p className="text-2xl font-bold text-white font-poppins">{totalStudentsFromSchool}</p>
                <p className="text-xs text-slate-500 font-poppins"></p>
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
                <p className="text-2xl font-bold text-white font-poppins">{totalStudents}</p>
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
                <p className="text-2xl font-bold text-white font-poppins">{activeStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              {/* <div className="p-3 bg-purple-600/20 rounded-xl">
                <KeyIcon className="h-6 w-6 text-purple-400" />
              </div> */}
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400 font-poppins">Taux d'Adoption</p>
                <p className="text-2xl font-bold text-white font-poppins">
                  {totalStudentsFromSchool > 0 ? Math.round((totalStudentsCount * 100) / totalStudentsFromSchool) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par Nom, No. identifiant, ou Email ..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="input-field w-48"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">Toutes les classes</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <select
              className="input-field w-48"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Statut</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
             
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Classe et No. de téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Parents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-slate-400">ID : {student.studentId}</div>
                        <div className="text-sm text-slate-400">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-white">{student.grade}</div>
                        <div className="text-sm text-slate-400">{student.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-white">{student.parentName}</div>
                        <div className="text-sm text-slate-400">{student.parentPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                          title="Modifier l'élève"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="text-green-400 hover:text-green-300 transition-colors duration-200"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Supprimer l'élève"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Ajouter un élève</h3>
                <form 
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSubmitting(true)
                    
                    try {
                      const formData = new FormData(e.target as HTMLFormElement)
                    const tokenSchoolId = getSchoolIdFromToken()
                    const studentData = {
                        FirstName: formData.get('firstName') as string,
                        LastName: formData.get('lastName') as string,
                        StudentId: formData.get('studentId') as string,
                        Grade: formData.get('grade') as string,
                        StudentEmail: formData.get('email') as string,
                        StudentPhoneNo: formData.get('phone') as string,
                        ParentName: formData.get('parentName') as string,
                        ParentPhoneNo: formData.get('parentPhone') as string,
                        StudentPassword: formData.get('password') as string,
                      SchoolId: tokenSchoolId ?? 1 // fallback if token missing
                      }
                      
                      const response = await studentService.createStudent(studentData)
                      
                      if (response.success) {
                        // Refresh the students list
                        await fetchStudents()
                        setShowAddModal(false)
                        // Reset form
                        ;(e.target as HTMLFormElement).reset()
                      } else {
                        setError('Failed to create student')
                      }
                    } catch (error: any) {
                      setError(
                        handleError(error, 'Error creating student', 'Failed to create student')
                      )
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Prénom (s)</label>
                      <input 
                        type="text" 
                        name="firstName"
                        className="input-field" 
                        placeholder="Entrer le prénom" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nom</label>
                      <input 
                        type="text" 
                        name="lastName"
                        className="input-field" 
                        placeholder="Entrer le nom" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">No. Identifiant</label>
                    <input 
                      type="text" 
                      name="studentId"
                      className="input-field" 
                      placeholder="Entrer l'ID de l'élève"
                      // defaultValue={}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Classe</label>
                    <select name="grade" className="input-field" required>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="input-field" 
                      placeholder="Entrer l'email de l'élève" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
                    <input 
                      type="password" 
                      name="password"
                      className="input-field" 
                      placeholder="Entrer le mot de passe de l'élève" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Numéro de tel.</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="input-field" 
                      placeholder="Entrer le numéro de téléphone" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nom du parent</label>
                    <input 
                      type="text" 
                      name="parentName"
                      className="input-field" 
                      placeholder="Entrer le nom du parent" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Contact du parent</label>
                    <input 
                      type="tel" 
                      name="parentPhone"
                      className="input-field" 
                      placeholder="Entrer le téléphone du parent" 
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Création...</span>
                        </div>
                      ) : (
                        'Ajouter un élève'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Modifier un élève</h3>
                <form 
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSubmitting(true)
                    
                    try {
                      const formData = new FormData(e.target as HTMLFormElement)
                      const studentData = {
                        FirstName: formData.get('firstName') as string,
                        LastName: formData.get('lastName') as string,
                        StudentId: formData.get('studentId') as string,
                        Grade: formData.get('grade') as string,
                        StudentEmail: formData.get('email') as string,
                        StudentPhoneNo: formData.get('phone') as string,
                        ParentName: formData.get('parentName') as string,
                        ParentPhoneNo: formData.get('parentPhone') as string,
                        StudentPassword: formData.get('password') as string || undefined
                      }
                      
                      const response = await studentService.updateStudent(parseInt(selectedStudent.id), studentData)
                      
                      if (response.success) {
                        // Refresh the students list
                        await fetchStudents()
                        setShowEditModal(false)
                        setSelectedStudent(null)
                      } else {
                        setError('Failed to update student')
                      }
                    } catch (error: any) {
                      setError(
                        handleError(error, 'Error updating student', 'Failed to update student')
                      )
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Prénom (s)</label>
                      <input 
                        type="text" 
                        name="firstName"
                        className="input-field" 
                        placeholder="Entrer le prénom" 
                        defaultValue={selectedStudent.firstName}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nom</label>
                      <input 
                        type="text" 
                        name="lastName"
                        className="input-field" 
                        placeholder="Entrer le nom" 
                        defaultValue={selectedStudent.lastName}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">No. Identifiant</label>
                      <input 
                        type="text" 
                        name="studentId"
                        className="input-field" 
                        placeholder="Entrer l'ID de l'élève" 
                        defaultValue={selectedStudent.studentId}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Classe</label>
                      <select name="grade" className="input-field" defaultValue={selectedStudent.grade}>
                        <option value="">Sélectionner la classe</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="input-field" 
                      placeholder="Entrer l'adresse email" 
                      defaultValue={selectedStudent.email}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Numéro de tel.</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="input-field" 
                      placeholder="Entrer le numéro de téléphone" 
                      defaultValue={selectedStudent.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nom du parent</label>
                    <input 
                      type="text" 
                      name="parentName"
                      className="input-field" 
                      placeholder="Entrer le nom du parent" 
                      defaultValue={selectedStudent.parentName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Contact du parent</label>
                    <input 
                      type="tel" 
                      name="parentPhone"
                      className="input-field" 
                      placeholder="Entrer le téléphone du parent" 
                      defaultValue={selectedStudent.parentPhone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nouveau mot de passe (Optionnel)</label>
                    <input 
                      type="password" 
                      name="password"
                      className="input-field" 
                      placeholder="Laisser vide pour garder le mot de passe actuel" 
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedStudent(null)
                      }}
                      className="btn-secondary"
                      disabled={submitting}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Mise à jour...</span>
                        </div>
                      ) : (
                        'Modifier l\'élève'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Student Modal */}
        {showViewModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white font-poppins">Détails de l'élève</h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedStudent(null)
                    }}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Student Information */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">Informations de l'élève</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Prénom (s)</label>
                        <p className="text-white font-poppins">{selectedStudent.firstName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Nom</label>
                        <p className="text-white font-poppins">{selectedStudent.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">No. Identifiant</label>
                        <p className="text-white font-poppins">{selectedStudent.studentId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Classe</label>
                        <p className="text-white font-poppins">{selectedStudent.grade}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Email</label>
                        <p className="text-white font-poppins">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Numéro de tel.</label>
                        <p className="text-white font-poppins">{selectedStudent.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">Informations du parent</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Nom du parent</label>
                        <p className="text-white font-poppins">{selectedStudent.parentName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Contact du parent</label>
                        <p className="text-white font-poppins">{selectedStudent.parentPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins">Statut de l'élève</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Statut</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedStudent.status)}`}>
                          {selectedStudent.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Dernière connexion</label>
                        <p className="text-white font-poppins">{selectedStudent.lastLogin}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 font-poppins">Total téléchargements</label>
                        <p className="text-white font-poppins">{selectedStudent.totalDownloads}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedStudent(null)
                    }}
                    className="btn-secondary"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      handleEditStudent(selectedStudent)
                    }}
                    className="btn-primary"
                  >
                    Modifier l'élève
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

export default StudentsManagement