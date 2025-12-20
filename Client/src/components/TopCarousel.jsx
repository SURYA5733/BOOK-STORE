// Frientend/src/components/TopCarousel.jsx
import React, { useEffect, useState } from 'react'
import { Carousel, Badge } from 'react-bootstrap'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// tiny star renderer (for carousel card)
function StarsInline({ avg }) {
  const rounded = Math.round(avg)
  const max = 5
  const style = { color: '#f5a623', fontSize: 16, marginRight: 6 }
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: rounded }).map((_, i) => <span key={'f'+i} style={style}>★</span>)}
      {Array.from({ length: max - rounded }).map((_, i) => <span key={'e'+i} style={{ ...style, color: '#ddd' }}>★</span>)}
    </span>
  )
}

export default function TopCarousel({ max = 6 }) {
  const [items, setItems] = useState([])
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get('/item')
        const all = Array.isArray(res.data) ? res.data : []

        // compute item score: use rating or average of reviews
        const withScore = all.map(it => {
          let score = 0
          if (typeof it.rating === 'number' && !Number.isNaN(it.rating)) score = it.rating
          else if (Array.isArray(it.reviews) && it.reviews.length) {
            const rs = it.reviews.map(r => (r && typeof r.rating === 'number' ? r.rating : null)).filter(Boolean)
            if (rs.length) score = rs.reduce((s, v) => s + v, 0) / rs.length
          }
          return { ...it, score }
        })

        withScore.sort((a, b) => b.score - a.score)
        if (mounted) setItems(withScore.slice(0, max))
      } catch (err) {
        console.error('TopCarousel load failed', err)
        if (mounted) setItems([])
      }
    }
    load()
    return () => { mounted = false }
  }, [max])

  function handleClickItem(item) {
    const target = `/item/${item._id}`
    if (!isLoggedIn) {
      // send to login and store destination
      navigate('/login', { state: { from: target } })
      return
    }
    navigate(target)
  }

  if (!items.length) return null

  return (
    <Carousel>
      {items.map(it => (
        <Carousel.Item key={it._id} onClick={() => handleClickItem(it)} style={{ cursor: 'pointer' }}>
          {it.coverImageFile || it.coverImageLink ? (
            <img className="d-block w-100" src={it.coverImageFile || it.coverImageLink} alt={it.title} style={{ maxHeight: 360, objectFit: 'cover' }} />
          ) : (
            <div style={{ height: 360 }} className="d-flex align-items-center justify-content-center bg-light">No image</div>
          )}
          <Carousel.Caption style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 6 }}>
            <h5>{it.title}</h5>
            <p className="mb-1">{it.author} {' '} <Badge bg="info">₹{it.price ?? 0}</Badge></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StarsInline avg={it.score || 0} />
              <span className="text-light">{it.score ? (it.score).toFixed(1) : '—'}</span>
            </div>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}
