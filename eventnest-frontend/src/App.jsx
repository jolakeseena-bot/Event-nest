import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar-New'
import Footer from './components/Footer'
import Home from './pages/Home-Modern'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import EditEvent from './pages/EditEvent'
import Bookmarks from './pages/Bookmarks'
import UserProfile from './pages/UserProfile'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './pages/NotFound'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/design-system.css'
import './styles/navbar-modern.css'
import './styles/home-modern.css'
import './styles/footer.css'
import './styles/create-event.css'
import './styles/dashboard.css'
import './styles/bookmarks.css'
import './styles/profile.css'
import './styles/auth.css'
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="app-layout">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } />
              <Route path="/create-event" element={
                <PrivateRoute>
                  <CreateEvent />
                </PrivateRoute>
              } />
              <Route path="/edit-event/:id" element={
                <PrivateRoute>
                  <EditEvent />
                </PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/bookmarks" element={
                <PrivateRoute>
                  <Bookmarks />
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
