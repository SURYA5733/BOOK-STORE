// src/components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getCart } from '../hooks/useCart';

export default function NavBar() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [name, setName] = useState(localStorage.getItem('name') || null);
  const [cartCount, setCartCount] = useState(getCart().reduce((s,i)=>s+i.qty,0));

  useEffect(() => {
    function onAuthChanged() {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
      setName(localStorage.getItem('name'));
    }
    function onCartChanged() {
      setCartCount(getCart().reduce((s,i)=>s+i.qty,0));
    }
    function onStorage(e) {
      if (e.key === 'lastAuthChange' || e.key === 'token' || e.key === 'role' || e.key === 'name') onAuthChanged();
      if (e.key === 'lastCartUpdate' || e.key === 'cart') onCartChanged();
    }
    window.addEventListener('authChanged', onAuthChanged);
    window.addEventListener('cartChanged', onCartChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('authChanged', onAuthChanged);
      window.removeEventListener('cartChanged', onCartChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const isLoggedIn = !!token;
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  function logout() {
localStorage.removeItem('token')
localStorage.removeItem('role')
localStorage.removeItem('name')
localStorage.removeItem('userId')
window.dispatchEvent(new CustomEvent('authChanged', { detail: { loggedIn: false } }))
localStorage.setItem('lastAuthChange', Date.now().toString())
navigate('/')
  }

  const dropdownTitle = (
    <span>
      {name || 'Profile'} {role && <Badge bg="secondary" className="ms-2 text-capitalize" style={{fontSize:'0.65rem'}}>{role}</Badge>}
    </span>
  );

  return (
    <Navbar bg="primary" variant="" expand="lg" fixed="top" className='bg-primary'>
      <Container>
        <Navbar.Brand as={Link} to="/" className='fs-2'>OnlineBookStore</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className='fw-bold fs-5 '>Home</Nav.Link>

            {isLoggedIn && isUser && <Nav.Link as={Link} to="/dashboard" className='fw-bold fs-5'>Dashboard</Nav.Link>}
            {isLoggedIn && isSeller && <Nav.Link as={Link} to="/seller/dashboard" className='fw-bold fs-5'>Seller</Nav.Link>}
            {isLoggedIn && isAdmin && <Nav.Link as={Link} to="/admin" className='fw-bold fs-5'>Admin</Nav.Link>}

            {(isSeller || isAdmin) && <Nav.Link as={Link} to="/add" className='fw-bold fs-5'>Add Book</Nav.Link>}
          </Nav>

          <Nav className="ms-auto align-items-center">
            {/* hide cart for admin */}
            {!isAdmin && isLoggedIn && (
              <Nav.Link as={Link} to="/cart" className='fw-bold fs-5'>
                Cart {cartCount > 0 && <Badge bg="danger" pill className="ms-1 fw-bold fs-5" >{cartCount}</Badge>}
              </Nav.Link>
            )}

            {!isLoggedIn && <>
              <Nav.Link as={Link} to="/login" className='fw-bold fs-5'>Login</Nav.Link>
              <Nav.Link as={Link} to="/signup" className='fw-bold fs-5'>Signup</Nav.Link>
            </>}
            {isLoggedIn && (
              <NavDropdown title={dropdownTitle} align="end">
                <NavDropdown.Item as={Link} to="/profile" >My Profile</NavDropdown.Item>
                <NavDropdown.Divider/>
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
