import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../services/api'

// Query keys for React Query
export const repositoryKeys = {
  all: ['repositories'] as const,
  lists: () => [...repositoryKeys.all, 'list'] as const,
  list: (filters: string) => [...repositoryKeys.lists(), { filters }] as const,
  search: (query: string) => [...repositoryKeys.all, 'search', query] as const,
}

// Hook to get user repositories
export const useUserRepositories = (params: {
  sort?: 'stars' | 'updated' | 'created' | 'name'
  direction?: 'asc' | 'desc'
  language?: string
  type?: 'all' | 'public' | 'private'
  page?: number
  per_page?: number
} = {}) => {
  return useQuery({
    queryKey: repositoryKeys.list(JSON.stringify(params)),
    queryFn: () => api.getUserRepositories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Will be controlled by auth context
  })
}

// Hook to search repositories
export const useRepositorySearch = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: repositoryKeys.search(query),
    queryFn: () => api.searchRepositories(query, limit),
    enabled: query.length > 2, // Only search if query is long enough
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to sync user repositories from GitHub
export const useSyncRepositories = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // This would call an API endpoint to sync repos from GitHub
      // For now, we'll just invalidate the cache to refetch
      return { success: true }
    },
    onSuccess: () => {
      // Invalidate and refetch repositories
      queryClient.invalidateQueries({ queryKey: repositoryKeys.all })
    },
    onError: (error: ApiError) => {
      console.error('Repository sync failed:', error)
    },
  })
}
