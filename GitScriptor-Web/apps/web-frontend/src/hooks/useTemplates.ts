import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

// Query keys for templates
export const templateKeys = {
  all: ['templates'] as const,
  styles: () => [...templateKeys.all, 'styles'] as const,
}

// Hook to get available templates and styles
export const useTemplatesAndStyles = () => {
  return useQuery({
    queryKey: templateKeys.styles(),
    queryFn: () => api.getTemplatesAndStyles(),
    staleTime: 10 * 60 * 1000, // 10 minutes - templates don't change often
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}
