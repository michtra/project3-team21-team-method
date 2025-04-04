import React, { useState } from 'react';
import ManagerInventoryView from './ManagerInventoryView';
import ManagerProductView from './ManagerProductView';
import ManagerReportView from './ManagerReportView'; 



const ManagerView = () => { 
  const [activeTab, setActiveTab] = useState('inventory');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inventory':
        return <ManagerInventoryView />; 
      case 'products':
        return <ManagerProductView />;
      case 'report':
        return <ManagerReportView />; 
      default:
        return <ManagerInventoryView />;
    }
  };

  const getTabClassName = (tabName) => {
    return `tab-button ${activeTab === tabName ? 'tab-button-active' : ''}`;
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Manager Dashboard</h1>

      <div className="tabs-container">
        <button
          className={getTabClassName('inventory')}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={getTabClassName('products')}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={getTabClassName('report')}
          onClick={() => setActiveTab('report')}
        >
          Report
        </button>
      </div>

      <div>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default ManagerView; 