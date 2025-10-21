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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  // Données de test - remplacer par des appels API réels
  const [content] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Français 6ème Année - Grammaire de Base',
      type: 'PDF',
      section: 'Primaire',
      grade: '6ème Année',
      subject: 'Français',
      size: '2.5 MB',
      uploadDate: '2024-10-01',
      status: 'Available',
      downloads: 45,
      assignedSchools: ['Lycée Vert', 'École du Soleil']
    },
    {
      id: '2',
      title: 'Calcul écrit 6ème Année - Addition et Soustraction',
      type: 'Video',
      section: 'Primaire',
      grade: '6ème Année',
      subject: 'Calcul écrit',
      size: '15.2 MB',
      uploadDate: '2024-10-02',
      status: 'Available',
      downloads: 32,
      assignedSchools: ['Lycée Vert', 'Académie Riverside']
    },
    {
      id: '3',
      title: 'Mathématiques 10ème Année - Bases de l\'Algèbre',
      type: 'Quiz',
      section: 'Collège',
      grade: '10ème Année',
      subject: 'Mathématiques',
      size: '1.8 MB',
      uploadDate: '2024-10-03',
      status: 'Processing',
      downloads: 0,
      assignedSchools: []
    },
    {
      id: '4',
      title: 'Physique TSE - Mécanique et Mouvement',
      type: 'Audio',
      section: 'Lycée',
      grade: 'TSE',
      subject: 'Physique',
      size: '25.3 MB',
      uploadDate: '2024-10-04',
      status: 'Available',
      downloads: 18,
      assignedSchools: ['Lycée Technique']
    },
    {
      id: '5',
      title: 'Économie TSM - Principes du Marché',
      type: 'Repository',
      section: 'Lycée',
      grade: 'TSM',
      subject: 'Économie',
      size: '3.2 MB',
      uploadDate: '2024-10-05',
      status: 'Available',
      downloads: 12,
      assignedSchools: ['Académie des Affaires']
    },
    {
      id: '6',
      title: 'Histoire TSS - Guerres Mondiales',
      type: 'PDF',
      section: 'Lycée',
      grade: 'TSS',
      subject: 'Histoire',
      size: '4.1 MB',
      uploadDate: '2024-10-06',
      status: 'Available',
      downloads: 8,
      assignedSchools: ['Lycée des Sciences Sociales']
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />
      case 'Video':
        return <VideoCameraIcon className="h-5 w-5 text-red-600" />
      case 'Audio':
        return <div className="h-5 w-5 bg-purple-600 rounded"></div>
      case 'Quiz':
        return <div className="h-5 w-5 bg-yellow-600 rounded"></div>
      case 'Repository':
        return <div className="h-5 w-5 bg-green-600 rounded"></div>
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Bibliothèque de Contenu</h1>
          <p className="text-slate-400 mt-2 font-poppins">Accédez au contenu éducatif assigné à votre école</p>
        </div>

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
                    Titre du Contenu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Matière
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