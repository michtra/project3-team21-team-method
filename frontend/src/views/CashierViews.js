import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../api';
import DrinkCustomizationModal from '../components/DrinkCustomizationModal';

function CashierView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [orderTotal, setOrderTotal] = useState({ subtotal: 0, tax: 0, total: 0 });

  // Pop Up initialization
  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };
  const closePopup = () => {
    setSelectedProduct(null);
  };

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'milk_tea', name: 'Milk Tea' },
    { id: 'fruit_tea', name: 'Fruit Tea' },
    { id: 'coffee', name: 'Coffee' },
  ];

  // const defaultCustomizations = {
  //   ice: '100%',
  //   topping: 'None'
  // }; // to be removed because it isn't being used

  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.0825; // 8.25%
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


  // Confirms customized product values and adds to current order
  const addToCart = (customizedProduct) => {
    const cartItem = {
      id: Date.now(),
      product_id: customizedProduct.product_id,
      name: customizedProduct.name || 'Unknown',
      price: customizedProduct.price || 0,
      customizations: customizedProduct.customizations || 'None',
      quantity: 1
    };
  
    console.log("Final cart item:", cartItem);
    console.log("Final cart name:", cartItem.name);
    console.log("Final cart price:", cartItem.price);
  
    setCart(prev => [...prev, cartItem]);
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
            {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div 
                    key={product.product_id} 
                    className="product-btn"
                    onClick={() => handleProductClick(product)}
                  >
                    <div>{product.product_name}</div>
                    <div>${product.product_cost.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <p>No products found in this category</p>
              )}
            </div>
          </div>

          {/* Pop Up Section */}
          {selectedProduct && (
            <DrinkCustomizationModal
              product={selectedProduct}
              onClose={closePopup}

              onConfirm={(customizedProduct) => {
                addToCart(customizedProduct); 
                closePopup();
              }}
            />
          )}
        
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
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {cart.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        Sugar: {item.customizations?.sugar || '100%'}<br />
                        Ice: {item.customizations?.ice || '100%'}<br />
                        Toppings:
                        <ul>
                          {item.customizations?.toppings &&
                            Object.entries(item.customizations?.toppings).map(([key, value]) => (
                              <li key={key}>{key}: {value}</li>
                            ))
                            
                          }
                        </ul>
                      </td>

                      <td>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        {item.quantity}
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button onClick={() => removeFromCart(item.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="cart-total">
              <p>Subtotal: ${orderTotal.subtotal.toFixed(2)}</p>
              <p>Tax (8.25%): ${orderTotal.tax.toFixed(2)}</p>
              <p><strong>Total: ${orderTotal.total.toFixed(2)}</strong></p>
            </div>

            <div className="checkout-actions">
            <button 
                className="checkout-btn" 
                disabled={cart.length === 0}
                onClick={processPayment}
              >
                Process Payment
              </button>
              <button 
                className="cancel-btn"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashierView;