import React, { useState } from 'react';
import KioskView from './views/KioskView';        
import CashierView from './views/CashierViews';   
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('main');

  const renderView = () => {
    switch (currentView) {
      case 'kiosk':
        return <KioskView />;
      case 'cashier':
        return <CashierView />;
      default:
        return (
          <div className="main-menu">
            <h1>Sharetea POS System</h1>
            <div className="menu-buttons">
              <button onClick={() => setCurrentView('kiosk')}>Customer Kiosk</button>
              <button onClick={() => setCurrentView('cashier')}>Cashier System</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {currentView !== 'main' && (
        <button className="back-button" onClick={() => setCurrentView('main')}>
          Back to Main Menu
        </button>
      )}
      {renderView()}
    </div>
  );
}

export default App;
