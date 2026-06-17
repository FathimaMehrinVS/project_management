import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function ProjectNewPage() {
  const navigate = useNavigate()
  const { user, apiFetch } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await apiFetch('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      })

      // On success, redirect to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      // Show specific error messages (e.g. 422 Validation errors, etc.)
      setError(err.message || 'Failed to create project.')
    } finally {
      setSaving(false)
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

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl p-8">
          <div className="border-b border-slate-800/60 pb-6 mb-6">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Create Workspace</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">Create New Project</h1>
            <p className="text-xs text-slate-400 mt-1">Initiate a new project. Default status will be set to 'draft'.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 flex items-start space-x-3">
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Project Title <span className="text-indigo-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Redesign Q3"
                className="block w-full px-3 py-3 border border-slate-800 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description <span className="text-slate-600">(Optional)</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project goals, deliverables, or team roles..."
                className="block w-full px-3 py-3 border border-slate-800 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end space-x-3">
              <Link
                to="/dashboard"
                className="px-4 py-2.5 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-[0_4px_15px_rgba(99,102,241,0.25)] cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
