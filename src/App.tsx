import { useMemo, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import './App.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')?.toString() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <main className="page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </main>
  )
}

function DashboardPage() {
  return (
    <main className="page">
      <h1>Dashboard</h1>
      <p>Welcome to the project dashboard.</p>
    </main>
  )
}

function ProjectNewPage() {
  return (
    <main className="page">
      <h1>New Project</h1>
      <p>Create a new project here.</p>
    </main>
  )
}

function ProjectViewPage() {
  return (
    <main className="page">
      <h1>Project Details</h1>
      <p>View a single project here.</p>
    </main>
  )
}

function RequireAuth({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects/new" element={<ProjectNewPage />} />
          <Route path="/projects/:id" element={<ProjectViewPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
