import { createTheme, ThemeOptions } from '@mui/material/styles'

type PaletteMode = 'light' | 'dark'

// GitHub color tokens
const gitHubColors = {
  light: {
    canvas: {
      default: '#ffffff',
      overlay: '#ffffff',
      inset: '#f6f8fa',
      subtle: '#f6f8fa',
    },
    fg: {
      default: '#1f2328',
      muted: '#656d76',
      subtle: '#6e7781',
      onEmphasis: '#ffffff',
    },
    border: {
      default: '#d0d7de',
      muted: '#d8dee4',
      subtle: 'hsla(210, 18%, 87%, 1)',
    },
    neutral: {
      emphasisPlus: '#24292f',
      emphasis: '#6e7781',
      muted: 'rgba(175,184,193,0.2)',
      subtle: 'rgba(234,238,242,0.5)',
    },
    accent: {
      fg: '#0969da',
      emphasis: '#0550ae',
      muted: 'rgba(84,174,255,0.4)',
      subtle: '#ddf4ff',
    },
    success: {
      fg: '#1a7f37',
      emphasis: '#1f883d',
      muted: 'rgba(74,194,107,0.4)',
      subtle: '#dcffe4',
    },
    attention: {
      fg: '#bf8700',
      emphasis: '#9a6700',
      muted: 'rgba(255,223,93,0.4)',
      subtle: '#fff8c5',
    },
    severe: {
      fg: '#bc4c00',
      emphasis: '#a04100',
      muted: 'rgba(255,135,67,0.4)',
      subtle: '#fff1e5',
    },
    danger: {
      fg: '#d1242f',
      emphasis: '#a40e26',
      muted: 'rgba(255,129,130,0.4)',
      subtle: '#ffebe9',
    },
    done: {
      fg: '#8250df',
      emphasis: '#6639ba',
      muted: 'rgba(194,151,255,0.4)',
      subtle: '#fbefff',
    },
    sponsors: {
      fg: '#bf3989',
      emphasis: '#a0326d',
      muted: 'rgba(255,128,200,0.4)',
      subtle: '#ffeff7',
    },
  },
  dark: {
    canvas: {
      default: '#0d1117',
      overlay: '#161b22',
      inset: '#010409',
      subtle: '#161b22',
    },
    fg: {
      default: '#e6edf3',
      muted: '#7d8590',
      subtle: '#6e7681',
      onEmphasis: '#ffffff',
    },
    border: {
      default: '#30363d',
      muted: '#21262d',
      subtle: 'hsla(215, 8%, 16%, 1)',
    },
    neutral: {
      emphasisPlus: '#6e7681',
      emphasis: '#6e7681',
      muted: 'rgba(110,118,129,0.4)',
      subtle: 'rgba(110,118,129,0.1)',
    },
    accent: {
      fg: '#2f81f7',
      emphasis: '#1f6feb',
      muted: 'rgba(56,139,253,0.4)',
      subtle: 'rgba(56,139,253,0.15)',
    },
    success: {
      fg: '#3fb950',
      emphasis: '#238636',
      muted: 'rgba(63,185,80,0.4)',
      subtle: 'rgba(63,185,80,0.15)',
    },
    attention: {
      fg: '#d29922',
      emphasis: '#bf8700',
      muted: 'rgba(187,128,9,0.4)',
      subtle: 'rgba(187,128,9,0.15)',
    },
    severe: {
      fg: '#db6d28',
      emphasis: '#bc4c00',
      muted: 'rgba(219,109,40,0.4)',
      subtle: 'rgba(219,109,40,0.15)',
    },
    danger: {
      fg: '#f85149',
      emphasis: '#da3633',
      muted: 'rgba(248,81,73,0.4)',
      subtle: 'rgba(248,81,73,0.15)',
    },
    done: {
      fg: '#a5a5ff',
      emphasis: '#8b949e',
      muted: 'rgba(163,163,255,0.4)',
      subtle: 'rgba(163,163,255,0.15)',
    },
    sponsors: {
      fg: '#f778ba',
      emphasis: '#bf3989',
      muted: 'rgba(247,120,186,0.4)',
      subtle: 'rgba(247,120,186,0.15)',
    },
  },
}

// Create theme with GitHub design tokens
export const createGitHubTheme = (mode: PaletteMode): ThemeOptions => {
  const colors = gitHubColors[mode as keyof typeof gitHubColors]
  
  return {
    palette: {
      mode,
      primary: {
        main: colors.accent.fg,
        dark: colors.accent.emphasis,
        light: colors.accent.subtle,
        contrastText: colors.fg.onEmphasis,
      },
      secondary: {
        main: colors.success.fg,
        dark: colors.success.emphasis,
        light: colors.success.subtle,
        contrastText: colors.fg.onEmphasis,
      },
      background: {
        default: colors.canvas.default,
        paper: colors.canvas.overlay,
      },
      text: {
        primary: colors.fg.default,
        secondary: colors.fg.muted,
        disabled: colors.fg.subtle,
      },
      divider: colors.border.default,
      error: {
        main: colors.danger.fg,
        dark: colors.danger.emphasis,
        light: colors.danger.subtle,
        contrastText: colors.fg.onEmphasis,
      },
      warning: {
        main: colors.attention.fg,
        dark: colors.attention.emphasis,
        light: colors.attention.subtle,
        contrastText: colors.fg.onEmphasis,
      },
      info: {
        main: colors.accent.fg,
        dark: colors.accent.emphasis,
        light: colors.accent.subtle,
        contrastText: colors.fg.onEmphasis,
      },
      success: {
        main: colors.success.fg,
        dark: colors.success.emphasis,
        light: colors.success.subtle,
        contrastText: colors.fg.onEmphasis,
      },
      // Custom GitHub palette extensions
      action: {
        active: colors.fg.default,
        hover: mode === 'light' ? 'rgba(208, 215, 222, 0.32)' : 'rgba(177, 186, 196, 0.12)',
        selected: mode === 'light' ? 'rgba(208, 215, 222, 0.48)' : 'rgba(177, 186, 196, 0.16)',
        disabled: colors.fg.subtle,
        disabledBackground: colors.neutral.subtle,
        focus: colors.accent.muted,
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.25,
      },
      h4: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.25,
      },
      h5: {
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: 1.25,
      },
      h6: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.25,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
      body1: {
        fontSize: '14px',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '12px',
        lineHeight: 1.4,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '14px',
        letterSpacing: 0,
      },
      caption: {
        fontSize: '12px',
        lineHeight: 1.33,
        color: colors.fg.muted,
      },
      overline: {
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1.33,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 6,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.canvas.default,
            color: colors.fg.default,
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: colors.canvas.inset,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: colors.border.default,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: colors.neutral.emphasis,
            },
          },
          '*:focus-visible': {
            outline: `2px solid ${colors.accent.fg}`,
            outlineOffset: '2px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            padding: '6px 16px',
            minHeight: '32px',
            border: '1px solid transparent',
            transition: 'all 150ms cubic-bezier(0.23, 1, 0.32, 1)',
            '&:focus-visible': {
              outline: `2px solid ${colors.accent.fg}`,
              outlineOffset: '2px',
            },
          },
          contained: {
            backgroundColor: colors.success.fg,
            color: colors.fg.onEmphasis,
            border: `1px solid ${colors.success.emphasis}`,
            boxShadow: `0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 ${mode === 'light' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)'}`,
            '&:hover': {
              backgroundColor: colors.success.emphasis,
              borderColor: colors.success.emphasis,
              boxShadow: `0 3px 2px rgba(27, 31, 36, 0.07), 0 7px 5px rgba(27, 31, 36, 0.04), 0 12px 9px rgba(27, 31, 36, 0.03), 0 22px 17px rgba(27, 31, 36, 0.02), 0 42px 33px rgba(27, 31, 36, 0.01), 0 100px 80px rgba(27, 31, 36, 0.003)`,
            },
            '&:active': {
              backgroundColor: colors.success.emphasis,
              boxShadow: 'inset 0 1px 0 rgba(0, 0, 0, 0.2)',
            },
          },
          outlined: {
            backgroundColor: colors.canvas.default,
            color: colors.fg.default,
            border: `1px solid ${colors.border.default}`,
            boxShadow: `0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 ${mode === 'light' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)'}`,
            '&:hover': {
              backgroundColor: colors.canvas.subtle,
              borderColor: colors.border.default,
              boxShadow: `0 3px 2px rgba(27, 31, 36, 0.07), 0 7px 5px rgba(27, 31, 36, 0.04), 0 12px 9px rgba(27, 31, 36, 0.03), 0 22px 17px rgba(27, 31, 36, 0.02), 0 42px 33px rgba(27, 31, 36, 0.01), 0 100px 80px rgba(27, 31, 36, 0.003)`,
            },
          },
          text: {
            color: colors.fg.muted,
            padding: '4px 8px',
            minHeight: '28px',
            '&:hover': {
              backgroundColor: colors.neutral.muted,
              color: colors.fg.default,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '6px',
            color: colors.fg.muted,
            '&:hover': {
              backgroundColor: colors.neutral.muted,
              color: colors.fg.default,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.canvas.default,
              borderRadius: 6,
              fontSize: '14px',
              color: colors.fg.default,
              '& fieldset': {
                borderColor: colors.border.default,
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: colors.border.muted,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.accent.fg,
                borderWidth: '1px',
                boxShadow: `0 0 0 3px ${colors.accent.muted}`,
              },
              '&.Mui-error fieldset': {
                borderColor: colors.danger.fg,
              },
              '&.Mui-error.Mui-focused fieldset': {
                boxShadow: `0 0 0 3px ${colors.danger.muted}`,
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '14px',
              color: colors.fg.muted,
              '&.Mui-focused': {
                color: colors.accent.fg,
              },
            },
            '& .MuiFormHelperText-root': {
              fontSize: '12px',
              color: colors.fg.muted,
              '&.Mui-error': {
                color: colors.danger.fg,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.canvas.overlay,
            border: `1px solid ${colors.border.default}`,
            borderRadius: 6,
            boxShadow: mode === 'light' 
              ? '0 8px 24px rgba(140, 149, 159, 0.2)'
              : '0 8px 24px rgba(1, 4, 9, 0.15)',
          },
          outlined: {
            border: `1px solid ${colors.border.default}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.canvas.default,
            color: colors.fg.default,
            borderBottom: `1px solid ${colors.border.default}`,
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontSize: '12px',
            fontWeight: 500,
            height: '20px',
            border: '1px solid',
          },
          filled: {
            backgroundColor: colors.neutral.muted,
            color: colors.fg.default,
            borderColor: colors.border.default,
          },
          outlined: {
            backgroundColor: 'transparent',
            borderColor: colors.border.default,
            color: colors.fg.muted,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '14px',
            padding: '12px 16px',
            border: '1px solid',
          },
          standardError: {
            backgroundColor: colors.danger.subtle,
            color: colors.danger.fg,
            borderColor: colors.danger.muted,
          },
          standardSuccess: {
            backgroundColor: colors.success.subtle,
            color: colors.success.fg,
            borderColor: colors.success.muted,
          },
          standardInfo: {
            backgroundColor: colors.accent.subtle,
            color: colors.accent.fg,
            borderColor: colors.accent.muted,
          },
          standardWarning: {
            backgroundColor: colors.attention.subtle,
            color: colors.attention.fg,
            borderColor: colors.attention.muted,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: colors.neutral.muted,
            borderRadius: 2,
            height: 4,
          },
          bar: {
            backgroundColor: colors.success.fg,
            borderRadius: 2,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border.default,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' 
              ? 'rgba(27, 31, 36, 0.5)' 
              : 'rgba(1, 4, 9, 0.8)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: colors.neutral.emphasisPlus,
            color: colors.fg.onEmphasis,
            fontSize: '12px',
            borderRadius: 6,
            padding: '4px 8px',
          },
        },
      },
    },
  }
}

export default createTheme(createGitHubTheme('dark'))
