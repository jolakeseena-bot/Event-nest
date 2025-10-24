import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const UserContext = createContext()

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  useEffect(() => {
    if (token) {
      // The api.js client handles auth tokens automatically
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      // For MVP, we don't have a /api/users/me endpoint
      // Just decode the token and set basic user info
      if (token) {
        // In a full implementation, you'd fetch user data from backend
        // For now, we'll just mark user as authenticated
        setUser({ authenticated: true, token })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password })
      const { token: authToken, user: userData } = res.data

      localStorage.setItem('authToken', authToken)
      if (userData) {
        localStorage.setItem('userId', userData.id)
        localStorage.setItem('userName', userData.name)
        setUser({
          authenticated: true,
          token: authToken,
          ...userData
        })
      }
      setToken(authToken)

      // Fetch user data
      await fetchUser()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData)
      const { token: authToken, user: userInfo } = res.data

      localStorage.setItem('authToken', authToken)
      if (userInfo) {
        localStorage.setItem('userId', userInfo.id)
        localStorage.setItem('userName', userInfo.name)
        setUser({
          authenticated: true,
          token: authToken,
          ...userInfo
        })
      }
      setToken(authToken)

      // Fetch user data
      await fetchUser()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed'
      }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    token
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
