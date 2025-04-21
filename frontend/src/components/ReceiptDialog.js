import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Divider,
    Button,
    IconButton,
    Paper,
    Chip
} from '@mui/material';
import {
    Clear as ClearIcon,
    Print as PrintIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon
} from '@mui/icons-material';

function ReceiptDialog({open, onClose, receipt}) {
    if (!receipt) return null;

    const getIceText = (iceValue) => {
        switch (iceValue) {
            case 0:
                return 'No Ice';
            case 0.25:
                return 'Light Ice';
            case 0.5:
                return 'Regular Ice';
            case 0.75:
                return 'Extra Ice';
            default:
                return 'Regular Ice';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {borderRadius: 2}
            }}
        >
            <DialogTitle
                sx={{
                    textAlign: 'center',
                    borderBottom: '1px dashed #ccc',
                    pb: 2
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    Receipt #{receipt.receiptNumber}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{position: 'absolute', right: 8, top: 8}}
                >
                    <ClearIcon/>
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{px: 3, py: 2}}>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: '#f9f9f9',
                        p: 2,
                        borderRadius: 2,
                        mb: 2,
                        border: '1px solid #eee'
                    }}
                >
                    <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                        SHARETEA
                    </Typography>
                    <Typography align="center" variant="body2" gutterBottom fontWeight="medium">
                        503 George Bush Dr W<br/>
                        College Station, TX 77840<br/>
                        Tel: (979) 353-0045
                    </Typography>
                </Paper>

                <Box sx={{mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <TimeIcon sx={{mr: 1, color: 'text.secondary'}}/>
                        <Typography variant="body2">
                            {receipt.date}
                        </Typography>
                    </Box>

                    <Box>
                        {receipt.customerId && receipt.customerId !== 'Guest' ? (
                            <Chip
                                size="small"
                                icon={<PersonIcon/>}
                                label={`Customer: ${receipt.customerId}`}
                                color="primary"
                                variant="outlined"
                            />
                        ) : (
                            <Chip
                                size="small"
                                icon={<PersonIcon/>}
                                label="Guest"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>

                <Typography variant="body2" sx={{mb: 1}}>
                    Cashier: {receipt.cashier}
                </Typography>

                <Divider sx={{my: 2}}/>

                {/* Items list */}
                <Box sx={{mb: 2}}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        ORDER DETAILS:
                    </Typography>

                    {receipt.items.map((item, index) => (
                        <Box key={index} sx={{mb: 1.5}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                                <Typography variant="body2" fontWeight="medium">
                                    {item.quantity} × {item.name} ({item.code})
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </Typography>
                            </Box>

                            <Typography variant="caption" color="text.secondary" component="div" sx={{ml: 2}}>
                                • Sugar: {item.customizations.sugar}
                                <br/>
                                • Ice: {getIceText(item.customizations.ice)}
                                <br/>
                                • Toppings: {Object.keys(item.customizations.toppings || {}).length > 0
                                ? Object.entries(item.customizations.toppings).map(([name, amount]) =>
                                    `${name} (${amount})`).join(', ')
                                : 'None'}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{my: 2}}/>

                {/* Totals */}
                <Box sx={{mb: 1}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">${receipt.subtotal.toFixed(2)}</Typography>
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                        <Typography variant="body2">Tax (8.25%):</Typography>
                        <Typography variant="body2">${receipt.tax.toFixed(2)}</Typography>
                    </Box>

                    <Divider sx={{my: 1}}/>

                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Typography variant="subtitle2" fontWeight="bold">Total:</Typography>
                        <Typography variant="subtitle2" fontWeight="bold">${receipt.total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Box sx={{mt: 3, textAlign: 'center'}}>
                    <Typography align="center" variant="body2" sx={{fontStyle: 'italic'}}>
                        Thank you for choosing Sharetea!
                    </Typography>
                    <Typography align="center" variant="caption" color="text.secondary">
                        Please come again.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{px: 3, pb: 3, pt: 0, display: 'flex', gap: 1}}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{flex: 1}}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PrintIcon/>}
                    sx={{flex: 1}}
                >
                    Print
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ReceiptDialog;