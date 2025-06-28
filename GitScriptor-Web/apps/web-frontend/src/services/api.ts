// GitScriptor API Client
export interface ApiConfig {
  baseUrl: string
  timeout?: number
}

export interface GenerateRequest {
  repo_url: string
  style?: 'classic' | 'modern' | 'minimal' | 'comprehensive'
  include_sections?: Record<string, boolean>
  template_id?: string
  custom_sections?: string[]
  ai_model?: 'default' | 'advanced' | 'premium'
}

export interface GenerateResponse {
  success: boolean
  markdown: string
  elapsed_ms: number
  style: string
  template_used?: string
  sections_generated: string[]
  word_count?: number
  repository?: Record<string, any>
  metadata?: Record<string, any>
  generation_id?: string
}

export interface Repository {
  id: number
  name: string
  full_name: string
  description?: string
  url: string
  language?: string
  stars_count: number
  forks_count: number
  is_private: boolean
  default_branch: string
}

export interface User {
  id: number
  username: string
  email?: string
  name?: string
  avatar_url?: string
  bio?: string
  location?: string
  company?: string
  blog?: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  is_active: boolean
}

export interface AuthTokens {
  access_token: string
  token_type: string
  expires_in?: number
}

export interface LoginResponse {
  user: User
  access_token: string
  token_type: string
  message: string
}

export interface ApiError extends Error {
  statusCode?: number
  type?: 'network' | 'auth' | 'not-found' | 'server' | 'validation' | 'unknown'
  errors?: any[]
}

class GitScriptorAPI {
  private config: ApiConfig
  private authToken?: string

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }
  }

  setAuthToken(token: string) {
    this.authToken = token
    console.log('API: Auth token set')
  }

  clearAuthToken() {
    this.authToken = undefined
    console.log('API: Auth token cleared')
  }

  getConfig() {
    return this.config
  }

  // Check if token is nearing expiry (useful for proactive warnings)
  isTokenNearExpiry(): boolean {
    try {
      const tokenMetadata = localStorage.getItem('gitscriptor_token_metadata')
      if (!tokenMetadata) return false
      
      const metadata = JSON.parse(tokenMetadata)
      const tokenAge = (Date.now() - metadata.timestamp) / (1000 * 60 * 60 * 24) // days
      
      // Warn if token is older than 28 days (2 days before 30 day expiry)
      return tokenAge > 28
    } catch {
      return false
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    })

    if (this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error() as ApiError
        error.statusCode = response.status

        try {
          const errorData = await response.json()
          error.message = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`
          error.errors = errorData.errors
        } catch {
          error.message = `HTTP ${response.status}: ${response.statusText}`
        }

        // Categorize error types based on status codes
        if (response.status === 401) {
          error.type = 'auth'
          error.message = 'Authentication required - please sign in again'
          console.log('API: 401 error - token may be expired')
        } else if (response.status === 403) {
          error.type = 'auth'
          error.message = 'Access forbidden'
        } else if (response.status === 404) {
          error.type = 'not-found'
          error.message = error.message || 'Resource not found'
        } else if (response.status === 422) {
          error.type = 'validation'
          error.message = error.message || 'Validation error'
        } else if (response.status >= 500) {
          error.type = 'server'
          error.message = 'Server error occurred. Please try again.'
        } else {
          error.type = 'unknown'
        }

        throw error
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('Failed to connect to server. Please check your connection.') as ApiError
        networkError.type = 'network'
        throw networkError
      }

      if ((error as any)?.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. Please try again.') as ApiError
        timeoutError.type = 'network'
        throw timeoutError
      }

      throw error
    }
  }

  // Health and Status
  async healthCheck(): Promise<{ ok: boolean }> {
    return this.request('/health/')
  }

  async getStatus(): Promise<any> {
    return this.request('/status')
  }

  // Generate README
  async generateReadme(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request('/generate/', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Authentication
  async githubLogin(): Promise<string> {
    // The backend redirects to GitHub OAuth, so we return the URL directly
    return `${this.config.baseUrl}/auth/login`
  }

  async githubCallback(code: string): Promise<LoginResponse> {
    return this.request(`/auth/callback?code=${encodeURIComponent(code)}`)
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', { method: 'POST' })
  }

  // User Management
  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me')
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // User Settings
  async getUserSettings(): Promise<any> {
    return this.request('/user/settings')
  }

  async updateUserSettings(updates: any): Promise<any> {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // User Profile Extended
  async getUserProfile(): Promise<any> {
    return this.request('/user/profile')
  }

  // Repositories
  async getUserRepositories(params: {
    sort?: 'stars' | 'updated' | 'created' | 'name'
    direction?: 'asc' | 'desc'
    language?: string
    type?: 'all' | 'public' | 'private'
    page?: number
    per_page?: number
  } = {}): Promise<{
    repositories: Repository[]
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString())
      }
    })

    return this.request(`/repositories/?${query.toString()}`)
  }

  async searchRepositories(query: string, limit: number = 10): Promise<Repository[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    })
    return this.request(`/search/repositories?${params.toString()}`)
  }

  async getRepository(id: number): Promise<Repository> {
    return this.request(`/repositories/${id}`)
  }

  async getRepositoryAnalytics(id: number): Promise<any> {
    return this.request(`/repositories/${id}/analytics`)
  }

  async syncRepositories(): Promise<{ message: string; total_repositories: number }> {
    return this.request('/repositories/sync')
  }

  // Generation History
  async getGenerationHistory(params: {
    page?: number
    per_page?: number
    status?: 'completed' | 'failed' | 'pending'
    style?: string
    repository_id?: number
  } = {}): Promise<any> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString())
      }
    })

    return this.request(`/history/?${query.toString()}`)
  }

  async getGenerationStats(): Promise<any> {
    return this.request('/history/stats')
  }

  // Templates and Styles
  async getTemplatesAndStyles(): Promise<any> {
    return this.request('/templates/')
  }
}

// Create API instance with environment configuration
const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
}

export const api = new GitScriptorAPI(apiConfig)

// Initialize API with any stored auth token
const initializeAPI = () => {
  const storedToken = localStorage.getItem('gitscriptor_auth_token')
  console.log('API Initialization: Token found in localStorage:', !!storedToken)
  
  if (storedToken) {
    try {
      // Token is stored directly as a string
      api.setAuthToken(storedToken)
      console.log('API Initialization: Token loaded successfully')
    } catch (error) {
      console.warn('Invalid stored auth token, clearing...', error)
      localStorage.removeItem('gitscriptor_auth_token')
      localStorage.removeItem('auth_mode')
    }
  }
}

// Initialize on import
initializeAPI()
