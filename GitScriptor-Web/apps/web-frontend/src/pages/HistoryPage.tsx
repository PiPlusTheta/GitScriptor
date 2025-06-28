import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Stack,
  Divider,
  Avatar,
} from '@mui/material'
import { 
  Delete, 
  Download, 
  Visibility, 
  GitHub,
  Schedule,
  Article,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'

interface SavedProject {
  id: string
  repoName: string
  repoUrl: string
  generatedAt: Date
  markdownSize: number
  generationTimeMs: number
}

// Mock data for saved projects
const mockSavedProjects: SavedProject[] = [
  {
    id: '1',
    repoName: 'facebook/react',
    repoUrl: 'https://github.com/facebook/react',
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    markdownSize: 12500,
    generationTimeMs: 3420,
  },
  {
    id: '2',
    repoName: 'microsoft/vscode',
    repoUrl: 'https://github.com/microsoft/vscode',
    generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    markdownSize: 8900,
    generationTimeMs: 2850,
  },
  {
    id: '3',
    repoName: 'vercel/next.js',
    repoUrl: 'https://github.com/vercel/next.js',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    markdownSize: 15200,
    generationTimeMs: 4120,
  },
  {
    id: '4',
    repoName: 'tailwindlabs/tailwindcss',
    repoUrl: 'https://github.com/tailwindlabs/tailwindcss',
    generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    markdownSize: 6800,
    generationTimeMs: 2200,
  },
]

export default function HistoryPage() {
  const handleView = (project: SavedProject) => {
    console.log('View project:', project.repoName)
    // Navigate to editor or preview
  }

  const handleDownload = (project: SavedProject) => {
    console.log('Download project:', project.repoName)
    // Download markdown file
  }

  const handleDelete = (projectId: string) => {
    console.log('Delete project:', projectId)
    // Delete from saved projects
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          📚 Saved Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your previously generated README files and project documentation
        </Typography>
      </Box>

      {mockSavedProjects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Article sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No saved projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate your first README to see it here
          </Typography>
          <Button 
            variant="contained" 
            href="/"
            sx={{ textTransform: 'none' }}
          >
            Generate README
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {mockSavedProjects.map((project, index) => (
              <Box key={project.id}>
                <ListItem 
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <GitHub />
                  </Avatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ fontWeight: 600, color: 'primary.main' }}
                        >
                          {project.repoName}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Generated {formatDistanceToNow(project.generatedAt)} ago
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={formatBytes(project.markdownSize)}
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            label={`${project.generationTimeMs}ms`}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        </Stack>
                      </Stack>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleView(project)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownload(project)}
                        sx={{ color: 'success.main' }}
                      >
                        <Download />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(project.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < mockSavedProjects.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Summary Stats */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          📊 Summary
        </Typography>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {mockSavedProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {formatBytes(mockSavedProjects.reduce((sum, p) => sum + p.markdownSize, 0))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Content
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {Math.round(mockSavedProjects.reduce((sum, p) => sum + p.generationTimeMs, 0) / mockSavedProjects.length)}ms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Generation Time
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}
