const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:'
const API_BASE = import.meta.env.VITE_API_URL ?? (isFileProtocol ? 'http://localhost:8080/api' : '/api')

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { mensaje?: string }
    throw new Error(error.mensaje ?? `La operación falló (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  const body = await response.text()
  return (body ? JSON.parse(body) : undefined) as T
}
