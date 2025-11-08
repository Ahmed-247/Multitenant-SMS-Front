import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import ebookService, { EbookContent } from '../../services/SuperAdmin/ebook.service'

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

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'pdf'>('content')
  const [searchTerm, setSearchTerm] = useState('')
  const [ebookSearchTerm, setEbookSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [ebooks, setEbooks] = useState<EbookContent[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showUploadModal])

  useEffect(() => {
    fetchEbooks()
  }, [])

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const response = await ebookService.getEbookContent()
      if (response.success && response.data) {
        setEbooks(response.data)
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hardcoded data based on the table structure
  const [content, setContent] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Primaire - 6ème Année',
      type: 'Document',
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
      type: 'Document',
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
      type: 'Document',
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
      type: 'Document',
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
      type: 'Document',
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

  // Educational structure based on the provided image
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

  // Subjects based on sections and grades
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

  const filteredEbooks = ebooks.filter(ebook =>
    (ebook.titre?.toLowerCase().includes(ebookSearchTerm.toLowerCase()) ?? false) ||
    (ebook.auteur?.toLowerCase().includes(ebookSearchTerm.toLowerCase()) ?? false) ||
    (ebook.description?.toLowerCase().includes(ebookSearchTerm.toLowerCase()) ?? false)
  )

  const parseCSV = (csvText: string): Array<{ no?: string; titre?: string; auteur?: string; description?: string }> => {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ''
    let inQuotes = false
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i]
      const nextChar = csvText[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++
        }
        currentRow.push(currentField.trim())
        currentField = ''
        if (currentRow.length > 0 && currentRow.some(field => field.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
      } else {
        currentField += char
      }
    }
    
    if (currentField.trim() || currentRow.length > 0) {
      currentRow.push(currentField.trim())
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow)
      }
    }
    
    if (rows.length < 2) return []
    
    const headers = rows[0].map(h => h.trim())
    const data: Array<{ no?: string; titre?: string; auteur?: string; description?: string }> = []
    
    const noIndex = headers.indexOf('No')
    const titreIndex = headers.indexOf('Titre')
    const auteurIndex = headers.indexOf('Auteur')
    const descriptionIndex = headers.indexOf('Description')
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 0) continue
      
      data.push({
        no: noIndex >= 0 && row[noIndex] ? row[noIndex] : undefined,
        titre: titreIndex >= 0 && row[titreIndex] ? row[titreIndex] : undefined,
        auteur: auteurIndex >= 0 && row[auteurIndex] ? row[auteurIndex] : undefined,
        description: descriptionIndex >= 0 && row[descriptionIndex] ? row[descriptionIndex] : undefined,
      })
    }
    
    return data
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      setUploading(true)
      const text = await file.text()
      const parsedData = parseCSV(text)
      
      if (parsedData.length === 0) {
        alert('CSV file is empty or invalid. Please ensure the file contains data.')
        return
      }
      
      const filteredData = parsedData.filter(item => 
        item.titre || item.auteur || item.description
      )
      
      if (filteredData.length === 0) {
        alert('No valid data found in CSV file.')
        return
      }
      
      await ebookService.bulkUploadEbookContent({ content: filteredData })
      await fetchEbooks()
      alert('EBooks uploaded successfully')
      event.target.value = ''
    } catch (error) {
      console.error('Error uploading ebooks:', error)
      alert('Error uploading eBooks. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // const getTypeIcon = (type: string) => {
  //   switch (type) {
  //     case 'Document':
  //       return <DocumentTextIcon className="h-5 w-5 text-blue-600" />
  //     case 'Video':
  //       return <VideoCameraIcon className="h-5 w-5 text-red-600" />
  //     case 'Image':
  //       return <PhotoIcon className="h-5 w-5 text-green-600" />
  //     case 'Audio':
  //       return <div className="h-5 w-5 bg-purple-600 rounded"></div>
  //     default:
  //       return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
  //   }
  // }



  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Content Management</h1>
            <p className="text-slate-400 mt-2 font-poppins">Manage educational content and distribution to schools</p>
          </div>
          {activeTab === 'pdf' && (
            <label className="btn-primary flex items-center space-x-2 cursor-pointer">
              <PlusIcon className="h-5 w-5" />
              <span>{uploading ? 'Uploading...' : 'Upload CSV'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
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
              Courses
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 font-poppins ${
                activeTab === 'pdf'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              EBook Library
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
          <>
            {/* Search Bar */}
            <div className="card">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search eBooks..."
                  className="input-field pl-10"
                  value={ebookSearchTerm}
                  onChange={(e) => setEbookSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* eBook Table */}
            <div className="card">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8 text-slate-400 font-poppins">Loading...</div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {filteredEbooks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-slate-400 font-poppins">
                            No eBooks found
                          </td>
                        </tr>
                      ) : (
                        filteredEbooks.map((ebook) => (
                          <tr key={ebook.id} className="hover:bg-slate-700 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white font-poppins">{ebook.no || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white font-poppins">{ebook.titre || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white font-poppins">{ebook.auteur || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-white font-poppins">{ebook.description || '-'}</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* Upload Content Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Upload New Content</h3>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    const contentData = {
                      title: formData.get('title'),
                      type: formData.get('type'),
                      section: formData.get('section'),
                      grade: formData.get('grade'),
                      subject: formData.get('subject')
                    }
                    console.log('New Content Data:', contentData)

                    // Add to content list
                    const newContent: ContentItem = {
                      id: Date.now().toString(),
                      title: contentData.title as string,
                      type: contentData.type as 'Document' | 'Video' | 'Image' | 'Audio',
                      section: contentData.section as string,
                      grade: contentData.grade as string,
                      subject: contentData.subject as string,
                      size: '2.5 MB', // Mock size
                      uploadDate: new Date().toISOString().split('T')[0],
                      status: 'Processing',
                      downloads: 0,
                      assignedSchools: []
                    }
                    setContent([...content, newContent])
                    setShowUploadModal(false)
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Content Title</label>
                    <input
                      type="text"
                      name="title"
                      className="input-field"
                      placeholder="Enter content title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Content Type</label>
                    <select name="type" className="input-field" required>
                      <option value="">Select Type</option>
                      <option value="Document">Document</option>
                      <option value="Video">Video</option>
                      <option value="Image">Image</option>
                      <option value="Audio">Audio</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Section</label>
                      <select name="section" className="input-field" required>
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section.value} value={section.value}>{section.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Grade</label>
                      <select name="grade" className="input-field" required>
                        <option value="">Select Grade</option>
                        <option value="6th Year">6th Year</option>
                        <option value="10th Year">10th Year</option>
                        <option value="TSE">TSE (Technical Sciences and Engineering)</option>
                        <option value="TSM">TSM (Technical Sciences and Management)</option>
                        <option value="TSS">TSS (Technical Sciences and Social Sciences)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Subject</label>
                    <select name="subject" className="input-field" required>
                      <option value="">Select Subject</option>
                      <option value="French">French</option>
                      <option value="Written Calculation">Written Calculation</option>
                      <option value="Observational Sciences">Observational Sciences</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="English">English</option>
                      <option value="Economics">Economics</option>
                      <option value="Geology">Geology</option>
                      <option value="ECM (Civic and Moral Education)">ECM (Civic and Moral Education)</option>
                    </select>
                  </div>


                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Upload Content
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ContentManagement
