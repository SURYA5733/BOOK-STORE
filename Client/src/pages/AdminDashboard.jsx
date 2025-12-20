// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react'
import api from '../api'
import { Card, Row, Col } from 'react-bootstrap'
import { tError } from '../toast'

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0)
  const [booksCount, setBooksCount] = useState(0)
  const [ordersCount, setOrdersCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const [bRes, oRes, uRes] = await Promise.all([
          api.get('/item'),
          api.get('/orders'),
          api.get('/users') // ensure you have /users backend route
        ])
        setBooksCount((bRes.data || []).length)
        setOrdersCount((oRes.data || []).length)
        setUsersCount((uRes.data || []).length)
      } catch (err) {
        tError('Failed to load admin stats')
      }
    }
    load()
  }, [])

  return (
    <div>
      <h3>Admin Dashboard</h3>
      <Row className="g-3">
        <Col md={4}>
          <Card className="p-3">
            <h5>Users</h5>
            <h2>{usersCount}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3">
            <h5>Books</h5>
            <h2>{booksCount}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3">
            <h5>Orders</h5>
            <h2>{ordersCount}</h2>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
