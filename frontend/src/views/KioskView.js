// KioskView.js
import React, { useState, useEffect, useCallback } from 'react';
// Import fetchWeather from api.js
import {
    fetchProducts,
    createTransaction,
    fetchInventory,
    fetchTransactions,
    fetchWeather // <-- Import the new function
} from '../api';
import DrinkCustomizationModal from '../components/DrinkCustomizationModal';
import ProductImage from '../components/ProductImage';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    CardActionArea,
    Paper,
    InputBase,
    Divider,
    List,
    ListItem,
    IconButton, // <-- Import IconButton
    Fade,
    Chip,
    CircularProgress,
    Alert,
    useTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    ShoppingCart as CartIcon,
    CreditCard as PaymentIcon,
    Cancel as CancelIcon,
    Receipt as ReceiptIcon,
    WbSunny as WeatherIcon, // <-- Import an icon for the weather button
    // You can choose other icons like Cloud as CloudIcon etc.
} from '@mui/icons-material';

function KioskView() {
    // --- Existing State ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [orderTotal, setOrderTotal] = useState({ subtotal: 0, tax: 0, total: 0 });
    const theme = useTheme();
    const [transactionNumber, setTransactionNumber] = useState(2001); // Initial fallback
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // --- NEW: Weather State ---
    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);
    const weatherCity = 'College Station'; // Define the city for weather lookup

    // --- Helper Functions ---
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };
    const closePopup = () => {
        setSelectedProduct(null);
    };

    const categories = [
        { id: 'all', name: 'All Drinks', color: theme.palette.primary.main },
        { id: 'milk_tea', name: 'Milk Tea', color: theme.palette.categories?.milkTea || '#a67c52' },
        { id: 'fruit_tea', name: 'Fruit Tea', color: theme.palette.categories?.fruitTea || '#ff7700' },
        { id: 'classic_tea', name: 'Classic Tea', color: theme.palette.categories?.classicTea || '#8bc34a' },
    ];

    const getCategoryColor = (product) => {
        const categoryKey = product.category_id || product.product_type;
        if (categoryKey) {
            const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
            const category = categories.find(cat => cat.id === normalized);
            return category ? category.color : theme.palette.secondary.main;
        }
        return theme.palette.secondary.main;
    };

    const calculateTotals = useCallback(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.0825; // Consider making this configurable
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        setOrderTotal({ subtotal, tax, total });
    }, [cart]);

    const fetchInventoryData = async () => {
        try {
            await fetchInventory(); // We don't seem to use the inventory data directly here yet
            // console.log('Inventory data fetched');
        } catch (err) {
            console.error('Error fetching inventory:', err);
            // Maybe set an error state or show a notification if needed
        }
    };

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching Kiosk products...');
            const productData = await fetchProducts();
            console.log('Kiosk products received:', productData);
            setProducts(productData);

            // Fetch initial transaction number state
            const transactions = await fetchTransactions();
             // Assuming the backend returns sorted transactions with latest first
             // And the structure is { customer_transaction_num: X }
            const latestTransactionNum = transactions.length > 0 ? transactions[0].customer_transaction_num : 2000; // Base number before first transaction
            setTransactionNumber(latestTransactionNum + 1); // Set the *next* number
            console.log('Next transaction number set to:', latestTransactionNum + 1);

            await fetchInventoryData(); // Load inventory data
        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Failed to load initial kiosk data. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    }, []); // No dependencies, runs once on mount

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]); // Correct dependency for initial load

    useEffect(() => {
        calculateTotals();
    }, [cart, calculateTotals]); // `cart` is the dependency here


    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const getFilteredProducts = () => {
        let filtered = products;

        if (activeCategory !== 'all') {
            filtered = filtered.filter(product => {
                const categoryKey = product.category_id || product.product_type;
                if (categoryKey) {
                    const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
                    return normalized === activeCategory;
                }
                return false;
            });
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.product_name?.toLowerCase().includes(query)
            );
        }

        // Sort products by product_id numerically
        filtered = filtered.sort((a, b) => a.product_id - b.product_id);

        return filtered;
    };

    const addToCart = (customizedProduct) => {
        // Generate a unique ID for the cart item (using Date.now() is simple but not foolproof for rapid adds)
        const cartItemId = Date.now() + Math.random(); // Add random number for better uniqueness

        const cartItem = {
            id: cartItemId,
            product_id: customizedProduct.product_id,
            name: customizedProduct.name || 'Unknown Product', // Provide default
            code: `${customizedProduct.product_id}`, // Use product ID as code
            price: customizedProduct.price || 0,
            customizations: customizedProduct.customizations || {}, // Ensure object
            quantity: 1,
            categoryColor: customizedProduct.categoryColor // Store the category color
        };

        setCart(prev => [...prev, cartItem]);
    };

    const removeFromCart = (cartItemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            // Optionally remove item if quantity becomes 0, or just prevent going below 1
            // removeFromCart(cartItemId);
            return;
        }
        setCart(prevCart => prevCart.map(item =>
            item.id === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        setOrderTotal({ subtotal: 0, tax: 0, total: 0 }); // Reset totals too
    };

    const getIceText = (iceValue) => {
        // Ensure iceValue is treated as a number
        const numericIceValue = Number(iceValue);
        switch (numericIceValue) {
            case 0: return 'No Ice';
            case 0.25: return 'Less Ice';
            case 0.5: return 'Regular Ice';
            case 0.75: return 'Extra Ice';
            default: return 'Regular Ice'; // Default case
        }
    };

    function getTransactionDateInCDT() {
        const currentDate = new Date();
        // Use toLocaleString for reliable timezone formatting
        return currentDate.toLocaleString('sv-SE', { timeZone: 'America/Chicago' }).replace(' ', 'T');
    }

    const processPayment = async () => {
        if (cart.length === 0) {
            setPaymentError('Your cart is empty.');
            return;
        }

        setProcessingPayment(true);
        setPaymentError('');
        setPaymentSuccess(false);

        try {
            // Use the current transactionNumber state
             const currentTransactionNum = transactionNumber;

            const transactionData = {
                customer_id: 0, // Kiosk orders are anonymous
                transaction_date: getTransactionDateInCDT(),
                transaction_number: currentTransactionNum, // Use the number from state
                items: cart.map(item => ({
                    product_id: parseInt(item.product_id, 10),
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    customizations: item.customizations || {} // Ensure it's an object
                })),
                // total: parseFloat(orderTotal.total.toFixed(2)) // Backend might recalculate, maybe not needed? Check API spec
            };

            console.log('Processing payment for transaction:', transactionData);

            // Send transaction to the server
            const result = await createTransaction(transactionData);
            console.log('Transaction saved:', result);

            // Payment successful
            setPaymentSuccess(true);

            // Prepare for the *next* transaction
            setTransactionNumber(prev => prev + 1);

            // Save current order details before clearing cart
            setCurrentOrder({
                items: [...cart], // Create a copy of the cart items
                total: orderTotal.total,
                date: new Date(),
                receiptNumber: currentTransactionNum // Use the number that was just processed
            });

            setProcessingPayment(false);
            setShowConfirmation(true); // Show confirmation dialog

        } catch (err) {
            console.error('Failed to save transaction:', err);
            // Use the error message from the API if available
            setPaymentError(err.message || 'Error processing transaction. Please check inventory or try again.');
            setProcessingPayment(false);
            setPaymentSuccess(false);
        }
    };


    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        clearCart(); // Clear cart for the next order
        setCurrentOrder(null); // Clear the displayed order
        setPaymentError(''); // Clear any previous payment errors
        setPaymentSuccess(false); // Reset success state
    };

    // --- NEW: Weather Functions ---
    const loadWeatherData = async () => {
        setWeatherLoading(true);
        setWeatherError(null);
        setWeatherData(null); // Clear old data
        try {
            console.log(`Fetching weather for ${weatherCity}...`);
            const data = await fetchWeather(weatherCity); // Use the configured city
            console.log('Weather data received:', data);
            setWeatherData(data);
        } catch (err) {
            console.error("Weather fetch failed:", err);
            setWeatherError(err.message || 'Could not fetch weather data.');
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleOpenWeatherModal = () => {
        setShowWeatherModal(true);
        // Fetch weather data only if it's not already loaded or errored recently
        // Or simply fetch every time the modal is opened:
        loadWeatherData();
    };

    const handleCloseWeatherModal = () => {
        setShowWeatherModal(false);
        // Optional: Clear weather data/error when closing to force reload next time
        // setWeatherData(null);
        // setWeatherError(null);
    };

    // --- Loading/Error Checks ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress size={60} thickness={4} color="secondary" />
                <Typography variant="h6" color="text.secondary">Loading menu...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mt: 4, display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                     <Typography variant="h6">Error Loading Kiosk</Typography>
                     <Typography sx={{ mt: 1 }}>{error}</Typography>
                     <Button variant="contained" color="secondary" onClick={loadInitialData} sx={{ mt: 2 }}>
                         Retry
                     </Button>
                 </Alert>
            </Container>
        );
    }

    const filteredProducts = getFilteredProducts();

    // --- Render Logic ---
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                background: 'linear-gradient(135deg, rgba(18,18,18,1) 0%, rgba(30,30,30,1) 100%)',
                 overflow: 'hidden' // Prevent body scroll when modals are open
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    textAlign: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    background: 'linear-gradient(90deg, rgba(0,150,136,0.1) 0%, rgba(255,152,0,0.1) 100%)',
                    position: 'relative', // <-- Needed for absolute positioning of the button
                    flexShrink: 0 // Prevent header from shrinking
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{ fontWeight: 700, color: 'white', mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                >
                    🧋 Sharetea Kiosk 🧋
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Customize and order your favorite bubble tea!
                </Typography>

                {/* --- NEW: Weather Button --- */}
                <IconButton
                    aria-label="show weather"
                    onClick={handleOpenWeatherModal}
                    sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 16 }, // Adjust for different screen sizes
                        right: { xs: 8, sm: 16 },
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        transition: 'background-color 0.3s',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                        }
                    }}
                    title={`Weather in ${weatherCity}`} // Tooltip
                >
                    <WeatherIcon />
                </IconButton>
                {/* --- End Weather Button --- */}
            </Box>

            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' /* Prevent outer scroll */ }}>
                {/* Left side - Products catalog */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '65%' }, // Responsive width
                        height: '100%', // Fill available height
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
                        overflow: 'hidden' // Prevent internal scrollbars here, handled by inner Box
                    }}
                >
                    {/* Search bar */}
                    <Paper
                        component="form"
                        onSubmit={(e) => e.preventDefault()} // Prevent form submission
                        sx={{ p: '4px 8px', display: 'flex', alignItems: 'center', mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0 }}
                    >
                        <IconButton sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search for a drink..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Paper>

                    {/* Category selector */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flexShrink: 0 }}>
                        {categories.map((category, index) => (
                            <Fade in={true} key={category.id} style={{ transitionDelay: `${index * 50}ms` }}>
                                <Chip
                                    label={category.name}
                                    onClick={() => handleCategoryChange(category.id)}
                                    color={activeCategory === category.id ? 'secondary' : 'default'}
                                    variant={activeCategory === category.id ? 'filled' : 'outlined'}
                                    sx={{ borderRadius: 6, px: 2, py: {xs: 1.5, sm: 3}, fontSize: {xs: '0.8rem', sm: '1rem'}, fontWeight: activeCategory === category.id ? 600 : 400, ...(category.color && activeCategory !== category.id ? { color: category.color, borderColor: category.color } : {}) }}
                                />
                            </Fade>
                        ))}
                    </Box>

                    {/* Products grid - Make this scrollable */}
                    <Box
                        sx={{
                            overflowY: 'auto', // Enable vertical scroll
                            pr: 2, // Padding for scrollbar
                            flexGrow: 1, // Take remaining space
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' },
                            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.1)'}
                        }}
                    >
                        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => {
                                     const categoryColor = getCategoryColor(product);
                                     const categoryKey = product.category_id || product.product_type;
                                     let categoryName = "bubble tea";
                                     if (categoryKey) {
                                         const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
                                         const category = categories.find(cat => cat.id === normalized);
                                         if (category) categoryName = category.name.toLowerCase();
                                     }

                                    return (
                                        <Grid item xs={6} sm={6} md={4} key={product.product_id}>
                                            <Fade in={true} style={{ transitionDelay: `${index * 30}ms` }}>
                                                <Card
                                                    sx={{
                                                        height: '100%', borderRadius: 4, background: `linear-gradient(145deg, rgba(40,40,40,1) 0%, rgba(25,25,25,1) 100%)`, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', border: `1px solid ${categoryColor}30`, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 10px 24px ${categoryColor}40`, borderColor: categoryColor }
                                                    }}
                                                >
                                                    <CardActionArea
                                                        onClick={() => handleProductClick({ ...product, categoryColor })}
                                                        sx={{ height: '100%', p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                                    >
                                                        <Box sx={{ width: '100%', position: 'relative', mb: 2, display: 'flex', justifyContent: 'center' }}>
                                                            <ProductImage
                                                                productId={product.product_id}
                                                                productName={product.product_name}
                                                                categoryName={categoryName}
                                                                height={140} // Adjusted height
                                                                style={{ borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                            />
                                                             <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold', zIndex: 2 }}>
                                                                #{product.product_id}
                                                            </Box>
                                                        </Box>
                                                        <CardContent sx={{ p: 1, width: '100%', textAlign: 'center' }}>
                                                            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                                {product.product_name}
                                                            </Typography>
                                                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, width: '100%' }}>
                                                                <Typography variant="h5" sx={{ fontWeight: 700, color: categoryColor, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                                                    ${product.product_cost.toFixed(2)}
                                                                </Typography>
                                                                <Chip label="ADD" size="small" sx={{ borderRadius: 3, bgcolor: categoryColor, color: '#fff', fontWeight: 'bold' }} />
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    );
                                })
                            ) : (
                                <Box sx={{ width: '100%', textAlign: 'center', mt: 4, p: 3 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        No products found matching your criteria.
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Box>
                </Box>

                {/* Right side - Order summary */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '35%' }, // Responsive width
                        height: '100%', // Fill height
                        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                        borderLeft: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        overflow: 'hidden' // Prevent outer scroll
                    }}
                >
                    {/* Order header */}
                    <Paper elevation={0} sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                        <CartIcon color="secondary" />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>Your Order</Typography>
                        <Chip label={`${cart.reduce((acc, item) => acc + item.quantity, 0)} item(s)`} size="small" color="secondary" sx={{ ml: 'auto' }} />
                    </Paper>

                    {/* Cart items - Make this scrollable */}
                    <Box sx={{
                        flexGrow: 1, overflowY: 'auto', p: 2,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '3px' }
                     }}>
                        {cart.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 8, textAlign: 'center' }}>
                                <CartIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>Your cart is empty</Typography>
                                <Typography variant="body2" color="text.secondary">Add items from the menu!</Typography>
                            </Box>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                {cart.map(item => (
                                    <ListItem key={item.id} disablePadding sx={{ mb: 2, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 500, pr: 1 }}>
                                                    <strong>#{item.code}</strong> - {item.name}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: item.categoryColor || theme.palette.secondary.main, whiteSpace: 'nowrap' }}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Box>

                                            {(item.customizations.sugar !== undefined || item.customizations.ice !== undefined || (item.customizations.toppings && Object.keys(item.customizations.toppings).length > 0)) && (
                                                <Paper variant="outlined" sx={{ p: 1, mb: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.03)', borderColor: item.categoryColor ? `${item.categoryColor}40` : 'rgba(0,0,0,0.1)' }}>
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
                                                            <strong>Toppings:</strong> {Object.entries(item.customizations.toppings).map(([name, amount]) => `${name}${amount > 1 ? ` (${amount})` : ''}`).join(', ')}
                                                        </Typography>
                                                    )}
                                                 </Paper>
                                            )}


                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} color="inherit" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="body1" sx={{ mx: 1, fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} color="inherit" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <IconButton size="small" onClick={() => removeFromCart(item.id)} color="error" sx={{ borderRadius: 2 }} title="Remove Item">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Order summary and checkout */}
                    <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
                         <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body1" color="text.secondary">Subtotal:</Typography>
                                <Typography variant="body1">${orderTotal.subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" color="text.secondary">Tax (8.25%):</Typography>
                                <Typography variant="body1">${orderTotal.tax.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
                                    ${orderTotal.total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                             {paymentError && (
                                <Alert severity="error" sx={{ width: '100%' }}>
                                    {paymentError}
                                </Alert>
                            )}
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                disabled={cart.length === 0 || processingPayment}
                                onClick={processPayment}
                                startIcon={processingPayment ? <CircularProgress size={24} color="inherit" /> : <PaymentIcon />}
                                sx={{ py: 1.5, borderRadius: 3, boxShadow: 'none', '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' } }}
                            >
                                {processingPayment ? 'Processing...' : `Checkout • $${orderTotal.total.toFixed(2)}`}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                disabled={cart.length === 0 || processingPayment}
                                onClick={clearCart}
                                startIcon={<CancelIcon />}
                                sx={{ borderRadius: 3 }}
                            >
                                Clear Order
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Customization Modal */}
            {selectedProduct && (
                 <DrinkCustomizationModal
                    product={selectedProduct}
                    onClose={closePopup}
                    onConfirm={(customizedProduct) => {
                        addToCart({ ...customizedProduct, categoryColor: selectedProduct.categoryColor });
                        closePopup();
                    }}
                />
            )}

            {/* Order Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                onClose={handleConfirmationClose} // Allow closing by clicking away or pressing Esc
                fullWidth
                maxWidth="sm" // Adjusted size
                PaperProps={{ sx: { borderRadius: 4, bgcolor: 'background.default' } }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontSize: 24, pt: 3, fontWeight: 'bold', color: theme.palette.secondary.main }}>
                    Order Confirmed!
                </DialogTitle>
                <DialogContent>
                    {currentOrder && (
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="h5" gutterBottom>Thank you!</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                                <ReceiptIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mr: 1.5 }} />
                                <Typography variant="h4">#{currentOrder.receiptNumber}</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 2 }}>Your order is being prepared.</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>Order Summary</Typography>
                            <Box sx={{ my: 2, textAlign: 'left', px: 2 }}>
                                {currentOrder.items.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: index < currentOrder.items.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none', py: 0.5 }}>
                                        <Typography variant="body2">{item.quantity} x #{item.code} {item.name}</Typography>
                                        <Typography variant="body2" fontWeight="bold">${(item.price * item.quantity).toFixed(2)}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mt: 2 }}>
                                <Typography variant="h5" color="secondary.main" fontWeight="bold">Total: ${currentOrder.total.toFixed(2)}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button variant="contained" color="secondary" size="large" onClick={handleConfirmationClose} sx={{ minWidth: 180, borderRadius: 2, py: 1 }}>
                        Start New Order
                    </Button>
                </DialogActions>
            </Dialog>


            {/* --- NEW: Weather Modal Dialog --- */}
            <Dialog
                open={showWeatherModal}
                onClose={handleCloseWeatherModal}
                aria-labelledby="weather-dialog-title"
                PaperProps={{ sx: { borderRadius: 3, minWidth: '300px' } }}
            >
                <DialogTitle id="weather-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', pb: 1 }}>
                    Weather in {weatherCity}
                </DialogTitle>
                <DialogContent dividers sx={{minHeight: 180, display: 'flex', flexDirection:'column', justifyContent:'center'}}>
                    {weatherLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                            <CircularProgress color="secondary" />
                        </Box>
                    )}
                    {weatherError && !weatherLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                             <Alert severity="warning" sx={{ width: '100%' }}>
                                {weatherError}
                             </Alert>
                        </Box>
                    )}
                    {weatherData && !weatherLoading && !weatherError && (
                         <Box sx={{ textAlign: 'center', py: 1 }}>
                             <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                                {Math.round(weatherData.main.temp)}°F
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                                {weatherData.weather[0].icon && (
                                     <img
                                        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                        alt={weatherData.weather[0].description}
                                        style={{ width: 60, height: 60, verticalAlign: 'middle' }}
                                    />
                                )}
                                <Typography variant="h6" sx={{ textTransform: 'capitalize', ml: 1 }}>
                                    {weatherData.weather[0].description}
                                </Typography>
                            </Box>
                             <Typography variant="body2" color="text.secondary" gutterBottom>
                                Feels like: {Math.round(weatherData.main.feels_like)}°F
                            </Typography>
                             <Typography variant="body2" color="text.secondary" gutterBottom>
                                Humidity: {weatherData.main.humidity}%
                            </Typography>
                             <Typography variant="body2" color="text.secondary">
                                Wind: {Math.round(weatherData.wind.speed)} mph
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 1.5 }}>
                    <Button onClick={handleCloseWeatherModal} variant="outlined" color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* --- End Weather Modal Dialog --- */}


            {/* Payment Success Snackbar */}
             <Snackbar
                open={paymentSuccess}
                autoHideDuration={4000} // Slightly longer duration
                onClose={() => setPaymentSuccess(false)}
                message="Payment processed successfully!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position at bottom center
                sx={{ '& .MuiSnackbarContent-root': { backgroundColor: 'success.main' } }} // Green background
            />

        </Box>
    );
}

export default KioskView;