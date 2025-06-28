import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Grid,
  InputAdornment,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Search,
  Star,
  ForkRight,
  Lock,
  Public,
  AutoAwesome,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useUserRepositories } from '../hooks/useRepositories'
import { useGenerateReadme } from '../hooks/useGenerateReadme'

const ReposPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { isAuthenticated, isGuest, login } = useAuth()
  const generateReadme = useGenerateReadme()
  
  const { data: reposData, isLoading, error } = useUserRepositories({
    per_page: 50,
    sort: 'updated'
  })

  const handleGenerateReadme = (repoUrl: string) => {
    generateReadme.mutate({ repo_url: repoUrl })
  }

  const handleSignIn = () => {
    login()
  }

  // Filter repositories based on search term
  const filteredRepos = reposData?.repositories?.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (!isAuthenticated && !isGuest) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Sign in Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please sign in with GitHub to view your repositories
        </Typography>
        <Button variant="contained" onClick={handleSignIn}>
          Sign in with GitHub
        </Button>
      </Container>
    )
  }

  if (isGuest) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          You're browsing as a guest. Sign in to view your private repositories.
        </Alert>
        <Typography variant="h4" gutterBottom>
          Public Repositories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          As a guest, you can generate READMEs for any public GitHub repository by entering the URL on the home page.
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Repositories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a repository to generate or update its README
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Loading */}
      {Boolean(isLoading) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {Boolean(error) && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load repositories. Please try again.
        </Alert>
      )}

      {/* Repository Grid */}
      <Grid container spacing={3}>
        {filteredRepos.map((repo) => (
          <Grid item xs={12} md={6} lg={4} key={repo.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  {repo.is_private ? <Lock color="action" fontSize="small" /> : <Public color="action" fontSize="small" />}
                  <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                    {repo.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {repo.description || 'No description available'}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star fontSize="small" color="action" />
                    <Typography variant="body2">{repo.stars_count || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ForkRight fontSize="small" color="action" />
                    <Typography variant="body2">{repo.forks_count || 0}</Typography>
                  </Box>
                </Stack>

                {repo.language && (
                  <Chip 
                    label={repo.language} 
                    size="small" 
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                )}
              </CardContent>

              <CardActions sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesome />}
                    onClick={() => handleGenerateReadme(repo.url)}
                    disabled={generateReadme.isPending}
                    sx={{ flex: 1 }}
                  >
                    Generate README
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => window.open(repo.url, '_blank')}
                    size="small"
                  >
                    View
                  </Button>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No results */}
      {!isLoading && filteredRepos.length === 0 && searchTerm && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No repositories found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        </Box>
      )}

      {/* No repositories */}
      {!isLoading && !error && reposData?.repositories?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No repositories found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first repository on GitHub to get started
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default ReposPage