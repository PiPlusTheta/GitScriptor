import React from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  useTheme,
  Divider,
  Alert,
} from '@mui/material'
import {
  Lock,
  GitHub,
  Star,
  Security,
  Public,
  Warning,
} from '@mui/icons-material'

interface SignInBannerProps {
  onSignIn: () => void
  onContinueAsGuest: () => void
  hasAuthError?: boolean
}

const SignInBanner: React.FC<SignInBannerProps> = ({ 
  onSignIn, 
  onContinueAsGuest, 
  hasAuthError = false 
}) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 4,
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%)'
          : 'linear-gradient(135deg, #161b22 0%, #21262d 100%)',
        border: 1,
        borderColor: theme.palette.mode === 'light' ? '#e1e4e8' : '#30363d',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #0969da 0%, #238636 50%, #d1242f 100%)',
        },
      }}
    >
      <Stack spacing={3}>
        {/* Auth Error Alert */}
        {hasAuthError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Having trouble signing in?
              </Typography>
              <Typography variant="body2">
                You can continue as a guest to explore public repositories with limited API access.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <Lock
              sx={{
                fontSize: 48,
                color: theme.palette.mode === 'light' ? '#656d76' : '#7d8590',
                mb: 1,
              }}
            />
          </Box>
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: 'text.primary',
            }}
          >
            Unlock Full Access
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.5,
            }}
          >
            Sign in with GitHub to access private repositories and get unlimited API access
          </Typography>
        </Box>

        {/* Benefits */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Chip
            icon={<Security />}
            label="Private repositories"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            icon={<Star />}
            label="Your starred repos"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            icon={<GitHub />}
            label="Unlimited API calls"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Stack>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GitHub />}
            onClick={onSignIn}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600,
              background: 'linear-gradient(-45deg, #22c55e, #16a34a, #15803d, #166534)',
              backgroundSize: '400% 400%',
              animation: 'greenGradient 6s ease infinite',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
              '@keyframes greenGradient': {
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
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.6)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Sign in with GitHub
          </Button>
          
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 2,
              color: 'text.secondary',
              fontSize: '12px',
            }}
          >
            We'll never store your credentials or modify your repositories
          </Typography>
        </Box>

        {/* Divider */}
        <Divider sx={{ mx: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            or
          </Typography>
        </Divider>

        {/* Guest Mode */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Public />}
            onClick={onContinueAsGuest}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 500,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Continue as Guest
          </Button>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '11px',
                maxWidth: 400,
                textAlign: 'center',
              }}
            >
              Guest mode: Limited to public repos & 60 unauthenticated API requests/hour
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}

export default SignInBanner
