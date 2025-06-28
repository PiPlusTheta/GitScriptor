import { useEffect } from 'react'
import { useThemeContext } from '../contexts/ThemeContext'
import { DynamicFavicon, faviconColors } from '../utils/favicon'

interface UseDynamicFaviconOptions {
  status?: 'idle' | 'loading' | 'success' | 'error'
  showBadge?: boolean
  customColor?: string
}

export const useDynamicFavicon = (options: UseDynamicFaviconOptions = {}) => {
  const { paletteMode } = useThemeContext()
  const { status = 'idle', showBadge = false, customColor } = options

  useEffect(() => {
    const colors = faviconColors[paletteMode]
    const color = customColor || colors.primary

    DynamicFavicon.setFavicon({
      color,
      status,
      showBadge,
    })
  }, [paletteMode, status, showBadge, customColor])

  return {
    setLoading: () => DynamicFavicon.setFavicon({ 
      color: customColor || faviconColors[paletteMode].primary, 
      status: 'loading' 
    }),
    setSuccess: () => DynamicFavicon.setFavicon({ 
      color: customColor || faviconColors[paletteMode].success, 
      status: 'success' 
    }),
    setError: () => DynamicFavicon.setFavicon({ 
      color: customColor || faviconColors[paletteMode].error, 
      status: 'error' 
    }),
    setIdle: () => DynamicFavicon.setFavicon({ 
      color: customColor || faviconColors[paletteMode].primary, 
      status: 'idle' 
    }),
    animateLoading: DynamicFavicon.animateLoading,
    reset: DynamicFavicon.reset,
  }
}
