// src/pages/Login.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import { tSuccess, tError } from '../toast'

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()

  // destination to return to after login. Default to home.
  const from = location.state?.from || '/'

  const initialRole = location.state?.role || 'user'
  const [role, setRole] = useState(initialRole) // user | seller | admin
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loginEndpoint = { user: '/login', seller: '/slogin', admin: '/alogin' }

  // helper to detect token
  const hasToken = useCallback(() => !!localStorage.getItem('token'), [])

  // If already logged in, immediately redirect to `from`
  useEffect(() => {
    if (hasToken()) {
      navigate(from, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen to cross-tab storage changes (other tab logged in/out).
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'lastAuthChange') {
        // token presence indicates logged in
        const token = localStorage.getItem('token')
        if (token) {
          // other tab logged in — redirect to where we were going
          navigate(from, { replace: true })
        } else {
          // other tab logged out — stay on login (or navigate here)
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true })
          }
        }
      }
    }
    window.addEventListener('storage', onStorage)

    // also listen to in-page custom event (your login code dispatches this)
    function onAuthChanged(ev) {
      const detail = ev?.detail || {}
      if (detail.loggedIn) {
        navigate(from, { replace: true })
      } else {
        if (window.location.pathname !== '/login') navigate('/login', { replace: true })
      }
    }
    window.addEventListener('authChanged', onAuthChanged)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('authChanged', onAuthChanged)
    }
  }, [from, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)
    try {
      const path = loginEndpoint[role] || '/login'
      const res = await api.post(path, { email, password })
      const data = res.data || {}
      const token = data.token || data.accessToken || null
      const userObj = data.user || data

      if (!token) {
        tError('Login succeeded but token not returned by backend.')
        console.warn('Login response:', data)
        setLoading(false)
        return
      }

      // persist auth
      localStorage.setItem('token', token)
      localStorage.setItem('role', userObj.role || role)
      if (userObj?.name) localStorage.setItem('name', userObj.name)
      if (userObj?.id || userObj?._id) localStorage.setItem('userId', userObj.id || userObj._id)

      // notify UI in same tab
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { loggedIn: true } }))
      // notify other tabs
      localStorage.setItem('lastAuthChange', Date.now().toString())

      tSuccess('Logged in')

      // Redirect back to requested page (preserve history cleanliness)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      tError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
            <div className="form-text">Sign in as User, Seller, or Admin.</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : `Sign in as ${role}`}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { setEmail(''); setPassword('') }} disabled={loading}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
