// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import ItemDetails from './pages/ItemDetails';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CartPage from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <>
      <NavBar />
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/edit/:id" element={<EditItem />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
