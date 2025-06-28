import React, { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // The AuthContext should handle the OAuth callback automatically
    // Once authentication is complete, redirect to home
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Completing sign in...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we process your GitHub authentication
      </Typography>
    </Box>
  )
}

export default AuthCallbackPage
