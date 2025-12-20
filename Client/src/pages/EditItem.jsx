// src/pages/EditItem.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import ItemForm from '../components/ItemForm'
import useAuth from '../hooks/useAuth'
import { tError } from '../toast'

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSeller, isAdmin, isLoggedIn, id: userId } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!isLoggedIn) { tError('Please login'); navigate('/login'); return }
    async function load() {
      try {
        const res = await api.get(`/item/${id}`)
        const it = res.data
        // If seller, ensure owner matches; backend must also enforce this
        if (isSeller && !isAdmin) {
          const ownerId = it.owner || it.userId || it.sellerId || null
          if (ownerId && ownerId !== userId) {
            tError('You are not authorized to edit this book')
            navigate('/')
            return
          }
        }
        setItem(it)
      } catch (err) {
        tError('Failed to load item')
        navigate('/')
      } finally { setLoading(false) }
    }
    load()
  }, [id, isSeller, isAdmin, isLoggedIn, userId, navigate])

  if (loading) return <p>Loading…</p>
  if (!item) return <p>Not found or unauthorized</p>

  return (
    <div>
      <h3>Edit Book</h3>
      <ItemForm initial={item} isEdit />
    </div>
  )
}
