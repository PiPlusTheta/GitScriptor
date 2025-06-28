import React from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Typography,
} from '@mui/material'
import {
  Refresh,
  HelpOutline,
  ErrorOutline,
  Lock,
  CloudOff,
} from '@mui/icons-material'
import { GenerateError } from '../hooks/useGenerateReadme'
import { ApiError } from '../services/api'

interface ErrorAlertProps {
  error: GenerateError | ApiError
  onRetry: () => void
  isRetrying?: boolean
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry, isRetrying = false }) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'auth':
        return <Lock />
      case 'network':
        return <CloudOff />
      default:
        return <ErrorOutline />
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case 'validation':
        return 'Validation Error'
      case 'auth':
        return 'Authentication Required'
      case 'not-found':
        return 'Repository Not Found'
      case 'network':
        return 'Connection Error'
      case 'server':
        return 'Server Error'
      default:
        return 'Generation Failed'
    }
  }

  const getHelpText = () => {
    switch (error.type) {
      case 'validation':
        return 'The provided data is invalid. Please check your input and try again.'
      case 'auth':
        return 'This repository may be private. Sign in to access private repositories or check if the URL is correct.'
      case 'not-found':
        return 'The repository could not be found. Please verify the URL is correct and the repository exists.'
      case 'network':
        return 'Unable to connect to the server. Check your internet connection and try again.'
      case 'server':
        return 'The server encountered an error. This is usually temporary - please try again in a moment.'
      default:
        return 'An unexpected error occurred. Please check the repository URL and try again.'
    }
  }

  const shouldShowRetry = error.type === 'network' || error.type === 'server' || error.type === 'unknown' || error.type === 'validation'

  return (
    <Alert
      severity="error"
      icon={getErrorIcon()}
      sx={{
        mb: 3,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={getHelpText()}>
            <IconButton
              size="small"
              sx={{ color: 'error.main' }}
              aria-label="Error details"
            >
              <HelpOutline fontSize="small" />
            </IconButton>
          </Tooltip>
          {shouldShowRetry && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
              onClick={onRetry}
              disabled={isRetrying}
              sx={{
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </Stack>
      }
    >
      <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
        {getErrorTitle()}
      </AlertTitle>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {error.message}
      </Typography>
    </Alert>
  )
}

export default ErrorAlert
