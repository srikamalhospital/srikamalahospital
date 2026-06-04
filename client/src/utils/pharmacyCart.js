const CART_KEY = 'pharmacy_cart';
const ORDER_PREFIX = 'pharmacy_order_';

export const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const cartLineKey = (product) => product.name;

export const addToCart = (product, qty = 1) => {
  const cart = getCart();
  const key = cartLineKey(product);
  const idx = cart.findIndex((l) => cartLineKey(l) === key);
  if (idx >= 0) {
    cart[idx].qty = Math.min(99, (cart[idx].qty || 1) + qty);
  } else {
    cart.push({
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      img: product.img || product.image,
      requiresPrescription: !!product.requiresPrescription,
      description: product.description,
      qty: Math.max(1, qty),
    });
  }
  saveCart(cart);
  return cart;
};

export const updateCartQty = (name, qty) => {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((l) => l.name !== name);
  } else {
    cart = cart.map((l) => (l.name === name ? { ...l, qty: Math.min(99, qty) } : l));
  }
  saveCart(cart);
  return cart;
};

export const removeFromCart = (name) => {
  const cart = getCart().filter((l) => l.name !== name);
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  return [];
};

export const cartTotals = (cart) => {
  const subtotal = cart.reduce((sum, l) => sum + (l.price || 0) * (l.qty || 1), 0);
  const rxCount = cart.filter((l) => l.requiresPrescription).length;
  return { subtotal, itemCount: cart.reduce((n, l) => n + (l.qty || 1), 0), rxCount };
};

export const generatePharmacyToken = () => {
  const n = Date.now().toString().slice(-6);
  return `KAMALA-RX-${n}`;
};

export const savePharmacyOrder = (order) => {
  localStorage.setItem(`${ORDER_PREFIX}${order.token}`, JSON.stringify(order));
  return order;
};

export const getPharmacyOrder = (token) => {
  if (!token) return null;
  try {
    const raw = localStorage.getItem(`${ORDER_PREFIX}${token}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const createPharmacyOrder = async ({ name, phone, age, gender, notes, items, appointmentToken }) => {
  const token = generatePharmacyToken();
  const { subtotal, rxCount } = cartTotals(items);
  const order = {
    token,
    name: name.trim(),
    phone: phone.trim(),
    age: age != null && String(age).trim() ? String(age).trim() : '',
    gender: gender != null && String(gender).trim() ? String(gender).trim() : '',
    appointmentToken: appointmentToken ? String(appointmentToken).trim() : '',
    notes: (notes || '').trim(),
    items: items.map((l) => ({ ...l })),
    subtotal,
    rxCount,
    status: 'pending_verification',
    createdAt: new Date().toISOString(),
  };
  savePharmacyOrder(order);
  try {
    const { submitPharmacyOrder } = await import('./api');
    await submitPharmacyOrder(order);
  } catch (err) {
    console.warn('Pharmacy order sync to server failed (saved locally):', err?.message || err);
  }
  clearCart();
  return order;
};
