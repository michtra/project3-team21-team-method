// src/views/KioskView.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchProducts,
    createTransaction,
    fetchInventory,
    fetchTransactions,
    fetchWeather
} from '../api';

// Import custom components
import DrinkCustomizationModal from '../components/DrinkCustomizationModal';
import ProductCard from '../components/ProductCard';
import CategorySelector from '../components/CategorySelector';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import WeatherModal from '../components/WeatherModal';

// MUI components
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Paper,
    InputBase,
    List,
    IconButton,
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

// Icons
import {
    Search as SearchIcon,
    ShoppingCart as CartIcon,
    Receipt as ReceiptIcon,
    WbSunny as WeatherIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

// Allergen icons
import { GiPeanut } from "react-icons/gi";
import { LuMilk } from "react-icons/lu";
import { SiHoneygain } from "react-icons/si";
import { MdOutlineNoFood } from "react-icons/md"; // Added for allergen-free indicator

function KioskView() {
    // --- State ---
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
    const [showAllergenInfo, setShowAllergenInfo] = useState(false);

    // --- Weather State ---
    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);
    const weatherCity = 'College Station'; // Define the city for weather lookup

    // --- Category Configuration ---
    const categories = [
        { id: 'all', name: 'All Drinks', color: theme.palette.primary.main },
        { id: 'milk_tea', name: 'Milk Tea', color: theme.palette.categories?.milkTea || '#e0ba6e' },
        { id: 'fruit_tea', name: 'Fruit Tea', color: theme.palette.categories?.fruitTea || '#4caf50' },
        { id: 'classic_tea', name: 'Classic Tea', color: theme.palette.categories?.classicTea || '#1793d1' },
    ];

    // --- Helper Functions ---
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    const closePopup = () => {
        setSelectedProduct(null);
    };

    const handleToggleAllergenInfo = () => {
        setShowAllergenInfo(prev => !prev);
    };

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

    // --- Data Fetching ---
    const fetchInventoryData = async () => {
        try {
            await fetchInventory();
        } catch (err) {
            console.error('Error fetching inventory:', err);
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
            const latestTransactionNum = transactions.length > 0 ? transactions[0].customer_transaction_num : 2000;
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

    // --- Category and Product Filtering ---
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

    // --- Cart Management ---
    const addToCart = (customizedProduct) => {
        // Generate a unique ID for the cart item
        const cartItemId = Date.now() + Math.random();

        // Process allergens data
        let allergenInfo = customizedProduct.allergens;
        // If no allergens or 'None', set it to a specific "allergen-free" indicator
        if (!allergenInfo || allergenInfo === 'None') {
            allergenInfo = { type: 'allergen-free', text: 'Allergen-Free' };
        }

        const cartItem = {
            id: cartItemId,
            product_id: customizedProduct.product_id,
            name: customizedProduct.name || 'Unknown Product', // Provide default
            code: `${customizedProduct.product_id}`, // Use product ID as code
            price: customizedProduct.price || 0,
            customizations: customizedProduct.customizations || {}, // Ensure object
            quantity: 1,
            categoryColor: customizedProduct.categoryColor, // Store the category color
            allergens: allergenInfo // Store allergens with improved structure
        };

        setCart(prev => [...prev, cartItem]);
    };

    const removeFromCart = (cartItemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
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
            case 0:
                return 'No Ice';
            case 0.25:
                return 'Less Ice';
            case 0.5:
                return 'Regular Ice';
            case 0.75:
                return 'Extra Ice';
            default:
                return 'Regular Ice'; // Default case
        }
    };

    // --- Transaction Processing ---
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

    // --- Weather Functions ---
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
        loadWeatherData();
    };

    const handleCloseWeatherModal = () => {
        setShowWeatherModal(false);
    };

    // --- Loading/Error Checks ---
    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress size={60} thickness={4} color="primary" />
                <Typography variant="h6" color="text.secondary">Loading menu...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error"
                       sx={{ mt: 4, display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6">Error Loading Kiosk</Typography>
                    <Typography sx={{ mt: 1 }}>{error}</Typography>
                    <Button variant="contained" color="primary" onClick={loadInitialData} sx={{ mt: 2 }}>
                        Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    const filteredProducts = getFilteredProducts();

    // --- Render ---
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                overflow: 'hidden' // Prevent body scroll when modals are open
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    textAlign: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                    position: 'relative', // Needed for absolute positioning of the button
                    flexShrink: 0 // Prevent header from shrinking
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{ fontWeight: 700, color: 'text.primary', mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                >
                    🧋 Sharetea Kiosk 🧋
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Customize and order your favorite bubble tea!
                </Typography>

                {/* Weather Button */}
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
                        zIndex: 2, // Ensure button is above the back button
                        pointerEvents: 'auto', // Make sure clicks register
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                        }
                    }}
                    title={`Weather in ${weatherCity}`} // Tooltip
                >
                    <WeatherIcon />
                </IconButton>

                {/* Allergen Information Button */}
                <IconButton
                    aria-label="allergen information"
                    onClick={handleToggleAllergenInfo}
                    sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 16 },
                        right: { xs: 70, sm: 80 }, // Position it to the left of the weather button
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        transition: 'background-color 0.3s',
                        zIndex: 2, // Ensure button is above the back button
                        pointerEvents: 'auto', // Make sure clicks register
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                        }
                    }}
                    title="Allergen Information"
                >
                    <InfoIcon />
                </IconButton>

                {/* Allergen Info Dialog - Updated with icons */}
                <Dialog
                    open={showAllergenInfo}
                    onClose={() => setShowAllergenInfo(false)}
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                        Allergen Information
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body1" paragraph>
                            We want to make sure you're aware of any potential allergens in our products:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <LuMilk size={24} color={theme.palette.warning.main} />
                                </Box>
                                <Typography variant="body1">
                                    <strong>Dairy:</strong> All "Milk Tea" drinks contain dairy products.
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <GiPeanut size={24} color={theme.palette.warning.main} />
                                </Box>
                                <Typography variant="body1">
                                    <strong>Nuts:</strong> Some drinks may contain nuts or be processed in facilities that handle nuts.
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <SiHoneygain size={24} color={theme.palette.warning.main} />
                                </Box>
                                <Typography variant="body1">
                                    <strong>Honey:</strong> Some of our teas contain honey.
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <MdOutlineNoFood size={24} color={theme.palette.success.main} />
                                </Box>
                                <Typography variant="body1">
                                    <strong>Allergen-Free:</strong> Drinks marked with this icon contain no known common allergens.
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                            If you have any allergies or dietary restrictions, please inform our staff before ordering.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
                        <Button variant="contained" color="primary" onClick={() => setShowAllergenInfo(false)}>
                            I Understand
                        </Button>
                    </DialogActions>
                </Dialog>
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
                        sx={{
                            p: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            flexShrink: 0
                        }}
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
                    <CategorySelector
                        categories={categories}
                        activeCategory={activeCategory}
                        handleCategoryChange={handleCategoryChange}
                        theme={theme}
                    />

                    {/* Products grid - Make this scrollable */}
                    <Box
                        sx={{
                            overflowY: 'auto', // Enable vertical scroll
                            pr: 2, // Padding for scrollbar
                            flexGrow: 1, // Take remaining space
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.1)' }
                        }}
                    >
                        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => (
                                    <Grid item xs={6} sm={6} md={4} key={product.product_id}>
                                        <ProductCard
                                            product={product}
                                            index={index}
                                            handleProductClick={handleProductClick}
                                            getCategoryColor={getCategoryColor}
                                            categories={categories}
                                            theme={theme}
                                        />
                                    </Grid>
                                ))
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
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexShrink: 0
                    }}>
                        <CartIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>Your Order</Typography>
                        <Chip label={`${cart.reduce((acc, item) => acc + item.quantity, 0)} item(s)`} size="small"
                              color="primary" sx={{ ml: 'auto' }} />
                    </Paper>

                    {/* Cart items - Make this scrollable */}
                    <Box sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '3px' }
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
                                <CartIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>Your cart is empty</Typography>
                                <Typography variant="body2" color="text.secondary">Add items from the menu!</Typography>
                            </Box>
                        ) : (
                            <List sx={{ pt: 0 }}>
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
                    {currentOrder && (
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="h5" gutterBottom>Thank you!</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                                <ReceiptIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 1.5 }} />
                                <Typography variant="h4">#{currentOrder.receiptNumber}</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 2 }}>Your order is being prepared.</Typography>
                            <Box sx={{ my: 2, textAlign: 'left', px: 2 }}>
                                {currentOrder.items.map((item, index) => (
                                    <Box key={index} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        borderBottom: index < currentOrder.items.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none',
                                        py: 0.5
                                    }}>
                                        <Typography variant="body2">{item.quantity} x
                                            #{item.code} {item.name}</Typography>
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
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button variant="contained" color="primary" size="large" onClick={handleConfirmationClose}
                            sx={{ minWidth: 180, borderRadius: 2, py: 1 }}>
                        Start New Order
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Weather Modal */}
            <WeatherModal
                open={showWeatherModal}
                onClose={handleCloseWeatherModal}
                weatherData={weatherData}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                weatherCity={weatherCity}
                theme={theme}
            />

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