import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button
} from '@mui/material';
import {Receipt as ReceiptIcon} from '@mui/icons-material';

const OrderConfirmationDialog = ({
                                     showConfirmation,
                                     handleConfirmationClose,
                                     currentOrder,
                                     theme
                                 }) => {
    if (!currentOrder) return null;

    return (
        <Dialog
            open={showConfirmation}
            onClose={handleConfirmationClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{sx: {borderRadius: 4, bgcolor: 'background.default'}}}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                fontSize: 24,
                pt: 3,
                fontWeight: 'bold',
                color: theme.palette.primary.main
            }}>
                Order Confirmed!
            </DialogTitle>
            <DialogContent>
                <Box sx={{textAlign: 'center', py: 1}}>
                    <Typography variant="h5" gutterBottom>Thank you!</Typography>
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2}}>
                        <ReceiptIcon sx={{fontSize: 40, color: theme.palette.primary.main, mr: 1.5}}/>
                        <Typography variant="h4">#{currentOrder.receiptNumber}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{mb: 2}}>Your order is being prepared.</Typography>
                    <Box sx={{my: 2, textAlign: 'left', px: 2}}>
                        {currentOrder.items.map((item, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: index < currentOrder.items.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none',
                                py: 0.5
                            }}>
                                <Typography variant="body2">{item.quantity} x #{item.code} {item.name}</Typography>
                                <Typography variant="body2"
                                            fontWeight="bold">${(item.price * item.quantity).toFixed(2)}</Typography>
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{
                        bgcolor: 'background.paper',
                        p: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        mt: 2
                    }}>
                        <Typography variant="h5" color="primary" fontWeight="bold">Total:
                            ${currentOrder.total.toFixed(2)}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{justifyContent: 'center', pb: 3}}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleConfirmationClose}
                    sx={{minWidth: 180, borderRadius: 2, py: 1}}
                >
                    Start New Order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderConfirmationDialog;