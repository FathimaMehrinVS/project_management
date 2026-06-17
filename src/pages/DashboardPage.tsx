import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

interface Project {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'completed'
  ownerId: string
  ownerEmail: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, logout, apiFetch } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/v1/projects')
      setProjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return
    setDeleting(true)
    try {
      await apiFetch(`/api/v1/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      })
      // Remove from UI state
      setProjects(projects.filter((p) => p.id !== projectToDelete.id))
      setProjectToDelete(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  // Count helper functions for Stats cards
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    draft: projects.filter((p) => p.status === 'draft').length,
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  // Get role styling for badges
  const getRoleBadgeStyle = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-500/10 border-red-500/20 text-red-400'
      case 'manager':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      case 'user':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    }
  }

  // Get status styling for badges
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'draft':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 pb-12">
      {/* Navigation Header */}
      <nav className="glass-panel border-b border-slate-800/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                P
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Project Hub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition text-xs font-medium cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Dashboard Title & Call to Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400">Manage, organize, and monitor team projects.</p>
          </div>
          <Link
            to="/projects/new"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition cursor-pointer self-start sm:self-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        </div>

        {/* Stats Metrics Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Total Projects</span>
            <span className="text-3xl font-black text-white">{loading ? '...' : stats.total}</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Active</span>
            <span className="text-3xl font-black text-indigo-400">{loading ? '...' : stats.active}</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Completed</span>
            <span className="text-3xl font-black text-emerald-400">{loading ? '...' : stats.completed}</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Drafts</span>
            <span className="text-3xl font-black text-slate-400">{loading ? '...' : stats.draft}</span>
          </div>
        </div>

        {/* Project List Section */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/10 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Projects Repository</h2>
            <button 
              onClick={fetchProjects}
              className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/50 text-slate-400 hover:text-white transition cursor-pointer"
              title="Refresh projects list"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col justify-center items-center space-y-3">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-slate-400">Loading your project workspace...</span>
            </div>
          ) : error ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-base mb-1">Failed to fetch data</h3>
              <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">{error}</p>
              <button 
                onClick={fetchProjects}
                className="px-4 py-2 border border-slate-800 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v3m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-base mb-1">No Projects Found</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                {user?.role === 'user' 
                  ? "You don't own any projects yet. Create a new one to get started." 
                  : "No projects exist in the repository yet. Create a new one."}
              </p>
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-[0_4px_15px_rgba(99,102,241,0.2)] cursor-pointer"
              >
                Create Project
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-900/20 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{project.title}</div>
                        {project.description && (
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-xs sm:max-w-md">
                            {project.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 font-mono text-xs">{project.ownerEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2.5">
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/20 hover:bg-slate-900/60 hover:text-white transition text-xs font-semibold cursor-pointer"
                        >
                          View Details
                        </Link>
                        
                        {/* Delete button: Visible only to admins */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(project)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-rose-950/50 bg-rose-950/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-transparent transition text-xs font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal (Admin only) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2">Delete Project</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">"{projectToDelete.title}"</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                disabled={deleting}
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(239,68,68,0.2)] cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
