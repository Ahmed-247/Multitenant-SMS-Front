import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import contactService from '../services/contact.service'
import { handleError } from '../utils/errorUtils'
import bonecoleLogo from '../assets/bonecoleLogo.svg'

const ContactRegistration: React.FC = () => {
  const navigate = useNavigate()
  const [contactForm, setContactForm] = useState({
    SchoolName: '',
    SchoolAddress: '',
    SchoolPhone: '',
    SchoolEmail: '',
    ContactPersonName: '',
    Message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')
  const [contactSuccess, setContactSuccess] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactError('')
    setContactSuccess(false)
    
    if (!contactForm.SchoolName || !contactForm.SchoolEmail) {
      setContactError('Le nom de l\'école et l\'email de l\'école sont requis')
      return
    }
    
    setContactLoading(true)
    
    try {
      const response = await contactService.submitContact({
        SchoolName: contactForm.SchoolName,
        SchoolAddress: contactForm.SchoolAddress || undefined,
        SchoolPhone: contactForm.SchoolPhone || undefined,
        SchoolEmail: contactForm.SchoolEmail,
        ContactPersonName: contactForm.ContactPersonName || undefined,
        Message: contactForm.Message || undefined
      })
      
      if (response.success) {
        setContactSuccess(true)
        setContactForm({
          SchoolName: '',
          SchoolAddress: '',
          SchoolPhone: '',
          SchoolEmail: '',
          ContactPersonName: '',
          Message: ''
        })
      }
    } catch (error: any) {
      setContactError(
        handleError(error, 'Contact submission error', 'Failed to submit contact information. Please try again.')
      )
    } finally {
      setContactLoading(false)
    }
  }

  if (contactSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="card text-center">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-600/20 mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white font-poppins mb-4">Merci !</h2>
            <p className="text-slate-300 font-poppins mb-8 text-lg">
              Nous avons reçu vos informations. Notre équipe vous contactera bientôt pour l'intégration.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 font-poppins"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Login
        </button>

        <div className="card">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <img src={bonecoleLogo} alt="Bonecole Logo" className="h-16" />
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-slate-300 mb-2 font-poppins">
                Nom de l'École <span className="text-red-400">*</span>
              </label>
              <input
                id="schoolName"
                type="text"
                required
                className="input-field"
                placeholder="Entrer le nom de l'école"
                value={contactForm.SchoolName}
                onChange={(e) => setContactForm({ ...contactForm, SchoolName: e.target.value })}
                disabled={contactLoading}
              />
            </div>

            <div>
              <label htmlFor="schoolEmail" className="block text-sm font-medium text-slate-300 mb-2 font-poppins">
                Email de l'école <span className="text-red-400">*</span>
              </label>
              <input
                id="schoolEmail"
                type="email"
                required
                className="input-field"
                placeholder="Entrer l'email de l'école"
                value={contactForm.SchoolEmail}
                onChange={(e) => setContactForm({ ...contactForm, SchoolEmail: e.target.value })}
                disabled={contactLoading}
              />
            </div>

            <div>
              <label htmlFor="schoolAddress" className="block text-sm font-medium text-slate-300 mb-2 font-poppins">
                Adresse
              </label>
              <input
                id="schoolAddress"
                type="text"
                className="input-field"
                placeholder="Entrer l'adresse de l'école"
                value={contactForm.SchoolAddress}
                onChange={(e) => setContactForm({ ...contactForm, SchoolAddress: e.target.value })}
                disabled={contactLoading}
              />
            </div>

            <div>
              <label htmlFor="schoolPhone" className="block text-sm font-medium text-slate-300 mb-2 font-poppins">
                Numéro de Téléphone
              </label>
              <input
                id="schoolPhone"
                type="tel"
                className="input-field"
                placeholder="Entrer le numéro de téléphone de l'école"
                value={contactForm.SchoolPhone}
                onChange={(e) => setContactForm({ ...contactForm, SchoolPhone: e.target.value })}
                disabled={contactLoading}
              />
            </div>

            <div>
              <label htmlFor="contactPersonName" className="block text-sm font-medium text-slate-300 mb-2 font-poppins">
                Nom de la personne de contact
              </label>
              <input
                id="contactPersonName"
                type="text"
                className="input-field"
                placeholder="Entrer le nom de la personne de contact"
                value={contactForm.ContactPersonName}
                onChange={(e) => setContactForm({ ...contactForm, ContactPersonName: e.target.value })}
                disabled={contactLoading}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2 font-poppins">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="input-field resize-none"
                placeholder="Entrer votre message"
                value={contactForm.Message}
                onChange={(e) => setContactForm({ ...contactForm, Message: e.target.value })}
                disabled={contactLoading}
              />
            </div>

            {contactError && (
              <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4">
                <div className="text-sm text-red-400 font-poppins">{contactError}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                disabled={contactLoading}
                className="btn-secondary flex-1 order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={contactLoading}
                className="btn-primary flex-1 order-1 sm:order-2"
              >
                {contactLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  'Soumettre'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactRegistration
