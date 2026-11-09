import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { request } from './api'
import {
  EMPTY_RECORDS,
  displayValue,
  initialFormValue,
  resources,
  valueAtPath,
} from './appData'

function AppShell() {
  const [records, setRecords] = useState({})
  const [activeKey, setActiveKey] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [connectionError, setConnectionError] = useState('')
  const [notice, setNotice] = useState('')
  const [questions, setQuestions] = useState([])

  const reportError = useCallback((requestError) => {
    if (requestError.name === 'BackendConnectionError') {
      setError('')
      setConnectionError(requestError.message)
    } else {
      setError(requestError.message)
    }
  }, [])

  const fetchRecords = useCallback(async () => {
    const entries = await Promise.all(resources.map(async (resource) => {
      const data = await request(resource.endpoint)
      return [resource.key, data]
    }))
    return Object.fromEntries(entries)
  }, [])

  const loadRecords = useCallback(async () => {
    try {
      setRecords(await fetchRecords())
      setError('')
      setConnectionError('')
    } catch (loadError) {
      reportError(loadError)
    } finally {
      setLoading(false)
    }
  }, [fetchRecords, reportError])

  useEffect(() => {
    let cancelled = false
    fetchRecords()
      .then((data) => {
        if (!cancelled) {
          setRecords(data)
          setConnectionError('')
        }
      })
      .catch((loadError) => {
        if (!cancelled) reportError(loadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [fetchRecords, reportError])

  const refreshRecords = () => {
    setLoading(true)
    return loadRecords()
  }

  const activeResource = resources.find((resource) => resource.key === activeKey)
  const rows = records[activeKey] ?? EMPTY_RECORDS
  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query || !activeResource) return rows
    return rows.filter((row) => activeResource.columns.some((column) =>
      displayValue(valueAtPath(row, column.key), column).toLowerCase().includes(query),
    ))
  }, [activeResource, rows, search])

  const openForm = async (row = null) => {
    setError('')
    setNotice('')
    const values = Object.fromEntries(activeResource.fields.map((field) => {
      let value = row ? row[field.key] : initialFormValue(field)
      if (field.key === 'teacherId' && row) value = row.teacher?.id
      if (field.key === 'classroomId' && row) value = row.classroom?.id
      if (field.key === 'userId' && row) value = row.user?.id
      if (field.key === 'lessonId' && row) value = row.lesson?.id
      if (field.key === 'quizId' && row) value = row.quiz?.id
      if (field.key === 'studentId' && row) value = row.student?.id
      if (field.key === 'studentIds' && row) value = row.students?.map((student) => student.id) ?? []
      if (field.key === 'options') value = (row?.options ?? []).join('\n')
      if (field.key === 'answers') value = {}
      if (field.key === 'isRead') value = row?.isRead ?? false
      if (field.key === 'password') value = ''
      return [field.key, value ?? initialFormValue(field)]
    }))
    setForm(values)
    if (activeKey === 'attempts') {
      try {
        setQuestions(await request('/questions'))
      } catch (loadError) {
        reportError(loadError)
        return
      }
    }
    setModal(row ? { mode: 'edit', row } : { mode: 'create' })
  }

  const closeForm = () => setModal(null)

  const saveRecord = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      if (Array.isArray(payload.options)) payload.options = payload.options.join('\n')
      if (typeof payload.options === 'string') {
        payload.options = payload.options.split('\n').map((option) => option.trim()).filter(Boolean)
      }
      for (const field of activeResource.fields) {
        if (field.type === 'relation' && payload[field.key] !== '') {
          payload[field.key] = Number(payload[field.key])
        }
        if (field.type === 'multiRelation') payload[field.key] = (payload[field.key] ?? []).map(Number)
        if (field.type === 'number') payload[field.key] = Number(payload[field.key])
      }
      if (activeKey === 'users' && !payload.password) delete payload.password
      const url = modal.mode === 'edit' ? `${activeResource.endpoint}/${modal.row.id}` : activeResource.createEndpoint ?? activeResource.endpoint
      await request(url, {
        method: modal.mode === 'edit' ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      setModal(null)
      setNotice(`${activeResource.singular} ${modal.mode === 'edit' ? 'updated' : 'created'}.`)
      await refreshRecords()
    } catch (saveError) {
      reportError(saveError)
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async (row) => {
    if (!window.confirm(`Delete "${activeResource.title(row)}"? This action cannot be undone.`)) return
    setError('')
    setNotice('')
    try {
      await request(`${activeResource.endpoint}/${row.id}`, { method: 'DELETE' })
      setNotice(`${activeResource.singular} deleted.`)
      await refreshRecords()
    } catch (deleteError) {
      reportError(deleteError)
    }
  }

  const changeFormValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const filteredQuestions = questions.filter((question) =>
    (!form.quizId || question.quiz?.id === Number(form.quizId)) &&
    (!form.difficulty || question.difficulty === form.difficulty),
  )

  return (
    <div className="app-shell">
      <Sidebar
        activeKey={activeKey}
        records={records}
        onOverviewClick={() => {
          setActiveKey('dashboard')
          setSearch('')
        }}
        onResourceClick={(key) => {
          setActiveKey(key)
          setSearch('')
          setError('')
          setNotice('')
        }}
      />

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {activeResource?.label ?? 'Overview'}</div>
          <span className="connection-indicator"><i aria-hidden="true" />Local workspace</span>
        </header>

        <div className="page-content">
          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
              <button className="text-button" onClick={refreshRecords}>Retry</button>
            </div>
          )}
          {notice && <div className="alert alert-success" role="status">{notice}</div>}

          {activeKey === 'dashboard' ? (
            <Dashboard records={records} loading={loading} onSelect={(key) => {
              setActiveKey(key)
              setSearch('')
              setError('')
              setNotice('')
            }} />
          ) : activeResource ? (
            <ResourcePanel
              resource={activeResource}
              rows={visibleRows}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              onAdd={() => openForm()}
              onEdit={(row) => openForm(row)}
              onDelete={deleteRecord}
              totalRows={rows.length}
            />
          ) : null}
        </div>
      </main>

      {modal && activeResource && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm() }}>
          <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <header className="dialog-heading">
              <div><p className="eyebrow">{modal.mode === 'edit' ? 'UPDATE RECORD' : 'NEW RECORD'}</p><h2 id="form-title">{modal.mode === 'edit' ? 'Edit' : 'Add'} {activeResource.singular}</h2></div>
              <button className="close-button" onClick={closeForm} aria-label="Close form">X</button>
            </header>
            <form onSubmit={saveRecord}>
              <div className="form-fields">
                {activeResource.fields.map((field) => (
                  <FormField
                    key={field.key}
                    field={{
                      ...field,
                      optionsValue: field.key === 'correctAnswer' ? form.options : field.optionsValue,
                      requiredOnCreate: field.requiredOnCreate && modal.mode === 'create',
                    }}
                    value={form[field.key]}
                    options={field.type === 'relation' || field.type === 'multiRelation' ? (records[field.source] ?? []).filter((item) => !field.filter || field.filter(item)) : []}
                    questions={filteredQuestions}
                    onChange={(value) => changeFormValue(field.key, value)}
                    onAnswerChange={(questionId, answer) => setForm((current) => ({ ...current, answers: { ...current.answers, [questionId]: answer } }))}
                  />
                ))}
              </div>
              <div className="dialog-actions">
                <button type="button" className="button button-quiet" onClick={closeForm} disabled={saving}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving...' : modal.mode === 'edit' ? 'Save changes' : 'Create record'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {connectionError && (
        <div className="modal-backdrop" role="presentation">
          <section className="form-dialog connection-dialog" role="alertdialog" aria-modal="true" aria-labelledby="connection-error-title" aria-describedby="connection-error-message">
            <header className="dialog-heading">
              <div><p className="eyebrow">CONNECTION ERROR</p><h2 id="connection-error-title">Backend unavailable</h2></div>
              <button className="close-button" onClick={() => setConnectionError('')} aria-label="Close error dialog">X</button>
            </header>
            <div className="connection-dialog-content">
              <p id="connection-error-message">{connectionError}</p>
              <div className="dialog-actions">
                <button type="button" className="button button-quiet" onClick={() => setConnectionError('')}>Close</button>
                <button type="button" className="button button-primary" onClick={refreshRecords}>Retry</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Sidebar({ activeKey, records, onOverviewClick, onResourceClick }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button className="brand" onClick={onOverviewClick}>
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>AdaptiLearn</span>
      </button>
      <div className="nav-label">WORKSPACE</div>
      <button className={`nav-item ${activeKey === 'dashboard' ? 'active' : ''}`} onClick={onOverviewClick}>
        <span className="nav-icon" aria-hidden="true">D</span> Overview
      </button>
      <div className="nav-label nav-label-spaced">LEARNING DATA</div>
      {resources.map((resource, index) => (
        <button
          className={`nav-item ${activeKey === resource.key ? 'active' : ''}`}
          key={resource.key}
          onClick={() => onResourceClick(resource.key)}
        >
          <span className="nav-icon" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          {resource.label}
          <span className="nav-count">{records[resource.key]?.length ?? 0}</span>
        </button>
      ))}
      <div className="sidebar-footer">
        <span className="avatar">ZG</span>
        <span><strong>ZenZone</strong><small>Learning workspace</small></span>
      </div>
    </aside>
  )
}

function Dashboard({ records, loading, onSelect }) {
  const total = resources.reduce((sum, resource) => sum + (records[resource.key]?.length ?? 0), 0)
  return (
    <>
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">YOUR LEARNING WORKSPACE</p>
          <h1>Good learning starts here.</h1>
          <p>Keep lessons, quizzes, and learner progress organized in one simple space.</p>
        </div>
        <div className="welcome-art" aria-hidden="true"><span>Learn</span><i /><b /></div>
      </section>
      <section className="overview-stats" aria-label="Workspace summary">
        <article className="stat-card"><span className="stat-icon">01</span><p>Total records</p><strong>{loading ? '...' : total}</strong><small>Across your workspace</small></article>
        <article className="stat-card"><span className="stat-icon">02</span><p>Learning content</p><strong>{loading ? '...' : (records.lessons?.length ?? 0) + (records.quizzes?.length ?? 0) + (records.questions?.length ?? 0)}</strong><small>Lessons, quizzes, questions</small></article>
        <article className="stat-card"><span className="stat-icon">03</span><p>People</p><strong>{loading ? '...' : records.users?.length ?? 0}</strong><small>Students and teachers</small></article>
      </section>
      <section className="section-heading"><div><p className="eyebrow">QUICK ACCESS</p><h2>Manage your learning data</h2></div></section>
      <section className="resource-grid" aria-label="Learning data sections">
        {resources.map((resource, index) => (
          <button className="resource-card" key={resource.key} onClick={() => onSelect(resource.key)}>
            <span className={`resource-icon resource-icon-${index % 4}`}>{String(index + 1).padStart(2, '0')}</span>
            <span className="resource-card-copy"><strong>{resource.label}</strong><small>{resource.description}</small></span>
            <span className="resource-arrow" aria-hidden="true">&gt;</span>
            <span className="resource-total">{loading ? '...' : records[resource.key]?.length ?? 0} records</span>
          </button>
        ))}
      </section>
    </>
  )
}

function ResourcePanel({ resource, rows, loading, search, onSearchChange, onAdd, onEdit, onDelete, totalRows }) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">DATA MANAGEMENT</p>
          <h1>{resource.label}</h1>
          <p className="page-description">{resource.description}</p>
        </div>
        <button className="button button-primary" onClick={onAdd}>
          <span aria-hidden="true">+</span> Add {resource.singular}
        </button>
      </section>

      <section className="panel data-panel" aria-label={`${resource.label} list`}>
        <div className="panel-toolbar">
          <div><h2>All {resource.label.toLowerCase()}</h2><p>{totalRows} record{totalRows === 1 ? '' : 's'}</p></div>
          <label className="search-box">
            <span aria-hidden="true">S</span>
            <span className="visually-hidden">Search {resource.label.toLowerCase()}</span>
            <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={`Search ${resource.label.toLowerCase()}...`} />
          </label>
        </div>

        {loading ? (
          <div className="loading-state">Loading your learning data...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">{search ? 'S' : '+'}</span>
            <h3>{search ? 'No matching records' : `No ${resource.label.toLowerCase()} yet`}</h3>
            <p>{search ? 'Try another search term.' : `Add your first ${resource.singular.toLowerCase()} to get started.`}</p>
            {!search && <button className="button button-secondary" onClick={onAdd}>Add {resource.singular}</button>}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {resource.columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  <th className="actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {resource.columns.map((column, index) => (
                      <td key={column.key}>
                        {index === 0 ? <strong>{displayValue(valueAtPath(row, column.key), column)}</strong> : displayValue(valueAtPath(row, column.key), column)}
                      </td>
                    ))}
                    <td className="row-actions">
                      <button className="text-button" onClick={() => onEdit(row)} aria-label={`Edit ${resource.title(row)}`}>Edit</button>
                      <button className="text-button danger-text" onClick={() => onDelete(row)} aria-label={`Delete ${resource.title(row)}`}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function FormField({ field, value, options, questions, onChange, onAnswerChange }) {
  const required = field.required || field.requiredOnCreate
  const fieldId = `field-${field.key}`
  let control

  if (field.type === 'relation' || field.type === 'select' || field.type === 'multiRelation') {
    const items = field.type === 'select'
      ? field.options.map((option) => ({ value: option, label: option }))
      : options.map((item) => ({ value: item.id, label: item.fullName ?? item.title ?? item.name }))

    control = (
      <select
        id={fieldId}
        value={field.type === 'multiRelation' ? value ?? [] : value ?? ''}
        multiple={field.type === 'multiRelation'}
        required={required}
        onChange={(event) => onChange(field.type === 'multiRelation' ? Array.from(event.target.selectedOptions, (option) => option.value) : event.target.value)}
      >
        {field.type !== 'multiRelation' && <option value="">Select {field.label.toLowerCase()}</option>}
        {items.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    )
  } else if (field.type === 'checkbox') {
    control = <input id={fieldId} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
  } else if (field.type === 'options') {
    control = <textarea id={fieldId} value={value ?? ''} rows={4} required onChange={(event) => onChange(event.target.value)} placeholder={'Option one\nOption two'} />
  } else if (field.type === 'answer-option') {
    const answers = typeof value === 'string' ? value : ''
    control = (
      <select id={fieldId} value={answers} required onChange={(event) => onChange(event.target.value)}>
        <option value="">Choose the correct answer</option>
        {(typeof field.optionsValue === 'string' ? field.optionsValue.split('\n') : []).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  } else if (field.type === 'answers') {
    control = questions.length ? (
      <div className="answer-list">
        {questions.map((question) => (
          <label className="answer-item" key={question.id}>
            <span>{question.text}</span>
            <select value={value?.[question.id] ?? ''} onChange={(event) => onAnswerChange(question.id, event.target.value)}>
              <option value="">No answer</option>
              {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
    ) : <p className="field-note">There are no questions for this quiz and difficulty yet.</p>
  } else if (field.type === 'textarea') {
    control = <textarea id={fieldId} value={value ?? ''} rows={field.rows ?? 3} required={required} onChange={(event) => onChange(event.target.value)} />
  } else {
    control = <input id={fieldId} type={field.type ?? 'text'} value={value ?? ''} min={field.min} max={field.max} required={required} onChange={(event) => onChange(event.target.value)} />
  }

  return (
    <div className={`form-field ${field.type === 'checkbox' ? 'checkbox-field' : ''}`}>
      {field.type !== 'checkbox' && <label htmlFor={fieldId}>{field.label}{required && <span className="required-mark"> *</span>}</label>}
      {field.type === 'checkbox' && <label htmlFor={fieldId}>{field.label}</label>}
      {field.help && <small>{field.help}</small>}
      {control}
    </div>
  )
}

export default AppShell
