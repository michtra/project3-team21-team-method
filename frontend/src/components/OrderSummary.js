import React from 'react';
import {Box, Typography, Divider, Button, Alert, CircularProgress} from '@mui/material';
import {Payment as PaymentIcon, Cancel as CancelIcon} from '@mui/icons-material';

const OrderSummary = ({
                          orderTotal,
                          cart,
                          processingPayment,
                          paymentError,
                          processPayment,
                          clearCart
                      }) => {
    return (
        <Box sx={{p: 3, borderTop: `1px solid rgba(0, 0, 0, 0.12)`, flexShrink: 0}}>
            <Box sx={{mb: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                    <Typography variant="body1" color="text.secondary">Subtotal:</Typography>
                    <Typography variant="body1">${orderTotal.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography variant="body1" color="text.secondary">Tax (8.25%):</Typography>
                    <Typography variant="body1">${orderTotal.tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{my: 1.5}}/>
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary" sx={{fontWeight: 600}}>
                        ${orderTotal.total.toFixed(2)}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                {paymentError && (
                    <Alert severity="error" sx={{width: '100%'}}>
                        {paymentError}
                    </Alert>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={cart.length === 0 || processingPayment}
                    onClick={processPayment}
                    startIcon={processingPayment ?
                        <CircularProgress size={24} color="inherit"/> :
                        <PaymentIcon/>
                    }
                    sx={{
                        py: 1.5,
                        borderRadius: 3,
                        boxShadow: 'none',
                        '&:hover': {boxShadow: '0 4px 8px rgba(0,0,0,0.2)'}
                    }}
                >
                    {processingPayment ? 'Processing...' : `Checkout • $${orderTotal.total.toFixed(2)}`}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={cart.length === 0 || processingPayment}
                    onClick={clearCart}
                    startIcon={<CancelIcon/>}
                    sx={{borderRadius: 3}}
                >
                    Clear Order
                </Button>
            </Box>
        </Box>
    );
};

export default OrderSummary;