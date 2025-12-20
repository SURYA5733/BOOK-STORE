// src/components/HeroSection.jsx
import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function HeroSection() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  return (
    <div className="bg-secondary text-white py-4 hero-section">
      <Container>
        <Row className="align-items-center">
          <Col md={7}>
            <h2 className="">Discover Your World in Favourite Book</h2>
            <p className="lead">“Books: your ticket to infinite worlds.”</p>
            <div className="d-flex gap-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/')}>Browse Books</Button>
              <Button variant="primary" size="sm" onClick={() => token ? navigate('/profile') : navigate('/login')}>My Account</Button>
            </div>
          </Col><div>

          </div>
        </Row>

          <div className='p-10'>
            <Row md={5} className="text-center ">
            <img src="/2.jpg" alt="books" className="img-fluid rounded shadow p-3" />
            <img src="/3.jpg" alt="books" className="img-fluid rounded shadow p-3" />
            <img src="/4.jpg" alt="books" className="img-fluid rounded shadow p-3" />
            <img src="/5.jpg" alt="books" className="img-fluid rounded shadow p-3" />
            <img src="/2.jpg" alt="books" className="img-fluid rounded shadow p-3" />

            </Row>
          </div>
      </Container>
    </div>
  )
}
