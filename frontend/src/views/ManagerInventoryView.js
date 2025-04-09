import React, { useState, useEffect } from 'react';
import { fetchInventory, createInventory, updateInventory } from '../api'; // Adjust path if api.js is not in src/


const ManagerInventoryView = () => { 
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ name: '', quantity: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadInventory = () => {
    setLoading(true);
    if (!isModalOpen) setError(null);
    fetchInventory()
      .then(data => {
        if (Array.isArray(data)) setInventory(data);
        else { setError("Invalid data format received."); setInventory([]); }
      })
      .catch(err => { setError(`Failed to load inventory: ${err.message}`); setInventory([]); })
      .finally(() => setLoading(false));
  };

  // Initial load
  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false); setEditingItemId(null); setFormData({ name: '', quantity: 0 });
    setError(null); setIsModalOpen(true);
  };
  const handleStartEdit = (item) => {
    setIsEditing(true); setEditingItemId(item.item_id); setFormData({ name: item.item_name, quantity: item.amount });
    setError(null); setIsModalOpen(true);
  };
  const closeModalAndReset = () => {
    setIsModalOpen(false);
    setTimeout(() => { setIsEditing(false); setEditingItemId(null); setFormData({ name: '', quantity: 0 }); setError(null); }, 300);
  };

  // Form Submission (inside Modal)
  const handleSubmit = (e) => {
    e.preventDefault(); setError(null);
    const currentQuantity = Number(formData.quantity);
    if (isNaN(currentQuantity) || currentQuantity < 0) { setError("Quantity must be a non-negative number."); return; }
    const currentName = formData.name.trim();
    if (!currentName) { setError("Item Name cannot be empty."); return; }
    const payload = { item_name: currentName, amount: currentQuantity };

    const apiCall = isEditing ? updateInventory(editingItemId, payload) : createInventory(payload);
    apiCall
      .then(result => { if (result && typeof result === 'object') { loadInventory(); closeModalAndReset(); } else { setError(isEditing ? "Update failed: Invalid response." : "Add failed: Invalid response."); }})
      .catch(err => { setError(`Failed to ${isEditing ? 'update' : 'add'} item: ${err.message || 'Unknown error'}`); });
  };

  // Increment Button Action
  const handleIncrement = (itemId, currentItemName, currentAmount) => {
    setError(null); const payload = { item_name: currentItemName, amount: Number(currentAmount) + 1 };
    updateInventory(itemId, payload)
      .then(updatedItem => { if (updatedItem?.item_id) { setInventory(prev => prev.map(item => (item.item_id === itemId ? updatedItem : item))); } else { setError("Increment failed: Invalid response."); }})
      .catch(err => { setError(`Failed to increment item ${currentItemName}: ${err.message}`); });
  };

  return (
    <div className="view-container">
      <button onClick={handleOpenAddModal} className="add-item-button">
        + Add New Inventory Item
      </button>
      {loading && <p>Loading inventory...</p>}
      {error && !isModalOpen && <p className="error-message">Error: {error}</p>}
      {!loading && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Quantity</th><th>Actions</th></tr></thead>
            <tbody>
              {inventory.length === 0 ? ( <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No inventory items found.</td></tr> )
              : ( inventory.map(item => (
                  <tr key={item.item_id}>
                    <td>{item.item_name}</td>
                    <td>{item.amount}</td>
                    <td>
                      <button onClick={() => handleIncrement(item.item_id, item.item_name, item.amount)} className="action-button increment"> Incr. Qty </button>
                      <button onClick={() => handleStartEdit(item)} className="action-button edit"> Edit </button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3></div>
            <div className="modal-body">
              {error && <p className="error-message">Error: {error}</p>}
              <form onSubmit={handleSubmit} id="modalInventoryForm" className="modal-form">
                <div>
                  <label htmlFor="inventoryItemName">Item Name</label>
                  <input id="inventoryItemName" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                </div>
                <div>
                  <label htmlFor="inventoryQuantity">Quantity</label>
                  <input id="inventoryQuantity" type="number" value={formData.quantity} min="0" onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={closeModalAndReset} className="modal-button modal-button-secondary"> Cancel </button>
              <button type="submit" form="modalInventoryForm" className="modal-button modal-button-primary"> {isEditing ? 'Save Changes' : 'Add Item'} </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManagerInventoryView;