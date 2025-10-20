import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

interface Subscription {
  id: string
  schoolName: string
  plan: string
  studentLimit: number
  currentStudents: number
  price: number
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly'
  status: 'Paid' | 'Unpaid'
  startDate: string
  endDate: string
  paymentMethod: 'Orange Money' | 'Bank Transfer'
  lastPayment: string
  nextPayment: string
}

const SubscriptionsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<Subscription | null>(null)

  // Prevent body scrolling when modals are open
  useEffect(() => {
    if (showPaymentModal || showInvoiceModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPaymentModal, showInvoiceModal])

  // Mock data - replace with actual API calls
  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      schoolName: 'Greenwood High School',
      plan: 'Standard',
      studentLimit: 200,
      currentStudents: 150,
      price: 500,
      billingCycle: 'Monthly',
      status: 'Paid',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      paymentMethod: 'Orange Money',
      lastPayment: '2024-10-01',
      nextPayment: '2024-11-01'
    },
    {
      id: '2',
      schoolName: 'Riverside Academy',
      plan: 'Standard',
      studentLimit: 100,
      currentStudents: 89,
      price: 300,
      billingCycle: 'Yearly',
      status: 'Paid',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      paymentMethod: 'Orange Money',
      lastPayment: '2024-10-01',
      nextPayment: '2025-01-01'
    },
    {
      id: '3',
      schoolName: 'Sunshine Elementary',
      plan: 'Standard',
      studentLimit: 200,
      currentStudents: 200,
      price: 500,
      billingCycle: 'Monthly',
      status: 'Unpaid',
      startDate: '2024-10-01',
      endDate: '2024-10-31',
      paymentMethod: 'Orange Money',
      lastPayment: 'N/A',
      nextPayment: '2024-11-01'
    }
  ])

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'Paid')
    .reduce((sum, sub) => sum + sub.price, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-900/30 text-green-400 border border-green-500/30'
      case 'Unpaid':
        return 'bg-red-900/30 text-red-400 border border-red-500/30'
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Orange Money':
        return '🟠'
      case 'Bank Transfer':
        return '🏦'
      default:
        return '💰'
    }
  }

  // Mock invoice history data - replace with actual API calls
  const getInvoiceHistory = (_schoolId: string) => {
    // This would typically fetch from API based on schoolId
    return [
      {
        id: '1',
        date: '2024-10-01',
        amount: 500,
        status: 'Paid',
        method: 'Orange Money',
        invoice: 'INV-2024-001'
      },
      {
        id: '2',
        date: '2024-09-01',
        amount: 500,
        status: 'Paid',
        method: 'Orange Money',
        invoice: 'INV-2024-002'
      },
      {
        id: '3',
        date: '2024-08-01',
        amount: 500,
        status: 'Paid',
        method: 'Orange Money',
        invoice: 'INV-2024-003'
      },
      {
        id: '4',
        date: '2024-07-01',
        amount: 500,
        status: 'Unpaid',
        method: 'Orange Money',
        invoice: 'INV-2024-004'
      }
    ]
  }

  const handleRowClick = (subscription: Subscription) => {
    setSelectedSchool(subscription)
    setShowInvoiceModal(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white font-poppins">Subscriptions & Billing</h1>
          <p className="text-slate-400 mt-2 font-poppins">Manage school subscriptions and payment processing</p>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400 font-poppins">Total Revenue</p>
                <p className="text-2xl font-bold text-white font-poppins">${totalRevenue.toLocaleString()}</p>
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
                placeholder="Search subscriptions by school or plan..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="input-field w-48">
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Plan & Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {filteredSubscriptions.map((subscription) => (
                  <tr 
                    key={subscription.id} 
                    className="hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleRowClick(subscription)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">{subscription.schoolName}</div>
                        <div className="text-sm text-slate-400 font-poppins">
                          {subscription.billingCycle} billing
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">{subscription.plan}</div>
                        <div className="text-sm text-slate-400 font-poppins">
                          {subscription.currentStudents}/{subscription.studentLimit} students
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(subscription.currentStudents / subscription.studentLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">
                          ${subscription.price}/{subscription.billingCycle === 'Monthly' ? 'mo' : subscription.billingCycle === 'Quarterly' ? 'qtr' : 'yr'}
                        </div>
                        <div className="text-sm text-slate-400 font-poppins">
                          Next: {new Date(subscription.nextPayment).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getPaymentMethodIcon(subscription.paymentMethod)}</span>
                        <span className="text-sm text-slate-300 font-poppins">{subscription.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice History Modal */}
        {showInvoiceModal && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white font-poppins">
                    Invoice History - {selectedSchool.schoolName}
                  </h3>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Invoice History Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {getInvoiceHistory(selectedSchool.id).map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-poppins">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white font-poppins">
                            ${payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getPaymentMethodIcon(payment.method)}</span>
                              <span className="text-sm text-slate-300 font-poppins">{payment.method}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-poppins">
                            {payment.invoice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

export default SubscriptionsManagement