import React from 'react'
import { SvgIcon, SvgIconProps } from '@mui/material'

interface GitScriptorIconProps extends SvgIconProps {
  variant?: 'default' | 'filled' | 'minimal'
  animated?: boolean
  showSparkle?: boolean
}

export const GitScriptorIcon: React.FC<GitScriptorIconProps> = ({ 
  variant = 'default', 
  animated = false,
  showSparkle = true,
  sx,
  ...props 
}) => {
  const animationSx = animated ? {
    animation: 'gitscriptorFloat 2.5s ease-in-out infinite',
    '@keyframes gitscriptorFloat': {
      '0%, 100%': {
        transform: 'translateY(0px) rotate(0deg)',
      },
      '25%': {
        transform: 'translateY(-3px) rotate(-1deg)',
      },
      '50%': {
        transform: 'translateY(-6px) rotate(0deg)',
      },
      '75%': {
        transform: 'translateY(-3px) rotate(1deg)',
      },
    },
  } : {}

  const sparkleAnimation = showSparkle ? {
    '& .sparkle': {
      animation: 'sparkle 1.5s ease-in-out infinite',
      '@keyframes sparkle': {
        '0%, 100%': {
          opacity: 0.8,
          transform: 'scale(1)',
        },
        '50%': {
          opacity: 1,
          transform: 'scale(1.2)',
        },
      },
    },
  } : {}

  const baseStyles = {
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: animated ? 'scale(1.1) translateY(-2px)' : 'scale(1.1)',
    },
    ...animationSx,
    ...sparkleAnimation,
    ...sx,
  }

  if (variant === 'filled') {
    return (
      <SvgIcon {...props} sx={baseStyles} viewBox="0 0 24 24">
        {/* Document body */}
        <rect x="6" y="3" width="10.5" height="15" fill="currentColor" rx="1"/>
        {/* Document fold */}
        <path d="M14.5 3 L17.5 6 L14.5 6 Z" fill="currentColor"/>
        {/* Document content lines */}
        <rect x="8" y="7" width="6" height="0.8" fill="rgba(255,255,255,0.8)" rx="0.4"/>
        <rect x="8" y="9" width="7.5" height="0.8" fill="rgba(255,255,255,0.8)" rx="0.4"/>
        <rect x="8" y="11" width="4.5" height="0.8" fill="rgba(255,255,255,0.8)" rx="0.4"/>
        <rect x="8" y="13" width="6.5" height="0.8" fill="rgba(255,255,255,0.8)" rx="0.4"/>
        
        {/* AI Sparkle */}
        {showSparkle && (
          <g className="sparkle">
            <path d="M18.5 6 L19.5 7.5 L21 6.5 L19.5 5.5 Z" fill="#ffd700"/>
            <path d="M19.5 5 L19.5 8 M18 6.5 L21 6.5" stroke="#ffd700" strokeWidth="0.5"/>
          </g>
        )}
      </SvgIcon>
    )
  }

  if (variant === 'minimal') {
    return (
      <SvgIcon {...props} sx={baseStyles} viewBox="0 0 24 24">
        {/* Simple document outline */}
        <path 
          d="M6 3 L14.5 3 L17.5 6 L17.5 18 C17.5 18.55 17.05 19 16.5 19 L6 19 C5.45 19 5 18.55 5 18 L5 4 C5 3.45 5.45 3 6 3 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
        {/* Document fold line */}
        <path d="M14.5 3 L14.5 6 L17.5 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        
        {/* Content lines */}
        <line x1="8" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="8" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="8" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        
        {/* AI Sparkle */}
        {showSparkle && (
          <g className="sparkle">
            <path d="M18.5 6 L19.5 7.5 L21 6.5 L19.5 5.5 Z" fill="#ffd700"/>
          </g>
        )}
      </SvgIcon>
    )
  }

  // Default variant
  return (
    <SvgIcon {...props} sx={baseStyles} viewBox="0 0 24 24">
      {/* Document body */}
      <path d="M6 3 C5.45 3 5 3.45 5 4 L5 20 C5 20.55 5.45 21 6 21 L18 21 C18.55 21 19 20.55 19 20 L19 8 L14 3 Z" fill="currentColor"/>
      {/* Document fold */}
      <path d="M14 3 L14 8 L19 8" fill="rgba(255,255,255,0.2)"/>
      
      {/* Document content lines */}
      <rect x="7" y="10" width="6" height="1" fill="rgba(255,255,255,0.8)" rx="0.5"/>
      <rect x="7" y="12" width="8" height="1" fill="rgba(255,255,255,0.8)" rx="0.5"/>
      <rect x="7" y="14" width="5" height="1" fill="rgba(255,255,255,0.8)" rx="0.5"/>
      <rect x="7" y="16" width="7" height="1" fill="rgba(255,255,255,0.8)" rx="0.5"/>
      
      {/* AI Sparkle */}
      {showSparkle && (
        <g className="sparkle">
          <path d="M20 5 L21 6.5 L22.5 5.5 L21 4.5 Z" fill="#ffd700"/>
          <path d="M21 4 L21 7 M19.5 5.5 L22.5 5.5" stroke="#ffd700" strokeWidth="0.8"/>
        </g>
      )}
    </SvgIcon>
  )
}

export default GitScriptorIcon
