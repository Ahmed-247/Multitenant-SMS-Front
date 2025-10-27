import React, { useState } from 'react'
import Layout from '../../components/Layout'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  // VideoCameraIcon
} from '@heroicons/react/24/outline'

interface ContentItem {
  id: string
  title: string
  type: 'Audio' | 'Video' | 'PDF' | 'Quiz' | 'Repository'
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
  const [activeTab, setActiveTab] = useState<'content' | 'pdf'>('content')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  // Hardcoded data based on the table structure
  const [content] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Primaire - 6ème Année',
      type: 'PDF',
      section: 'Primaire',
      grade: '6ème Année',
      subject: 'Français, Calcul écrit, Sciences d\'observations, Histoire, Géographie, ECM',
      size: 'Various',
      uploadDate: '2024-10-01',
      status: 'Available',
      downloads: 0,
      assignedSchools: []
    },
    {
      id: '2',
      title: 'Collège - 10ème Année',
      type: 'PDF',
      section: 'Collège',
      grade: '10ème Année',
      subject: 'Mathématiques, Physique, Chimie, Histoire, Géographie, Biologie, Français, ECM',
      size: 'Various',
      uploadDate: '2024-10-02',
      status: 'Available',
      downloads: 0,
      assignedSchools: []
    },
    {
      id: '3',
      title: 'Lycée - TSE',
      type: 'PDF',
      section: 'Lycée',
      grade: 'TSE',
      subject: 'Mathématiques, Philosophie, Français, Anglais, Physique, Chimie, Biologie, Géologie',
      size: 'Various',
      uploadDate: '2024-10-03',
      status: 'Available',
      downloads: 0,
      assignedSchools: []
    },
    {
      id: '4',
      title: 'Lycée - TSM',
      type: 'PDF',
      section: 'Lycée',
      grade: 'TSM',
      subject: 'Mathématiques, Philosophie, Français, Anglais, Économie, Physique, Chimie',
      size: 'Various',
      uploadDate: '2024-10-04',
      status: 'Available',
      downloads: 0,
      assignedSchools: []
    },
    {
      id: '5',
      title: 'Lycée - TSS',
      type: 'PDF',
      section: 'Lycée',
      grade: 'TSS',
      subject: 'Mathématiques, Philosophie, Français, Anglais, Économie, Histoire, Géographie',
      size: 'Various',
      uploadDate: '2024-10-05',
      status: 'Available',
      downloads: 0,
      assignedSchools: []
    }
  ])

  // Structure éducative française basée sur l'image
  const sections = [
    { value: 'Primaire', label: 'Primaire' },
    { value: 'Collège', label: 'Collège' },
    { value: 'Lycée', label: 'Lycée' }
  ]

  // Grades based on sections
  const getGradesForSection = (section: string) => {
    switch (section) {
      case 'Primaire':
        return [
          { value: '6ème Année', label: '6ème Année' }
        ]
      case 'Collège':
        return [
          { value: '10ème Année', label: '10ème Année' }
        ]
      case 'Lycée':
        return [
          { value: 'TSE', label: 'TSE' },
          { value: 'TSM', label: 'TSM' },
          { value: 'TSS', label: 'TSS' }
        ]
      default:
        return []
    }
  }

  // Matières basées sur les sections et niveaux
  const getSubjectsForSectionAndGrade = (section: string, grade: string) => {
    if (section === 'Primaire' && grade === '6ème Année') {
      return [
        'Français',
        'Calcul écrit',
        'Sciences d\'observations',
        'Histoire',
        'Géographie',
        'ECM'
      ]
    }
    
    if (section === 'Collège' && grade === '10ème Année') {
      return [
        'Mathématiques',
        'Physique',
        'Chimie',
        'Histoire',
        'Géographie',
        'Biologie',
        'Français',
        'ECM'
      ]
    }
    
    if (section === 'Lycée') {
      const commonSubjects = [
        'Mathématiques',
        'Philosophie',
        'Français',
        'Anglais'
      ]
      
      switch (grade) {
        case 'TSE':
          return [
            ...commonSubjects,
            'Physique',
            'Chimie',
            'Biologie',
            'Géologie'
          ]
        case 'TSM':
          return [
            ...commonSubjects,
            'Économie',
            'Physique',
            'Chimie'
          ]
        case 'TSS':
          return [
            ...commonSubjects,
            'Économie',
            'Histoire',
            'Géographie'
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

  // const getTypeIcon = (type: string) => {
  //   switch (type) {
  //     case 'PDF':
  //       return <DocumentTextIcon className="h-5 w-5 text-blue-600" />
  //     case 'Video':
  //       return <VideoCameraIcon className="h-5 w-5 text-red-600" />
  //     case 'Audio':
  //       return <div className="h-5 w-5 bg-purple-600 rounded"></div>
  //     case 'Quiz':
  //       return <div className="h-5 w-5 bg-yellow-600 rounded"></div>
  //     case 'Repository':
  //       return <div className="h-5 w-5 bg-green-600 rounded"></div>
  //     default:
  //       return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
  //   }
  // }


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Bibliothèque de Contenu</h1>
          <p className="text-slate-400 mt-2 font-poppins">Accédez au contenu éducatif assigné à votre école</p>
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div className="flex space-x-1 bg-slate-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 font-poppins ${
                activeTab === 'content'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              Gestion du Contenu
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 font-poppins ${
                activeTab === 'pdf'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              Contenu PDF
            </button>
          </div>
        </div>

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <>
            {/* Search and Filters */}
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher du contenu..."
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
                  <option value="">Toutes les Sections</option>
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
                  <option value="">Tous les Niveaux</option>
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
                  <option value="">Toutes les Matières</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <button 
                  className="btn-secondary"
                  onClick={clearFilters}
                >
                  Effacer les Filtres
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
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                        Grade / Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                        Courses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                        Content Format
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {filteredContent.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white font-poppins">{item.section}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-poppins">{item.grade}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-poppins">{item.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-poppins">Audio · Video · PDF · Quiz · Repository</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
          </>
        )}

        {/* PDF Content Tab */}
        {activeTab === 'pdf' && (
          <div className="card">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <DocumentTextIcon className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white font-poppins mb-2">Gestion du Contenu PDF</h3>
              <p className="text-slate-400 font-poppins mb-6">Gérez et organisez le contenu éducatif PDF</p>
              <p className="text-sm text-slate-500 font-poppins">Les fonctionnalités de gestion du contenu PDF arrivent bientôt...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SchoolContent