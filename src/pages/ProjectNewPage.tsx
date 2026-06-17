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
        return 'bg-red-50 border-red-200 text-red-700'
      case 'manager':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      case 'user':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-slate-800 pb-12">
      {/* Navigation Header */}
      <nav className="glass-panel border-b border-slate-200 sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                P
              </Link>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Project Hub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-slate-500 hidden sm:inline">{user?.email}</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 transition text-xs font-medium bg-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="glass-panel rounded-2xl p-8 bg-white">
          <div className="border-b border-slate-200 pb-6 mb-6">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Create Workspace</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">Create New Project</h1>
            <p className="text-xs text-slate-500 mt-1">Initiate a new project. Default status will be set to 'draft'.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-600 flex items-start space-x-3">
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Project Title <span className="text-blue-600">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Redesign Q3"
                className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project goals, deliverables, or team roles..."
                className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <Link
                to="/dashboard"
                className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-600 transition bg-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition shadow-sm cursor-pointer"
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
