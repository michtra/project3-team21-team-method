import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../api';

function CashierView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'milk_tea', name: 'Milk Tea' },
    { id: 'fruit_tea', name: 'Fruit Tea' },
    { id: 'coffee', name: 'Coffee' },
  ];

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

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // Later this would filter products based on category
  };

  // Placeholder function for adding products to cart
  const addToCart = (product) => {
    console.log('Product added to cart:', product);
    // This would be implemented later
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter products by category (when implemented)
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === activeCategory);

  return (
    <div className="cashier-view">
      <h1>Sharetea Cashier System</h1>
      
      <div className="cashier-container">
        <div className="customer-info">
          <div>
            <label htmlFor="customer-name">Customer Name:</label>
            <input type="text" id="customer-name" placeholder="Optional" />
          </div>
          <div>
            <label htmlFor="order-type">Order Type:</label>
            <select id="order-type">
              <option value="dine-in">Dine In</option>
              <option value="takeout">Takeout</option>
            </select>
          </div>
        </div>

        <div className="order-section">
          <div className="product-selection">
            <div className="category-nav">
              {categories.map(category => (
                <button 
                  key={category.id}
                  className={activeCategory === category.id ? 'active' : ''}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="product-grid">
              {filteredProducts.map(product => (
                <div 
                  key={product.product_id} 
                  className="product-btn"
                  onClick={() => addToCart(product)}
                >
                  <div>{product.product_name}</div>
                  <div>${product.product_cost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart">
            <h2>Current Order</h2>
            {cart.length === 0 ? (
              <p>No items in cart</p>
            ) : (
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Customizations</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Cart items would be rendered here */}
                </tbody>
              </table>
            )}

            <div className="cart-total">
              <p>Subtotal: $0.00</p>
              <p>Tax (8.25%): $0.00</p>
              <p><strong>Total: $0.00</strong></p>
            </div>

            <div className="checkout-actions">
              <button className="checkout-btn" disabled>Process Payment</button>
              <button className="cancel-btn">Cancel Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashierView;