import React from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  useTheme,
} from '@mui/material'
import {
  Public,
  GitHub,
  Warning,
  Login,
} from '@mui/icons-material'

interface GuestModeBannerProps {
  onSignIn: () => void
}

const GuestModeBanner: React.FC<GuestModeBannerProps> = ({ onSignIn }) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)'
          : 'linear-gradient(135deg, #1a1611 0%, #21262d 100%)',
        border: 1,
        borderColor: theme.palette.mode === 'light' ? '#ffd54f' : '#f57f17',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #ff9800 0%, #f57c00 50%, #ef6c00 100%)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Public sx={{ fontSize: 32, color: 'warning.main' }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Guest Mode
              </Typography>
              <Chip
                icon={<Warning />}
                label="Limited Access"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 500, fontSize: '11px' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You're browsing public repositories with rate-limited API access (60 requests/hour)
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Login />}
          onClick={onSignIn}
          sx={{
            px: 3,
            py: 1,
            fontSize: '14px',
            fontWeight: 600,
            background: 'linear-gradient(-45deg, #1976d2, #1565c0, #0d47a1)',
            '&:hover': {
              background: 'linear-gradient(-45deg, #1565c0, #0d47a1, #01579b)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Sign In
        </Button>
      </Box>
    </Paper>
  )
}

export default GuestModeBanner
