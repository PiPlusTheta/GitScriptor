import React, { useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Stack,
  Container,
  Alert,
} from '@mui/material'
import { GitHub, Autorenew } from '@mui/icons-material'
import RepoInput from '../components/RepoInput'
import ReadmeViewer from '../components/ReadmeViewer'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorAlert from '../components/ErrorAlert'
import { useGenerateReadme, GenerateError } from '../hooks/useGenerateReadme'
import { useDynamicFavicon } from '../hooks/useDynamicFavicon'
import { useAuth } from '../contexts/AuthContext'
import { useUserRepositories } from '../hooks/useRepositories'

const HomePage: React.FC = () => {
  const generateReadme = useGenerateReadme()
  const { user, isAuthenticated, isGuest, login, continueAsGuest, error, isLoading } = useAuth()
  
  // Get user repositories if authenticated
  const { data: userReposData } = useUserRepositories(
    { per_page: 10, sort: 'updated' },
  )
  
  // Dynamic favicon management
  useDynamicFavicon({
    status: generateReadme?.isPending ? 'loading' : 
            generateReadme?.error ? 'error' :
            generateReadme?.data ? 'success' : 'idle'
  })

  // Update page title based on status
  useEffect(() => {
    if (generateReadme?.isPending) {
      document.title = 'Generating README... | GitScriptor'
    } else if (generateReadme?.data) {
      document.title = 'README Generated! | GitScriptor'
    } else if (generateReadme?.error) {
      document.title = 'Error | GitScriptor'
    } else {
      document.title = 'GitScriptor - AI-Powered README Generator'
    }
  }, [generateReadme?.isPending, generateReadme?.data, generateReadme?.error])

  // Get repositories for suggestions
  const userRepos = isAuthenticated && userReposData?.repositories?.map(repo => repo.url) || [
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
    'https://github.com/vercel/next.js',
    'https://github.com/nodejs/node',
    'https://github.com/tensorflow/tensorflow'
  ]

  const handleSignIn = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleContinueAsGuest = () => {
    continueAsGuest()
  }

  const handleGenerate = (url: string) => {
    generateReadme.mutate({ repo_url: url })
  }

  const handleRetry = () => {
    if (generateReadme?.variables) {
      generateReadme.mutate(generateReadme.variables)
    }
  }

  // Show authentication choice if not authenticated and not in guest mode
  if (!isAuthenticated && !isGuest && !isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <GitHub sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Welcome to GitScriptor
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            AI-powered README generator for your GitHub repositories
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GitHub />}
            onClick={handleSignIn}
            sx={{ py: 1.5 }}
          >
            Sign in with GitHub
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleContinueAsGuest}
            sx={{ py: 1.5 }}
          >
            Continue as Guest
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Sign in to access your private repositories and get personalized suggestions
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          {isAuthenticated ? `Welcome back, ${user?.name || user?.login}!` : 'Welcome to GitScriptor'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAuthenticated 
            ? 'Generate professional READMEs for your repositories' 
            : 'Generate professional READMEs for any public GitHub repository'
          }
        </Typography>
      </Box>

      {/* Repository Input Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate README
        </Typography>
        <RepoInput
          onGenerate={handleGenerate}
          suggestions={userRepos}
          disabled={generateReadme?.isPending}
          placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
        />
        {generateReadme?.isPending && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Generating README... This may take a few moments.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Results Section */}
      {generateReadme?.isPending && (
        <Paper sx={{ p: 4, mb: 4 }}>
          <LoadingSkeleton />
        </Paper>
      )}

      {generateReadme?.error && (
        <Box sx={{ mb: 4 }}>
          <ErrorAlert 
            error={generateReadme.error as GenerateError}
            onRetry={handleRetry}
          />
        </Box>
      )}

      {generateReadme?.data && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Generated README
            </Typography>
            <Button
              startIcon={<Autorenew />}
              onClick={handleRetry}
              variant="outlined"
              size="small"
            >
              Regenerate
            </Button>
          </Box>
          <ReadmeViewer readme={generateReadme.data} />
        </Paper>
      )}

      {/* Quick Start for Authenticated Users */}
      {isAuthenticated && userReposData?.repositories && userReposData.repositories.length > 0 && (
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Recent Repositories
          </Typography>
          <Stack spacing={1}>
            {userReposData.repositories.slice(0, 5).map((repo) => (
              <Box
                key={repo.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {repo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {repo.description || 'No description'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleGenerate(repo.url)}
                  disabled={generateReadme?.isPending}
                >
                  Generate README
                </Button>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Container>
  )
}

export default HomePage
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center" 
          sx={{ mb: 4 }}
        >
          <Chip 
            icon={<AutoAwesome sx={{ color: '#ffffff !important' }} />}
            label="Powered by Gemini AI"
            size="small"
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(-45deg, #3d3b8e, #5a2d7a, #7d4b9c, #2d5f8f)',
              backgroundSize: '400% 400%',
              animation: 'geminiChipGradient 6s ease infinite',
              color: '#ffffff',
              fontSize: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(61, 59, 142, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              '@keyframes geminiChipGradient': {
                '0%': {
                  backgroundPosition: '0% 50%',
                },
                '50%': {
                  backgroundPosition: '100% 50%',
                },
                '100%': {
                  backgroundPosition: '0% 50%',
                },
              },
              '&:hover': {
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 30px rgba(61, 59, 142, 0.5)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              },
            }}
          />
          <Chip 
            label="Free & Open Source"
            size="small"
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(-45deg, #d4787c, #e0b8c9, #e0b8c9, #e6c79d)',
              backgroundSize: '400% 400%',
              animation: 'openSourceGradient 6s ease infinite',
              color: '#2d2d2d',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 15px rgba(212, 120, 124, 0.3)',
              transition: 'all 0.3s ease',
              '@keyframes openSourceGradient': {
                '0%': {
                  backgroundPosition: '0% 50%',
                },
                '50%': {
                  backgroundPosition: '100% 50%',
                },
                '100%': {
                  backgroundPosition: '0% 50%',
                },
              },
              '&:hover': {
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 25px rgba(212, 120, 124, 0.4)',
              },
            }}
          />
        </Stack>

        {/* User Status Indicator */}
        {(isAuthenticated || isGuest) && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Chip
              label={
                isAuthenticated 
                  ? `👋 Welcome back, ${user?.name || user?.username}!`
                  : '🌐 Guest Mode - Public repositories only'
              }
              variant="outlined"
              size="small"
              color={isAuthenticated ? 'success' : 'default'}
              sx={{ 
                fontWeight: 500,
                backgroundColor: isAuthenticated ? 'rgba(76, 175, 80, 0.08)' : 'rgba(158, 158, 158, 0.08)',
                borderColor: isAuthenticated ? 'success.light' : 'grey.400'
              }}
            />
          </Box>
        )}
      </Box>

      {/* Input Section */}
      {generateReadme?.isPending ? (
        <LoadingSkeleton />
      ) : (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            🚀 Get Started
          </Typography>
          <RepoInput 
            onGenerate={handleGenerate} 
            isLoading={generateReadme?.isPending || false}
            isAuthenticated={isAuthenticated || isGuest}
            userRepos={userRepos}
            isGuest={isGuest}
          />
        </Paper>
      )}

      {/* Sign In Banner for unauthenticated users */}
      {!isAuthenticated && !isGuest && (
        <SignInBanner 
          onSignIn={handleSignIn} 
          onContinueAsGuest={handleContinueAsGuest}
          hasAuthError={!!error}
        />
      )}

      {/* Error Section */}
      {generateReadme?.error && (
        <ErrorAlert
          error={generateReadme.error as GenerateError}
          onRetry={handleRetry}
          isRetrying={generateReadme?.isPending || false}
        />
      )}

      {/* Results Section */}
      {generateReadme?.data && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📝 Generated README
            </Typography>
            <Chip 
              label={`Generated in ${generateReadme.data?.elapsed_ms || 0}ms`}
              size="small"
              color="success"
              sx={{ fontWeight: 500 }}
            />
          </Box>
          <Divider sx={{ mb: 3 }} />
          <ReadmeViewer markdown={generateReadme.data?.markdown || ''} />
        </Paper>
      )}

      {/* OAuth and Guest Mode Test Component */}
      <OAuthGuestModeTest />

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 4, mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        
        {/* Temporary API Test Component - Remove in production */}
        {/* <ApiTestComponent />
        <Divider sx={{ my: 4 }} />
        
        <AuthenticationTest />
        <Divider sx={{ my: 4 }} /> */}
        
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Built with ❤️ using React, FastAPI, and Google Gemini AI
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center"
        >
          <Chip 
            icon={<GitScriptorIcon fontSize="small" animated variant="minimal" />}
            label="GitScriptor"
            variant="outlined"
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
                color: 'primary.main',
                transform: 'translateY(-2px)',
              }
            }}
          />
          <Chip 
            label="Documentation"
            variant="outlined"
            size="small"
            sx={{ color: 'text.secondary' }}
          />
          <Chip 
            label="API Reference"
            variant="outlined"
            size="small"
            sx={{ color: 'text.secondary' }}
          />
          <Chip 
            icon={<GitHubIcon fontSize="small" animated />}
            label="GitHub"
            variant="outlined"
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
                color: 'primary.main',
                transform: 'translateY(-2px)',
              }
            }}
          />
        </Stack>
      </Box>
    </Box>
  )
}

export default HomePage
