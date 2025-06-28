import React from 'react'
import { Box, IconButton, Tooltip, Paper } from '@mui/material'
import { ContentCopy, Download } from '@mui/icons-material'
import MarkdownPreview from '@uiw/react-markdown-preview'

interface ReadmeViewerProps {
  markdown: string
}

const ReadmeViewer: React.FC<ReadmeViewerProps> = ({ markdown }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Action buttons */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          zIndex: 1,
          display: 'flex',
          gap: 1
        }}
      >
        <Tooltip title="Copy to clipboard">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              backgroundColor: '#f6f8fa',
              border: '1px solid #d0d7de',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#8c959f'
              }
            }}
          >
            <ContentCopy sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download README.md">
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              backgroundColor: '#f6f8fa',
              border: '1px solid #d0d7de',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#8c959f'
              }
            }}
          >
            <Download sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Markdown content */}
      <Paper
        sx={{
          border: '1px solid #d0d7de',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}
      >
        <MarkdownPreview 
          source={markdown}
          style={{ 
            padding: '16px 24px',
            backgroundColor: 'transparent',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#1f2328'
          }}
          wrapperElement={{
            'data-color-mode': 'light'
          }}
          rehypeRewrite={(node: any) => {
            // Customize the styling to match GitHub
            if (node.type === 'element') {
              // Style headings
              if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    fontWeight: '600',
                    lineHeight: '1.25',
                    marginTop: node.tagName === 'h1' ? '0' : '24px',
                    marginBottom: '16px',
                    paddingBottom: ['h1', 'h2'].includes(node.tagName) ? '0.3em' : '0',
                    borderBottom: ['h1', 'h2'].includes(node.tagName) ? '1px solid #d0d7de' : 'none'
                  }
                }
              }
              
              // Style code blocks
              if (node.tagName === 'pre') {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    backgroundColor: '#f6f8fa',
                    border: '1px solid #d0d7de',
                    borderRadius: '6px',
                    padding: '16px',
                    overflow: 'auto',
                    fontSize: '85%',
                    lineHeight: '1.45'
                  }
                }
              }
              
              // Style inline code
              if (node.tagName === 'code' && node.parent?.tagName !== 'pre') {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    backgroundColor: 'rgba(175, 184, 193, 0.2)',
                    padding: '0.2em 0.4em',
                    borderRadius: '3px',
                    fontSize: '85%'
                  }
                }
              }
              
              // Style tables
              if (node.tagName === 'table') {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    borderCollapse: 'collapse',
                    borderSpacing: '0',
                    width: '100%',
                    marginTop: '16px',
                    marginBottom: '16px'
                  }
                }
              }
              
              if (node.tagName === 'th' || node.tagName === 'td') {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    padding: '6px 13px',
                    border: '1px solid #d0d7de'
                  }
                }
              }
              
              if (node.tagName === 'th') {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    backgroundColor: '#f6f8fa',
                    fontWeight: '600'
                  }
                }
              }
              
              // Style blockquotes
              if (node.tagName === 'blockquote') {
                node.properties = {
                  ...node.properties,
                  style: {
                    ...node.properties?.style,
                    padding: '0 1em',
                    color: '#656d76',
                    borderLeft: '0.25em solid #d0d7de',
                    margin: '0'
                  }
                }
              }
            }
          }}
        />
      </Paper>
    </Box>
  )
}

export default ReadmeViewer
