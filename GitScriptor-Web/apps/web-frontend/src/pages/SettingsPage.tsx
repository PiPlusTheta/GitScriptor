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
} from '@mui/material'
import { 
  Key, 
  Security,
  Email,
} from '@mui/icons-material'
import { useState } from 'react'
import GitScriptorIcon from '../components/GitScriptorIcon'

export default function SettingsPage() {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  // Mock user data
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    avatar: 'https://github.com/github.png',
    joinedDate: '2023-01-15',
    plan: 'Pro',
  }

  const handleSaveApiKey = () => {
    console.log('Saving API key:', geminiApiKey)
    // Save to localStorage or backend
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

      {/* Account Section */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          👤 Account Information
        </Typography>
        
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Avatar 
            src={mockUser.avatar} 
            sx={{ width: 80, height: 80 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {mockUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              @{mockUser.username}
            </Typography>
            <Chip 
              label={mockUser.plan} 
              color="primary" 
              size="small" 
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Stack>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <Email />
            </ListItemIcon>
            <ListItemText 
              primary="Email" 
              secondary={mockUser.email}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GitScriptorIcon 
                variant="minimal"
                sx={{
                  '&:hover': {
                    transform: 'translateY(-1px) scale(1.05)',
                    color: 'primary.main',
                  }
                }}
              />
            </ListItemIcon>
            <ListItemText 
              primary="GitHub Username" 
              secondary={`@${mockUser.username}`}
            />
          </ListItem>
        </List>

        <Button 
          variant="outlined" 
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Edit Profile
        </Button>
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
                checked={true}
                disabled
              />
            }
            label="Dark Mode"
          />
          
          <Typography variant="body2" color="text.secondary">
            GitScriptor uses a beautiful dark theme optimized for code reading and long coding sessions.
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
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            fullWidth
            InputProps={{
              startAdornment: <Key sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleSaveApiKey}
            disabled={!geminiApiKey}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            Save API Key
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            Your API key is encrypted and stored securely. It's only used for generating README content.
          </Typography>
        </Stack>
      </Card>

      {/* Preferences Section */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          🔧 Preferences
        </Typography>
        
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            }
            label="Email Notifications"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
            }
            label="Auto-save Generated READMEs"
          />
          
          <Typography variant="body2" color="text.secondary">
            Configure how GitScriptor behaves and what notifications you receive.
          </Typography>
        </Stack>
      </Card>

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
                secondary="Not enabled"
              />
              <Button 
                variant="outlined" 
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Enable
              </Button>
            </ListItem>
          </List>
          
          <Divider />
          
          <Button 
            variant="outlined" 
            color="error"
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            Change Password
          </Button>
        </Stack>
      </Card>

      {/* Danger Zone */}
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
          >
            Clear All Data
          </Button>
          <Button 
            variant="contained" 
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Delete Account
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}
