import React from 'react';
import {Box, Typography, Paper, ListItem, IconButton} from '@mui/material';
import {Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon} from '@mui/icons-material';
import AllergenIcon from './AllergenIcon';

const CartItem = ({item, updateQuantity, removeFromCart, getIceText, theme}) => {
    return (
        <ListItem
            disablePadding
            sx={{mb: 2, pb: 2, borderBottom: `1px solid ${theme.palette.divider}`}}
        >
            <Box sx={{width: '100%'}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography variant="body1" sx={{fontWeight: 500, pr: 1}}>
                        <strong>#{item.code}</strong> - {item.name}
                    </Typography>
                    <Typography variant="body1" sx={{
                        fontWeight: 600,
                        color: item.categoryColor || theme.palette.primary.main,
                        whiteSpace: 'nowrap'
                    }}>
                        ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                </Box>

                {/* Consistent allergen icon display */}
                <Box sx={{display: 'flex', mb: 1}}>
                    <AllergenIcon product={item}/>
                </Box>

                {(item.customizations.sugar !== undefined ||
                    item.customizations.ice !== undefined ||
                    (item.customizations.toppings && Object.keys(item.customizations.toppings).length > 0)) && (
                    <Paper variant="outlined" sx={{
                        p: 1,
                        mb: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderColor: item.categoryColor ? `${item.categoryColor}40` : 'rgba(0,0,0,0.1)'
                    }}>
                        {item.customizations.sugar !== undefined && (
                            <Typography variant="caption" display="block" color="text.secondary">
                                <strong>Sugar:</strong> {item.customizations.sugar}%
                            </Typography>
                        )}
                        {item.customizations.ice !== undefined && (
                            <Typography variant="caption" display="block" color="text.secondary">
                                <strong>Ice:</strong> {getIceText(item.customizations.ice)}
                            </Typography>
                        )}
                        {item.customizations.toppings && Object.keys(item.customizations.toppings).length > 0 && (
                            <Typography variant="caption" display="block" color="text.secondary">
                                <strong>Toppings:</strong> {Object.entries(item.customizations.toppings)
                                .map(([name, amount]) => `${name}${amount > 1 ? ` (${amount})` : ''}`)
                                .join(', ')}
                            </Typography>
                        )}
                    </Paper>
                )}

                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            color="inherit"
                            sx={{borderRadius: 2, bgcolor: 'action.hover'}}
                        >
                            <RemoveIcon fontSize="small"/>
                        </IconButton>
                        <Typography variant="body1" sx={{
                            mx: 1,
                            fontWeight: 600,
                            minWidth: '20px',
                            textAlign: 'center'
                        }}>
                            {item.quantity}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            color="inherit"
                            sx={{borderRadius: 2, bgcolor: 'action.hover'}}
                        >
                            <AddIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.id)}
                        color="error"
                        sx={{borderRadius: 2}}
                        title="Remove Item"
                    >
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>
            </Box>
        </ListItem>
    );
};

export default CartItem;