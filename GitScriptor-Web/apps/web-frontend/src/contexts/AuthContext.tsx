import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { api, User, ApiError } from '../services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isGuest: boolean
  tokenNearExpiry?: boolean
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
  | { type: 'SET_TOKEN_WARNING'; payload: boolean }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isGuest: false,
  tokenNearExpiry: false,
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
    case 'SET_TOKEN_WARNING':
      return { ...state, tokenNearExpiry: action.payload }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'gitscriptor_auth_token'
const TOKEN_METADATA_KEY = 'gitscriptor_token_metadata'

// Helper functions for enhanced token management
const storeTokenWithMetadata = (token: string) => {
  const metadata = {
    timestamp: Date.now(),
    lastValidated: Date.now(),
    version: '1.0'
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(TOKEN_METADATA_KEY, JSON.stringify(metadata))
}

const getTokenMetadata = () => {
  try {
    const metadata = localStorage.getItem(TOKEN_METADATA_KEY)
    return metadata ? JSON.parse(metadata) : null
  } catch {
    return null
  }
}

const updateTokenValidation = () => {
  const metadata = getTokenMetadata()
  if (metadata) {
    metadata.lastValidated = Date.now()
    localStorage.setItem(TOKEN_METADATA_KEY, JSON.stringify(metadata))
  }
}

const clearTokenData = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(TOKEN_METADATA_KEY)
  localStorage.removeItem('auth_mode')
}

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
      const metadata = getTokenMetadata()
      
      console.log('InitAuth - Token exists:', !!token, 'Auth mode:', authMode, 'Metadata:', metadata)
      
      if (authMode === 'guest') {
        dispatch({ type: 'SET_GUEST', payload: true })
        return
      }
      
      if (token) {
        // Check if token is too old (older than 25 days - 5 day buffer before 30 day expiry)
        const tokenAge = metadata ? (Date.now() - metadata.timestamp) / (1000 * 60 * 60 * 24) : 0
        if (tokenAge > 25) {
          console.log('Token is too old, clearing...')
          clearTokenData()
          api.clearAuthToken()
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        api.setAuthToken(token)
        try {
          const user = await api.getCurrentUser()
          console.log('Token validation successful, user:', user.username)
          updateTokenValidation()
          dispatch({ type: 'SET_USER', payload: user })
        } catch (error) {
          console.error('Token validation failed:', error)
          clearTokenData()
          api.clearAuthToken()
          dispatch({ type: 'SET_USER', payload: null })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  // Periodic token validation (every 15 minutes for better UX)
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (state.isAuthenticated && !state.isGuest) {
      interval = setInterval(async () => {
        try {
          await api.getCurrentUser()
          console.log('Token heartbeat: OK')
          updateTokenValidation()
          
          // Check if token is nearing expiry
          const nearExpiry = api.isTokenNearExpiry()
          if (nearExpiry !== state.tokenNearExpiry) {
            dispatch({ type: 'SET_TOKEN_WARNING', payload: nearExpiry })
          }
        } catch (error) {
          console.log('Token heartbeat: Failed, will retry once before logging out')
          // Retry once before giving up
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            await api.getCurrentUser()
            console.log('Token heartbeat retry: OK')
            updateTokenValidation()
          } catch (retryError) {
            console.log('Token heartbeat retry: Failed, logging out')
            await logout()
          }
        }
      }, 15 * 60 * 1000) // 15 minutes - less aggressive
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [state.isAuthenticated, state.isGuest])

  // Validate token when user returns to the tab (with retry logic)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated && !state.isGuest) {
        try {
          await api.getCurrentUser()
          console.log('Tab focus: Token validation OK')
          updateTokenValidation()
        } catch (error) {
          console.log('Tab focus: Token validation failed, retrying once...')
          // Retry once before logging out - network might be temporarily down
          try {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
            await api.getCurrentUser()
            console.log('Tab focus retry: Token validation OK')
            updateTokenValidation()
          } catch (retryError) {
            console.log('Tab focus retry: Token invalid, logging out')
            await logout()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isAuthenticated, state.isGuest])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (code) {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
          const response = await api.githubCallback(code)
          
          // Store token with enhanced metadata
          storeTokenWithMetadata(response.access_token)
          api.setAuthToken(response.access_token)
          
          console.log('OAuth successful, user:', response.user.username)
          
          // Use the user data from the response directly
          dispatch({ type: 'SET_USER', payload: response.user })
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          const apiError = error as ApiError
          console.error('OAuth callback failed:', apiError)
          console.error('Full error details:', error)
          console.error('Error type:', typeof error)
          console.error('Error message:', apiError.message || 'Unknown error')
          
          // Don't automatically fallback to guest mode - let user choose
          dispatch({ type: 'SET_ERROR', payload: `Authentication failed: ${apiError.message || 'Unknown error'}. Please try signing in again.` })
          dispatch({ type: 'SET_LOADING', payload: false })
          
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
      dispatch({ type: 'CLEAR_ERROR' })
      
      const oauthUrl = await api.githubLogin()
      console.log('Redirecting to GitHub OAuth:', oauthUrl)
      
      // Redirect to GitHub OAuth
      window.location.href = oauthUrl
    } catch (error) {
      const apiError = error as ApiError
      console.error('Login initiation failed:', apiError)
      
      // Don't automatically fallback to guest mode - show error and let user choose
      dispatch({ type: 'SET_ERROR', payload: `GitHub sign-in failed: ${apiError.message || 'Unknown error'}. Please try again or continue as guest.` })
      dispatch({ type: 'SET_LOADING', payload: false })
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
      clearTokenData()
      api.clearAuthToken()
      dispatch({ type: 'LOGOUT' })
    }
  }
  const refreshUser = async () => {
    if (!state.isAuthenticated) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const user = await api.getCurrentUser()
      updateTokenValidation()
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      const apiError = error as ApiError
      console.error('User refresh failed:', apiError)
      
      if (apiError.type === 'auth' || apiError.statusCode === 401) {
        // Token expired or invalid, logout
        console.log('Token invalid, logging out...')
        await logout()
      } else {
        dispatch({ type: 'SET_ERROR', payload: apiError.message || 'Failed to refresh user' })
        dispatch({ type: 'SET_LOADING', payload: false })
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
