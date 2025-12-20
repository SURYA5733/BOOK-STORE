// src/pages/ItemDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { addToCart } from '../hooks/useCart';
import { tSuccess, tError } from '../toast';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { isLoggedIn, id: userId, name: userName, role } = auth;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/item/${id}`);
        if (mounted) setItem(res.data);
      } catch (err) {
        tError('Failed to load item');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => mounted = false;
  }, [id]);

  function handleAddToCart() {
    if (!item) return;
    addToCart({
      _id: item._id,
      title: item.title,
      price: item.price,
      coverImage: item.coverImageFile || item.coverImageLink
    });
    tSuccess('Added to cart');
  }

  async function handleBuyNow() {
    if (!isLoggedIn) {
      tError('Please login to buy');
      navigate('/login');
      return;
    }
    try {
      const payload = {
        totalamount: item.price || 0,
        seller: item.userName || '',
        sellerId: item.owner || item.userId || null,
        booktitle: item.title,
        bookauthor: item.author,
        bookgenre: item.genre,
        itemImage: item.pdfFile || item.coverImageFile || item.coverImageLink,
        items: [{ bookId: item._id, title: item.title, price: item.price, qty: 1 }]
      };
      // createOrder endpoint is protected — token attached automatically by api interceptor
      await api.post('/userorder', payload);
      tSuccess('Order placed');
      navigate('/dashboard');
    } catch (err) {
      tError('Order failed');
    }
  }

  async function downloadPdf() {
    if (!item || !item.pdfFile) return tError('No pdf available');
    try {
      const res = await api.get(`/item/${id}/pdf/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title || 'book'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      tError('Download failed');
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      tError('Login to submit review');
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/item/${id}/review`, { userId, userName: userName || 'User', rating, comment });
      tSuccess('Review submitted');
      setComment('');
      const r = await api.get(`/item/${id}`);
      setItem(r.data);
    } catch (err) {
      tError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (!item) return <p>Not found</p>;

  const isAdmin = role === 'admin';

  return (
    <Row>
      <Col md={5}>
        {item.coverImageFile || item.coverImageLink ? (
          <img src={item.coverImageFile || item.coverImageLink} alt={item.title} className="img-fluid rounded" />
        ) : (
          <div className="bg-light p-5 text-center">No image</div>
        )}

        <div className="mt-3 d-flex gap-2">
          {!isAdmin && <Button variant="success" onClick={handleAddToCart}>Add to Cart</Button>}
          {!isAdmin && <Button variant="primary" onClick={handleBuyNow}>Buy Now</Button>}
          {item.pdfFile && <Button variant="outline-secondary" onClick={downloadPdf}>Download PDF</Button>}
          {item.pdfFile && <Button variant="outline-secondary" href={item.pdfFile} target="_blank">Open PDF</Button>}
        </div>
      </Col>

      <Col md={7}>
        <h3>{item.title}</h3>
        <p className="mb-1"><strong>Author:</strong> {item.author}</p>
        <p className="mb-1"><strong>Genre:</strong> {item.genre}</p>
        <p>{item.description}</p>
        <p><strong>Price:</strong> ₹{item.price}</p>
        <p><strong>Stock:</strong> {item.stockQty ?? 0}</p>
        <p><strong>Average Rating:</strong> {item.rating ?? '—'}</p>

        <hr />

        <h5>Reviews</h5>
        {item.reviews && item.reviews.length > 0 ? (
          item.reviews.slice().reverse().map((r, idx) => (
            <Card key={idx} className="mb-2">
              <Card.Body>
                <strong>{r.userName || 'User'}</strong> <small className="text-muted"> — {r.rating}/5</small>
                <p className="mb-0">{r.comment}</p>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p className="text-muted">No reviews yet.</p>
        )}

        <Form onSubmit={submitReview} className="mt-3">
          <Form.Group className="mb-2">
            <Form.Label>Your rating</Form.Label>
            <Form.Select value={rating} onChange={e => setRating(Number(e.target.value))}>
              <option value={5}>5 — Excellent</option>
              <option value={4}>4 — Very good</option>
              <option value={3}>3 — Good</option>
              <option value={2}>2 — Fair</option>
              <option value={1}>1 — Poor</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Comment</Form.Label>
            <Form.Control as="textarea" rows={3} value={comment} onChange={e => setComment(e.target.value)} />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button type="submit" disabled={submittingReview}>{submittingReview ? 'Saving...' : 'Submit Review'}</Button>
            <Button variant="outline-secondary" onClick={() => { setComment(''); setRating(5); }}>Clear</Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
}
