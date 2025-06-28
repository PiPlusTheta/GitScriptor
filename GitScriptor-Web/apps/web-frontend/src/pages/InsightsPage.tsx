import React from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from '@mui/material'
import {
  Code,
  People,
  BugReport,
  Star,
  ForkRight,
  TrendingUp,
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

// Mock data for charts
const languageData = [
  { name: 'TypeScript', value: 45, color: '#3178c6' },
  { name: 'JavaScript', value: 30, color: '#f7df1e' },
  { name: 'Python', value: 15, color: '#3776ab' },
  { name: 'Go', value: 10, color: '#00add8' },
]

const commitsData = [
  { name: 'Mon', commits: 12 },
  { name: 'Tue', commits: 19 },
  { name: 'Wed', commits: 8 },
  { name: 'Thu', commits: 15 },
  { name: 'Fri', commits: 25 },
  { name: 'Sat', commits: 5 },
  { name: 'Sun', commits: 3 },
]

const contributionData = [
  { month: 'Jan', contributions: 45 },
  { month: 'Feb', contributions: 52 },
  { month: 'Mar', contributions: 48 },
  { month: 'Apr', contributions: 61 },
  { month: 'May', contributions: 55 },
  { month: 'Jun', contributions: 67 },
]

const InsightsPage: React.FC = () => {
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
                    24
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
                  <People />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    156
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contributors
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
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Issues
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
                    1.2k
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
              Programming Languages
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Commits Over Time */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Weekly Commits
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commitsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commits" fill="#3178c6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Top Languages Progress */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Language Usage
            </Typography>
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
                      {lang.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={lang.value}
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
          </Card>
        </Grid>

        {/* Contribution Activity */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Monthly Contributions
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={contributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  stroke="#3178c6"
                  strokeWidth={3}
                  dot={{ fill: '#3178c6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              📈 Quick Stats
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    +23%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Commits this month
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <Star sx={{ fontSize: 32, color: 'warning.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    +45
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    New stars this week
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <ForkRight sx={{ fontSize: 32, color: 'info.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    +12
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    New forks this week
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <Code sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    2.4k
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Lines of code added
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