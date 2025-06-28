import React from 'react'
import {
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  DarkMode,
} from '@mui/icons-material'

const ThemeToggle: React.FC = () => {
  return (
    <Tooltip title="Dark theme active">
      <IconButton
        size="small"
        aria-label="theme indicator"
        disabled
        sx={{
          ml: 1,
          color: 'primary.main',
        }}
      >
        <DarkMode fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default ThemeToggle
