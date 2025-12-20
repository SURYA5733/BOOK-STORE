// src/hooks/useCart.js
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function dispatchCartChanged() {
  try {
    window.dispatchEvent(new CustomEvent('cartChanged'));
    localStorage.setItem('lastCartUpdate', Date.now().toString()); // for cross-tab
  } catch {}
}

export function addToCart(item) {
  const c = getCart();
  const exist = c.find(i => i._id === item._id);
  if (exist) {
    exist.qty = (exist.qty || 1) + 1;
  } else {
    c.push({ ...item, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(c));
  dispatchCartChanged();
  return c;
}

export function updateCartItemQty(id, qty) {
  let c = getCart();
  c = c.map(i => i._id === id ? { ...i, qty } : i);
  localStorage.setItem('cart', JSON.stringify(c));
  dispatchCartChanged();
  return c;
}

export function removeFromCart(id) {
  const c = getCart().filter(i => i._id !== id);
  localStorage.setItem('cart', JSON.stringify(c));
  dispatchCartChanged();
  return c;
}

export function clearCart() {
  localStorage.removeItem('cart');
  dispatchCartChanged();
}
