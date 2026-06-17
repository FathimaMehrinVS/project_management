import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, apiFetch } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'active' | 'completed'>('draft')

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch(`/api/v1/projects/${id}`)
        setProject(data)
        if (data) {
          setTitle(data.title)
          setDescription(data.description || '')
          setStatus(data.status)
        }
      } catch (err: any) {
        // Show specific error messages (e.g. 403 Forbidden, 404 Not Found)
        if (err.status === 403) {
          setError('You do not have permission to view or manage this project.')
        } else if (err.status === 404) {
          setError('The requested project was not found.')
        } else {
          setError(err.message || 'Failed to load project details.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  // Determine if the current user is allowed to edit this project
  // - Admin: can edit all
  // - Manager: can edit all
  // - User: can edit only own projects
  const canEdit = React.useMemo(() => {
    if (!user || !project) return false
    if (user.role === 'admin' || user.role === 'manager') return true
    return user.role === 'user' && project.ownerId === user.id
  }, [user, project])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit || !project) return

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const updated = await apiFetch(`/api/v1/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          status,
        }),
      })

      setProject(updated)
      setSaveSuccess(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!project || user?.role !== 'admin') return
    setDeleting(true)
    try {
      await apiFetch(`/api/v1/projects/${project.id}`, {
        method: 'DELETE',
      })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      alert(err.message || 'Failed to delete project')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 pb-12">
      {/* Navigation Header */}
      <nav className="glass-panel border-b border-slate-800/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                P
              </Link>
              <span className="font-bold text-white text-lg tracking-tight">Project Hub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 transition text-xs font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center space-y-3">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-slate-400">Loading project details...</span>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-2xl p-8 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Access Denied / Error</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
            <Link
              to="/dashboard"
              className="inline-flex justify-center px-4 py-2 border border-slate-800 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-white transition"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : project ? (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-6 mb-6 gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Project Workspace</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{project.title}</h1>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                  {project.status}
                </span>
              </div>
            </div>

            {/* Read-only notification banner if not permitted to edit */}
            {!canEdit && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400 flex items-start space-x-3 mb-6">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <span className="font-semibold block mb-0.5">Read-Only View</span>
                  <p className="text-xs text-slate-400">
                    You do not have permission to edit this project. Only the project owner or managers/admins can make modifications.
                  </p>
                </div>
              </div>
            )}

            {/* Update / Save feedbacks */}
            {saveSuccess && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 flex items-center space-x-3 mb-6 animate-pulse">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Project changes saved successfully.</span>
              </div>
            )}

            {saveError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 flex items-start space-x-3 mb-6">
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className="font-semibold block mb-0.5">Failed to Save changes</span>
                  <p className="text-xs text-slate-400">{saveError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-3 border border-slate-800 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 ease-in-out text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Project Description
                </label>
                <textarea
                  rows={4}
                  disabled={!canEdit}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a comprehensive description..."
                  className="block w-full px-3 py-3 border border-slate-800 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 ease-in-out text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Project Status
                  </label>
                  <select
                    disabled={!canEdit}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="block w-full px-3 py-3 border border-slate-800 rounded-xl bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 ease-in-out text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="draft">Draft (planning phase)</option>
                    <option value="active">Active (in progress)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Project Owner
                  </label>
                  <input
                    type="text"
                    disabled
                    value={project.ownerEmail}
                    className="block w-full px-3 py-3 border border-slate-800/40 rounded-xl bg-slate-950/20 text-slate-400 text-sm font-mono cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Created on {new Date(project.createdAt).toLocaleString()}
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  {/* Delete Button - Admin Only */}
                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2.5 rounded-xl border border-rose-950/60 bg-rose-950/10 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-transparent transition text-xs font-semibold cursor-pointer"
                    >
                      Delete Project
                    </button>
                  )}

                  {/* Save changes button - only if editable */}
                  {canEdit && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-[0_4px_15px_rgba(99,102,241,0.25)] cursor-pointer"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : null}
      </main>

      {/* Delete Confirmation Modal (Admin only) */}
      {showDeleteModal && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-2">Delete Project</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">"{project.title}"</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
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
