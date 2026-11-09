import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { request } from './api'

const resources = [
  {
    key: 'users',
    label: 'Users',
    singular: 'User',
    description: 'Manage student and teacher accounts.',
    endpoint: '/users',
    createEndpoint: '/users/register',
    columns: [
      { key: 'fullName', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'rewardPoints', label: 'Points' },
    ],
    fields: [
      { key: 'fullName', label: 'Full name', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'password', label: 'Password', type: 'password', requiredOnCreate: true, help: 'Leave blank when editing to keep the current password.' },
      { key: 'role', label: 'Role', type: 'select', options: ['STUDENT', 'TEACHER'], required: true },
      { key: 'rewardPoints', label: 'Reward points', type: 'number', min: 0, required: true },
    ],
    title: (row) => row.fullName,
  },
  {
    key: 'classrooms',
    label: 'Classrooms',
    singular: 'Classroom',
    description: 'Organize learners into subject-based classrooms.',
    endpoint: '/classrooms',
    columns: [
      { key: 'name', label: 'Classroom' },
      { key: 'subject', label: 'Subject' },
      { key: 'joinCode', label: 'Join code' },
    ],
    fields: [
      { key: 'name', label: 'Classroom name', required: true },
      { key: 'subject', label: 'Subject', required: true },
      { key: 'joinCode', label: 'Join code', required: true },
      { key: 'studentIds', label: 'Enrolled students', type: 'multiRelation', source: 'users', filter: (user) => user.role === 'STUDENT', help: 'Hold Ctrl or Command to select more than one student.' },
    ],
    title: (row) => row.name,
  },
  {
    key: 'lessons',
    label: 'Lessons',
    singular: 'Lesson',
    description: 'Create and update learning materials.',
    endpoint: '/lessons',
    columns: [
      { key: 'title', label: 'Lesson' },
      { key: 'teacher.fullName', label: 'Teacher' },
      { key: 'description', label: 'Description' },
    ],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Short description', type: 'textarea' },
      { key: 'content', label: 'Lesson content', type: 'textarea', rows: 5 },
      { key: 'teacherId', label: 'Teacher', type: 'relation', source: 'users', filter: (user) => user.role === 'TEACHER', required: true },
      { key: 'classroomId', label: 'Classroom', type: 'relation', source: 'classrooms', required: true },
    ],
    title: (row) => row.title,
  },
  {
    key: 'quizzes',
    label: 'Quizzes',
    singular: 'Quiz',
    description: 'Connect quizzes to lessons.',
    endpoint: '/quizzes',
    columns: [
      { key: 'title', label: 'Quiz' },
      { key: 'lesson.title', label: 'Lesson' },
      { key: 'createdAt', label: 'Created' },
    ],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'lessonId', label: 'Lesson', type: 'relation', source: 'lessons', required: true },
    ],
    title: (row) => row.title,
  },
  {
    key: 'adaptiveRules',
    label: 'Adaptive rules',
    singular: 'Adaptive rule',
    description: 'Set the skill and score thresholds used to adapt quizzes.',
    endpoint: '/adaptive-rules',
    columns: [
      { key: 'quiz.title', label: 'Quiz' },
      { key: 'minSkillLevel', label: 'Minimum skill (%)' },
      { key: 'thresholdScore', label: 'Score threshold (%)' },
    ],
    fields: [
      { key: 'quizId', label: 'Quiz', type: 'relation', source: 'quizzes', required: true },
      { key: 'minSkillLevel', label: 'Minimum skill level (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'thresholdScore', label: 'Score threshold (%)', type: 'number', min: 0, max: 100, required: true },
    ],
    title: (row) => row.quiz?.title ?? 'Adaptive rule',
  },
  {
    key: 'questions',
    label: 'Questions',
    singular: 'Question',
    description: 'Write multiple-choice questions and set their difficulty.',
    endpoint: '/questions',
    columns: [
      { key: 'text', label: 'Question' },
      { key: 'quiz.title', label: 'Quiz' },
      { key: 'difficulty', label: 'Difficulty' },
    ],
    fields: [
      { key: 'text', label: 'Question', type: 'textarea', rows: 3, required: true },
      { key: 'options', label: 'Answer options', type: 'options', help: 'Enter one option per line.' },
      { key: 'correctAnswer', label: 'Correct answer', type: 'answer-option', required: true },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['EASY', 'MEDIUM', 'HARD'], required: true },
      { key: 'quizId', label: 'Quiz', type: 'relation', source: 'quizzes', required: true },
    ],
    title: (row) => row.text,
  },
  {
    key: 'progress',
    label: 'Progress',
    singular: 'Progress record',
    description: 'Review learner progress by lesson.',
    endpoint: '/progress',
    columns: [
      { key: 'user.fullName', label: 'Learner' },
      { key: 'lesson.title', label: 'Lesson' },
      { key: 'status', label: 'Status' },
      { key: 'skillLevel', label: 'Skill level' },
    ],
    fields: [
      { key: 'userId', label: 'Learner', type: 'relation', source: 'users', filter: (user) => user.role === 'STUDENT', required: true },
      { key: 'lessonId', label: 'Lesson', type: 'relation', source: 'lessons', required: true },
      { key: 'status', label: 'Status', required: true },
      { key: 'skillLevel', label: 'Skill level (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'completionTime', label: 'Time spent (seconds)', type: 'number', min: 0, required: true },
    ],
    title: (row) => `${row.user?.fullName ?? 'Learner'} - ${row.lesson?.title ?? 'Lesson'}`,
  },
  {
    key: 'attempts',
    label: 'Quiz attempts',
    singular: 'Quiz attempt',
    description: 'Review quiz submissions and recorded results.',
    endpoint: '/attempts',
    columns: [
      { key: 'student.fullName', label: 'Learner' },
      { key: 'quiz.title', label: 'Quiz' },
      { key: 'difficulty', label: 'Difficulty' },
      { key: 'scorePercent', label: 'Score' },
      { key: 'submittedAt', label: 'Submitted' },
    ],
    fields: [
      { key: 'studentId', label: 'Learner', type: 'relation', source: 'users', filter: (user) => user.role === 'STUDENT', required: true },
      { key: 'quizId', label: 'Quiz', type: 'relation', source: 'quizzes', required: true },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['EASY', 'MEDIUM', 'HARD'], required: true },
      { key: 'completionTimeSeconds', label: 'Time taken (seconds)', type: 'number', min: 0, required: true },
      { key: 'answers', label: 'Answers', type: 'answers', help: 'Choose an answer for each question at the selected difficulty.' },
    ],
    title: (row) => row.quiz?.title ?? 'Quiz attempt',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    singular: 'Notification',
    description: 'Manage messages sent to learners and teachers.',
    endpoint: '/notifications',
    columns: [
      { key: 'user.fullName', label: 'Recipient' },
      { key: 'message', label: 'Message' },
      { key: 'type', label: 'Type' },
      { key: 'isRead', label: 'Read' },
      { key: 'createdAt', label: 'Created' },
    ],
    fields: [
      { key: 'userId', label: 'Recipient', type: 'relation', source: 'users', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'type', label: 'Type', required: true },
      { key: 'isRead', label: 'Already read', type: 'checkbox' },
    ],
    title: (row) => row.message,
  },
]

const EMPTY_RECORDS = []

const initialFormValue = (field) => {
  if (field.type === 'checkbox') return false
  if (field.type === 'number') return 0
  if (field.type === 'options') return ''
  if (field.type === 'multiRelation') return []
  if (field.type === 'answers') return {}
  return ''
}

function valueAtPath(object, path) {
  return path.split('.').reduce((value, part) => value?.[part], object)
}

function displayValue(value, column) {
  if (value == null || value === '') return '-'
  if (column.key === 'isRead') return value ? 'Yes' : 'No'
  if (column.key === 'scorePercent' || column.key === 'skillLevel') return `${value}%`
  if (column.key.endsWith('At')) return new Date(value).toLocaleString()
  return String(value)
}

function App() {
  const [records, setRecords] = useState({})
  const [activeKey, setActiveKey] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [questions, setQuestions] = useState([])

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
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [fetchRecords])

  useEffect(() => {
    let cancelled = false
    fetchRecords()
      .then((data) => {
        if (!cancelled) setRecords(data)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [fetchRecords])

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
        setError(loadError.message)
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
      setError(saveError.message)
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
      setError(deleteError.message)
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
      <aside className="sidebar" aria-label="Main navigation">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActiveKey('dashboard') }}>
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>AdaptiLearn</span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <button className={`nav-item ${activeKey === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveKey('dashboard'); setSearch('') }}>
          <span className="nav-icon" aria-hidden="true">D</span> Overview
        </button>
        <div className="nav-label nav-label-spaced">LEARNING DATA</div>
        {resources.map((resource, index) => (
          <button
            className={`nav-item ${activeKey === resource.key ? 'active' : ''}`}
            key={resource.key}
            onClick={() => { setActiveKey(resource.key); setSearch(''); setError(''); setNotice('') }}
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

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {activeResource?.label ?? 'Overview'}</div>
          <span className="connection-indicator"><i /> Local workspace</span>
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
            <Dashboard records={records} loading={loading} onSelect={(key) => { setActiveKey(key); setSearch(''); setError(''); setNotice('') }} />
          ) : activeResource ? (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">DATA MANAGEMENT</p>
                  <h1>{activeResource.label}</h1>
                  <p className="page-description">{activeResource.description}</p>
                </div>
                <button className="button button-primary" onClick={() => openForm()}>
                  <span aria-hidden="true">+</span> Add {activeResource.singular}
                </button>
              </section>

              <section className="panel data-panel" aria-label={`${activeResource.label} list`}>
                <div className="panel-toolbar">
                  <div><h2>All {activeResource.label.toLowerCase()}</h2><p>{rows.length} record{rows.length === 1 ? '' : 's'}</p></div>
                  <label className="search-box">
                    <span aria-hidden="true">S</span>
                    <span className="visually-hidden">Search {activeResource.label.toLowerCase()}</span>
                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeResource.label.toLowerCase()}...`} />
                  </label>
                </div>
                {loading ? (
                  <div className="loading-state">Loading your learning data...</div>
                ) : visibleRows.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon" aria-hidden="true">{search ? 'S' : '+'}</span>
                    <h3>{search ? 'No matching records' : `No ${activeResource.label.toLowerCase()} yet`}</h3>
                    <p>{search ? 'Try another search term.' : `Add your first ${activeResource.singular.toLowerCase()} to get started.`}</p>
                    {!search && <button className="button button-secondary" onClick={() => openForm()}>Add {activeResource.singular}</button>}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead><tr>{activeResource.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="actions-heading">Actions</th></tr></thead>
                      <tbody>
                        {visibleRows.map((row) => (
                          <tr key={row.id}>
                            {activeResource.columns.map((column, index) => (
                              <td key={column.key}>
                                {index === 0 ? <strong>{displayValue(valueAtPath(row, column.key), column)}</strong> : displayValue(valueAtPath(row, column.key), column)}
                              </td>
                            ))}
                            <td className="row-actions">
                              <button className="text-button" onClick={() => openForm(row)} aria-label={`Edit ${activeResource.title(row)}`}>Edit</button>
                              <button className="text-button danger-text" onClick={() => deleteRecord(row)} aria-label={`Delete ${activeResource.title(row)}`}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
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
    </div>
  )
}

function FormField({ field, value, options, questions, onChange, onAnswerChange }) {
  const required = field.required || field.requiredOnCreate
  const fieldId = `field-${field.key}`
  let control

  if (field.type === 'relation' || field.type === 'select' || field.type === 'multiRelation') {
    const items = field.type === 'select' ? field.options.map((option) => ({ value: option, label: option })) : options.map((item) => ({ value: item.id, label: item.fullName ?? item.title ?? item.name }))
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
    const optionsValue = typeof value === 'string' ? value : ''
    control = (
      <select id={fieldId} value={optionsValue} required onChange={(event) => onChange(event.target.value)}>
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

export default App
