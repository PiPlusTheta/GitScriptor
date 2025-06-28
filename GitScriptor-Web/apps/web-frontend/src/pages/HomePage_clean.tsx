import React, { useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Stack,
  Container,
  Alert,
  Chip,
} from '@mui/material'
import { GitHub, Autorenew, AutoAwesome } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import RepoInput from '../components/RepoInput'
import ReadmeViewer from '../components/ReadmeViewer'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorAlert from '../components/ErrorAlert'
import { useGenerateReadme, GenerateError } from '../hooks/useGenerateReadme'
import { useDynamicFavicon } from '../hooks/useDynamicFavicon'
import { useAuth } from '../contexts/AuthContext'
import { useUserRepositories } from '../hooks/useRepositories'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
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

  // Demo repositories
  const demoRepos = [
    { url: 'https://github.com/facebook/react', name: 'React', description: 'A declarative JavaScript library' },
    { url: 'https://github.com/microsoft/vscode', name: 'VS Code', description: 'Code editor redefined' },
    { url: 'https://github.com/vercel/next.js', name: 'Next.js', description: 'The React framework' },
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

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GitHub />}
            onClick={handleSignIn}
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
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
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Chip 
            icon={<AutoAwesome />}
            label="AI-Powered"
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Typography 
          variant="h1" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 600,
            mb: 2,
          }}
        >
          Generate beautiful READMEs
        </Typography>
        
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 400,
            mb: 4,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Transform any GitHub repository into professional documentation with AI-powered insights
        </Typography>

        {/* URL Input Section */}
        <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', mb: 6 }}>
          <RepoInput onGenerate={handleGenerate} isLoading={generateReadme?.isPending} />
        </Box>

        {/* Demo Repositories Section */}
        <Box sx={{ 
          width: '100%', 
          maxWidth: '800px', 
          mx: 'auto',
          mt: 4,
          mb: 6
        }}>
          <Typography variant="h6" component="h3" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Or try these popular repositories
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {demoRepos.map((repo) => (
              <Button
                key={repo.url}
                variant="outlined"
                onClick={() => handleGenerate(repo.url)}
                disabled={generateReadme?.isPending}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  textTransform: 'none',
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {repo.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {repo.description}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Error Display */}
      {generateReadme?.error && (
        <Box sx={{ mt: 4 }}>
          <ErrorAlert 
            error={generateReadme.error as GenerateError}
            onRetry={() => generateReadme.reset()}
          />
        </Box>
      )}

      {/* Loading Display */}
      {generateReadme?.isPending && (
        <Box sx={{ mt: 4 }}>
          <LoadingSkeleton />
        </Box>
      )}

      {/* README Display */}
      {generateReadme?.data && (
        <Box sx={{ mt: 4 }}>
          <ReadmeViewer 
            readme={generateReadme.data}
            onEdit={() => navigate('/edit', { state: { readme: generateReadme.data } })}
          />
        </Box>
      )}

      {/* Recent Repositories for authenticated users */}
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
                  onClick={() => handleGenerate(repo.html_url)}
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
