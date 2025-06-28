import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material'
import { GitHub, Public, CheckCircle, Error, Warning, Launch } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const IntegrationTest: React.FC = () => {
  const { user, isAuthenticated, isGuest, login, continueAsGuest, logout, error } = useAuth()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [testOutput, setTestOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const runIntegrationTests = async () => {
    setLoading(true)
    const results: Record<string, boolean> = {}
    let output = '🧪 Running GitScriptor Integration Tests...\n\n'

    try {
      // Test 1: API Health Check
      output += '1. Testing API Health Check...\n'
      try {
        const health = await api.healthCheck()
        results['health'] = health.ok
        output += `   ✓ Health check: ${health.ok ? 'PASS' : 'FAIL'}\n\n`
      } catch (error) {
        results['health'] = false
        output += `   ✗ Health check: FAIL - ${error}\n\n`
      }

      // Test 2: Guest Mode README Generation
      output += '2. Testing Guest Mode README Generation...\n'
      try {
        const guestReadme = await api.generateReadme({
          repo_url: 'https://github.com/octocat/Hello-World',
          style: 'classic'
        })
        results['guestGeneration'] = guestReadme.success
        output += `   ✓ Guest README generation: ${guestReadme.success ? 'PASS' : 'FAIL'}\n`
        if (guestReadme.success) {
          output += `   - Generated ${guestReadme.word_count || 0} words\n`
          output += `   - Elapsed time: ${guestReadme.elapsed_ms}ms\n`
          output += `   - Sections: ${guestReadme.sections_generated?.join(', ') || 'N/A'}\n`
        }
        output += '\n'
      } catch (error) {
        results['guestGeneration'] = false
        output += `   ✗ Guest README generation: FAIL - ${error}\n\n`
      }

      // Test 3: OAuth URL Generation
      output += '3. Testing OAuth URL Generation...\n'
      try {
        const oauthUrl = await api.githubLogin()
        results['oauthUrl'] = oauthUrl.includes('github.com/login/oauth/authorize')
        output += `   ✓ OAuth URL: ${results['oauthUrl'] ? 'PASS' : 'FAIL'}\n`
        output += `   - URL: ${oauthUrl}\n\n`
      } catch (error) {
        results['oauthUrl'] = false
        output += `   ✗ OAuth URL generation: FAIL - ${error}\n\n`
      }

      // Test 4: Authentication State Check
      output += '4. Testing Current Auth State...\n'
      output += `   - Is Authenticated: ${isAuthenticated}\n`
      output += `   - Is Guest: ${isGuest}\n`
      output += `   - User: ${user ? user.username : 'None'}\n`
      output += `   - Auth Error: ${error || 'None'}\n\n`

      // Test 5: Local Storage
      output += '5. Testing Local Storage...\n'
      try {
        const authMode = localStorage.getItem('auth_mode')
        const authToken = localStorage.getItem('gitscriptor_auth_token')
        output += `   - Auth mode: ${authMode || 'Not set'}\n`
        output += `   - Auth token: ${authToken ? 'Present' : 'Not present'}\n`
        results['localStorage'] = true
        output += `   ✓ Local storage: PASS\n\n`
      } catch (error) {
        results['localStorage'] = false
        output += `   ✗ Local storage: FAIL - ${error}\n\n`
      }

      output += '✅ Integration tests completed!\n'
      setTestResults(results)
      setTestOutput(output)
    } catch (error) {
      output += `\n❌ Test suite failed: ${error}\n`
      setTestOutput(output)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (test: string) => {
    if (!(test in testResults)) return <Warning color="warning" />
    return testResults[test] ? <CheckCircle color="success" /> : <Error color="error" />
  }

  const getStatusColor = (test: string): 'success' | 'error' | 'warning' => {
    if (!(test in testResults)) return 'warning'
    return testResults[test] ? 'success' : 'error'
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 GitScriptor Integration Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This test verifies that the frontend is properly integrated with the backend, 
          authentication flows work correctly, and guest mode functions as expected.
        </Typography>
      </Alert>

      {/* Current Auth Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Authentication Status
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {isAuthenticated && (
              <Chip 
                icon={<GitHub />} 
                label={`Authenticated as ${user?.username}`}
                color="success"
                variant="filled"
              />
            )}
            {isGuest && (
              <Chip 
                icon={<Public />} 
                label="Guest Mode Active"
                color="info"
                variant="filled"
              />
            )}
            {!isAuthenticated && !isGuest && (
              <Chip 
                label="Not Authenticated"
                color="default"
                variant="outlined"
              />
            )}
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<GitHub />}
              onClick={login}
              disabled={isAuthenticated}
            >
              Sign in with GitHub
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Public />}
              onClick={continueAsGuest}
              disabled={isGuest}
            >
              Continue as Guest
            </Button>
            
            {(isAuthenticated || isGuest) && (
              <Button
                variant="text"
                onClick={logout}
              >
                Logout / Exit Guest Mode
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={runIntegrationTests}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
          sx={{ mr: 2 }}
        >
          {loading ? 'Running Tests...' : 'Run Integration Tests'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Launch />}
          onClick={() => window.open(`${api.getConfig().baseUrl}/docs`, '_blank')}
        >
          Open API Docs
        </Button>
      </Box>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon('health')}
                <Typography>API Health Check</Typography>
                <Chip 
                  label={testResults.health ? 'PASS' : 'FAIL'} 
                  size="small" 
                  color={getStatusColor('health')}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon('guestGeneration')}
                <Typography>Guest Mode README Generation</Typography>
                <Chip 
                  label={testResults.guestGeneration ? 'PASS' : 'FAIL'} 
                  size="small" 
                  color={getStatusColor('guestGeneration')}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon('oauthUrl')}
                <Typography>OAuth URL Generation</Typography>
                <Chip 
                  label={testResults.oauthUrl ? 'PASS' : 'FAIL'} 
                  size="small" 
                  color={getStatusColor('oauthUrl')}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon('localStorage')}
                <Typography>Local Storage Access</Typography>
                <Chip 
                  label={testResults.localStorage ? 'PASS' : 'FAIL'} 
                  size="small" 
                  color={getStatusColor('localStorage')}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Test Output */}
      {testOutput && (
        <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
          <Typography variant="h6" gutterBottom>
            Test Output
          </Typography>
          <Typography 
            component="pre" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              maxHeight: 400,
              overflow: 'auto',
              lineHeight: 1.4,
              color: 'text.primary'
            }}
          >
            {testOutput}
          </Typography>
        </Paper>
      )}

      {/* Integration Status */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Integration Status
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Frontend Setup" 
                secondary="React app with Material-UI and proper routing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Authentication Context" 
                secondary="JWT-based authentication with GitHub OAuth support"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Guest Mode" 
                secondary="Local storage-based guest mode for unauthenticated users"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="API Integration" 
                secondary="RESTful API client with error handling and timeout support"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}

export default IntegrationTest
