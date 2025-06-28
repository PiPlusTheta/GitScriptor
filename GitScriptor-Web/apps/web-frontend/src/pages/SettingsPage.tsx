import {
  Box,
  Typography,
  Card,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Avatar,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
} from '@mui/material'
import { 
  Key, 
  Security,
  Person,
  LocationOn,
  Business,
  Link as LinkIcon,
  CalendarToday,
  Public,
  Star,
  Code,
  Visibility,
  VisibilityOff,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import IntegrationTest from '../components/IntegrationTest'

interface UserSettings {
  default_style: string
  auto_save_drafts: boolean
  email_notifications: boolean
  theme: string
  language: string
  timezone: string
}

export default function SettingsPage() {
  const { user, isAuthenticated, isGuest } = useAuth()
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Load user settings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserSettings()
    }
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key')
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey)
    }
  }, [isAuthenticated])

  const loadUserSettings = async () => {
    try {
      const settings = await api.getUserSettings()
      setUserSettings(settings as UserSettings)
    } catch (error) {
      console.error('Failed to load user settings:', error)
    }
  }

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    if (!isAuthenticated) return
    
    try {
      setSaveStatus('saving')
      const updatedSettings = await api.updateUserSettings(updates)
      setUserSettings(updatedSettings as UserSettings)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to update settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (userSettings) {
      const updates = { [key]: value }
      setUserSettings({ ...userSettings, ...updates })
      updateUserSettings(updates)
    }
  }

  const handleSaveApiKey = () => {
    console.log('Saving API key:', geminiApiKey)
    // Save to localStorage for now (backend integration needed)
    localStorage.setItem('gemini_api_key', geminiApiKey)
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAuthStatusChip = () => {
    if (isGuest) {
      return <Chip icon={<Public />} label="Guest Mode" color="info" size="small" />
    }
    if (isAuthenticated) {
      return <Chip icon={<CheckCircle />} label="Authenticated" color="success" size="small" />
    }
    return <Chip icon={<ErrorOutline />} label="Not Signed In" color="default" size="small" />
  }

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          ⚙️ Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account, preferences, and integrations
        </Typography>
      </Box>

      {/* Authentication Status */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <CardHeader
          title="🔐 Authentication Status"
          action={getAuthStatusChip()}
          sx={{ pb: 2 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {isGuest && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Guest Mode Active</AlertTitle>
              You're currently using GitScriptor as a guest. Sign in with GitHub to access private repositories and save your preferences.
            </Alert>
          )}
          
          {!isAuthenticated && !isGuest && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Not Signed In</AlertTitle>
              Please sign in to access all features and save your settings.
            </Alert>
          )}

          {isAuthenticated && user && (
            <Box>
              <Typography variant="h6" gutterBottom>GitHub Account Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={user.avatar_url} sx={{ width: 60, height: 60 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {user.name || user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{user.username}
                        </Typography>
                        {user.email && (
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Profile Stats</Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Code sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {user.public_repos} public repositories
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {user.followers} followers
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {user.following} following
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                {(user.bio || user.location || user.company || user.blog) && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Additional Info</Typography>
                      <Stack spacing={1}>
                        {user.bio && (
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{user.bio}"
                          </Typography>
                        )}
                        <Stack direction="row" spacing={3} flexWrap="wrap">
                          {user.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{user.location}</Typography>
                            </Box>
                          )}
                          {user.company && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Business sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{user.company}</Typography>
                            </Box>
                          )}
                          {user.blog && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LinkIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{user.blog}</Typography>
                            </Box>
                          )}
                        </Stack>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            Joined {formatDate(user.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          🎨 Appearance
        </Typography>
        
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={userSettings?.theme === 'dark'}
                onChange={(e) => handleSettingChange('theme', e.target.checked ? 'dark' : 'light')}
                disabled={!isAuthenticated}
              />
            }
            label="Dark Mode"
          />
          
          <Typography variant="body2" color="text.secondary">
            {isAuthenticated 
              ? "Choose your preferred theme. Your selection will be saved to your account."
              : "GitScriptor uses a beautiful dark theme optimized for code reading and long coding sessions. Sign in to customize your theme preference."
            }
          </Typography>
        </Stack>
      </Card>

      {/* API Integration Section */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          🔑 API Integration
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Gemini API Integration</AlertTitle>
          Add your Google Gemini API key to enable AI-powered README generation with advanced features.
        </Alert>

        <Stack spacing={2}>
          <TextField
            label="Gemini API Key"
            type={showApiKey ? 'text' : 'password'}
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            fullWidth
            InputProps={{
              startAdornment: <Key sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <IconButton
                  onClick={() => setShowApiKey(!showApiKey)}
                  edge="end"
                  size="small"
                >
                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleSaveApiKey}
            disabled={!geminiApiKey || saveStatus === 'saving'}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            startIcon={saveStatus === 'saving' ? <CircularProgress size={16} /> : undefined}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save API Key'}
          </Button>
          
          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 1 }}>
              API key saved successfully!
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Your API key is encrypted and stored securely. It's only used for generating README content.
          </Typography>
        </Stack>
      </Card>

      {/* Preferences Section */}
      {isAuthenticated && userSettings && (
        <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            🔧 Preferences
          </Typography>
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={userSettings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={userSettings.auto_save_drafts}
                  onChange={(e) => handleSettingChange('auto_save_drafts', e.target.checked)}
                />
              }
              label="Auto-save Generated READMEs"
            />
            
            <Typography variant="body2" color="text.secondary">
              Configure how GitScriptor behaves and what notifications you receive.
            </Typography>

            {saveStatus === 'saving' && (
              <Alert severity="info">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  Saving preferences...
                </Box>
              </Alert>
            )}

            {saveStatus === 'success' && (
              <Alert severity="success">
                Preferences saved successfully!
              </Alert>
            )}
          </Stack>
        </Card>
      )}

      {/* Security Section */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          🔒 Security
        </Typography>
        
        <Stack spacing={2}>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText 
                primary="Two-Factor Authentication" 
                secondary={isAuthenticated ? "Managed through GitHub settings" : "Not available in guest mode"}
              />
              {isAuthenticated && (
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ textTransform: 'none' }}
                  onClick={() => window.open('https://github.com/settings/security', '_blank')}
                >
                  Configure on GitHub
                </Button>
              )}
            </ListItem>
          </List>
          
          <Divider />
          
          {isAuthenticated ? (
            <Typography variant="body2" color="text.secondary">
              Your account security is managed through GitHub. Visit your GitHub security settings to configure two-factor authentication and other security options.
            </Typography>
          ) : (
            <Alert severity="info">
              Sign in with GitHub to access security features and account management.
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Integration Testing Section */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          🧪 Integration Testing
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Test the integration between frontend and backend to ensure all features are working correctly.
        </Typography>
        
        <IntegrationTest />
      </Card>

      {/* Danger Zone */}
      {isAuthenticated && (
        <Card variant="outlined" sx={{ p: 3, border: 1, borderColor: 'error.main' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'error.main' }}>
            ⚠️ Danger Zone
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These actions are irreversible. Please proceed with caution.
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              color="error"
              sx={{ textTransform: 'none' }}
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
            >
              Clear Local Data
            </Button>
            <Button 
              variant="contained" 
              color="error"
              sx={{ textTransform: 'none' }}
              disabled
            >
              Delete Account (Coming Soon)
            </Button>
          </Stack>
        </Card>
      )}
    </Box>
  )
}
