import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../api';

function KioskView() {
  console.log("✅ KioskView rendered");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orderTotal, setOrderTotal] = useState({ subtotal: 0, tax: 0, total: 0 });

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'milk_tea', name: 'Milk Tea' },
    { id: 'fruit_tea', name: 'Fruit Tea' },
    { id: 'classic_tea', name: 'Classic Tea' },
  ];

  const defaultCustomizations = {
    ice: '100%',
    topping: 'None'
  };

  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.0825;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    setOrderTotal({ subtotal, tax, total });
  }, [cart]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log("📦 Fetching Kiosk products...");
        const data = await fetchProducts();
        console.log("✅ Kiosk products received:", data);
        if (data.length > 0) {
          console.log("🔍 First product object:", data[0]);
        }
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => {
        const categoryKey = product.category_id || product.product_type;
        if (categoryKey) {
          const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
          return normalized === activeCategory;
        }
        return false;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => product.product_name?.toLowerCase().includes(query));
    }

    return filtered;
  };

  const addToCart = (product) => {
    const cartItem = {
      id: Date.now(),
      product_id: product.product_id,
      name: product.product_name,
      price: product.product_cost,
      customizations: { ...defaultCustomizations },
      quantity: 1
    };

    setCart([...cart, cartItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.id === cartItemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const processPayment = () => {
    alert('Processing payment for $' + orderTotal.total.toFixed(2));
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredProducts = getFilteredProducts();

  const styles = {
    header: {
      marginTop: '0.5rem',
      marginBottom: '0.5rem',
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    filtersContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '0.5rem',
      marginBottom: '1.5rem',
    },
    searchInput: {
      padding: '0.5rem',
      fontSize: '1rem',
      borderRadius: '8px',
      border: '1px solid #ccc',
      width: '100%',
    },
    categoryFilterRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    categoryButton: (isActive) => ({
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      border: `1px solid ${isActive ? '#007bff' : '#ccc'}`,
      backgroundColor: isActive ? '#007bff' : '#fff',
      color: isActive ? '#fff' : '#000',
      cursor: 'pointer',
      fontWeight: isActive ? '600' : '400',
    }),
  };

  return (
    <div className="cashier-dashboard-container">
      <h1 style={styles.header}>🧋 KIOSK INTERFACE 🧋</h1>

      <div className="cashier-main-area">
        <div className="product-catalog">
          <div style={styles.filtersContainer}>
            <input
              type="text"
              placeholder="Search for a drink..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <div style={styles.categoryFilterRow}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  style={styles.categoryButton(activeCategory === category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div
                  key={product.product_id}
                  className="product-card"
                  onClick={() => addToCart(product)}
                >
                  <div className="product-card-name">{product.product_name}</div>
                  <div className="product-card-price">${product.product_cost.toFixed(2)}</div>
                </div>
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
        </div>

        <div className="order-summary">
          <h2 className="order-summary-header">Current Order</h2>

          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-customizations">
                      Ice: {item.customizations.ice} • Topping: {item.customizations.topping}
                    </div>
                  </div>
                  <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                  <div className="cart-item-controls">
                    <button className="quantity-control" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button className="quantity-control" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="quantity-control" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="order-total-section">
            <div className="order-subtotal">
              <span>Subtotal:</span>
              <span>${orderTotal.subtotal.toFixed(2)}</span>
            </div>
            <div className="order-tax">
              <span>Tax (8.25%):</span>
              <span>${orderTotal.tax.toFixed(2)}</span>
            </div>
            <div className="order-total">
              <span>Total:</span>
              <span>${orderTotal.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-buttons">
            <button
              className="checkout-button checkout-button-primary"
              disabled={cart.length === 0}
              onClick={processPayment}
            >
              Process Payment
            </button>
            <button
              className="checkout-button checkout-button-secondary"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KioskView;
