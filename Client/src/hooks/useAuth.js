// src/hooks/useAuth.js
import { useMemo } from 'react';

export default function useAuth() {
  return useMemo(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role') || null; // 'user'|'seller'|'admin'
    const id    = localStorage.getItem('userId') || localStorage.getItem('id') || null;
    const name  = localStorage.getItem('name') || null;
    return {
      token,
      role,
      id,
      name,
      isLoggedIn: !!token,
      isSeller: role === 'seller',
      isAdmin: role === 'admin',
      isUser: role === 'user'
    };
  }, []);
}
