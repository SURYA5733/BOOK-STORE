// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react'
import api from '../api'
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap'
import TopCarousel from '../components/TopCarousel'
import CategoryCards from '../components/CategoryCards'
import { tError } from '../toast'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function UserDashboard() {
  const [orders, setOrders] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { isLoggedIn, id: userId } = useAuth()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        if (isLoggedIn && userId) {
          const res = await api.get(`/getorders/${userId}`)
          setOrders(res.data || [])
        } else {
          setOrders([])
        }

        const res2 = await api.get('/item')
        const items = res2.data || []
        setRecommendations(items.slice(0, 6))
      } catch (err) {
        console.error(err)
        tError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isLoggedIn, userId])

  return (
    <Container className="my-4">
      <h2>Welcome to your dashboard</h2>

      <Row className="mt-4">
        <Col lg={8}>
          <Card className="mb-3">
            <Card.Body>
              <h5>Recent Orders</h5>
              {loading ? <p>Loading...</p> : (
                orders.length === 0 ? <p>No recent orders found.</p> : (
                  <Table responsive>
                    <thead><tr><th>#</th><th>Book</th><th>Seller</th><th>Amount</th><th>Delivery</th><th>Status</th></tr></thead>
                    <tbody>
                      {orders.slice(0,6).map((o, idx) => (
                        <tr key={o._id || idx}>
                          <td>{idx+1}</td>
                          <td>{o.booktitle || o.description || '—'}</td>
                          <td>{o.seller || '—'}</td>
                          <td>₹{o.totalamount || '0'}</td>
                          <td>{o.Delivery || '—'}</td>
                          <td>{o.status || 'Placed Confirmed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )
              )}
              <div className="text-end">
                <Button variant="link" onClick={() => navigate('/orders')}>View all orders</Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <h5>Recommendations</h5>
              <Row className="g-3">
                {recommendations.map(it => (
                  <Col md={4} key={it._id}>
                    <Card role="button" onClick={() => navigate(`/item/${it._id}`)} className="h-100">
                      {it.coverImageFile || it.coverImageLink ? <Card.Img src={it.coverImageFile || it.coverImageLink} style={{height:140, objectFit:'cover'}} /> : <div style={{height:140}} className="bg-light"></div>}
                      <Card.Body>
                        <Card.Title className="h6">{it.title}</Card.Title>
                        <small className="text-muted">{it.author}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <h5>Top Picks</h5>
              <TopCarousel max={4} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h6>Quick Links</h6>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/profile')}>Profile</Button>
                <Button variant="outline-secondary" onClick={() => navigate(`/getorders/${userId}`)}>My Orders</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CategoryCards />
    </Container>
  )
}
