import React, { useState, useRef, useCallback } from 'react'
import { 
  TextField, 
  Button, 
  Box, 
  Alert, 
  InputAdornment,
  Typography,
  Stack,
  Autocomplete,
  Fade,
} from '@mui/material'
import { GitHub, Send, Link } from '@mui/icons-material'

interface RepoInputProps {
  onGenerate: (url: string) => void
  isLoading: boolean
  isAuthenticated?: boolean
  isGuest?: boolean
  userRepos?: string[]
}

const RepoInput: React.FC<RepoInputProps> = ({ 
  onGenerate, 
  isLoading, 
  isAuthenticated = false, 
  isGuest = false,
  userRepos = [] 
}) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const validateUrl = (url: string): boolean => {
    const pattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?\/?$/
    return pattern.test(url)
  }

  const extractRepoUrl = (text: string): string | null => {
    // Handle various GitHub URL formats and git clone URLs
    const patterns = [
      /https:\/\/github\.com\/([\w\-\.]+\/[\w\-\.]+)(?:\.git)?\/?/,
      /git@github\.com:([\w\-\.]+\/[\w\-\.]+)\.git/,
      /([\w\-\.]+\/[\w\-\.]+)/ // Just owner/repo format
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const repoPath = match[1]
        return `https://github.com/${repoPath}`
      }
    }
    
    return null
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const text = e.dataTransfer.getData('text')
    const extractedUrl = extractRepoUrl(text)
    
    if (extractedUrl) {
      setUrl(extractedUrl)
      setError('')
    } else {
      setError('Please drop a valid GitHub repository URL')
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateUrl(url)) {
      setError('Please enter a valid GitHub repository URL')
      return
    }
    
    setError('')
    onGenerate(url)
  }

  const exampleRepos = [
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
    'https://github.com/vercel/next.js',
    'https://github.com/tiangolo/fastapi'
  ]

  return (
    <Box>
      {/* Guest Mode Indicator */}
      {isGuest && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(90deg, rgba(2,136,209,0.05) 0%, rgba(25,118,210,0.05) 100%)',
            border: '1px solid rgba(2,136,209,0.2)',
            '.MuiAlert-icon': {
              color: 'info.main'
            }
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              🌐 Guest Mode Active
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Limited to public repositories • 60 API requests per hour • No authentication required
            </Typography>
          </Box>
        </Alert>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ mb: 3 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Enhanced input with autocomplete and drag-drop */}
          {(isAuthenticated && userRepos.length > 0) || isGuest ? (
            <Autocomplete
              freeSolo
              options={userRepos}
              value={url}
              onInputChange={(_, newValue) => {
                setUrl(newValue || '')
                setError('')
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  ref={inputRef}
                  fullWidth
                  label="GitHub Repository URL"
                  placeholder="https://github.com/username/repository or drag & drop"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError('')
                  }}
                  error={!!error}
                  disabled={isLoading}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHub sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isLoading || !url}
                          startIcon={<Send />}
                          sx={{ 
                            minWidth: 'auto',
                            px: 2,
                            py: 0.75,
                            height: '36px',
                            fontSize: '13px',
                            background: isLoading || !url 
                              ? undefined 
                              : 'linear-gradient(-45deg, #22c55e, #16a34a, #15803d, #166534)',
                            backgroundSize: '400% 400%',
                            animation: (isLoading || !url) ? 'none' : 'generateGradient 6s ease infinite',
                            color: (isLoading || !url) ? undefined : '#ffffff',
                            border: (isLoading || !url) ? undefined : '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: (isLoading || !url) ? undefined : '0 2px 8px rgba(34, 197, 94, 0.3)',
                            '@keyframes generateGradient': {
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
                            '&:not(:disabled):hover': {
                              transform: 'translateY(-1px) scale(1.02)',
                              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.5)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isLoading ? 'Generating...' : 'Generate'}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDragOver ? 'action.hover' : 'transparent',
                      borderColor: isDragOver ? 'primary.main' : undefined,
                      transition: 'all 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover:not(.Mui-focused):not(.Mui-error)': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <GitHub sx={{ mr: 2, fontSize: 18 }} />
                  {option}
                </Box>
              )}
              sx={{ width: '100%' }}
            />
          ) : (
            <TextField
              ref={inputRef}
              fullWidth
              label="GitHub Repository URL"
              placeholder="https://github.com/username/repository or drag & drop"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
              error={!!error}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHub sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || !url}
                      startIcon={<Send />}
                      sx={{ 
                        minWidth: 'auto',
                        px: 2,
                        py: 0.75,
                        height: '36px',
                        fontSize: '13px',
                        background: isLoading || !url 
                          ? undefined 
                          : 'linear-gradient(-45deg, #22c55e, #16a34a, #15803d, #166534)',
                        backgroundSize: '400% 400%',
                        animation: (isLoading || !url) ? 'none' : 'generateGradient 6s ease infinite',
                        color: (isLoading || !url) ? undefined : '#ffffff',
                        border: (isLoading || !url) ? undefined : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: (isLoading || !url) ? undefined : '0 2px 8px rgba(34, 197, 94, 0.3)',
                        '@keyframes generateGradient': {
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
                        '&:not(:disabled):hover': {
                          transform: 'translateY(-1px) scale(1.02)',
                          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.5)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDragOver ? 'action.hover' : 'transparent',
                  borderColor: isDragOver ? 'primary.main' : undefined,
                  transition: 'all 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover:not(.Mui-focused):not(.Mui-error)': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            />
          )}
          
          {/* Drag overlay */}
          <Fade in={isDragOver}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: 2,
                borderColor: 'primary.main',
                borderStyle: 'dashed',
                borderRadius: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                Drop GitHub URL here
              </Typography>
            </Box>
          </Fade>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              fontSize: '14px',
              '& .MuiAlert-icon': {
                fontSize: '18px'
              },
              '& .MuiAlert-message': {
                fontSize: '14px',
              }
            }}
          >
            {error}
          </Alert>
        )}
      </Box>

      <Box>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2, 
            color: 'text.secondary',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          💡 Try these popular repositories:
        </Typography>
        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap="wrap" 
          useFlexGap
          sx={{
            '& > *': {
              mb: 1,
            }
          }}
        >
          {exampleRepos.map((repo, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              startIcon={<Link sx={{ fontSize: '14px !important' }} />}
              onClick={() => setUrl(repo)}
              disabled={isLoading}
              sx={{
                fontSize: '12px',
                px: 1.5,
                py: 0.5,
                height: '28px',
                fontWeight: 400,
                transition: 'all 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.light',
                  color: 'primary.main'
                }
              }}
            >
              {repo.replace('https://github.com/', '')}
            </Button>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export default RepoInput
