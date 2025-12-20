// src/pages/Signup.jsx
import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { tSuccess, tError } from '../toast'

export default function Signup() {
  const [role, setRole] = useState('user') // user | seller | admin
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // maps role to endpoint
  const signupEndpoint = {
    user: '/signup',
    seller: '/ssignup',
    admin: '/asignup'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name || !email || !password) {
      setError('Name, email and password are required')
      return
    }

    setLoading(true)
    try {
      const path = signupEndpoint[role] || '/signup'
      // If you want to include phone for all roles, backend must accept it
      const payload = { name, email, password }
      if (phone) payload.phone = phone

      const res = await api.post(path, payload)

      tSuccess('Account created — please login')
      // redirect to login page and pre-select the same role
      navigate('/login', { state: { role } })
    } catch (err) {
      console.error('signup error', err)
      const msg = err.response?.data?.message || err.response?.data?.error || err.response?.data || err.message
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      tError('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Signup</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
            <div className="form-text">Create an account as User, Seller or Admin.</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone (optional)</label>
            <input className="form-control" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating…' : `Create ${role} account`}
            </button>
            <button type="button" className="btn btn-secondary" onClick={()=>{ setName(''); setEmail(''); setPassword(''); setPhone('') }} disabled={loading}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
