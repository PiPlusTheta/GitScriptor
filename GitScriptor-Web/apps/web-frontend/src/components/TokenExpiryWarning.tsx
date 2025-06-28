import React from 'react'
import { Alert, AlertTitle, Button } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

const TokenExpiryWarning: React.FC = () => {
  const { tokenNearExpiry, login } = useAuth()

  if (!tokenNearExpiry) {
    return null
  }

  const handleReauth = () => {
    login()
  }

  return (
    <Alert 
      severity="warning" 
      sx={{ mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={handleReauth}>
          Re-authenticate
        </Button>
      }
    >
      <AlertTitle>Session Expiring Soon</AlertTitle>
      Your GitHub authentication will expire soon. Click "Re-authenticate" to stay signed in.
    </Alert>
  )
}

export default TokenExpiryWarning
