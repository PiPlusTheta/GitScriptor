import React, { useEffect, useState } from 'react'
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material'
import { api } from '../services/api'

interface TestComponentProps {}

const ApiTestComponent: React.FC<TestComponentProps> = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testHealthEndpoint = async () => {
    setStatus('loading')
    setError(null)
    
    try {
      const healthResult = await api.healthCheck()
      setResult(healthResult)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'API connection failed')
      setStatus('error')
    }
  }

  const testGenerateEndpoint = async () => {
    setStatus('loading')
    setError(null)
    
    try {
      const generateResult = await api.generateReadme({
        repo_url: 'https://github.com/tiangolo/fastapi'
      })
      setResult(generateResult)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'README generation failed')
      setStatus('error')
    }
  }

  useEffect(() => {
    // Auto-test health endpoint on mount
    testHealthEndpoint()
  }, [])

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        API Integration Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={testHealthEndpoint}
          disabled={status === 'loading'}
          sx={{ mr: 2 }}
        >
          {status === 'loading' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Test Health
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testGenerateEndpoint}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Test Generate
        </Button>
      </Box>

      {status === 'success' && result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="h6">Success!</Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Alert>
      )}

      {status === 'error' && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary">
        API URL: {api.getConfig()?.baseUrl || 'Not configured'}
      </Typography>
    </Box>
  )
}

export default ApiTestComponent
