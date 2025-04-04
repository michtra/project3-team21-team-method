import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct } from '../api'; // Adjust path if api.js is not in src/

const ManagerProductView = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', cost: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    if (!isModalOpen) setError(null);
    fetchProducts()
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else { setError("Invalid data format received."); setProducts([]); }
      })
      .catch(err => { setError(`Failed to load products: ${err.message}`); setProducts([]); })
      .finally(() => setLoading(false));
  };

  // Initial load
  useEffect(() => {
    loadProducts();
    
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Modal Open/Close/Edit handlers
  const handleOpenAddModal = () => {
    setIsEditing(false); setEditingProductId(null); setFormData({ name: '', cost: '', type: '' });
    setError(null); setIsModalOpen(true);
  };
  const handleStartEdit = (product) => {
    setIsEditing(true); setEditingProductId(product.product_id);
    setFormData({ name: product.product_name, cost: product.product_cost.toString(), type: product.product_type });
    setError(null); setIsModalOpen(true);
  };
  const closeModalAndReset = () => {
    setIsModalOpen(false);
    setTimeout(() => { setIsEditing(false); setEditingProductId(null); setFormData({ name: '', cost: '', type: '' }); setError(null); }, 300);
  };

  // Form Submission (inside Modal)
  const handleSubmit = (e) => {
    e.preventDefault(); setError(null);
    const currentCost = parseFloat(formData.cost);
    if (isNaN(currentCost) || currentCost < 0) { setError("Cost must be a valid non-negative number."); return; }
    const currentName = formData.name.trim(); const currentType = formData.type.trim();
    if (!currentName || !currentType) { setError("Product Name and Type cannot be empty."); return; }
    const payload = { product_name: currentName, product_cost: currentCost, product_type: currentType };

    const apiCall = isEditing ? updateProduct(editingProductId, payload) : createProduct(payload);
    apiCall
      .then(result => { if (result && typeof result === 'object') { loadProducts(); closeModalAndReset(); } else { setError(isEditing ? "Update failed: Invalid response." : "Add failed: Invalid response."); }})
      .catch(err => { setError(`Failed to ${isEditing ? 'update' : 'add'} product: ${err.message || 'Unknown error'}`); });
  };

  return (
    <div className="view-container">
      <button onClick={handleOpenAddModal} className="add-item-button">
        + Add New Product
      </button>
      {loading && <p>Loading products...</p>}
      {error && !isModalOpen && <p className="error-message">Error: {error}</p>}
      {!loading && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Cost</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {products.length === 0 ? ( <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr> )
              : ( products.map(product => (
                  <tr key={product.product_id}>
                    <td>{product.product_name}</td>
                    <td>${product.product_cost.toFixed(2)}</td>
                    <td>{product.product_type}</td>
                    <td>
                      <button onClick={() => handleStartEdit(product)} className="action-button edit"> Edit </button>
                      {/* Delete button placeholder */}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3></div>
            <div className="modal-body">
              {error && <p className="error-message">Error: {error}</p>}
              <form onSubmit={handleSubmit} id="modalProductForm" className="modal-form">
                <div>
                  <label htmlFor="productName">Product Name</label>
                  <input id="productName" name="name" type="text" value={formData.name} onChange={handleInputChange} required autoFocus />
                </div>
                <div>
                  <label htmlFor="productCost">Cost</label>
                  <input id="productCost" name="cost" type="number" value={formData.cost} onChange={handleInputChange} min="0" step="0.01" required placeholder="e.g., 5.49" />
                </div>
                <div>
                  <label htmlFor="productType">Type</label>
                  <input id="productType" name="type" type="text" value={formData.type} onChange={handleInputChange} required placeholder="e.g., Milk Tea / Fruit Tea" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={closeModalAndReset} className="modal-button modal-button-secondary"> Cancel </button>
              <button type="submit" form="modalProductForm" className="modal-button modal-button-primary"> {isEditing ? 'Save Changes' : 'Add Product'} </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManagerProductView;