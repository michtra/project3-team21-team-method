// component that displays the shopping cart with items and order summary
import React from 'react';
import {Box, Paper, Typography, Chip, List} from '@mui/material';
import {ShoppingCart as CartIcon} from '@mui/icons-material';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';

const CartSection = ({
                         cart,
                         orderTotal,
                         updateQuantity,
                         removeFromCart,
                         getIceText,
                         theme,
                         processingPayment,
                         paymentError,
                         processPayment,
                         clearCart
                     }) => {
    return (
        <Box
            sx={{
                width: {xs: '100%', md: '35%'},
                height: {xs: 'auto', md: '100%'},
                minHeight: {xs: '300px', md: 'auto'},
                boxShadow: {
                    xs: '0 -4px 15px rgba(0,0,0,0.1)',
                    md: '-4px 0 15px rgba(0,0,0,0.1)'
                },
                borderLeft: {xs: 'none', md: `1px solid ${theme.palette.divider}`},
                borderTop: {xs: `1px solid ${theme.palette.divider}`, md: 'none'},
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                zIndex: 1
            }}
        >
            {/* Order header */}
            <Paper elevation={0} sx={{
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0
            }}>
                <CartIcon sx={{ 
                    // Force high contrast for cart icon with a black outline in light theme
                    color: theme.palette.mode === 'light' ? '#000000' : theme.palette.primary.main,
                    stroke: theme.palette.mode === 'light' ? '#000000' : 'none',
                    strokeWidth: theme.palette.mode === 'light' ? 1 : 0,
                }} />
                <Typography variant="h5" sx={{fontWeight: 600}}>Your Order</Typography>
                <Chip
                    label={`${cart.reduce((acc, item) => acc + item.quantity, 0)} item(s)`}
                    size="small"
                    color="primary"
                    sx={{ml: 'auto'}}
                />
            </Paper>

            {/* Cart items - Make this scrollable */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                '&::-webkit-scrollbar': {width: '6px'},
                '&::-webkit-scrollbar-thumb': {backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '3px'}
            }}>
                {cart.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        py: 8,
                        textAlign: 'center'
                    }}>
                        <CartIcon sx={{
                            fontSize: 60, 
                            mb: 2,
                            // Force high contrast for empty cart icon
                            color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'action.disabled',
                            stroke: theme.palette.mode === 'light' ? '#000000' : 'none',
                            strokeWidth: theme.palette.mode === 'light' ? 0.5 : 0,
                        }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>Your cart is empty</Typography>
                        <Typography variant="body2" color="text.secondary">Add items from the menu!</Typography>
                    </Box>
                ) : (
                    <List sx={{pt: 0}}>
                        {cart.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                updateQuantity={updateQuantity}
                                removeFromCart={removeFromCart}
                                getIceText={getIceText}
                                theme={theme}
                            />
                        ))}
                    </List>
                )}
            </Box>

            {/* Order summary and checkout */}
            <OrderSummary
                orderTotal={orderTotal}
                cart={cart}
                processingPayment={processingPayment}
                paymentError={paymentError}
                processPayment={processPayment}
                clearCart={clearCart}
            />
        </Box>
    );
};

export default CartSection;