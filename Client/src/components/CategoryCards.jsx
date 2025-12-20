// Frientend/src/components/CategoryCards.jsx
import React, { useEffect, useState } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// small star renderer
function renderStars(avg) {
  const rounded = Math.round(avg)
  const max = 5
  let stars = ''
  for (let i = 0; i < rounded; i++) stars += '★'
  for (let i = rounded; i < max; i++) stars += '☆'
  return stars
}

export default function CategoryCards() {
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const { token, isLoggedIn } = useAuth()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get('/item')
        const items = Array.isArray(res.data) ? res.data : []

        const map = {}
        items.forEach(it => {
          const g = it.genre || 'Misc'

          // book rating: prefer numeric rating, else average of reviews
          let bookRating = 0
          if (typeof it.rating === 'number' && !Number.isNaN(it.rating)) {
            bookRating = it.rating
          } else if (Array.isArray(it.reviews) && it.reviews.length) {
            const rs = it.reviews.map(r => (r && typeof r.rating === 'number' ? r.rating : null)).filter(Boolean)
            if (rs.length) bookRating = rs.reduce((s, v) => s + v, 0) / rs.length
          }

          if (!map[g]) map[g] = { count: 0, totalRating: 0, ratedCount: 0, sample: it }
          map[g].count += 1
          if (bookRating > 0) {
            map[g].totalRating += bookRating
            map[g].ratedCount += 1
          }
          // keep first sample
          if (!map[g].sample) map[g].sample = it
        })

        const arr = Object.keys(map).map(k => {
          const m = map[k]
          const avg = m.ratedCount ? (m.totalRating / m.ratedCount) : 0
          return { name: k, count: m.count, avg, sample: m.sample }
        })

        // sort top rated then by count; limit to 6
        arr.sort((a, b) => (b.avg !== a.avg ? b.avg - a.avg : b.count - a.count))
        const top = arr.slice(0, 6)
        if (mounted) setCategories(top)
      } catch (err) {
        console.error('Category load failed', err)
        if (mounted) setCategories([])
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (!categories.length) return null

  function goToGenre(genre) {
    const target = `/?genre=${encodeURIComponent(genre)}`
    if (!isLoggedIn) {
      // send guest to login, but remember where they wanted to go
      navigate('/login', { state: { from: target } })
      return
    }
    navigate(target)
  }

  return (
    <div className="my-4">
      <h4 className="mb-3">Browse by Category — Top Rated</h4>
      <Row className="g-3 mt-2">
        {categories.map(cat => (
          <Col md={2} sm={4} xs={6} key={cat.name}>
            <Card
              className="h-100 category-card"
              role="button"
              onClick={() => goToGenre(cat.name)}
            >
              {cat.sample && (cat.sample.coverImageFile || cat.sample.coverImageLink) ? (
                <Card.Img
                  variant="top"
                  src={cat.sample.coverImageFile || cat.sample.coverImageLink}
                  style={{ height: 160, objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: 160 }} className="bg-light d-flex align-items-center justify-content-center">No image</div>
              )}

              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-1" style={{ fontSize: '0.95rem' }}>{cat.name}</Card.Title>
                <div className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>{cat.count} books</div>

                <div className="mt-auto d-flex align-items-center justify-content-between">
                  <div style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                    <span aria-hidden="true" style={{ color: '#f5a623', marginRight: 6 }}>{renderStars(cat.avg)}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{cat.avg ? cat.avg.toFixed(1) : '—'}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
