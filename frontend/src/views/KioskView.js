// KioskView.js
import React, {useState, useEffect, useCallback} from 'react';
import {fetchProducts, createTransaction, fetchInventory, fetchTransactions} from '../api';
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
    IconButton,
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
    Receipt as ReceiptIcon
} from '@mui/icons-material';

function KioskView() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [orderTotal, setOrderTotal] = useState({subtotal: 0, tax: 0, total: 0});
    const theme = useTheme();
    const [transactionNumber, setTransactionNumber] = useState(2001);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // order confirmation state
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    // pop up initialization
    const [selectedProduct, setSelectedProduct] = useState(null);
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };
    const closePopup = () => {
        setSelectedProduct(null);
    };

    const categories = [
        {id: 'all', name: 'All Drinks', color: theme.palette.primary.main},
        {id: 'milk_tea', name: 'Milk Tea', color: theme.palette.categories?.milkTea || '#a67c52'},
        {id: 'fruit_tea', name: 'Fruit Tea', color: theme.palette.categories?.fruitTea || '#ff7700'},
        {id: 'classic_tea', name: 'Classic Tea', color: theme.palette.categories?.classicTea || '#8bc34a'},
    ];

    // function to get category color based on product type
    const getCategoryColor = (product) => {
        const categoryKey = product.category_id || product.product_type;
        if (categoryKey) {
            const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
            const category = categories.find(cat => cat.id === normalized);
            return category ? category.color : theme.palette.secondary.main;
        }
        return theme.palette.secondary.main; // default color
    };

    const calculateTotals = useCallback(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.0825;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        setOrderTotal({subtotal, tax, total});
    }, [cart]);

    // fetch inventory function
    const fetchInventoryData = async () => {
        try {
            const inventoryData = await fetchInventory();
        }
        catch (err) {
            console.error('Error fetching inventory:', err);
        }
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                console.log('Fetching Kiosk products...');
                const data = await fetchProducts();
                console.log('Kiosk products received:', data);
                setProducts(data);
                setLoading(false);
            }
            catch (err) {
                console.error('Error:', err);
                setError('Failed to load products');
                setLoading(false);
            }
        };
        loadProducts();
        fetchInventoryData(); // load inventory data
    });

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    // drink categories filtering
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

        // search bar input
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.product_name?.toLowerCase().includes(query)
            );
        }

        // sort products by product_id numerically
        filtered = filtered.sort((a, b) => a.product_id - b.product_id);

        return filtered;
    };

    const addToCart = (customizedProduct) => {
        const cartItem = {
            id: Date.now(),
            product_id: customizedProduct.product_id,
            name: customizedProduct.name || 'Unknown',
            code: `${customizedProduct.product_id}`,
            price: customizedProduct.price || 0,
            customizations: customizedProduct.customizations || 'None',
            quantity: 1,
            categoryColor: customizedProduct.categoryColor // store the category color
        };

        setCart(prev => [...prev, cartItem]);
    };

    const removeFromCart = (cartItemId) => {
        setCart(cart.filter(item => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart(cart.map(item =>
            item.id === cartItemId
                ? {...item, quantity: newQuantity}
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

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

    function getTransactionDateInCDT() {
        const currentDate = new Date();

        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Chicago', // CDT timezone
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(currentDate);

        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const year = parts.find(p => p.type === 'year').value;
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;
        const second = parts.find(p => p.type === 'second').value;

        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    const processPayment = async () => {
        try {
            setProcessingPayment(true);
            setPaymentError('');

            // 1. create transaction data, ensure proper format matching server expectations
            const transactionData = {
                customer_id: 0, // Kiosk orders are anonymous
                transaction_date: getTransactionDateInCDT(),
                transaction_number: transactionNumber,
                items: cart.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    customizations: item.customizations || {}
                })),
                total: parseFloat(orderTotal.total.toFixed(2))
            };

            // 2. process payment
            console.log('Processing payment for transaction:', transactionData);

            try {
                // send transaction to the server
                const result = await createTransaction(transactionData);
                console.log('Transaction saved:', result);

                // payment successful
                setPaymentSuccess(true);
                // TODO
                const transactions = await fetchTransactions();
                setTransactionNumber(transactions.length);

                // save current order before clearing cart
                setCurrentOrder({
                    items: [...cart],
                    total: orderTotal.total,
                    date: new Date(),
                    receiptNumber: transactions.length
                });

                setProcessingPayment(false);

                // show confirmation dialog
                setShowConfirmation(true);
            }
            catch (err) {
                console.error('Failed to save transaction:', err);
                setPaymentError('Error processing transaction. Please try again.');
                setProcessingPayment(false);
            }
        }
        catch (error) {
            console.error('Payment error:', error);
            setPaymentError('Error processing payment. Please try again.');
            setProcessingPayment(false);
        }
    };

    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        clearCart();
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <CircularProgress size={60} thickness={4} color="secondary"/>
                <Typography variant="h6" color="text.secondary">
                    Loading menu...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{mt: 4}}>
                <Alert severity="error" sx={{mt: 4}}>
                    Error: {error}
                </Alert>
            </Container>
        );
    }

    const filteredProducts = getFilteredProducts();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                background: 'linear-gradient(135deg, rgba(18,18,18,1) 0%, rgba(30,30,30,1) 100%)'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    textAlign: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    background: 'linear-gradient(90deg, rgba(0,150,136,0.1) 0%, rgba(255,152,0,0.1) 100%)'
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: 'white',
                        mb: 1,
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    🧋 Sharetea Kiosk 🧋
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Customize and order your favorite bubble tea!
                </Typography>
            </Box>

            <Box sx={{display: 'flex', flexGrow: 1}}>
                {/* Left side - Products catalog */}
                <Box
                    sx={{
                        width: '65%',
                        height: 'calc(100vh - 120px)',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 3
                    }}
                >
                    {/* Search bar */}
                    <Paper
                        component="form"
                        sx={{
                            p: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <IconButton sx={{p: '10px'}} aria-label="search">
                            <SearchIcon/>
                        </IconButton>
                        <InputBase
                            sx={{ml: 1, flex: 1}}
                            placeholder="Search for a drink..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Paper>

                    {/* Category selector */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            mb: 3
                        }}
                    >
                        {categories.map(category => (
                            <Fade in={true} key={category.id}
                                  style={{transitionDelay: `${categories.indexOf(category) * 100}ms`}}>
                                <Chip
                                    label={category.name}
                                    onClick={() => handleCategoryChange(category.id)}
                                    color={activeCategory === category.id ? 'secondary' : 'default'}
                                    variant={activeCategory === category.id ? 'filled' : 'outlined'}
                                    sx={{
                                        borderRadius: 6,
                                        px: 2,
                                        py: 3,
                                        fontSize: '1rem',
                                        fontWeight: activeCategory === category.id ? 600 : 400,
                                        ...(category.color && activeCategory !== category.id ? {
                                            color: category.color,
                                            borderColor: category.color,
                                        } : {})
                                    }}
                                />
                            </Fade>
                        ))}
                    </Box>

                    {/* Products grid */}
                    <Box
                        sx={{
                            overflowY: 'auto',
                            pr: 2,
                            flexGrow: 1,
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '3px',
                            }
                        }}
                    >
                        <Grid container spacing={3}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => {
                                    const categoryColor = getCategoryColor(product);
                                    // get category name for alt text
                                    const categoryKey = product.category_id || product.product_type;
                                    let categoryName = "bubble tea";
                                    if (categoryKey) {
                                        const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
                                        const category = categories.find(cat => cat.id === normalized);
                                        if (category) {
                                            categoryName = category.name.toLowerCase();
                                        }
                                    }

                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={product.product_id}>
                                            <Fade in={true} style={{transitionDelay: '150ms'}}>
                                                <Card
                                                    sx={{
                                                        height: '100%',
                                                        borderRadius: 4,
                                                        background: `linear-gradient(145deg, rgba(40,40,40,1) 0%, rgba(25,25,25,1) 100%)`,
                                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                                        border: `1px solid ${categoryColor}30`,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-8px)',
                                                            boxShadow: `0 12px 28px ${categoryColor}40`,
                                                            borderColor: categoryColor
                                                        }
                                                    }}
                                                >
                                                    <CardActionArea
                                                        onClick={() => handleProductClick({...product, categoryColor})}
                                                        sx={{
                                                            height: '100%',
                                                            p: 2,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {/* Placeholder image with product code */}
                                                        <Box
                                                            sx={{
                                                                width: '100%',
                                                                position: 'relative',
                                                                mb: 2,
                                                                display: 'flex',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <ProductImage
                                                                productId={product.product_id}
                                                                productName={product.product_name}
                                                                categoryName={categoryName}
                                                                height={160}
                                                                style={{
                                                                    borderRadius: 8,
                                                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                                                }}
                                                            />

                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 10,
                                                                    left: 10,
                                                                    bgcolor: 'rgba(0,0,0,0.6)',
                                                                    color: 'white',
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 'bold',
                                                                    zIndex: 2
                                                                }}
                                                            >
                                                                {product.product_id}
                                                            </Box>
                                                        </Box>

                                                        <CardContent sx={{p: 1, width: '100%'}}>
                                                            <Typography
                                                                variant="h6"
                                                                component="div"
                                                                sx={{fontWeight: 600, mb: 1}}
                                                            >
                                                                {product.product_name}
                                                            </Typography>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mt: 1
                                                            }}>
                                                                <Typography
                                                                    variant="h5"
                                                                    sx={{fontWeight: 700, color: categoryColor}}
                                                                >
                                                                    ${product.product_cost.toFixed(2)}
                                                                </Typography>
                                                                <Chip
                                                                    label="ADD"
                                                                    size="small"
                                                                    sx={{
                                                                        borderRadius: 3,
                                                                        bgcolor: categoryColor,
                                                                        color: '#fff'
                                                                    }}
                                                                />
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    );
                                })
                            ) : (
                                <Box sx={{width: '100%', textAlign: 'center', mt: 4}}>
                                    <Typography variant="h6" color="text.secondary">
                                        No products found
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Box>
                </Box>

                {/* Right side - Order summary */}
                <Box
                    sx={{
                        width: '35%',
                        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper'
                    }}
                >
                    {/* Order header */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <CartIcon color="secondary"/>
                        <Typography variant="h5" sx={{fontWeight: 600}}>
                            Your Order
                        </Typography>
                        <Chip
                            label={`${cart.length} item${cart.length !== 1 ? 's' : ''}`}
                            size="small"
                            color="secondary"
                            sx={{ml: 'auto'}}
                        />
                    </Paper>

                    {/* Cart items */}
                    <Box sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '3px',
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
                                    py: 8
                                }}
                            >
                                <CartIcon sx={{fontSize: 60, color: 'action.disabled', mb: 2}}/>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Your cart is empty
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Add items from the menu to start your order
                                </Typography>
                            </Box>
                        ) : (
                            <List>
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
                                                <Typography variant="h6" sx={{fontWeight: 500}}>
                                                    <strong>{item.code}</strong> - {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 600,
                                                    color: item.categoryColor || theme.palette.secondary.main
                                                }}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Box>

                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1,
                                                    mb: 2,
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(0,0,0,0.03)',
                                                    borderColor: item.categoryColor ? `${item.categoryColor}40` : undefined
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Sugar:</strong> {item.customizations.sugar} • <strong>Ice:</strong> {getIceText(item.customizations.ice)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Toppings:</strong> {Object.keys(item.customizations.toppings || {}).length > 0
                                                    ? Object.entries(item.customizations.toppings).map(([name, amount]) =>
                                                        `${name} (${amount})`).join(', ')
                                                    : 'None'}
                                                </Typography>
                                            </Paper>

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
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: 'action.hover'
                                                        }}
                                                    >
                                                        <RemoveIcon fontSize="small"/>
                                                    </IconButton>
                                                    <Typography variant="body1" sx={{mx: 2, fontWeight: 600}}>
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        color="inherit"
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: 'action.hover'
                                                        }}
                                                    >
                                                        <AddIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeFromCart(item.id)}
                                                    color="error"
                                                    sx={{
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Order summary and checkout */}
                    <Box sx={{p: 3, borderTop: `1px solid ${theme.palette.divider}`}}>
                        <Box sx={{mb: 3}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="body1" color="text.secondary">Subtotal:</Typography>
                                <Typography variant="body1">${orderTotal.subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="body1" color="text.secondary">Tax (8.25%):</Typography>
                                <Typography variant="body1">${orderTotal.tax.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{my: 2}}/>
                            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6" color="secondary" sx={{fontWeight: 600}}>
                                    ${orderTotal.total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                disabled={cart.length === 0 || processingPayment}
                                onClick={processPayment}
                                startIcon={processingPayment ? <CircularProgress size={24} color="inherit"/> :
                                    <PaymentIcon/>}
                                sx={{
                                    py: 2,
                                    borderRadius: 3,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                {processingPayment ? 'Processing...' : `Checkout • ${orderTotal.total.toFixed(2)}`}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                disabled={cart.length === 0 || processingPayment}
                                onClick={clearCart}
                                startIcon={<CancelIcon/>}
                                sx={{
                                    borderRadius: 3
                                }}
                            >
                                Clear Order
                            </Button>

                            {paymentError && (
                                <Alert severity="error" sx={{mt: 2}}>
                                    {paymentError}
                                </Alert>
                            )}
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
                        addToCart({...customizedProduct, categoryColor: selectedProduct.categoryColor});
                        closePopup();
                    }}
                />
            )}

            {/* Order Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        bgcolor: 'background.default',
                        minHeight: '60vh',
                        margin: 0
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontSize: 24,
                    pt: 4,
                    fontWeight: 'bold',
                    color: theme.palette.secondary.main
                }}>
                    Order Confirmed!
                </DialogTitle>
                <DialogContent>
                    {currentOrder && (
                        <Box sx={{textAlign: 'center', py: 2}}>
                            <Typography variant="h5" gutterBottom>
                                Thank you for your order!
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                my: 3
                            }}>
                                <ReceiptIcon sx={{
                                    fontSize: 50,
                                    color: theme.palette.secondary.main,
                                    mr: 2
                                }}/>
                                <Typography variant="h4">
                                    #{currentOrder.receiptNumber}
                                </Typography>
                            </Box>

                            <Typography variant="body1" sx={{mb: 3}}>
                                Your order is being prepared and will be ready shortly.
                            </Typography>

                            <Divider sx={{my: 3}}/>

                            <Typography variant="h6" gutterBottom>
                                Order Summary
                            </Typography>

                            <Box sx={{my: 3}}>
                                {currentOrder.items.map((item, index) => (
                                    <Box key={index} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        borderBottom: index < currentOrder.items.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none',
                                        py: 1
                                    }}>
                                        <Typography>
                                            {item.quantity} x {item.code} {item.name}
                                        </Typography>
                                        <Typography fontWeight="bold">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{
                                bgcolor: 'background.paper',
                                p: 3,
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <Typography variant="h5" color="secondary.main" fontWeight="bold">
                                    Total: ${currentOrder.total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{justifyContent: 'center', pb: 4}}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleConfirmationClose}
                        sx={{minWidth: 200, borderRadius: 2, py: 1.5}}
                    >
                        Start New Order
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Success Snackbar */}
            <Snackbar
                open={paymentSuccess}
                autoHideDuration={3000}
                onClose={() => setPaymentSuccess(false)}
                message="Payment processed successfully"
            />
        </Box>
    );
}

export default KioskView;