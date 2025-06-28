import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import ReposPage from './pages/ReposPage'
import EditorPage from './pages/EditorPage'
import InsightsPage from './pages/InsightsPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { useAuth } from './contexts/AuthContext'
import { DynamicFavicon } from './utils/favicon'

function App() {
  const { user, isAuthenticated, login, logout } = useAuth()

  // Initialize dynamic favicon on app load
  useEffect(() => {
    DynamicFavicon.reset()
  }, [])

  return (
    <Router>
      <Routes>
        <Route 
          path="/*" 
          element={
            <AppLayout 
              isAuthenticated={isAuthenticated}
              onSignIn={login}
              onSignOut={logout}
              userInfo={user ? {
                name: user.name || user.username,
                avatar: user.avatar_url || '',
                login: user.username
              } : undefined}
            />
          }
        >
          <Route path="" element={<HomePage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="repos" element={<ReposPage />} />
          <Route path="editor/:repo" element={<EditorPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
