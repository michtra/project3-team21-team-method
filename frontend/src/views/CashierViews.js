import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../api';

function CashierView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
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
    
    setOrderTotal({
      subtotal,
      tax,
      total
    });
  }, [cart]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Fetching products...');
        const data = await fetchProducts();
        console.log('Products received:', data);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err);
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
    if (activeCategory === 'all') {
      return products;
    }
    
    return products.filter(product => {
      if (product.category_id) {
        return product.category_id === activeCategory;
      }
      if (product.product_type) {
        const normalizedType = product.product_type.toLowerCase().replace(/\s+/g, '_');
        return normalizedType === activeCategory;
      }
      return false;
    });
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
    console.log('Product added to cart:', cartItem);
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
    // Can call API to process payment here
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredProducts = getFilteredProducts();

  return (
    <div className="cashier-dashboard-container">
      <h1 className="cashier-dashboard-header">Sharetea Cashier Interface</h1>

      <div className="cashier-main-area">

        {/* Search function should be placed here */}
        
        <div className="product-catalog">
          <div className="category-filters">
            {categories.map(category => (
              <button 
                key={category.id}
                className={`category-filter-button ${activeCategory === category.id ? 'category-filter-active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
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
              <p>No products found in this category</p>
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

export default CashierView;