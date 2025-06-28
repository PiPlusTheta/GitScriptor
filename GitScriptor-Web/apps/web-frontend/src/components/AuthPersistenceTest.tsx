import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const AuthPersistenceTest: React.FC = () => {
  const { user, isAuthenticated, isGuest, login, logout, error } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // Check initial state
    const token = localStorage.getItem('gitscriptor_auth_token')
    const authMode = localStorage.getItem('auth_mode')
    
    addTestResult(`Initial check - Token exists: ${!!token}, Auth mode: ${authMode}`)
    addTestResult(`Auth state - Authenticated: ${isAuthenticated}, Guest: ${isGuest}`)
    
    if (user) {
      addTestResult(`User loaded: ${user.username}`)
    }
  }, [user, isAuthenticated, isGuest])

  const testTokenValidation = async () => {
    try {
      addTestResult('Testing token validation...')
      const currentUser = await api.getCurrentUser()
      addTestResult(`✅ Token valid - User: ${currentUser.username}`)
    } catch (error: any) {
      addTestResult(`❌ Token validation failed: ${error.message}`)
    }
  }

  const simulatePageRefresh = () => {
    addTestResult('🔄 Simulating page refresh...')
    window.location.reload()
  }

  const clearStorage = () => {
    localStorage.removeItem('gitscriptor_auth_token')
    localStorage.removeItem('auth_mode')
    addTestResult('🧹 Storage cleared')
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔐 Authentication Persistence Test
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              color={isAuthenticated ? 'success' : 'default'}
            />
            <Chip 
              label={isGuest ? 'Guest Mode' : 'User Mode'}
              color={isGuest ? 'info' : 'primary'}
            />
            <Chip 
              label={localStorage.getItem('gitscriptor_auth_token') ? 'Token Stored' : 'No Token'}
              variant="outlined"
            />
          </Box>

          {user && (
            <Typography variant="body2" color="text.secondary">
              Logged in as: {user.username} ({user.name})
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {!isAuthenticated && !isGuest && (
              <Button variant="contained" onClick={login}>
                Sign In with GitHub
              </Button>
            )}
            
            {isAuthenticated && (
              <>
                <Button variant="outlined" onClick={testTokenValidation}>
                  Test Token
                </Button>
                <Button variant="outlined" onClick={logout} color="error">
                  Sign Out
                </Button>
              </>
            )}
            
            <Button variant="outlined" onClick={simulatePageRefresh}>
              Refresh Page
            </Button>
            
            <Button variant="outlined" onClick={clearStorage} color="warning">
              Clear Storage
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Log
          </Typography>
          
          <List dense>
            {testResults.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={result}
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  />
                </ListItem>
                {index < testResults.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            
            {testResults.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="No test results yet..."
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AuthPersistenceTest
