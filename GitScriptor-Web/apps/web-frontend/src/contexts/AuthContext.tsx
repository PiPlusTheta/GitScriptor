import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { api, User, ApiError } from '../services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isGuest: boolean
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>
  logout: () => Promise<void>
  continueAsGuest: () => void
  refreshUser: () => Promise<void>
  clearError: () => void
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_GUEST'; payload: boolean }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isGuest: false,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
        isGuest: false,
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_GUEST':
      return { 
        ...state, 
        isGuest: action.payload, 
        isLoading: false, 
        error: null,
        user: null,
        isAuthenticated: false 
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'gitscriptor_auth_token'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load token from localStorage and validate on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const authMode = localStorage.getItem('auth_mode')
      
      if (authMode === 'guest') {
        dispatch({ type: 'SET_GUEST', payload: true })
        return
      }
      
      if (token) {
        api.setAuthToken(token)
        try {
          const user = await api.getCurrentUser()
          dispatch({ type: 'SET_USER', payload: user })
        } catch (error) {
          console.error('Token validation failed:', error)
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          api.clearAuthToken()
          dispatch({ type: 'SET_USER', payload: null })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (code) {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
          const response = await api.githubCallback(code)
          
          // Store token
          localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token)
          api.setAuthToken(response.access_token)
          
          // Use the user data from the response directly
          dispatch({ type: 'SET_USER', payload: response.user })
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          const apiError = error as ApiError
          console.error('OAuth callback failed:', apiError)
          
          // Automatically fallback to guest mode on OAuth failure
          dispatch({ type: 'SET_ERROR', payload: 'Authentication failed. Continuing as guest instead.' })
          dispatch({ type: 'SET_GUEST', payload: true })
          localStorage.setItem('auth_mode', 'guest')
          
          // Clean up URL even on error
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }

    handleOAuthCallback()
  }, [])

  const login = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const oauthUrl = await api.githubLogin()
      
      // Redirect to GitHub OAuth
      window.location.href = oauthUrl
    } catch (error) {
      const apiError = error as ApiError
      console.error('Login initiation failed:', apiError)
      
      // Fallback to guest mode if login fails
      dispatch({ type: 'SET_ERROR', payload: 'GitHub sign-in failed. Continuing as guest instead.' })
      dispatch({ type: 'SET_GUEST', payload: true })
      localStorage.setItem('auth_mode', 'guest')
    }
  }

  const continueAsGuest = () => {
    dispatch({ type: 'SET_GUEST', payload: true })
    localStorage.setItem('auth_mode', 'guest')
  }

  const logout = async () => {
    try {
      if (state.isAuthenticated) {
        await api.logout()
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state regardless of API call result
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem('auth_mode')
      api.clearAuthToken()
      dispatch({ type: 'LOGOUT' })
    }
  }

  const refreshUser = async () => {
    if (!state.isAuthenticated) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const user = await api.getCurrentUser()
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.type === 'auth') {
        // Token expired or invalid, logout
        await logout()
      } else {
        dispatch({ type: 'SET_ERROR', payload: apiError.message || 'Failed to refresh user' })
      }
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    continueAsGuest,
    refreshUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
