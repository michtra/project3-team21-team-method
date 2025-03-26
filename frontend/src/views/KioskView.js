import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../api';

function KioskView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customizations, setCustomizations] = useState({
    ice: '100%',
    topping: 'None'
  });

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

  const handleCustomizationChange = (e) => {
    const { name, value } = e.target;
    setCustomizations({
      ...customizations,
      [name]: value
    });
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="kiosk-view">
      <h1>Sharetea Kiosk</h1>
      
      <div className="kiosk-container">
        <div className="product-list">
          <h2>Menu Items</h2>
          <div className="products">
            {products.map(product => (
              <div key={product.product_id} className="product-card">
                <h3>{product.product_name}</h3>
                <p>${product.product_cost.toFixed(2)}</p>
                <p>Type: {product.product_type}</p>
                <div className="customizations">
                  <label>
                    Ice Level:
                    <select 
                      name="ice" 
                      value={customizations.ice}
                      onChange={handleCustomizationChange}
                    >
                      <option value="100%">100%</option>
                      <option value="75%">75%</option>
                      <option value="50%">50%</option>
                      <option value="25%">25%</option>
                      <option value="0%">0%</option>
                    </select>
                  </label>
                  <label>
                    Topping:
                    <select 
                      name="topping" 
                      value={customizations.topping}
                      onChange={handleCustomizationChange}
                    >
                      <option value="None">None</option>
                      <option value="Boba">Boba</option>
                      <option value="Pudding">Pudding</option>
                      <option value="Grass Jelly">Grass Jelly</option>
                      <option value="Aloe Vera">Aloe Vera</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KioskView;