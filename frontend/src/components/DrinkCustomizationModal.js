// modal dialog for customizing drinks with options for sugar, ice and toppings
import React, {useState, useEffect, useMemo} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    IconButton,
    Grid,
    Paper
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import ProductImage from './ProductImage';

function DrinkCustomizationModal({product, onClose, onConfirm}) {
    const [selectedSugar, setSelectedSugar] = useState('100%');
    // initialize ice with numeric value for precise level control
    const [selectedIce, setSelectedIce] = useState(0.5); // default to "Regular Ice" (0.5)
    const [selectedToppings, setSelectedToppings] = useState({});
    const [totalPrice, setTotalPrice] = useState(product?.product_cost || 0);

    // ice options as a scale from 0-0.75 with corresponding display labels
    const iceOptions = [
        {value: 0, label: "No Ice"},
        {value: 0.25, label: "Less Ice"},
        {value: 0.5, label: "Regular Ice"},
        {value: 0.75, label: "Extra Ice"}
    ];

    const sugarOptions = ['0%', '25%', '50%', '75%', '100%'];

    // available toppings that can be added to drinks with their prices
    const toppingOptions = useMemo(() => [
        {id: 'pearls', name: 'Boba Pearls', price: 0.75},
        {id: 'jelly', name: 'Grass Jelly', price: 0.75},
        {id: 'pudding', name: 'Pudding', price: 0.75},
        {id: 'aloe', name: 'Aloe Vera', price: 0.75},
        {id: 'red_bean', name: 'Red Bean', price: 0.75}
    ], []);

    // recalculates the total price whenever toppings or product selection changes
    useEffect(() => {
        // start with base product cost
        let newTotal = product?.product_cost || 0;

        // add topping prices
        for (const [toppingId, quantity] of Object.entries(selectedToppings)) {
            const topping = toppingOptions.find(t => t.id === toppingId);
            if (topping && quantity > 0) {
                newTotal += topping.price * quantity;
            }
        }

        setTotalPrice(newTotal);
    }, [selectedToppings, product, toppingOptions]);

    const handleSugarChange = (event) => {
        setSelectedSugar(event.target.value);
    };

    const handleIceChange = (event) => {
        // convert to number since radio values are strings by default
        setSelectedIce(parseFloat(event.target.value));
    };

    const handleToppingChange = (toppingId, quantity) => {
        setSelectedToppings(prev => {
            // create a copy of the current toppings object
            const updatedToppings = {...prev};

            // remove topping if quantity is 0 or less
            if (quantity <= 0) {
                delete updatedToppings[toppingId];
            }
            else {
                // otherwise update the quantity
                updatedToppings[toppingId] = quantity;
            }

            return updatedToppings;
        });
    };

    const getToppingQuantity = (toppingId) => {
        return selectedToppings[toppingId] || 0;
    };

    // creates the final customized product object and passes it to the parent component
    const handleSubmit = () => {
        const customizedProduct = {
            product_id: product.product_id,
            name: product.product_name,
            price: totalPrice,
            customizations: {
                sugar: selectedSugar,
                ice: selectedIce, // numeric value representing ice level
                toppings: selectedToppings
            },
            categoryColor: product.categoryColor,
            allergens: product.allergens
        };

        onConfirm(customizedProduct);
    };

    // get human-readable label for ice level
    const getIceLabelByValue = (value) => {
        const option = iceOptions.find(opt => opt.value === value);
        return option ? option.label : "Regular Ice";
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h5" sx={{fontWeight: 600}}>
                    Customize Your Drink
                </Typography>
                <IconButton onClick={onClose} size="large">
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Product Info Section */}
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                mr: 2,
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <ProductImage
                                    productId={product.product_id}
                                    productName={product.product_name}
                                    categoryName="bubble tea"
                                    height={80}
                                />
                            </Box>
                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    {product.product_name}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    ${product.product_cost.toFixed(2)}
                                </Typography>
                                {product.allergens && product.allergens !== 'None' && (
                                    <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <WarningIcon fontSize="small" />
                                        Contains allergens: {product.allergens}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Sugar Level Selection */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{p: 2, height: '100%'}}>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Sugar Level
                            </Typography>
                            <FormControl component="fieldset">
                                <RadioGroup value={selectedSugar} onChange={handleSugarChange}>
                                    {sugarOptions.map((option) => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio/>}
                                            label={option}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>

                    {/* Ice Level Selection */}
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{p: 2, height: '100%'}}>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Ice Level
                            </Typography>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    value={selectedIce.toString()}
                                    onChange={handleIceChange}
                                >
                                    {iceOptions.map((option) => (
                                        <FormControlLabel
                                            key={option.value}
                                            value={option.value.toString()}
                                            control={<Radio/>}
                                            label={option.label}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>

                    {/* Toppings Selection */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{p: 2}}>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Toppings
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Add extra toppings for $0.75 each
                            </Typography>

                            <Grid container spacing={2}>
                                {toppingOptions.map((topping) => {
                                    const quantity = getToppingQuantity(topping.id);

                                    return (
                                        <Grid item xs={12} sm={6} key={topping.id}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: quantity > 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                                            }}>
                                                <Box>
                                                    <Typography variant="body1">
                                                        {topping.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        +${topping.price.toFixed(2)}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToppingChange(topping.id, Math.max(0, quantity - 1))}
                                                        disabled={quantity === 0}
                                                    >
                                                        <RemoveIcon fontSize="small"/>
                                                    </IconButton>

                                                    <Typography sx={{mx: 1, minWidth: 20, textAlign: 'center'}}>
                                                        {quantity}
                                                    </Typography>

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToppingChange(topping.id, quantity + 1)}
                                                    >
                                                        <AddIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{p: 2, justifyContent: 'space-between'}}>
                <Box>
                    <Typography variant="h5" color="primary" fontWeight={600}>
                        Total: ${totalPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {product.product_name} • {selectedSugar} Sugar • {getIceLabelByValue(selectedIce)}
                    </Typography>
                </Box>

                <Box>
                    <Button onClick={onClose} sx={{mr: 1}}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        size="large"
                    >
                        Add to Order
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default DrinkCustomizationModal;