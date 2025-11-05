import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  // DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import paymentsService, { Payment } from '../../services/SuperAdmin/payments.service'
import { generatePaymentInvoicePdf } from '../../utils/pdfUtils'
import { formatCurrency } from '../../utils/currencyUtils'

interface Subscription {
  id: string
  schoolName: string
  orderId: string
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
  const [statusFilter, setStatusFilter] = useState('')
  const [showPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalRevenue, setTotalRevenue] = useState(0)

  // Fetch payments data
  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await paymentsService.getAllPayments()
      
      if (response.success) {
        setPayments(response.data.payments)
        setTotalRevenue(parseFloat(response.data.totalCollectiveAmount))
      } else {
        setError('Failed to fetch payments data')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setError('Failed to fetch payments data')
    } finally {
      setLoading(false)
    }
  }

  // Load payments data on component mount
  useEffect(() => {
    fetchPayments()
  }, [])

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

  // Transform API data to subscription format
  const transformPaymentsToSubscriptions = (payments: Payment[]): Subscription[] => {
    // Group payments by school
    const schoolPayments = payments.reduce((acc, payment) => {
      const schoolId = payment.SchoolId
      if (!acc[schoolId]) {
        acc[schoolId] = {
          school: payment.school,
          payments: []
        }
      }
      acc[schoolId].payments.push(payment)
      return acc
    }, {} as Record<string, { school: Payment['school'], payments: Payment[] }>)

    // Transform to subscription format
    return Object.values(schoolPayments).map(({ school, payments }) => {
      const latestPayment = payments[0] // Most recent payment
      
      return {
        id: latestPayment.SchoolId,
        schoolName: school.SchoolName,
        orderId: latestPayment.Order_id,
        plan: 'Standard',
        studentLimit: parseInt(school.StudentLimit),
        currentStudents: 0, // This would need a separate API
        price: parseFloat(latestPayment.Amount),
        billingCycle: 'Yearly' as const,
        status: latestPayment.PaymentStatus === 'SUCCESS' ? 'Paid' as const : 'Unpaid' as const,
        startDate: school.PlanExpiryDate ? new Date(school.PlanExpiryDate).toISOString().split('T')[0] : '',
        endDate: school.PlanExpiryDate || '',
        paymentMethod: 'Orange Money' as const,
        lastPayment: latestPayment.PaymentTime,
        nextPayment: school.PlanExpiryDate || ''
      }
    })
  }

  const subscriptions = transformPaymentsToSubscriptions(payments)

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  // Get invoice history for a specific school
  const getInvoiceHistory = (schoolId: string) => {
    const schoolPayments = payments.filter(payment => payment.SchoolId === schoolId)
    return schoolPayments.map(payment => ({
      id: payment.PaymentId,
      date: payment.PaymentTime,
      amount: parseFloat(payment.Amount),
      status: payment.PaymentStatus === 'SUCCESS' ? 'Paid' : payment.PaymentStatus === 'PENDING' ? 'Pending' : 'Failed',
      method: 'Orange Money',
      invoice: payment.Order_id
    }))
  }

  const handleRowClick = (subscription: Subscription) => {
    setSelectedSchool(subscription)
    setShowInvoiceModal(true)
  }

  const handleDownloadInvoice = async (
    opts: {
      schoolName: string,
      orderId: string,
      amount: number,
      date: string,
      status: string,
      method: string
    }
  ) => {
    const now = new Date(opts.date)
    const due = new Date(now)
    due.setDate(due.getDate() + 14)

    const invoiceNumber = opts.orderId || `INV-${now.getTime()}`
    const amountPaid = opts.status === 'Paid' ? opts.amount : 0
    const amountLeft = opts.amount - amountPaid

    await generatePaymentInvoicePdf({
      schoolName: opts.schoolName,
      invoiceNumber,
      invoiceDate: now,
      dueDate: due,
      row: {
        date: opts.date,
        totalAmount: Number(opts.amount || 0),
        amountPaid: Number(amountPaid || 0),
        amountLeftToPay: Number(amountLeft || 0),
        method: opts.method,
        status: opts.status,
        invoice: opts.orderId,
      },
    })
  }

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Subscriptions & Billing</h1>
            <p className="text-slate-400 mt-2 font-poppins">Manage school subscriptions and payment processing</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-400">Loading payments data...</span>
          </div>
        </div>
      </Layout>
    )
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Subscriptions & Billing</h1>
            <p className="text-slate-400 mt-2 font-poppins">Manage school subscriptions and payment processing</p>
          </div>
          <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4">
            <div className="text-sm text-red-400">{error}</div>
            <button
              onClick={fetchPayments}
              className="text-xs text-red-300 hover:text-red-200 mt-1"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    )
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
                <p className="text-2xl font-bold text-white font-poppins">{formatCurrency(totalRevenue)}</p>
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
            <select 
              className="input-field w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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
                    Order ID
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">{subscription.orderId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white font-poppins">
                          {formatCurrency(subscription.price)}
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
                          Total Amount to Pay
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Amount Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                          Amount Left to Pay
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins hidden sm:table-cell">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {getInvoiceHistory(selectedSchool.id).map((payment) => {
                        const totalAmount = payment.amount
                        const amountPaid = payment.status === 'Paid' ? payment.amount : 0
                        const amountLeftToPay = totalAmount - amountPaid

                        return (
                          <tr key={payment.id} className="hover:bg-slate-700 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-poppins">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white font-poppins">
                              {formatCurrency(totalAmount, 2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400 font-poppins">
                              {formatCurrency(amountPaid, 2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-400 font-poppins">
                              {formatCurrency(amountLeftToPay, 2)}
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
                            <div className="flex flex-col gap-2">
                              <span>{payment.invoice}</span>
                              <button
                                className="sm:hidden px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md w-full"
                                onClick={() => handleDownloadInvoice({
                                  schoolName: selectedSchool.schoolName,
                                  orderId: payment.invoice,
                                  amount: totalAmount,
                                  date: payment.date,
                                  status: payment.status,
                                  method: payment.method
                                })}
                              >
                                Download PDF
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell">
                            <button
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md"
                              onClick={() => handleDownloadInvoice({
                                schoolName: selectedSchool.schoolName,
                                orderId: payment.invoice,
                                amount: totalAmount,
                                date: payment.date,
                                status: payment.status,
                                method: payment.method
                              })}
                            >
                              Download PDF
                            </button>
                          </td>
                          </tr>
                        )
                      })}
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