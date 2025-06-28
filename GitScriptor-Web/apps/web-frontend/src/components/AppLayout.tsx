import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  FolderOpen,
  Analytics,
  History,
  Settings,
  Login,
  Logout,
  Person,
} from '@mui/icons-material'
import GitScriptorIcon from './GitScriptorIcon'

const navigation = [
  { label: 'Repositories', path: '/repos', icon: FolderOpen },
  { label: 'Insights', path: '/insights', icon: Analytics },
  { label: 'History', path: '/history', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings },
]

interface AppLayoutProps {
  isAuthenticated?: boolean
  onSignIn?: () => void
  onSignOut?: () => void
  userInfo?: {
    name: string
    avatar: string
    login: string
  }
}

const AppLayout: React.FC<AppLayoutProps> = ({
  isAuthenticated = false,
  onSignIn,
  onSignOut,
  userInfo,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleSignIn = () => {
    onSignIn?.()
  }

  const handleSignOut = () => {
    onSignOut?.()
    handleUserMenuClose()
  }

  const mobileDrawer = (
    <Box sx={{ width: 240 }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
        GitScriptor
      </Typography>
      <Divider />
      <List>
        {navigation.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={1} 
        sx={{ 
          background: 'linear-gradient(-45deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25), rgba(236, 72, 153, 0.25), rgba(16, 185, 129, 0.25))',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backgroundSize: '500% 500%',
          animation: 'navbarGradient 15s ease-in-out infinite',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
          color: theme.palette.mode === 'dark' ? '#ffffff' : 'text.primary',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          '@keyframes navbarGradient': {
            '0%, 100%': {
              backgroundPosition: '0% 50%',
            },
            '20%': {
              backgroundPosition: '100% 50%',
            },
            '40%': {
              backgroundPosition: '200% 50%',
            },
            '60%': {
              backgroundPosition: '300% 50%',
            },
            '80%': {
              backgroundPosition: '400% 50%',
            },
          },
        }}
      >
        <Toolbar>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <GitScriptorIcon 
              animated 
              variant="minimal"
              sx={{ mr: 1, color: 'primary.main', fontSize: 24 }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                cursor: 'pointer',
                color: theme.palette.mode === 'dark' ? '#ffffff' : 'text.primary'
              }}
              onClick={() => navigate('/')}
            >
              GitScriptor
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigation.map((item) => (
                <Button
                  key={item.path}
                  startIcon={<item.icon />}
                  onClick={() => handleNavigation(item.path)}
                  variant={location.pathname === item.path ? 'contained' : 'text'}
                  size="small"
                  sx={{ 
                    textTransform: 'none',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Authentication */}
          {!isAuthenticated ? (
            <Button 
              variant="contained" 
              startIcon={<Login />}
              onClick={handleSignIn}
              sx={{ textTransform: 'none' }}
            >
              Sign in with GitHub
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleUserMenuOpen} size="small">
                <Avatar 
                  src={userInfo?.avatar} 
                  sx={{ width: 32, height: 32 }}
                >
                  {userInfo?.name?.[0] || userInfo?.login?.[0]}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {userInfo?.name || userInfo?.login}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleNavigation('/settings'); handleUserMenuClose(); }}>
                  <Person sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleNavigation('/settings'); handleUserMenuClose(); }}>
                  <Settings sx={{ mr: 1 }} />
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <Logout sx={{ mr: 1 }} />
                  Sign out
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        {mobileDrawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default AppLayout
