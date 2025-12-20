// src/pages/SellerDashboard.jsx
import React, { useEffect, useState } from 'react'
import api from '../api'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { tError } from '../toast'
import { useNavigate } from 'react-router-dom'

export default function SellerDashboard() {
  const [stats, setStats] = useState({ totalBooks:0, totalOrders:0, totalStock:0, totalRevenue:0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const sellerId = localStorage.getItem('userId') || localStorage.getItem('id') || localStorage.getItem('sellerId')
        if (!sellerId) {
          setStats({ totalBooks:0, totalOrders:0, totalStock:0, totalRevenue:0 })
          return
        }

        const itemsRes = await api.get(`/getitem/${sellerId}`)
        const items = itemsRes.data || []
        const ordersRes = await api.get(`/getsellerorders/${sellerId}`)
        const orders = ordersRes.data || []

        const totalStock = items.reduce((s,i)=>s + (Number(i.stockQty) || 0), 0)
        const totalBooks = items.length
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((s,o) => s + (Number(o.totalamount) || 0), 0)

        setStats({ totalBooks, totalOrders, totalStock, totalRevenue })
      } catch (err) {
        console.error(err)
        tError('Failed to load seller dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Container className="my-4">
      <h2>Seller Dashboard</h2>

      <Row className="mt-3 g-3">
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>{loading ? '—' : stats.totalBooks}</h5>
            <div className="text-muted">Books</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>{loading ? '—' : stats.totalOrders}</h5>
            <div className="text-muted">Orders</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>{loading ? '—' : stats.totalStock}</h5>
            <div className="text-muted">Stock</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>{loading ? '—' : `₹${stats.totalRevenue}`}</h5>
            <div className="text-muted">Revenue</div>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5>Recent Orders</h5>
              <p className="text-muted">Click below to view all seller orders.</p>
              <Button variant="primary" onClick={() => navigate('/seller/orders')}>View Orders</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Quick Actions</h5>
              <div className="d-grid gap-2">
                <Button variant="success" onClick={() => navigate('/add')}>Add New Book</Button>
                <Button variant="outline-secondary" onClick={() => navigate('/item')}>Manage Books</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
