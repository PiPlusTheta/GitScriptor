import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createGitHubTheme } from '../theme'

type ThemeMode = 'dark'
type PaletteMode = 'dark'

interface ThemeContextType {
  themeMode: ThemeMode
  paletteMode: PaletteMode
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeContextProviderProps {
  children: ReactNode
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const themeMode: ThemeMode = 'dark'
  const paletteMode: PaletteMode = 'dark'

  // Create MUI theme
  const theme = createTheme(createGitHubTheme(paletteMode))

  // Update document class for global styling
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(paletteMode)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0d1117')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = '#0d1117'
      document.head.appendChild(meta)
    }
  }, [paletteMode])

  const contextValue: ThemeContextType = {
    themeMode,
    paletteMode,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider')
  }
  return context
}

export default ThemeContext
