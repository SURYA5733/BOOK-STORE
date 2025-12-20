// Frientend/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react'
import api from '../api'
import { tSuccess, tError } from '../toast'
import useAuth from '../hooks/useAuth'

export default function Profile() {
  const { id: myId } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(()=>{
    async function load() {
      try {
        const res = await api.get('/profile')
        setProfile(res.data)
        setName(res.data.name || '')
        setEmail(res.data.email || '')
        setPhone(res.data.phone || '')
      } catch (err) {
        tError('Failed to load profile')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append('name', name)
      form.append('phone', phone)
      form.append('email', email)
      if (file) form.append('avatar', file)

      // Do NOT set Content-Type manually; let browser set boundary.
      const res = await api.put('/profile', form)
      setProfile(res.data)

      // notify other UI parts that profile changed (name/avatar)
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { loggedIn: true } }))
      localStorage.setItem('lastAuthChange', Date.now().toString())

      // update localStorage copies used by NavBar/useAuth
      if (res.data.name) localStorage.setItem('name', res.data.name)

      tSuccess('Profile updated')
    } catch (err) {
      console.error('Profile update error', err)
      tError('Failed to update profile')
    }
  }

  if (loading) return <p>Loading...</p>
  if (!profile) return <p>No profile</p>

  return (
    <div className="row">
      <div className="col-md-4">
        {profile.image ? (
          <img src={profile.image} className="img-fluid rounded" alt="avatar" />
        ) : (
          <div className="bg-light p-5 text-center">No image</div>
        )}
      </div>

      <div className="col-md-8">
        <h3>Profile</h3>
        <form onSubmit={handleSave} encType="multipart/form-data">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Avatar</label>
            <input type="file" accept="image/*" className="form-control" onChange={e=>setFile(e.target.files[0])} />
          </div>

          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  )
}
