import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
// import {
//   DocumentArrowDownIcon
// } from '@heroicons/react/24/outline'
import paymentService, { PaymentStatus, PaymentHistoryItem } from '../../services/schoolAdmin/payment.service'
import { generatePaymentInvoicePdf } from '../../utils/pdfUtils'

const SchoolBilling: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showStudentLimitModal, setShowStudentLimitModal] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([])
  const [schoolName, setSchoolName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [additionalStudents, setAdditionalStudents] = useState<number | any>(1) // Default increment of 1 student

  // Prevent body scrolling when payment modal is open
  useEffect(() => {
    if (showPaymentModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPaymentModal])

  // Fetch payment status
  const fetchPaymentStatus = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await paymentService.getPaymentStatus()
      
      if (response.success) {
        setPaymentData(response.data)
        setSchoolName(response.data.schoolName || 'School')
      } else {
        setError('Failed to fetch payment status')
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)
      setError('Failed to fetch payment status')
    } finally {
      setLoading(false)
    }
  }

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory()
      
      if (response.success) {
        setPaymentHistory(response.data.payments)
        setSchoolName(response.data.schoolName || paymentData?.schoolName || 'School')
      } else {
        console.error('Failed to fetch payment history')
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
    }
  }

  // Load payment data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchPaymentStatus()
      await fetchPaymentHistory()
    }
    loadData()
  }, [])

  // Handle payment initiation
  const handlePaymentInitiation = async () => {
    try {
      setPaymentProcessing(true)
      setError('')
      
      const response = await paymentService.initiatePayment()
      
      if (response.status === 201) {
        // Redirect to Orange Money payment page
        window.location.href = response.payment_url
      } else {
        setError('Failed to initiate payment')
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      setError('Failed to initiate payment')
    } finally {
      setPaymentProcessing(false)
    }
  }

  // Helper function to format payment status for display
  const formatPaymentStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'Paid'
      case 'PENDING':
        return 'Pending'
      case 'FAILED':
        return 'Failed'
      default:
        return status
    }
  }

  // Helper functions
  const getStatusDisplay = () => {
    if (!paymentData) return 'Loading...'
    
    if (paymentData.isActive) {
      return 'Active'
    } else if (paymentData.isExpired) {
      return 'Expired'
    } else {
      return 'Inactive'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/30 text-green-400 border border-green-500/30'
      case 'Expired':
        return 'bg-red-900/30 text-red-400 border border-red-500/30'
      case 'Inactive':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600'
    }
  }

  const getExpiryMessage = () => {
    if (!paymentData) return ''
    
    if (paymentData.isExpired) {
      return 'Your plan has expired'
    } else if (paymentData.daysUntilExpiry !== null) {
      if (paymentData.daysUntilExpiry <= 7) {
        return `Expires in ${paymentData.daysUntilExpiry} days`
      } else {
        return `Expires on ${new Date(paymentData.planExpiryDate).toLocaleDateString()}`
      }
    } else {
      return 'No expiry date set'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-900/30 text-green-400 border border-green-500/30'
      case 'Pending':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
      case 'Failed':
        return 'bg-red-900/30 text-red-400 border border-red-500/30'
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600'
    }
  }


  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Facturation et Abonnement</h1>
            <p className="text-slate-400 mt-2 font-poppins">Gérez l'abonnement et les paiements de votre école</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-400">Loading payment information...</span>
          </div>
        </div>
      </Layout>
    )
  }

  // Calculate additional cost based on current plan
  const calculateAdditionalCost = () => {
    if (!paymentData) return 0
    const costPerStudent = paymentData.paymentAmount / parseInt(paymentData.studentLimit)
    const numericAdditional = typeof additionalStudents === 'string'
      ? parseInt(additionalStudents || '0')
      : (additionalStudents || 0)
    return parseFloat((costPerStudent * numericAdditional).toFixed(2))
  }

  // Handle invoice download
  const handleDownloadInvoice = async (payment: PaymentHistoryItem) => {
    try {
      const invoiceDate = new Date(payment.paymentTime)
      const dueDate = new Date(invoiceDate)
      dueDate.setDate(dueDate.getDate() + 14)

      const invoiceNumber = payment.orderId || `INV-${invoiceDate.getTime()}`
      const amountPaid = formatPaymentStatus(payment.status) === 'Paid' ? parseFloat(payment.amount) : 0
      const amountLeft = parseFloat(payment.amount) - amountPaid

      await generatePaymentInvoicePdf({
        schoolName: schoolName || paymentData?.schoolName || 'School',
        invoiceNumber,
        invoiceDate,
        dueDate,
        row: {
          date: payment.paymentTime,
          totalAmount: parseFloat(payment.amount || '0'),
          amountPaid: amountPaid || 0,
          amountLeftToPay: amountLeft || 0,
          method: 'Orange Money',
          status: formatPaymentStatus(payment.status),
          invoice: payment.orderId,
          txnid: payment.transactionId || ''
        }
      })
    } catch (error) {
      console.error('Error generating invoice:', error)
      setError('Failed to generate invoice')
    }
  }

  // Handle student limit increase payment
  const handleStudentLimitIncrease = async () => {
    try {
      setError('')
      const num = typeof additionalStudents === 'string' ? parseInt(additionalStudents) : additionalStudents
      if (!num || isNaN(num) || num <= 0) {
        setError('Please enter a valid number of additional students')
        return
      }

      setPaymentProcessing(true)
      const response = await paymentService.initiatePaymentIncreaseStudent(num)

      if (response && response.payment_url) {
        setShowStudentLimitModal(false)
        window.location.href = response.payment_url
      } else {
        setError('Failed to initiate increase limit payment')
      }
    } catch (err) {
      console.error('Error initiating increase limit payment:', err)
      setError('Failed to initiate increase limit payment')
    } finally {
      setPaymentProcessing(false)
    }
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Facturation et Abonnement</h1>
            <p className="text-slate-400 mt-2 font-poppins">Gérez l'abonnement et les paiements de votre école</p>
          </div>
          <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4">
            <div className="text-sm text-red-400">{error}</div>
            <button
              onClick={fetchPaymentStatus}
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
          <h1 className="text-3xl font-bold text-white font-poppins">Facturation et Abonnement</h1>
          <p className="text-slate-400 mt-2 font-poppins">Gérez l'abonnement et les paiements de votre école</p>
        </div>

        {/* Error Display */}
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

        {/* Current Subscription */}
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-white font-poppins">Abonnement Actuel</h2>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(getStatusDisplay())}`}>
              {getStatusDisplay()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">Standard Plan</h3>
              <p className="text-3xl font-bold text-blue-400">
                ${paymentData?.paymentAmount || 0}
              </p>
              <p className="text-sm text-slate-400 font-poppins mt-1">
                {paymentData?.planMonthDuration} months duration
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">Plan Status</h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-300 font-poppins">
                  {getExpiryMessage()}
                </p>
                {/* {paymentData?.planExpiryDate && (
                  <p className="text-sm text-slate-400 font-poppins">
                    Expiry: {new Date(paymentData.planExpiryDate).toLocaleDateString()}
                  </p>
                )} */}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">Student Limit</h3>
              <p className="text-lg font-semibold text-white font-poppins">
                {paymentData?.studentLimit} Students
              </p>
              <p className="text-sm text-slate-400 font-poppins">
                Maximum capacity
              </p>
              {paymentData?.isActive && (
                <button
                  onClick={() => setShowStudentLimitModal(true)}
                  className="mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                >
                  Increase Limit
                </button>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">Payment Status</h3>
              <p className="text-lg font-semibold text-white font-poppins">
                {paymentData?.paymentStatus ? 'Paid' : 'Unpaid'}
              </p>
              <p className="text-sm text-slate-400 font-poppins">
                {paymentData?.paymentStatus ? 'Payment confirmed' : 'Payment pending'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-lg">🟠</span>
                <div>
                  <p className="font-medium text-white font-poppins">Payment Method</p>
                  <p className="text-sm text-slate-400 font-poppins">Orange Money</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!paymentData?.isActive && (
                  <button 
                    onClick={handlePaymentInitiation}
                    className="btn-primary"
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Make Payment'
                    )}
                  </button>
                )}
                {paymentData?.isActive && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium">Payment Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Payment History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Payment History</h3>
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
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins hidden sm:table-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (
                    <tr key={payment.paymentId} className="hover:bg-slate-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-poppins">
                        {new Date(payment.paymentTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white font-poppins">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🟠</span>
                          <span className="text-sm text-slate-300 font-poppins">Orange Money</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(formatPaymentStatus(payment.status))}`}>
                          {formatPaymentStatus(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-poppins">
                        {payment.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-poppins">
                        <div className="flex flex-col gap-2">
                          <span>{payment.transactionId || 'N/A'}</span>
                          <button
                            className="sm:hidden px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md w-full text-xs"
                            onClick={() => handleDownloadInvoice(payment)}
                          >
                            Download PDF
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell">
                        <button
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs"
                          onClick={() => handleDownloadInvoice(payment)}
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-poppins">
                      No payment history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Make Payment</h3>
                <div className="space-y-4">
                  <div className="bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-medium text-white font-poppins">Standard Plan</h4>
                    <p className="text-sm text-slate-400 font-poppins">Amount: ${paymentData?.paymentAmount || 0}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Payment Method</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="paymentMethod" value="orange" className="mr-2 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="flex items-center">
                          <span className="text-lg mr-2">🟠</span>
                          <span className="text-slate-300 font-poppins">Orange Money</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-poppins">Phone Number</label>
                    <input type="tel" className="input-field" placeholder="Enter phone number" />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={handlePaymentInitiation}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Process Payment'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Student Limit Increase Modal */}
{showStudentLimitModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
    <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Increase Student Limit</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 font-poppins">Current Limit</label>
            <p className="text-lg text-white font-poppins">{paymentData?.studentLimit} Students</p>
          </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 font-poppins">Additional Students</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        value={additionalStudents}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string while user clears input
                          if (value === '') {
                            setAdditionalStudents('');
                            return;
                          }

                          const parsedValue = parseInt(value);
                          if (!isNaN(parsedValue) && parsedValue >= 1) {
                            setAdditionalStudents(parsedValue);
                          }
                        }}
                        onBlur={() => {
                          // Reset to 1 if user leaves it empty
                          if (additionalStudents === '') {
                            setAdditionalStudents(1);
                          }
                        }}
                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter number of students"
                      />
                    </div>
                  </div>

          <div className="bg-slate-700/50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 font-poppins">New Total Limit</span>
              <span className="text-white font-poppins">
                {(() => {
                  const base = parseInt(paymentData?.studentLimit || '0')
                  const add = typeof additionalStudents === 'string'
                    ? parseInt(additionalStudents || '0')
                    : (additionalStudents || 0)
                  return base + add
                })()} Students
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-poppins">Additional Cost</span>
              <span className="text-white font-poppins">${calculateAdditionalCost()}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowStudentLimitModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleStudentLimitIncrease}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </Layout>
  )
}

export default SchoolBilling