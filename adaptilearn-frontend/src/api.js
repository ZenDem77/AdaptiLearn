const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error

    const connectionError = new Error('Could not connect to the AdaptiLearn backend. Check that Spring Boot is running.')
    connectionError.name = 'BackendConnectionError'
    throw connectionError
  }

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload.detail ?? payload.message ?? payload.error ?? `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload
}
