import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import ContactRegistration from './pages/ContactRegistration'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SchoolAdminDashboard from './pages/SchoolAdminDashboard'
import SchoolsManagement from './pages/SuperAdmin/SchoolsManagement'
import SubscriptionsManagement from './pages/SuperAdmin/SubscriptionsManagement'
import ContentManagement from './pages/SuperAdmin/ContentManagement'
import ContactsManagement from './pages/SuperAdmin/ContactsManagement'
import StudentsManagement from './pages/SchoolAdmin/StudentsManagement'
import SchoolProfile from './pages/SchoolAdmin/SchoolProfile'
import SchoolBilling from './pages/SchoolAdmin/SchoolBilling'
import SchoolContent from './pages/SchoolAdmin/SchoolContent'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/contact-registration" element={<ContactRegistration />} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/schools" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SchoolsManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/subscriptions" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SubscriptionsManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/content" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <ContentManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/contacts" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <ContactsManagement />
            </ProtectedRoute>
          } />
          
          {/* School Admin Routes */}
          <Route path="/school-admin" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/students" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <StudentsManagement />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/profile" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <SchoolProfile />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/billing" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <SchoolBilling />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/content" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <SchoolContent />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
  )
}

export default App
