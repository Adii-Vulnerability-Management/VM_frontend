import { useState, useEffect, useMemo, useEffect as ReactUseEffect } from 'react'
import CustomAxios from '@/globalcomponents/CustomAxios'
import { baseurl, initURL } from '../../../../BaseUrl'

/* ------------------------------- Helpers ------------------------------- */
function fmtDate(input) {
  if (!input) return '—'
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

/* ------------------------------- Skeleton ------------------------------- */
function ListSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-6 w-52 rounded bg-gray-200 mb-4" />
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-10 w-full bg-gray-50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-gray-100 border-t border-gray-200" />
        ))}
      </div>
    </div>
  )
}

/* --------------------------- Confirm Delete Modal --------------------------- */
function ConfirmDeleteModal({ open, label, onCancel, onConfirm, loading }) {
  const [value, setValue] = useState('')
  const canDelete = value.trim() === label

  ReactUseEffect(() => {
    if (open) setValue('')
  }, [open])

  ReactUseEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !loading && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => !loading && onCancel()} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Delete vendor?</h3>
        <p className="mt-2 text-sm text-gray-600">
          This action cannot be undone. Type <strong>{label}</strong> to confirm.
        </p>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={label}
          disabled={loading}
          className="mt-4 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={!canDelete || loading}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-white ${canDelete && !loading ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 cursor-not-allowed'}`}
          >
            {loading ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Deleting…
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- Page --------------------------------- */
export default function CookieVendorsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // form state (vendor-first)
  const [form, setForm] = useState({
    id: '',                 // _id
    name: '',               // vendor name (human readable)
    cookie: '',             // cookie key
    domain: '',             // domain
    category: 'Uncategorized',
    description: '',
    dataController: '',
    privacyLink: '',
    retentionPeriod: '',
    patterns: '',           // UI string: comma/newline separated
  })

  // search/filter
  const [query, setQuery] = useState('')

  // delete modal
  const [showDelete, setShowDelete] = useState(false)
  const [target, setTarget] = useState(null) // {_id, name || cookie}
  const [deleting, setDeleting] = useState(false)

  // Endpoint returning items like the sample you shared
  const apiBase = `${baseurl}/${initURL}/scanner/vendors`

  const fetchList = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await CustomAxios.get(apiBase)
      setRows(res.data || [])
    } catch (err) {
      console.error(err)
      setError('Could not load cookie vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const parsePatterns = (text) =>
    text
      .split(/\r?\n|,/g)
      .map((s) => s.trim())
      .filter(Boolean)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        // vendor-centric fields
        name: form.name,
        dataController: form.dataController,
        privacyLink: form.privacyLink,
        retentionPeriod: form.retentionPeriod,
        // cookie mapping fields
        cookie: form.cookie,
        domain: form.domain,
        category: form.category,
        description: form.description,
        patterns: parsePatterns(form.patterns),
      }
      if (form.id) {
        await CustomAxios.put(`${apiBase}/${form.id}`, payload)
      } else {
        await CustomAxios.post(apiBase, payload)
      }
      setForm({
        id: '',
        name: '',
        cookie: '',
        domain: '',
        category: 'Uncategorized',
        description: '',
        dataController: '',
        privacyLink: '',
        retentionPeriod: '',
        patterns: '',
      })
      fetchList()
    } catch (err) {
      console.error(err)
      setError('Save failed')
    }
  }

  const onEdit = (item) => {
    setForm({
      id: item._id,
      name: item.name || '',
      cookie: item.cookie || '',
      domain: item.domain || '',
      category: item.category || 'Uncategorized',
      description: item.description || '',
      dataController: item.dataController || '',
      privacyLink: item.privacyLink || '',
      retentionPeriod: item.retentionPeriod || '',
      patterns: (item.patterns || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openDelete = (item) => {
    // prefer vendor name; fall back to cookie key
    const label = item.name?.trim() ? item.name : item.cookie
    setTarget({ _id: item._id, label })
    setShowDelete(true)
  }
  const closeDelete = () => {
    if (deleting) return
    setShowDelete(false)
    setTarget(null)
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await CustomAxios.delete(`${apiBase}/${target._id}`)
      setRows((prev) => prev.filter((x) => x._id !== target._id))
      closeDelete()
    } catch (err) {
      console.error(err)
      setError('Delete failed')
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.cookie || '').toLowerCase().includes(q) ||
      (r.domain || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.patterns || []).join(', ').toLowerCase().includes(q) ||
      (r.dataController || '').toLowerCase().includes(q)
    )
  }, [rows, query])

  const isEditing = !!form.id
  const labelForTarget = target ? target.label || 'vendor' : ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Cookie Vendors</h1>
              <p className="mt-1 text-sm text-gray-600">Manage cookie vendors, categories, and associated cookie patterns.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchList}
                disabled={loading}
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                    Refreshing…
                  </>
                ) : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: '',
                    name: '',
                    cookie: '',
                    domain: '',
                    category: 'Uncategorized',
                    description: '',
                    dataController: '',
                    privacyLink: '',
                    retentionPeriod: '',
                    patterns: '',
                  })
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                + New Vendor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Google Analytics"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cookie Key</label>
              <input
                name="cookie"
                value={form.cookie}
                onChange={onChange}
                required
                placeholder="_ga, _fbp"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Domain</label>
              <input
                name="domain"
                value={form.domain}
                onChange={onChange}
                required
                placeholder="example.com"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="Analytics / Marketing / Functional"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                placeholder="Purpose or notes about this vendor’s cookies…"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Data Controller</label>
              <input
                name="dataController"
                value={form.dataController}
                onChange={onChange}
                placeholder="Google LLC"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Privacy Policy Link</label>
              <input
                name="privacyLink"
                value={form.privacyLink}
                onChange={onChange}
                placeholder="https://policies.google.com/privacy"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Retention Period</label>
              <input
                name="retentionPeriod"
                value={form.retentionPeriod}
                onChange={onChange}
                placeholder="2 years"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Patterns (regex)</label>
              <textarea
                name="patterns"
                value={form.patterns}
                onChange={onChange}
                rows={2}
                placeholder="^_ga$, ^_ga_9Y51KSV8Q3$"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">Use commas or new lines to add multiple entries.</p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: '',
                      name: '',
                      cookie: '',
                      domain: '',
                      category: 'Uncategorized',
                      description: '',
                      dataController: '',
                      privacyLink: '',
                      retentionPeriod: '',
                      patterns: '',
                    })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                {isEditing ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </form>
        </section>

        {/* Filter card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by vendor, cookie, domain, category, pattern, controller"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && <ListSkeleton />}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-gray-600">
              {rows.length === 0 ? 'No cookie vendors yet.' : 'No results match your search.'}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={() => setQuery('')}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear search
              </button>
              <button
                onClick={() =>
                  setForm({
                    id: '',
                    name: '',
                    cookie: '',
                    domain: '',
                    category: 'Uncategorized',
                    description: '',
                    dataController: '',
                    privacyLink: '',
                    retentionPeriod: '',
                    patterns: '',
                  })
                }
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add vendor
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-700">
                  <tr>
                    {['Vendor', 'Cookie', 'Domain', 'Category', 'Patterns', 'Controller', 'Updated', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{r.name || '—'}</td>
                      <td className="px-6 py-3">{r.cookie}</td>
                      <td className="px-6 py-3">{r.domain}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {r.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {(r.patterns || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.patterns.map((p, i) => (
                              <span key={i} className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs">{p}</span>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-3">{r.dataController || '—'}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700">{fmtDate(r.updatedAt)}</td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onEdit(r)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDelete(r)}
                            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={showDelete}
        label={labelForTarget}
        onCancel={closeDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
