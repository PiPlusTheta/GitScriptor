import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress, 
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material'
import { GitHub } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const AuthenticationTest: React.FC = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testResult, setTestResult] = useState<any>(null)

  const handleLogin = async () => {
    try {
      setTestStatus('testing')
      await login()
    } catch (error: any) {
      setTestStatus('error')
      setTestResult({ error: error.message })
    }
  }

  const handleLogout = async () => {
    try {
      setTestStatus('testing')
      await logout()
      setTestStatus('idle')
      setTestResult(null)
    } catch (error: any) {
      setTestStatus('error')
      setTestResult({ error: error.message })
    }
  }

  const testAuthenticatedEndpoint = async () => {
    try {
      setTestStatus('testing')
      const result = await api.getCurrentUser()
      setTestStatus('success')
      setTestResult(result)
    } catch (error: any) {
      setTestStatus('error')
      setTestResult({ error: error.message })
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading authentication state...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔐 Authentication Test
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              color={isAuthenticated ? 'success' : 'default'}
              variant={isAuthenticated ? 'filled' : 'outlined'}
            />
          </Box>

          {user && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                User: {user.username} ({user.name})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {user.email}
              </Typography>
            </Box>
          )}

          <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
            {!isAuthenticated ? (
              <Button
                variant="contained"
                startIcon={<GitHub />}
                onClick={handleLogin}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                Sign in with GitHub
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={testAuthenticatedEndpoint}
                  disabled={testStatus === 'testing'}
                >
                  {testStatus === 'testing' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Test User API
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  disabled={testStatus === 'testing'}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {testStatus === 'success' ? '✅ Test Result' : '❌ Error'}
            </Typography>
            
            <Alert severity={testStatus === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
              {testStatus === 'success' ? 'API call successful!' : 'API call failed'}
            </Alert>

            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              maxHeight: 300,
              overflow: 'auto'
            }}>
              <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </Box>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Backend API: {api.getConfig().baseUrl}
      </Typography>
    </Box>
  )
}

export default AuthenticationTest
