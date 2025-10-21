import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  PencilIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import schoolProfileService, { type SchoolProfile } from '../../services/schoolAdmin/SchoolProfile.service'
import { handleError } from '../../utils/errorUtils'

const SchoolProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [schoolData, setSchoolData] = useState<SchoolProfile>({
    SchoolName: '',
    SchoolAddress: '',
    SchoolPhone: '',
    SchoolEmail: '',
    AdminName: '',
    AdminEmail: ''
  })

  // Form data for editing
  const [formData, setFormData] = useState({
    SchoolName: '',
    SchoolAddress: '',
    SchoolPhone: ''
  })

  // Fetch school profile on component mount
  useEffect(() => {
    fetchSchoolProfile()
  }, [])

  const fetchSchoolProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await schoolProfileService.getSchoolProfile()
      
      if (response.success) {
        setSchoolData(response.data)
        setFormData({
          SchoolName: response.data.SchoolName,
          SchoolAddress: response.data.SchoolAddress,
          SchoolPhone: response.data.SchoolPhone
        })
      } else {
        setError('Failed to fetch school profile' + response.message)
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Error fetching school profile', 'Failed to fetch school profile')
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      SchoolName: schoolData.SchoolName,
      SchoolAddress: schoolData.SchoolAddress,
      SchoolPhone: schoolData.SchoolPhone
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      SchoolName: schoolData.SchoolName,
      SchoolAddress: schoolData.SchoolAddress,
      SchoolPhone: schoolData.SchoolPhone
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      
      // Validate that at least one field has changed
      const hasChanges = 
        formData.SchoolName !== schoolData.SchoolName ||
        formData.SchoolAddress !== schoolData.SchoolAddress ||
        formData.SchoolPhone !== schoolData.SchoolPhone

      if (!hasChanges) {
        setIsEditing(false)
        return
      }

      const response = await schoolProfileService.editSchoolProfile(formData)
      
      if (response.success) {
        setSchoolData(response.data)
        setIsEditing(false)
      } else {
        setError('Failed to update school profile')
      }
    } catch (error: any) {
      setError(
        handleError(error, 'Error updating school profile', 'Failed to update school profile')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Profil de l'École</h1>
            <p className="text-slate-400 mt-2 font-poppins">Gérez les informations et paramètres de votre école</p>
          </div>
          <button
            onClick={isEditing ? handleCancel : handleEdit}
            className="btn-primary flex items-center space-x-2"
            disabled={loading || saving}
          >
            <PencilIcon className="h-5 w-5" />
            <span>{isEditing ? 'Annuler' : 'Modifier le Profil'}</span>
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
              <span className="ml-3 text-slate-400">Chargement du profil de l'école...</span>
            </div>
          </div>
        )}

        {/* School Overview */}
        {!loading && (
          <div className="card">
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-blue-600/20 rounded-xl">
                <BuildingOfficeIcon className="h-12 w-12 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2 font-poppins">{schoolData.SchoolName}</h2>
                <p className="text-slate-400 font-poppins">School Information and Settings</p>
              </div>
            </div>
          </div>
        )}

        {/* School Information */}
        {!loading && (
          <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-600/20 rounded-xl mr-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-poppins">School Information</h3>
                  <p className="text-slate-400 font-poppins">Manage your school details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editable Fields */}
                <div className="space-y-6">
                  <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Informations Modifiables
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Nom de l'École</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="input-field w-full bg-slate-600 border-slate-500 focus:border-blue-400 focus:ring-blue-400"
                            value={formData.SchoolName}
                            onChange={(e) => handleInputChange('SchoolName', e.target.value)}
                            required
                          />
                        ) : (
                          <div className="text-white font-poppins bg-slate-600 p-3 rounded-lg">{schoolData.SchoolName}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Adresse</label>
                        {isEditing ? (
                          <textarea
                            className="input-field w-full h-24 resize-none bg-slate-600 border-slate-500 focus:border-blue-400 focus:ring-blue-400"
                            value={formData.SchoolAddress}
                            onChange={(e) => handleInputChange('SchoolAddress', e.target.value)}
                            required
                          />
                        ) : (
                          <div className="text-white font-poppins bg-slate-600 p-3 rounded-lg">{schoolData.SchoolAddress}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Numéro de Téléphone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            className="input-field w-full bg-slate-600 border-slate-500 focus:border-blue-400 focus:ring-blue-400"
                            value={formData.SchoolPhone}
                            onChange={(e) => handleInputChange('SchoolPhone', e.target.value)}
                            required
                          />
                        ) : (
                          <div className="text-white font-poppins bg-slate-600 p-3 rounded-lg">{schoolData.SchoolPhone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Read-only Fields */}
                <div className="space-y-6">
                  <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600">
                    <h4 className="text-lg font-semibold text-white mb-4 font-poppins flex items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mr-3"></div>
                      System Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Email</label>
                        <div className="text-white font-poppins bg-slate-600 p-3 rounded-lg">{schoolData.SchoolEmail}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Admin Name</label>
                        <div className="text-white font-poppins bg-slate-600 p-3 rounded-lg">{schoolData.AdminName || 'Not assigned'}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Admin Email</label>
                        <div className="text-white font-poppins bg-slate-600 p-3 rounded-lg">{schoolData.AdminEmail || 'Not assigned'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Save Button */}
        {isEditing && !loading && (
          <div className="flex justify-end">
            <button 
              onClick={handleSave} 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </div>
              ) : (
                'Sauvegarder les Modifications'
              )}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SchoolProfile