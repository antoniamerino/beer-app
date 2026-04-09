import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import BeerDetailPage from './pages/BeerDetailPage'
import LoginPage from './pages/LoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AddBeerPage from './pages/admin/AddBeerPage'
import AdminBeerPage from './pages/admin/AdminBeerPage'
import AdminConfigPage from './pages/admin/AdminConfigPage'
import StatsPage from './pages/admin/StatsPage'
import QuizPage from './pages/QuizPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/beer/:id" element={<BeerDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/beer/new" element={<AddBeerPage />} />
              <Route path="/admin/beer/:id" element={<AdminBeerPage />} />
              <Route path="/admin/config" element={<AdminConfigPage />} />
              <Route path="/admin/stats" element={<StatsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
