import React, { useState } from 'react'
import Layout from '../../components/Layout'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface ContentItem {
  id: string
  title: string
  type: 'Document' | 'Video' | 'Image' | 'Audio'
  section: string
  grade: string
  subject: string
  size: string
  uploadDate: string
  status: 'Uploaded' | 'Processing' | 'Available' | 'Error'
  downloads: number
  assignedSchools: string[]
}

const SchoolContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  // Mock data - replace with actual API calls
  const [content] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'French 6th Year - Basic Grammar',
      type: 'Document',
      section: 'Primary',
      grade: '6th Year',
      subject: 'French',
      size: '2.5 MB',
      uploadDate: '2024-10-01',
      status: 'Available',
      downloads: 45,
      assignedSchools: ['Greenwood High', 'Sunshine Elementary']
    },
    {
      id: '2',
      title: 'Written Calculation 6th Year - Addition and Subtraction',
      type: 'Video',
      section: 'Primary',
      grade: '6th Year',
      subject: 'Written Calculation',
      size: '15.2 MB',
      uploadDate: '2024-10-02',
      status: 'Available',
      downloads: 32,
      assignedSchools: ['Greenwood High', 'Riverside Academy']
    },
    {
      id: '3',
      title: 'Mathematics 10th Year - Algebra Basics',
      type: 'Document',
      section: 'Middle School',
      grade: '10th Year',
      subject: 'Mathematics',
      size: '1.8 MB',
      uploadDate: '2024-10-03',
      status: 'Processing',
      downloads: 0,
      assignedSchools: []
    },
    {
      id: '4',
      title: 'Physics TSE - Mechanics and Motion',
      type: 'Video',
      section: 'High School',
      grade: 'TSE',
      subject: 'Physics',
      size: '25.3 MB',
      uploadDate: '2024-10-04',
      status: 'Available',
      downloads: 18,
      assignedSchools: ['Technical High School']
    },
    {
      id: '5',
      title: 'Economics TSM - Market Principles',
      type: 'Document',
      section: 'High School',
      grade: 'TSM',
      subject: 'Economics',
      size: '3.2 MB',
      uploadDate: '2024-10-05',
      status: 'Available',
      downloads: 12,
      assignedSchools: ['Business Academy']
    },
    {
      id: '6',
      title: 'History TSS - World Wars',
      type: 'Document',
      section: 'High School',
      grade: 'TSS',
      subject: 'History',
      size: '4.1 MB',
      uploadDate: '2024-10-06',
      status: 'Available',
      downloads: 8,
      assignedSchools: ['Social Sciences High']
    }
  ])

  // Educational structure based on the provided image
  const sections = [
    { value: 'Primary', label: 'Primary' },
    { value: 'Middle School', label: 'Middle School' },
    { value: 'High School', label: 'High School' }
  ]

  // Grades based on sections
  const getGradesForSection = (section: string) => {
    switch (section) {
      case 'Primary':
        return [
          { value: '6th Year', label: '6th Year' }
        ]
      case 'Middle School':
        return [
          { value: '10th Year', label: '10th Year' }
        ]
      case 'High School':
        return [
          { value: 'TSE', label: 'TSE (Technical Sciences and Engineering)' },
          { value: 'TSM', label: 'TSM (Technical Sciences and Management)' },
          { value: 'TSS', label: 'TSS (Technical Sciences and Social Sciences)' }
        ]
      default:
        return []
    }
  }

  // Subjects based on sections and grades
  const getSubjectsForSectionAndGrade = (section: string, grade: string) => {
    if (section === 'Primary' && grade === '6th Year') {
      return [
        'French',
        'Written Calculation',
        'Observational Sciences',
        'History',
        'Geography',
        'ECM (Civic and Moral Education)'
      ]
    }
    
    if (section === 'Middle School' && grade === '10th Year') {
      return [
        'Mathematics',
        'Physics',
        'Chemistry',
        'History',
        'Geography',
        'Biology',
        'French',
        'ECM (Civic and Moral Education)'
      ]
    }
    
    if (section === 'High School') {
      const commonSubjects = [
        'Mathematics',
        'Philosophy',
        'French',
        'English'
      ]
      
      switch (grade) {
        case 'TSE':
          return [
            ...commonSubjects,
            'Physics',
            'Chemistry',
            'Biology',
            'Geology'
          ]
        case 'TSM':
          return [
            ...commonSubjects,
            'Economics',
            'Physics',
            'Chemistry'
          ]
        case 'TSS':
          return [
            ...commonSubjects,
            'Economics',
            'History',
            'Geography'
          ]
        default:
          return commonSubjects
      }
    }
    
    return []
  }

  // Get available grades for current section
  const availableGrades = getGradesForSection(selectedSection)
  
  // Get available subjects for current section and grade
  const availableSubjects = getSubjectsForSectionAndGrade(selectedSection, selectedGrade)

  // Handle section change - reset grade and subject
  const handleSectionChange = (section: string) => {
    setSelectedSection(section)
    setSelectedGrade('')
    setSelectedSubject('')
  }

  // Handle grade change - reset subject
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade)
    setSelectedSubject('')
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedSection('')
    setSelectedGrade('')
    setSelectedSubject('')
    setSearchTerm('')
  }

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSection === '' || item.section === selectedSection) &&
    (selectedGrade === '' || item.grade === selectedGrade) &&
    (selectedSubject === '' || item.subject === selectedSubject)
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Document':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />
      case 'Video':
        return <VideoCameraIcon className="h-5 w-5 text-red-600" />
      case 'Image':
        return <PhotoIcon className="h-5 w-5 text-green-600" />
      case 'Audio':
        return <div className="h-5 w-5 bg-purple-600 rounded"></div>
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Content Library</h1>
          <p className="text-slate-400 mt-2 font-poppins">Access educational content assigned to your school</p>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search content..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="input-field" 
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value)}
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section.value} value={section.value}>{section.label}</option>
              ))}
            </select>
            <select 
              className="input-field" 
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              disabled={!selectedSection}
            >
              <option value="">All Grades</option>
              {availableGrades.map(grade => (
                <option key={grade.value} value={grade.value}>{grade.label}</option>
              ))}
            </select>
            <select 
              className="input-field" 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedGrade}
            >
              <option value="">All Subjects</option>
              {availableSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <button 
              className="btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Content Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Subject
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
          {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white font-poppins">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                  {getTypeIcon(item.type)}
                        <span className="ml-2 text-sm text-slate-300 font-poppins">{item.type}</span>
                  </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-poppins">{item.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-poppins">{item.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-poppins">{item.subject}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
      </div>
    </Layout>
  )
}

export default SchoolContent