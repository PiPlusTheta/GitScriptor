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
  Paper,
} from '@mui/material'
import { GitHub, Public, CheckCircle, Error, Warning } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const OAuthGuestModeTest: React.FC = () => {
  const { user, isAuthenticated, isGuest, login, continueAsGuest, logout, error } = useAuth()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [testOutput, setTestOutput] = useState<string>('')

  const runTests = async () => {
    const results: Record<string, boolean> = {}
    let output = 'Running OAuth and Guest Mode Tests...\n\n'

    try {
      // Test 1: Health check
      output += '1. Testing API Health Check...\n'
      const health = await api.healthCheck()
      results['health'] = health.ok
      output += `   ✓ Health check: ${health.ok ? 'PASS' : 'FAIL'}\n\n`

      // Test 2: Guest mode README generation
      output += '2. Testing Guest Mode README Generation...\n'
      try {
        const guestReadme = await api.generateReadme({
          repo_url: 'https://github.com/octocat/Hello-World',
          style: 'classic'
        })
        results['guestGeneration'] = guestReadme.success
        output += `   ✓ Guest README generation: ${guestReadme.success ? 'PASS' : 'FAIL'}\n`
        output += `   - Generated ${guestReadme.word_count} words\n`
        output += `   - Elapsed time: ${guestReadme.elapsed_ms}ms\n`
        output += `   - User authenticated: ${guestReadme.metadata?.user_authenticated}\n\n`
      } catch (error) {
        results['guestGeneration'] = false
        output += `   ✗ Guest README generation: FAIL - ${error}\n\n`
      }

      // Test 3: OAuth URL generation
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

      // Test 4: Check current auth state
      output += '4. Testing Current Auth State...\n'
      output += `   - Is Authenticated: ${isAuthenticated}\n`
      output += `   - Is Guest: ${isGuest}\n`
      output += `   - User: ${user ? user.username : 'None'}\n`
      output += `   - Auth Error: ${error || 'None'}\n\n`

      setTestResults(results)
      setTestOutput(output)
    } catch (error) {
      output += `\nTest suite failed: ${error}\n`
      setTestOutput(output)
    }
  }

  const getStatusIcon = (test: string) => {
    if (!(test in testResults)) return <Warning color="warning" />
    return testResults[test] ? <CheckCircle color="success" /> : <Error color="error" />
  }

  const getStatusColor = (test: string) => {
    if (!(test in testResults)) return 'warning'
    return testResults[test] ? 'success' : 'error'
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        OAuth & Guest Mode Test Suite
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This component tests the GitHub OAuth flow and Guest mode functionality.
          Run the tests to verify all features are working correctly.
        </Typography>
      </Alert>

      {/* Auth Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Authentication Status
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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
                label="Guest Mode"
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

          <Stack direction="row" spacing={2}>
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
          onClick={runTests}
          size="large"
        >
          Run All Tests
        </Button>
      </Box>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            
            <Stack spacing={2}>
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
              overflow: 'auto'
            }}
          >
            {testOutput}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default OAuthGuestModeTest
