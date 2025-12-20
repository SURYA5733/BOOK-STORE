// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import { getCart, updateCartItemQty, removeFromCart, clearCart } from '../hooks/useCart';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { tSuccess, tError } from '../toast';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { isLoggedIn, id: userId, name: userName } = useAuth();

  useEffect(() => {
    setCart(getCart());
  }, []);

  function handleQtyChange(id, qty) {
    const updated = updateCartItemQty(id, Number(qty));
    setCart(updated);
  }

  function handleRemove(id) {
    const updated = removeFromCart(id);
    setCart(updated);
  }

  function getTotal() {
    return cart.reduce((s,i)=>s + (Number(i.price) || 0) * (i.qty || 1), 0);
  }

  async function handleCheckout() {
    if (!isLoggedIn) {
      tError('Please login to checkout');
      navigate('/login');
      return;
    }
    try {
      const payload = {
        userId,
        userName,
        totalamount: getTotal(),
        items: cart.map(i => ({ bookId: i._id, title: i.title, price: i.price, qty: i.qty })),
      };
      await api.post('/userorder', payload);
      tSuccess('Order placed');
      clearCart();
      setCart([]);
      navigate('/dashboard');
    } catch (err) {
      tError('Checkout failed');
    }
  }

  if (cart.length === 0) return (
    <Container className="my-4">
      <h3>Your cart is empty</h3>
      <p><Button variant="primary" onClick={() => navigate('/')}>Browse Books</Button></p>
    </Container>
  );

  return (
    <Container className="my-4">
      <h3>Your Cart</h3>
      <Table responsive>
        <thead><tr><th>Title</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>Action</th></tr></thead>
        <tbody>
          {cart.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>₹{item.price}</td>
              <td>
                <Form.Control style={{width:100}} type="number" min="1" value={item.qty} onChange={e=>handleQtyChange(item._id, e.target.value)} />
              </td>
              <td>₹{(item.price * item.qty).toFixed(2)}</td>
              <td><Button variant="danger" size="sm" onClick={()=>handleRemove(item._id)}>Remove</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Card className="p-3">
        <h5>Total: ₹{getTotal().toFixed(2)}</h5>
        <div className="d-flex gap-2 mt-2">
          <Button variant="success" onClick={handleCheckout}>Checkout</Button>
          <Button variant="secondary" onClick={()=>{ clearCart(); setCart([]); }}>Clear Cart</Button>
        </div>
      </Card>
    </Container>
  );
}
