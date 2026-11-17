export type Role = 'HUESPED' | 'RECEPCIONISTA' | 'ADMINISTRADOR'

export type SessionUser = {
  documento: string
  nombre: string
  role: Role
}

type DemoUser = SessionUser & { password: string }

export const demoUsers: DemoUser[] = [
  { documento: '1001', nombre: 'Laura Gómez', role: 'HUESPED', password: '1234' },
  { documento: '1002', nombre: 'Andrés Ríos', role: 'HUESPED', password: '1234' },
  { documento: '2001', nombre: 'Sofía Arango', role: 'RECEPCIONISTA', password: '1234' },
  { documento: '2002', nombre: 'Diego Montoya', role: 'RECEPCIONISTA', password: '1234' },
  { documento: '2006', nombre: 'Ricardo Valencia', role: 'ADMINISTRADOR', password: '1234' },
]

export function authenticate(role: Role, documento: string, password: string) {
  const user = demoUsers.find((candidate) => candidate.role === role && candidate.documento === documento && candidate.password === password)
  if (!user) return null
  const { password: _password, ...session } = user
  return session
}

export const roleLabels: Record<Role, string> = {
  HUESPED: 'Huésped',
  RECEPCIONISTA: 'Recepcionista',
  ADMINISTRADOR: 'Administrador',
}
