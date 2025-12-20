// src/pages/AddItem.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ItemForm from '../components/ItemForm'
import useAuth from '../hooks/useAuth'
import { tError } from '../toast'

export default function AddItem() {
  const navigate = useNavigate()
  const { isSeller, isAdmin, isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      tError('Please login as a seller to add books')
      navigate('/login')
    } else if (!isSeller && !isAdmin) {
      tError('Only sellers or admins can add books')
      navigate('/')
    }
  }, [isLoggedIn, isSeller, isAdmin, navigate])

  return (
    <div>
      <h3>Add Book</h3>
      {(isSeller || isAdmin) ? <ItemForm /> : null}
    </div>
  )
}
