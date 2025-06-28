import React from 'react'
import {
  Paper,
  Skeleton,
  Box,
  Stack,
} from '@mui/material'

const LoadingSkeleton: React.FC = () => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 3, sm: 4 }, 
        mb: 4,
      }}
    >
      {/* Title skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton 
          variant="text" 
          width={200} 
          height={32} 
          sx={{ fontSize: '1.25rem' }} 
        />
      </Box>

      {/* Input field skeleton */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Skeleton 
          variant="rounded" 
          height={56} 
          sx={{ borderRadius: 1 }} 
        />
        
        {/* Button skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Skeleton 
            variant="rounded" 
            width={140} 
            height={40} 
            sx={{ borderRadius: 1 }} 
          />
        </Box>
      </Stack>

      {/* Example repos skeleton */}
      <Box>
        <Skeleton 
          variant="text" 
          width={120} 
          height={20} 
          sx={{ mb: 1 }} 
        />
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton 
              key={i}
              variant="rounded" 
              height={32} 
              sx={{ borderRadius: 0.5 }} 
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  )
}

export default LoadingSkeleton
