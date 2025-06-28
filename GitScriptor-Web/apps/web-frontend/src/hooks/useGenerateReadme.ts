import { useMutation } from '@tanstack/react-query'
import { api, GenerateRequest, GenerateResponse, ApiError } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export interface GenerateError extends Error {
  statusCode?: number
  type?: 'network' | 'auth' | 'not-found' | 'server' | 'validation' | 'unknown'
}

export const useGenerateReadme = () => {
  const { isAuthenticated, isGuest } = useAuth()

  return useMutation<GenerateResponse, ApiError, GenerateRequest>({
    mutationFn: api.generateReadme.bind(api),
    onError: (error) => {
      console.error('README generation failed:', error)
      
      // Handle authentication errors for non-guest users
      if (error.type === 'auth' && !isGuest) {
        console.warn('Authentication required for README generation')
      }
    },
    retry: (failureCount: number, error: ApiError) => {
      // Don't retry auth errors if not in guest mode, only network errors (max 2 retries)
      if (error.type === 'auth' && !isGuest) {
        return false
      }
      return error.type === 'network' && failureCount < 2
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Allow generation for both authenticated and guest users
    mutationKey: ['generateReadme', isAuthenticated || isGuest],
  })
}
