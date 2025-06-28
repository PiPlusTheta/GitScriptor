import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Stack,
  Chip,
  Alert,
} from '@mui/material'
import {
  Refresh,
  Download,
  GitHub,
  Visibility,
  Edit,
  ContentCopy,
} from '@mui/icons-material'

// Mock README content
const mockReadmeContent = `# Project Name

A brief description of what this project does and who it's for.

## Features

- ✨ Feature 1: Description of feature 1
- 🚀 Feature 2: Description of feature 2
- 🔧 Feature 3: Description of feature 3

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
import { ProjectName } from 'project-name';

const example = new ProjectName();
example.doSomething();
\`\`\`

## API Reference

### \`doSomething()\`

Description of the method.

**Parameters:**
- \`param1\` (string): Description of param1
- \`param2\` (number): Description of param2

**Returns:**
- Promise<string>: Description of return value

## Contributing

Contributions are always welcome!

See \`contributing.md\` for ways to get started.

## License

[MIT](https://choosealicense.com/licenses/mit/)
`

const EditorPage: React.FC = () => {
  const { repo } = useParams<{ repo: string }>()
  const [markdownContent, setMarkdownContent] = useState(mockReadmeContent)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Parse repo full name
  const repoFullName = repo?.replace('-', '/') || 'unknown/repository'
  const [owner, repoName] = repoFullName.split('/')

  useEffect(() => {
    // Reset unsaved changes when content changes externally (like regeneration)
    setHasUnsavedChanges(false)
  }, [repo])

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value)
    setHasUnsavedChanges(true)
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setMarkdownContent(mockReadmeContent + '\n\n<!-- Regenerated at ' + new Date().toLocaleString() + ' -->')
      setIsGenerating(false)
      setHasUnsavedChanges(false)
    }, 2000)
  }

  const handleExport = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      // In a real app, you'd show a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCommitToGitHub = () => {
    // Placeholder for GitHub API integration
    console.log('Committing to GitHub:', repoFullName)
  }

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <GitHub sx={{ fontSize: 32, color: 'text.secondary' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              {repoName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {owner}/{repoName}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={hasUnsavedChanges ? 'Unsaved Changes' : 'Saved'}
            color={hasUnsavedChanges ? 'warning' : 'success'}
            size="small"
          />
        </Stack>

        {/* Action buttons */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRegenerate}
            disabled={isGenerating}
            sx={{ minWidth: 140 }}
          >
            {isGenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCopy}
          >
            Copy
          </Button>
          <Button
            variant="contained"
            startIcon={<GitHub />}
            onClick={handleCommitToGitHub}
            disabled={!hasUnsavedChanges}
          >
            Commit to GitHub
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={showPreview ? <Edit /> : <Visibility />}
            onClick={() => setShowPreview(!showPreview)}
            sx={{ minWidth: 120 }}
          >
            {showPreview ? 'Edit Mode' : 'Preview'}
          </Button>
        </Stack>
      </Box>

      {hasUnsavedChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have unsaved changes. Don't forget to commit them to GitHub when you're ready.
        </Alert>
      )}

      {/* Editor/Preview */}
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 300px)' }}>
        {/* Editor Panel */}
        <Grid item xs={12} md={showPreview ? 6 : 12}>
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Edit sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Markdown Editor
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {markdownContent.length} characters
              </Typography>
            </Box>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={markdownContent}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              placeholder="Enter your markdown content here..."
              InputProps={{
                sx: {
                  height: '100%',
                  '& .MuiInputBase-input': {
                    height: '100% !important',
                    overflow: 'auto !important',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  padding: 0,
                },
              }}
            />
          </Paper>
        </Grid>

        {/* Preview Panel */}
        {showPreview && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Visibility sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Preview
                </Typography>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 3,
                  '& h1': { fontSize: '2rem', fontWeight: 600, mb: 2 },
                  '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 1.5, mt: 3 },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1, mt: 2 },
                  '& p': { mb: 2, lineHeight: 1.6 },
                  '& ul, & ol': { mb: 2, pl: 3 },
                  '& li': { mb: 0.5 },
                  '& pre': {
                    backgroundColor: 'action.hover',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  },
                  '& code': {
                    backgroundColor: 'action.hover',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.875rem',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  },
                  '& blockquote': {
                    borderLeft: 4,
                    borderColor: 'primary.main',
                    pl: 2,
                    ml: 0,
                    fontStyle: 'italic',
                    color: 'text.secondary',
                  },
                }}
              >
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default EditorPage
