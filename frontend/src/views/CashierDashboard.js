import React, {useState} from 'react';
import {AppBar, Box, Tab, Tabs, Toolbar, Typography} from '@mui/material';
import {
    LocalCafe as CoffeeIcon,
    AccountCircle as UserIcon,
    History as HistoryIcon,
    ShoppingCart as CartIcon
} from '@mui/icons-material';
import OrderEntryTab from './OrderEntryTab';
import CashierInfoTab from './CashierInfoTab';
import OrderHistoryTab from './OrderHistoryTab';

function CashierDashboard({user}) {
    const [activeTab, setActiveTab] = useState(0);
    const [cart, setCart] = useState([]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column'}}>
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar sx={{justifyContent: 'center', position: 'relative'}}>
                    <Typography variant="h5" component="h1">
                        Sharetea Cashier System
                    </Typography>
                    <Box sx={{position: 'absolute', right: 24, display: 'flex', alignItems: 'center'}}>
                        <CartIcon sx={{mr: 1}}/>
                        <Typography variant="body1">
                            {cart.length} item{cart.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Toolbar>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    sx={{
                        bgcolor: 'background.paper',
                        '& .MuiTab-root': {py: 2}
                    }}
                >
                    <Tab icon={<CoffeeIcon/>} label="Order Entry" iconPosition="start"/>
                    <Tab icon={<HistoryIcon/>} label="Order History" iconPosition="start"/>
                    <Tab icon={<UserIcon/>} label="Cashier Info" iconPosition="start"/>
                </Tabs>
            </AppBar>

            {activeTab === 0 && <OrderEntryTab user={user} cart={cart} setCart={setCart}/>}
            {activeTab === 1 && <OrderHistoryTab/>}
            {activeTab === 2 && <CashierInfoTab user={user}/>}
        </Box>
    );
}

export default CashierDashboard;
