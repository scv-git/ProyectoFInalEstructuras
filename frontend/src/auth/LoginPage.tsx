import { useState } from 'react'
import { ArrowRight, Building2, ShieldCheck, UserRound } from 'lucide-react'
import { authenticate, roleLabels, type Role, type SessionUser } from './users'

export function LoginPage({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [role, setRole] = useState<Role>('HUESPED')
  const [documento, setDocumento] = useState('1001')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const user = authenticate(role, documento.trim(), password)
    if (!user) return setError('El documento, la clave o el rol no coinciden.')
    onLogin(user)
  }

  function changeRole(nextRole: Role) {
    setRole(nextRole)
    setDocumento(nextRole === 'HUESPED' ? '1001' : nextRole === 'RECEPCIONISTA' ? '2001' : '2006')
    setError('')
  }

  return <main className="login-shell"><section className="login-aside"><div className="brand login-brand"><div className="brand-mark">CN</div><div><strong>Casa Nómada</strong><span>operaciones</span></div></div><div className="login-aside-copy"><span className="eyebrow">Sistema de gestión de alojamiento</span><h1>Un edificio.<br /><em>Tres formas</em><br />de habitarlo.</h1><p>Una entrada distinta para cada persona que mantiene el lugar en movimiento.</p></div><div className="login-aside-footer"><span /> Datos de prueba cargados en el escenario UQ</div></section><section className="login-card-wrap"><form className="login-card" onSubmit={submit}><div className="login-heading"><span className="section-kicker">Acceso al sistema</span><h2>¿Quién está entrando?</h2><p>Elige tu perfil para abrir el panel correspondiente.</p></div><div className="role-options">{(['HUESPED', 'RECEPCIONISTA', 'ADMINISTRADOR'] as Role[]).map((item) => <button type="button" key={item} className={`role-option ${role === item ? 'role-option--selected' : ''}`} onClick={() => changeRole(item)}><span className="role-icon">{item === 'HUESPED' ? <UserRound size={19} /> : item === 'RECEPCIONISTA' ? <Building2 size={19} /> : <ShieldCheck size={19} />}</span><span><strong>{roleLabels[item]}</strong><small>{item === 'HUESPED' ? 'Reservas y estancias' : item === 'RECEPCIONISTA' ? 'Operación diaria' : 'Control del sistema'}</small></span></button>)}</div><label className="login-label">Documento<input value={documento} onChange={(event) => setDocumento(event.target.value)} inputMode="numeric" autoComplete="username" /></label><label className="login-label">Clave<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" /></label>{error && <p className="login-error">{error}</p>}<button className="button button--primary login-submit" type="submit">Entrar como {roleLabels[role]} <ArrowRight size={16} /></button><p className="demo-hint">Prueba: {role === 'HUESPED' ? '1001' : role === 'RECEPCIONISTA' ? '2001' : '2006'} · clave 1234</p></form></section></main>
}
