import React from 'react'
import { 
  Backdrop, 
  Box, 
  Typography, 
  LinearProgress,
  Paper
} from '@mui/material'
import { AutoAwesome } from '@mui/icons-material'

interface LoadingBackdropProps {
  open: boolean
}

const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ open }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(31, 35, 40, 0.8)'
      }}
      open={open}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #d0d7de',
          minWidth: '300px',
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <AutoAwesome 
            sx={{ 
              fontSize: 48,
              color: '#238636',
              animation: 'pulse 2s infinite'
            }} 
          />
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1,
            color: '#1f2328',
            fontWeight: 600
          }}
        >
          Generating README
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 3,
            color: '#656d76'
          }}
        >
          AI is analyzing your repository...
        </Typography>
        
        <LinearProgress 
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: '#f6f8fa',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#238636',
              borderRadius: 2
            }
          }}
        />
        
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 2,
            display: 'block',
            color: '#656d76',
            fontSize: '12px'
          }}
        >
          This usually takes 10-30 seconds
        </Typography>
      </Paper>
    </Backdrop>
  )
}

export default LoadingBackdrop
