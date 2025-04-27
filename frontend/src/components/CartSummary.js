import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Cancel as CancelIcon,
    Clear as ClearIcon,
    CreditCard as PaymentIcon,
    Remove as RemoveIcon,
    AccountCircle as UserIcon,
    ShoppingCart as CartIcon
} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';

function CartSummary({
                         cart,
                         orderTotal,
                         customerId,
                         handleCustomerIdOpen,
                         removeFromCart,
                         updateQuantity,
                         clearCart,
                         processPayment,
                         processingPayment,
                         paymentError
                     }) {
    const theme = useTheme();

    const getIceText = (iceValue) => {
        switch (iceValue) {
            case 0:
                return 'No Ice';
            case 0.25:
                return 'Less Ice';
            case 0.5:
                return 'Regular Ice';
            case 0.75:
                return 'Extra Ice';
            default:
                return 'Regular Ice';
        }
    };

    return (
        <Box sx={{
            width: '35%',
            bgcolor: 'background.paper',
            borderLeft: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Typography variant="h5" sx={{fontWeight: 500}}>
                    Current Order
                </Typography>

                {customerId > 0 ? (
                    <Chip
                        color="primary"
                        label={`Customer ID: ${customerId}`}
                        variant="outlined"
                        onClick={handleCustomerIdOpen}
                    />
                ) : (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCustomerIdOpen}
                        startIcon={<UserIcon/>}
                    >
                        Set Customer
                    </Button>
                )}
            </Paper>

            {/* Cart items */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                }
            }}>
                {cart.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            opacity: 0.6,
                            py: 8
                        }}
                    >
                        <CartIcon sx={{fontSize: 50, mb: 2, opacity: 0.5}}/>
                        <Typography variant="h6" color="text.secondary">
                            No items in cart
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{mt: 1}}>
                            Select products from the menu to add them to your order
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {cart.map(item => (
                            <ListItem
                                key={item.id}
                                disablePadding
                                sx={{
                                    mb: 2,
                                    pb: 2,
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Box sx={{width: '100%'}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                                            <strong>{item.code}</strong> - {item.name}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: 500,
                                            color: item.categoryColor || theme.palette.primary.main
                                        }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                        Sugar: {item.customizations.sugar} •
                                        Ice: {getIceText(item.customizations.ice)} •
                                        Toppings: {Object.keys(item.customizations.toppings || {}).length > 0
                                        ? Object.entries(item.customizations.toppings).map(([name, amount]) =>
                                            `${name} (${amount})`).join(', ')
                                        : 'None'}
                                    </Typography>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                color="inherit"
                                                sx={{bgcolor: 'action.hover'}}
                                            >
                                                <RemoveIcon fontSize="small"/>
                                            </IconButton>
                                            <Typography sx={{mx: 1, minWidth: 24, textAlign: 'center'}}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                color="inherit"
                                                sx={{bgcolor: 'action.hover'}}
                                            >
                                                <AddIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => removeFromCart(item.id)}
                                            color="error"
                                        >
                                            <ClearIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            {/* Order total and checkout */}
            <Box sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
            }}>
                <Box sx={{mb: 3}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                        <Typography variant="body1">Subtotal:</Typography>
                        <Typography variant="body1">${orderTotal.subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                        <Typography variant="body1">Tax (8.25%):</Typography>
                        <Typography variant="body1">${orderTotal.tax.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{my: 1.5}}/>
                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" color="primary">${orderTotal.total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Box sx={{display: 'flex', gap: 2}}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={cart.length === 0 || processingPayment}
                        onClick={processPayment}
                        startIcon={processingPayment ? <CircularProgress size={24} color="inherit"/> :
                            <PaymentIcon/>}
                    >
                        {processingPayment ? 'Processing...' : 'Process Payment'}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="large"
                        disabled={cart.length === 0 || processingPayment}
                        onClick={clearCart}
                        startIcon={<CancelIcon/>}
                        sx={{
                            // Force high contrast regardless of theme
                            color: '#d32f2f',
                            borderColor: '#d32f2f',
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                borderColor: '#d32f2f',
                            },
                            '&.Mui-disabled': {
                                color: 'rgba(211, 47, 47, 0.7)',
                                borderColor: 'rgba(211, 47, 47, 0.5)',
                            },
                        }}
                    >
                        Cancel Order
                    </Button>
                </Box>

                {paymentError && (
                    <Alert severity="error" sx={{mt: 2}}>
                        {paymentError}
                    </Alert>
                )}
            </Box>
        </Box>
    );
}

export default CartSummary;