// CashierViews.js
import React, {useCallback, useEffect, useState} from 'react';
import {createTransaction, fetchInventory, fetchProducts, fetchTransactions} from '../api';
import DrinkCustomizationModal from '../components/DrinkCustomizationModal';
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputBase,
    List,
    ListItem,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Toolbar,
    Typography,
    useTheme
} from '@mui/material';
import {
    AccountCircle as UserIcon,
    Add as AddIcon,
    Cancel as CancelIcon,
    Clear as ClearIcon,
    CreditCard as PaymentIcon,
    LocalCafe as CoffeeIcon,
    Remove as RemoveIcon,
    Search as SearchIcon,
    ShoppingCart as CartIcon
} from '@mui/icons-material';

function CashierView({user}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [orderTotal, setOrderTotal] = useState({subtotal: 0, tax: 0, total: 0});
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [customerId, setCustomerId] = useState(0);
    const [customerIdDialog, setCustomerIdDialog] = useState(false);
    const [tempCustomerId, setTempCustomerId] = useState('');
    const [transactionNumber, setTransactionNumber] = useState(1001);
    const [receiptDialog, setReceiptDialog] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState(null);

    // Get employee name from user prop if available, otherwise use default
    const cashierName = user ? user.name : 'John Doe';

    // pop up initialization
    const [selectedProduct, setSelectedProduct] = useState(null);
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };
    const closePopup = () => {
        setSelectedProduct(null);
    };

    const categories = [
        {id: 'all', name: 'All Items', icon: <CoffeeIcon/>, color: theme.palette.primary.main},
        {id: 'milk_tea', name: 'Milk Tea', icon: <CoffeeIcon/>, color: theme.palette.categories?.milkTea || '#a67c52'},
        {
            id: 'fruit_tea',
            name: 'Fruit Tea',
            icon: <CoffeeIcon/>,
            color: theme.palette.categories?.fruitTea || '#ff7700'
        },
        {
            id: 'classic_tea',
            name: 'Classic Tea',
            icon: <CoffeeIcon/>,
            color: theme.palette.categories?.classicTea || '#8bc34a'
        },
    ];

    // function to get category color based on product type
    const getCategoryColor = (product) => {
        const categoryKey = product.category_id || product.product_type;
        if (categoryKey) {
            const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
            const category = categories.find(cat => cat.id === normalized);
            return category ? category.color : theme.palette.primary.main;
        }
        return theme.palette.primary.main; // default color
    };

    const calculateTotals = useCallback(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.0825;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        setOrderTotal({
            subtotal,
            tax,
            total
        });
    }, [cart]);

    // fetch inventory function
    const fetchInventoryData = async () => {
        try {
            return await fetchInventory();
        }
        catch (err) {
            console.error('Error fetching inventory:', err);
        }
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                console.log('Fetching products...');
                const data = await fetchProducts();
                console.log('Products received:', data);
                setProducts(data);
                setLoading(false);
            }
            catch (err) {
                console.error('Error details:', err);
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

    const getFilteredProducts = () => {
        let filtered = products;

        if (activeCategory !== 'all') {
            filtered = filtered.filter(product => {
                if (product.category_id) {
                    return product.category_id === activeCategory;
                }
                if (product.product_type) {
                    const normalizedType = product.product_type.toLowerCase().replace(/\s+/g, '_');
                    return normalizedType === activeCategory;
                }
                return false;
            });
        }

        // search functionality
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

    // confirms customized product values and adds to current order
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
                customer_id: customerId || 0,
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

                // Payment successful
                setPaymentSuccess(true);
                // TODO
                const transactions = await fetchTransactions();
                setTransactionNumber(transactions.length);

                // Generate receipt data
                const receiptData = {
                    receiptNumber: transactions.length,
                    cashier: cashierName,
                    date: new Date().toLocaleString(),
                    items: cart,
                    subtotal: orderTotal.subtotal,
                    tax: orderTotal.tax,
                    total: orderTotal.total,
                    customerId: customerId || 'Guest'
                };

                setCurrentReceipt(receiptData);
                setReceiptDialog(true);

                // Reset cart
                clearCart();
                setProcessingPayment(false);
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

    const handleCustomerIdOpen = () => {
        setCustomerIdDialog(true);
    };

    const handleCustomerIdClose = () => {
        setCustomerIdDialog(false);
    };

    const handleCustomerIdSubmit = () => {
        if (tempCustomerId) {
            setCustomerId(parseInt(tempCustomerId, 10));
            setTempCustomerId('');
            setCustomerIdDialog(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const closeReceiptDialog = () => {
        setReceiptDialog(false);
        setCurrentReceipt(null);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <CircularProgress size={60} thickness={4}/>
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

    const renderOrderTab = () => (
        <Box sx={{display: 'flex', flexGrow: 1, overflow: 'hidden'}}>
            {/* Left side - Product selection */}
            <Box sx={{
                width: '65%',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Search and filters */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        borderRadius: 2
                    }}
                >
                    <IconButton sx={{p: '10px'}} aria-label="search">
                        <SearchIcon/>
                    </IconButton>
                    <InputBase
                        sx={{ml: 1, flex: 1}}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Paper>

                {/* Category filters */}
                <Box sx={{display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap'}}>
                    {categories.map(category => (
                        <Chip
                            key={category.id}
                            label={category.name}
                            icon={category.icon}
                            onClick={() => handleCategoryChange(category.id)}
                            color={activeCategory === category.id ? 'primary' : 'default'}
                            variant={activeCategory === category.id ? 'filled' : 'outlined'}
                            sx={{
                                borderRadius: 2,
                                py: 2.5,
                                ...(category.color && activeCategory !== category.id ? {
                                    color: category.color,
                                    borderColor: category.color,
                                } : {})
                            }}
                        />
                    ))}
                </Box>

                {/* Products grid */}
                <Box sx={{
                    overflowY: 'auto',
                    flexGrow: 1,
                    pr: 1,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                    }
                }}>
                    <Grid container spacing={2}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => {
                                const categoryColor = getCategoryColor(product);
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.product_id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                transition: 'transform 0.2s',
                                                border: `1px solid ${categoryColor}30`,
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 16px ${categoryColor}30`,
                                                    borderColor: categoryColor
                                                }
                                            }}
                                        >
                                            <CardActionArea
                                                onClick={() => handleProductClick({...product, categoryColor})}
                                                sx={{height: '100%', p: 2}}
                                            >
                                                <CardContent sx={{p: 1}}>
                                                    <Typography variant="h6" component="div" gutterBottom noWrap>
                                                        <strong>{product.product_id}</strong> - {product.product_name}
                                                    </Typography>
                                                    <Typography variant="h5"
                                                                sx={{fontWeight: 600, color: categoryColor}}>
                                                        ${product.product_cost.toFixed(2)}
                                                    </Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
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
        </Box>
    );

    const renderEmployeeTab = () => (
        <Container maxWidth="md" sx={{py: 4}}>
            <Paper elevation={3} sx={{p: 4, borderRadius: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                    <Avatar
                        src={user?.photo || ''}
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'primary.main',
                            mr: 3,
                            border: '4px solid',
                            borderColor: 'primary.light'
                        }}
                    >
                        {!user?.photo && <UserIcon sx={{fontSize: 60}}/>}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" gutterBottom>{cashierName}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Cashier</Typography>
                        {user?.email && (
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                {user.email}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );

    return (
        <Box sx={{flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column'}}>
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar sx={{justifyContent: 'center', position: 'relative'}}>
                    <Typography variant="h5" component="h1">
                        Sharetea Cashier System
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Box sx={{position: 'absolute', right: 24, display: 'flex', alignItems: 'center'}}>
                            <CartIcon sx={{mr: 1}}/>
                            <Typography variant="body1">
                                {cart.length} item{cart.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </Box>
                </Toolbar>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    sx={{
                        bgcolor: 'background.paper',
                        '& .MuiTab-root': {py: 2}
                    }}
                >
                    <Tab
                        icon={<CoffeeIcon/>}
                        label="Order Entry"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<UserIcon/>}
                        label="Cashier Info"
                        iconPosition="start"
                    />
                </Tabs>
            </AppBar>

            {activeTab === 0 ? renderOrderTab() : renderEmployeeTab()}

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

            {/* Customer ID Dialog */}
            <Dialog open={customerIdDialog} onClose={handleCustomerIdClose}>
                <DialogTitle>Customer Identification</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter customer ID for loyalty tracking or leave blank for guest checkout.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Customer ID"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={tempCustomerId}
                        onChange={(e) => setTempCustomerId(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCustomerIdClose}>Cancel</Button>
                    <Button onClick={handleCustomerIdSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>

            {/* Receipt Dialog */}
            <Dialog
                open={receiptDialog}
                onClose={closeReceiptDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{textAlign: 'center'}}>
                    Receipt #{currentReceipt?.receiptNumber}
                    <IconButton
                        aria-label="close"
                        onClick={closeReceiptDialog}
                        sx={{position: 'absolute', right: 8, top: 8}}
                    >
                        <ClearIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {currentReceipt && (
                        <Box sx={{fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
                            <Typography variant="h6" align="center" gutterBottom>SHARETEA</Typography>
                            <Typography align="center" variant="body2" gutterBottom>
                                503 George Bush Dr W<br/>
                                College Station, TX 77840<br/>
                                Tel: (979) 353-0045
                            </Typography>

                            <Divider sx={{my: 2}}/>

                            <Typography variant="body2">
                                Receipt #: {currentReceipt.receiptNumber}<br/>
                                Date: {currentReceipt.date}<br/>
                                Cashier: {currentReceipt.cashier}<br/>
                            </Typography>

                            <Divider sx={{my: 2}}/>

                            <Box sx={{mb: 2}}>
                                {currentReceipt.items.map((item, index) => (
                                    <Box key={index} sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                        <Typography variant="body2">
                                            {item.quantity} x {item.code} {item.name}
                                        </Typography>
                                        <Typography variant="body2">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{my: 2}}/>

                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2">${currentReceipt.subtotal.toFixed(2)}</Typography>
                            </Box>

                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="body2">Tax (8.25%):</Typography>
                                <Typography variant="body2">${currentReceipt.tax.toFixed(2)}</Typography>
                            </Box>

                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="body2" fontWeight="bold">Total:</Typography>
                                <Typography variant="body2"
                                            fontWeight="bold">${currentReceipt.total.toFixed(2)}</Typography>
                            </Box>

                            <Divider sx={{my: 2}}/>

                            <Typography align="center" variant="body2">
                                Thank you for choosing Sharetea!<br/>
                                Please come again.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button fullWidth variant="contained" color="primary" onClick={closeReceiptDialog}>
                        Close
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

export default CashierView;