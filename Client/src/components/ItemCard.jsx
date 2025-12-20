// src/components/ItemCard.jsx
import React, { useMemo } from 'react'
import { Card, Button, Badge } from 'react-bootstrap'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'



function computeAvgRating(item) {
  // Prefer numeric item.rating
  if (typeof item.rating === 'number' && !Number.isNaN(item.rating)) return item.rating
  // Else compute from reviews array (each review {rating})
  if (Array.isArray(item.reviews) && item.reviews.length) {
    const nums = item.reviews.map(r => (r && typeof r.rating === 'number' ? r.rating : null)).filter(x => x !== null)
    if (nums.length) {
      const sum = nums.reduce((s, v) => s + v, 0)
      return sum / nums.length
    }
  }
  return 0
}

function Stars({ avg, size = 14 }) {
  // round to nearest 0.5 for nicer display
  const v = Math.round(avg * 2) / 2
  const full = Math.floor(v)
  const half = v - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  const starStyle = { color: '#f5a623', fontSize: size, lineHeight: 1 }

  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: full }).map((_, i) => <span key={'f'+i} style={starStyle}>★</span>)}
      {half ? <span key="half" style={starStyle}>☆</span> : null}
      {Array.from({ length: empty }).map((_, i) => <span key={'e'+i} style={{ ...starStyle, color: '#ddd' }}>★</span>)}
    </span>
  )
}

export default function ItemCard({ item, onView, onDelete }) {
  const { id: myId, role } = useAuth()
  const navigate = useNavigate()

  // robust owner detection (tolerate multiple field names)
  const ownerId =
    (item.owner && ('' + item.owner)) ||
    (item.userId && ('' + item.userId)) ||
    (item.sellerId && ('' + item.sellerId)) ||
    (item.user && item.user._id && ('' + item.user._id)) ||
    null

  const isAdmin = role === 'admin'
  const isSeller = role === 'seller'
  const isOwner = !!(ownerId && myId && ownerId === myId)
  const canEditOrDelete = isAdmin || (isSeller && isOwner)

  const isLoggedIn = !!(localStorage.getItem('token') || (myId && role))

  const avg = useMemo(() => computeAvgRating(item), [item])

  function handleView() {
    if (!isLoggedIn) return navigate('/login')
    if (typeof onView === 'function') return onView(item)
    // fallback: go to details
    return navigate(`/item/${item._id}`)
  }

  function handleDetails() {
    if (!isLoggedIn) return navigate('/login')
    return navigate(`/item/${item._id}`)
  }

  return (
    <Card className="h-100 shadow-sm">
      {item.coverImageFile || item.coverImageLink ? (
        <Card.Img variant="top" src={item.coverImageFile || item.coverImageLink} style={{ height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{ height: 200 }} className="d-flex align-items-center justify-content-center bg-light">No image</div>
      )}

      <Card.Body className="d-flex flex-column">
        <div className="mb-2 d-flex justify-content-between align-items-start">
          <div>
            <Card.Title className="h6 mb-0">{item.title}</Card.Title>
            <small className="text-muted">{item.author}</small>

            {/* rating */}
            <div className="mt-1" style={{ fontSize: 13 }}>
              <Stars avg={avg} size={14} />{' '}
              <span className="text-muted" style={{ fontSize: 12, marginLeft: 6 }}>{avg ? avg.toFixed(1) : '—'}</span>
            </div>
          </div>

          <div className="text-end">
            <div>
              <Badge bg="info" className="me-1">₹{item.price ?? 0}</Badge>
            </div>
            <div className="mt-1">
              <Badge bg={(item.stockQty ?? 0) > 0 ? 'success' : 'secondary'}>
                {item.stockQty ?? 0} in stock
              </Badge>
            </div>
          </div>
        </div>

        <Card.Text className="text-truncate">{item.description}</Card.Text>

        <div className="mt-auto d-flex gap-2">
          <Button variant="primary" size="sm" onClick={handleView}>View</Button>
          <Button variant="outline-secondary" size="sm" onClick={handleDetails}>Details</Button>

          {canEditOrDelete && typeof onDelete === 'function' && (
            <Button variant="danger" size="sm" onClick={() => onDelete(item)}>Delete</Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
