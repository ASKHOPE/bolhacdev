import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MaintenanceWrapper } from './components/MaintenanceWrapper'
import { PageWrapper } from './components/PageWrapper'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'

// Pages
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Programs } from './pages/Programs'
import { ProgramDetail } from './pages/ProgramDetail'
import { Events } from './pages/Events'
import { Contact } from './pages/Contact'
import { Donate } from './pages/Donate'
import { DonationSuccess } from './pages/DonationSuccess'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminEvents } from './pages/admin/AdminEvents'
import { AdminDonations } from './pages/admin/AdminDonations'
import { AdminAnalytics } from './pages/admin/AdminAnalytics'
import { AdminContent } from './pages/admin/AdminContent'
import { AdminSettings } from './pages/admin/AdminSettings'
import { AdminContacts } from './pages/admin/AdminContacts'
import { AdminNewsletter } from './pages/admin/AdminNewsletter'
import { AdminPrograms } from './pages/admin/AdminPrograms'
import { AdminProjects } from './pages/admin/AdminProjects'
import { AdminTheme } from './pages/admin/AdminTheme'
import { AdminStats } from './pages/admin/AdminStats'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <MaintenanceWrapper>
            <div className="min-h-screen flex flex-col">
              <Routes>
                {/* Admin Routes - No protection for now */}
                <Route path="/admin/*" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="programs" element={<AdminPrograms />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="donations" element={<AdminDonations />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="stats" element={<AdminStats />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="contacts" element={<AdminContacts />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                  <Route path="theme" element={<AdminTheme />} />
                </Route>

                {/* Public Routes with Navbar and Footer */}
                <Route
                  path="/*"
                  element={
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <PageWrapper>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/programs" element={<Programs />} />
                            <Route path="/programs/:programId" element={<ProgramDetail />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/donate" element={<Donate />} />
                            <Route path="/donation-success" element={<DonationSuccess />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute>
                                  <Dashboard />
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                        </PageWrapper>
                      </main>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </div>
          </MaintenanceWrapper>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App