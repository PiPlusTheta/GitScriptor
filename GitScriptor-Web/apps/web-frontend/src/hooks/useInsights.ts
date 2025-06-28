import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// Types for insights data
export interface GenerationStats {
  total_generations: number
  successful_generations: number
  failed_generations: number
  average_generation_time: number
  total_tokens_used: number
  most_used_style: string
  generations_by_month: Record<string, number>
  popular_languages: Record<string, number>
}

export interface RepositoryStats {
  total_repositories: number
  public_repositories: number
  private_repositories: number
  total_stars: number
  total_forks: number
}

// Hook to get generation statistics
export const useGenerationStats = () => {
  const { isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['insights', 'generation-stats'],
    queryFn: () => api.getGenerationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  })
}

// Hook to get repository statistics 
export const useRepositoryStats = () => {
  const { isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['insights', 'repository-stats'],
    queryFn: async () => {
      const repoData = await api.getUserRepositories({ per_page: 100 })
      
      // Calculate stats from repository data
      const stats: RepositoryStats = {
        total_repositories: repoData.total,
        public_repositories: repoData.repositories.filter(r => !r.is_private).length,
        private_repositories: repoData.repositories.filter(r => r.is_private).length,
        total_stars: repoData.repositories.reduce((sum, repo) => sum + repo.stars_count, 0),
        total_forks: repoData.repositories.reduce((sum, repo) => sum + repo.forks_count, 0),
      }
      
      return stats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  })
}
