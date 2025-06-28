import React, { useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Button,
  Stack,
  Container,
  Alert,
  Divider,
  Chip
} from '@mui/material'
import { GitHub, AutoAwesome, Rocket, Google } from '@mui/icons-material'
import RepoInput from '../components/RepoInput'
import ReadmeViewer from '../components/ReadmeViewer'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorAlert from '../components/ErrorAlert'
import { useGenerateReadme, GenerateError } from '../hooks/useGenerateReadme'
import { useDynamicFavicon } from '../hooks/useDynamicFavicon'
import { useAuth } from '../contexts/AuthContext'
import { useUserRepositories } from '../hooks/useRepositories'
import GitScriptorIcon from '../components/GitScriptorIcon'

const HomePage: React.FC = () => {
  const generateReadme = useGenerateReadme()
  const { isAuthenticated, isGuest, login, continueAsGuest, error, isLoading } = useAuth()

  const { data: userReposData } = useUserRepositories({ per_page: 10, sort: 'updated' })

  useDynamicFavicon({
    status: generateReadme?.isPending ? 'loading' : 
            generateReadme?.error ? 'error' :
            generateReadme?.data ? 'success' : 'idle'
  })

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
    { url: 'https://github.com/nodejs/node', name: 'Node.js', description: 'JavaScript runtime' },
    { url: 'https://github.com/tensorflow/tensorflow', name: 'TensorFlow', description: 'Machine learning platform' }
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

  if (!isAuthenticated && !isGuest && !isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <GitScriptorIcon 
            animated 
            sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} 
          />
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
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Rocket 
              sx={{ 
                color: 'primary.main',
                animation: 'rocketFloat 3s ease-in-out infinite',
                '@keyframes rocketFloat': {
                  '0%, 100%': {
                    transform: 'translateY(0px) rotate(-10deg)',
                  },
                  '50%': {
                    transform: 'translateY(-10px) rotate(5deg)',
                  },
                },
              }}
            />
            <Chip 
              icon={<AutoAwesome />}
              label="AI-Powered"
              variant="outlined"
              size="small"
              color="primary"
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                '& .MuiChip-icon': {
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      opacity: 0.8,
                    },
                    '50%': {
                      transform: 'scale(1.2)',
                      opacity: 1,
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>
        
        <Typography 
          variant="h1" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 600,
            mb: 2,
            background: 'linear-gradient(-45deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)',
            backgroundSize: '400% 400%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'gradientShift 26s ease-in-out infinite',
            '@keyframes gradientShift': {
              '0%, 100%': {
                backgroundPosition: '0% 50%',
              },
              '25%': {
                backgroundPosition: '100% 50%',
              },
              '50%': {
                backgroundPosition: '200% 50%',
              },
              '75%': {
                backgroundPosition: '300% 50%',
              },
            },
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
            mb: 3,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Transform any GitHub repository into professional documentation with AI-powered insights
        </Typography>

        {/* Powered by Gemini and Open Source chips */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center" 
          sx={{ mb: 4 }}
        >
          <Chip 
            icon={
              <Google 
                sx={{ 
                  color: '#ffffff !important',
                  animation: 'geminiIconFloat 3s ease-in-out infinite',
                  '@keyframes geminiIconFloat': {
                    '0%, 100%': {
                      transform: 'translateY(0px) scale(1)',
                    },
                    '50%': {
                      transform: 'translateY(-2px) scale(1.1)',
                    },
                  },
                }} 
              />
            }
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
            icon={<GitScriptorIcon fontSize="small" animated variant="minimal" sx={{ color: '#2d2d2d !important' }} />}
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
                boxShadow: '0 8px 25px rgba(212, 120, 124, 0.5)',
              },
            }}
          />
        </Stack>

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
                  transition: 'all 0.3s ease',
                  outline: 'none !important',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  '&:focus': {
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    border: '1px solid',
                    borderColor: 'primary.main',
                  },
                  '&:focus-visible': {
                    outline: 'none !important',
                    boxShadow: 'none !important',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)',
                  },
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
            onRetry={handleRetry}
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
            markdown={generateReadme.data.markdown}
          />
        </Box>
      )}

      {/* Recent Repositories for authenticated users */}
      {isAuthenticated && userReposData?.repositories && userReposData.repositories.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 3, textAlign: 'center' }}>
            Your Recent Repositories
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {userReposData.repositories.slice(0, 5).map((repo) => (
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
                  transition: 'all 0.3s ease',
                  outline: 'none !important',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  '&:focus': {
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    border: '1px solid',
                    borderColor: 'primary.main',
                  },
                  '&:focus-visible': {
                    outline: 'none !important',
                    boxShadow: 'none !important',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {repo.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {repo.description || 'No description available'}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', py: 4, mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Built with ❤️ using React, FastAPI, and Google Gemini AI
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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
          <Chip label="Documentation" variant="outlined" size="small" sx={{ color: 'text.secondary' }} />
          <Chip label="API Reference" variant="outlined" size="small" sx={{ color: 'text.secondary' }} />
          <Chip 
            icon={
              <GitHub 
                fontSize="small" 
                sx={{
                  animation: 'githubFloat 3s ease-in-out infinite',
                  '@keyframes githubFloat': {
                    '0%, 100%': {
                      transform: 'translateY(0px) rotate(0deg)',
                    },
                    '50%': {
                      transform: 'translateY(-3px) rotate(5deg)',
                    },
                  },
                }}
              />
            } 
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
    </Container>
  )
}

export default HomePage
