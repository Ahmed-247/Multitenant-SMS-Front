import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

const SchoolBilling: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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

  // Mock data - replace with actual API calls
  const subscriptionData = {
    plan: 'Standard',
    studentLimit: 100,
    currentStudents: 89,
    price: 300,
    billingCycle: 'Yearly',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    nextPayment: '2025-01-01',
    lastPayment: '2024-10-01',
    paymentMethod: 'Orange Money',
    autoRenew: true
  }

  const paymentHistory = [
    {
      id: '1',
      date: '2024-10-01',
      amount: 300,
      status: 'Paid',
      method: 'Orange Money',
      invoice: 'INV-2024-001'
    },
    {
      id: '2',
      date: '2024-07-01',
      amount: 300,
      status: 'Paid',
      method: 'Orange Money',
      invoice: 'INV-2024-002'
    },
    {
      id: '3',
      date: '2024-04-01',
      amount: 300,
      status: 'Paid',
      method: 'Orange Money',
      invoice: 'INV-2024-003'
    },
    {
      id: '4',
      date: '2024-01-01',
      amount: 300,
      status: 'Paid',
      method: 'Orange Money',
      invoice: 'INV-2024-004'
    }
  ]

  const usagePercentage = (subscriptionData.currentStudents / subscriptionData.studentLimit) * 100

  const getStatusColor = (status: string) => {
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white font-poppins">Facturation et Abonnement</h1>
          <p className="text-slate-400 mt-2 font-poppins">Gérez l'abonnement et les paiements de votre école</p>
        </div>

        {/* Current Subscription */}
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-white font-poppins">Abonnement Actuel</h2>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              subscriptionData.status === 'Active' 
                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
            }`}>
              {subscriptionData.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">{subscriptionData.plan} Plan</h3>
              <p className="text-3xl font-bold text-blue-400">
                ${subscriptionData.price}
                <span className="text-lg font-normal text-slate-400">
                  /{subscriptionData.billingCycle === 'Monthly' ? 'mo' : subscriptionData.billingCycle === 'Quarterly' ? 'qtr' : 'yr'}
                </span>
              </p>
              <p className="text-sm text-slate-400 mt-1 font-poppins">{subscriptionData.billingCycle} billing</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">Student Usage</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      usagePercentage > 90 ? 'bg-red-500' : 
                      usagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white font-poppins">
                  {subscriptionData.currentStudents}/{subscriptionData.studentLimit}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-poppins">
                {Math.round(usagePercentage)}% of plan limit used
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 font-poppins">Next Payment</h3>
              <p className="text-lg font-semibold text-white font-poppins">
                {new Date(subscriptionData.nextPayment).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-400 font-poppins">
                {subscriptionData.autoRenew ? 'Auto-renewal enabled' : 'Manual renewal required'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-lg">{getPaymentMethodIcon(subscriptionData.paymentMethod)}</span>
                <div>
                  <p className="font-medium text-white font-poppins">Payment Method</p>
                  <p className="text-sm text-slate-400 font-poppins">{subscriptionData.paymentMethod}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary"
                >
                  Make Payment
                </button>
                <button 
                  className="btn-secondary"
                >
                  Cancel Subscription
                </button>
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
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-poppins">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {paymentHistory.map((payment) => (
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

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{margin: 0}}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Make Payment</h3>
                <div className="space-y-4">
                  <div className="bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-medium text-white font-poppins">{subscriptionData.plan} Plan</h4>
                    <p className="text-sm text-slate-400 font-poppins">Amount: ${subscriptionData.price}</p>
                    <p className="text-sm text-slate-400 font-poppins">Billing: {subscriptionData.billingCycle}</p>
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
                    <button className="btn-primary">
                      Process Payment
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