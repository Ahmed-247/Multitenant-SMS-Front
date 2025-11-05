import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import contactsService, { Contact } from '../../services/SuperAdmin/contacts.service'

const ContactsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    if (showViewModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showViewModal])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await contactsService.getAllContacts()
      
      if (response.success) {
        setContacts(response.data)
      } else {
        setError('Failed to fetch contacts')
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setError('Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      contact.SchoolName.toLowerCase().includes(searchLower) ||
      contact.SchoolEmail.toLowerCase().includes(searchLower) ||
      contact.SchoolPhone?.toLowerCase().includes(searchLower) ||
      contact.ContactPersonName?.toLowerCase().includes(searchLower) ||
      contact.SchoolAddress?.toLowerCase().includes(searchLower)
    )
  })

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setShowViewModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-400 border border-green-500/30">
        Processed
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-500/30">
        Pending
      </span>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Contacts Management</h1>
            <p className="text-slate-400 mt-2 font-poppins">View and manage all school contact requests</p>
          </div>
        </div>

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

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search contacts by school name, email, phone, or contact person..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-400">Loading contacts...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-poppins">
                  {searchTerm ? 'No contacts found matching your search.' : 'No contacts found.'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      School Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Contact Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.ContactId} className="hover:bg-slate-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white font-poppins">{contact.SchoolName}</div>
                          {contact.SchoolAddress && (
                            <div className="text-sm text-slate-400 font-poppins mt-1">{contact.SchoolAddress}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-poppins">{contact.SchoolEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-poppins">{contact.SchoolPhone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-poppins">{contact.ContactPersonName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contact.Status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300 font-poppins">
                          {formatDate(contact.CreatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="text-green-400 hover:text-green-300 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showViewModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content p-6 sm:p-8 max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white font-poppins">Contact Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">School Name</label>
                  <div className="text-white font-poppins">{selectedContact.SchoolName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">School Email</label>
                  <div className="text-white font-poppins">{selectedContact.SchoolEmail}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">School Phone</label>
                  <div className="text-white font-poppins">{selectedContact.SchoolPhone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">Contact Person</label>
                  <div className="text-white font-poppins">{selectedContact.ContactPersonName || 'N/A'}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">School Address</label>
                  <div className="text-white font-poppins">{selectedContact.SchoolAddress || 'N/A'}</div>
                </div>
                {selectedContact.Message && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">Message</label>
                    <div className="text-white font-poppins bg-slate-700 p-3 rounded-lg">{selectedContact.Message}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">Status</label>
                  {getStatusBadge(selectedContact.Status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 font-poppins">Created At</label>
                  <div className="text-white font-poppins">{formatDate(selectedContact.CreatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default ContactsManagement
