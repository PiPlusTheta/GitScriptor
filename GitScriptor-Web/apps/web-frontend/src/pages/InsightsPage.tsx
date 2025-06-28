import React from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  CircularProgress,
  Alert,
  Container,
  Button,
} from '@mui/material'
import {
  Code,
  People,
  BugReport,
  Star,
  ForkRight,
  TrendingUp,
  AutoAwesome,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useGenerationStats, useRepositoryStats } from '../hooks/useInsights'

const InsightsPage: React.FC = () => {
  const { isAuthenticated, isGuest, login } = useAuth()
  const { data: generationStats, isLoading: statsLoading, error: statsError } = useGenerationStats()
  const { data: repoStats, isLoading: repoLoading, error: repoError } = useRepositoryStats()

  const isLoading = statsLoading || repoLoading
  const hasError = statsError || repoError

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated && !isGuest) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Sign in Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please sign in with GitHub to view your insights
        </Typography>
        <Button variant="contained" onClick={login}>
          Sign in with GitHub
        </Button>
      </Container>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading insights...
        </Typography>
      </Container>
    )
  }

  // Show error state
  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load insights. Please try again.
        </Alert>
      </Container>
    )
  }

  // Transform data for charts
  const languageData = generationStats?.popular_languages ? 
    Object.entries(generationStats.popular_languages).map(([name, value], index) => ({
      name,
      value: Number(value),
      color: ['#3178c6', '#f7df1e', '#3776ab', '#00add8', '#e34c26'][index % 5]
    })) : []

  const monthlyData = generationStats?.generations_by_month ?
    Object.entries(generationStats.generations_by_month).map(([month, count]) => ({
      month: new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      generations: Number(count)
    })) : []

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          📊 Repository Insights
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Overview of your GitHub activity, repository statistics, and development trends.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  <Code />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {repoStats?.total_repositories || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Repositories
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                  }}
                >
                  <AutoAwesome />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {generationStats?.total_generations || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    README Generated
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                  }}
                >
                  <BugReport />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {generationStats?.failed_generations || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed Generations
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'info.main',
                    color: 'info.contrastText',
                  }}
                >
                  <Star />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {repoStats?.total_stars || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Stars
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Programming Languages */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Popular Languages
            </Typography>
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No language data available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Monthly Generations */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Monthly Generations
            </Typography>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="generations" fill="#3178c6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No generation history available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Language Usage Details */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Language Breakdown
            </Typography>
            {languageData.length > 0 ? (
              <Stack spacing={3}>
                {languageData.map((lang) => (
                  <Box key={lang.name}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: lang.color,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lang.name}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {lang.value} repos
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(lang.value / Math.max(...languageData.map(l => l.value))) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: lang.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No language data available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              📈 Quick Stats
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Stack alignItems="center" spacing={1}>
                  <TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {generationStats?.successful_generations || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Successful generations
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack alignItems="center" spacing={1}>
                  <ForkRight sx={{ fontSize: 32, color: 'info.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {repoStats?.total_forks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Total forks
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack alignItems="center" spacing={1}>
                  <People sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {repoStats?.public_repositories || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Public repos
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack alignItems="center" spacing={1}>
                  <Box sx={{ fontSize: 32, color: 'warning.main' }}>⏱️</Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {generationStats?.average_generation_time ? 
                      `${(generationStats.average_generation_time / 1000).toFixed(1)}s` : 
                      '0s'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Avg generation time
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default InsightsPage