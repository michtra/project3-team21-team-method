import React, { useState } from 'react';

const toppingOptions = ['Boba', 'Herb Jelly', 'Lychee Jelly', 'Pudding', 'Ice Cream'];
const percentageOptions = ['0%', '25%', '50%', '75%', '100%'];

function DrinkCustomizationModal({ product, onClose, onConfirm }) {
  const [sugarLevel, setSugarLevel] = useState('100%');
  const [iceLevel, setIceLevel] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState({});

  const handleToppingChange = (topping, amount) => {
    setSelectedToppings(prev => ({
      ...prev,
      [topping]: amount
    }));
  };

  const handleConfirm = () => {
    // filters 0% toppings from being included to the cart
    const filteredToppings = Object.fromEntries(
      Object.entries(selectedToppings).filter(([_, amount]) => amount !== '0%')
    );

    const customizedProduct = {
      id: product.product_id,
      name: product.product_name,
      price: product.product_cost,
      customizations: {
        sugar: sugarLevel,
        ice: iceLevel,
        toppings: filteredToppings
      }
      
    };

    // ================ DEBUGGING ========================
    console.log("Sugar to be added:", sugarLevel);
    console.log("Ice to be added:", iceLevel);
    console.log("Toppings to be added:", selectedToppings);

    onConfirm(customizedProduct);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '350px'
      }}>
        <button className="close-btn" onClick={onClose} style={{ float: 'right' }}>X</button>
        <h2>Customizing: "{product.product_name}"</h2>

        {/* SUGAR LEVEL */}
        <div className="custom-row" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontWeight: 'bold', width: '120px' }}>Sugar Level</label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
            {percentageOptions.map(p => (
              <button 
                key={`sugar-${p}`} 
                onClick={() => setSugarLevel(p)}
                style={{
                  backgroundColor: sugarLevel === p ? '#cceeff' : '',
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ICE LEVEL */}
        <div className="custom-row" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontWeight: 'bold', width: '120px' }}>Ice Level</label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
            {percentageOptions.map(p => (
              <button 
                key={`ice-${p}`} 
                onClick={() => setIceLevel(p)}
                style={{
                  backgroundColor: iceLevel === p ? '#cceeff' : '',
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* TOPPINGS */}
        <div className="custom-row">
          {toppingOptions.map(topping => (
            <div
              key={topping}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <span style={{ fontWeight: 'bold', width: '120px' }}>{topping}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
                {['0%', '50%', '100%'].map(p => (
                  <button
                    key={`${topping}-${p}`}
                    onClick={() => handleToppingChange(topping, p)}
                    style={{
                      backgroundColor: selectedToppings[topping] === p ? '#cceeff' : '',
                      border: '1px solid #ccc',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>



        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button className="checkout-btn" onClick={handleConfirm}>CONFIRM</button>
          <button className="cancel-btn" onClick={onClose}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

export default DrinkCustomizationModal;
