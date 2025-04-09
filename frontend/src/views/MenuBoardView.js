import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../api';

function MenuBoardView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const categories = [
    { id: 'milk_tea', name: 'Milk Tea' },
    { id: 'fruit_tea', name: 'Fruit Tea' },
    { id: 'classic_tea', name: 'Classic Tea' },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Fetching products for menu board...');
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

  const getProductsByCategory = (categoryId) => {
    return products.filter(product => {
      if (product.category_id) {
        return product.category_id === categoryId;
      }
      if (product.product_type) {
        const normalizedType = product.product_type.toLowerCase().replace(/\s+/g, '_');
        return normalizedType === categoryId;
      }
      return false;
    });
  };

  if (loading) return <div>Loading menu board...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="menu-board-container">
      <h1 className="menu-board-header">Sharetea Menu</h1>
      
      <div className="menu-board-content">
      {categories.map(category => {
          const categoryProducts = getProductsByCategory(category.id);
          
          if (categoryProducts.length === 0) {
            return null;
          }
          
          return (
            <div 
              key={category.id} 
              className={`menu-category-section category-${category.id}`}
            >
              <h2 className="menu-category-header">{category.name}</h2>
              
              <div className="menu-items-grid">
                {categoryProducts.map((product, index) => (
                  <div key={product.product_id} className="menu-item">
                    <div className="menu-item-number">{`${category.id.charAt(0).toUpperCase()}${index + 1}`}</div>
                    <div className="menu-item-content">
                      <h3 className="menu-item-name">{product.product_name}</h3>
                      <p className="menu-item-price">${product.product_cost.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MenuBoardView;