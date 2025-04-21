import React, {useState, useEffect, useCallback} from 'react';
import {fetchProducts, createTransaction, fetchTransactions, fetchInventory} from '../api';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import CategorySelector from '../components/CategorySelector';
import CartSummary from '../components/CartSummary';
import ReceiptDialog from '../components/ReceiptDialog';
import DrinkCustomizationModal from '../components/DrinkCustomizationModal';
import {
    Box,
    CircularProgress,
    Container,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    Snackbar,
    useTheme
} from '@mui/material';
import {
    LocalCafe as CoffeeIcon
} from '@mui/icons-material';

function OrderEntryTab({user, cart, setCart}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderTotal, setOrderTotal] = useState({subtotal: 0, tax: 0, total: 0});
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [customerId, setCustomerId] = useState(0);
    const [customerIdDialog, setCustomerIdDialog] = useState(false);
    const [tempCustomerId, setTempCustomerId] = useState('');
    const [transactionNumber, setTransactionNumber] = useState(1001);
    const [receiptDialog, setReceiptDialog] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const theme = useTheme();

    // get employee name from user prop if available, otherwise use default
    const cashierName = user ? user.name : 'John Doe';

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

    // load products
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                console.log('Fetching products...');
                const data = await fetchProducts();
                console.log('Products received:', data);
                setProducts(data);

                // also fetch inventory data
                await fetchInventory();

                setLoading(false);
            }
            catch (err) {
                console.error('Error details:', err);
                setError('Failed to load products');
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // calculate totals when cart changes
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

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    // handle product customization
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    const closePopup = () => {
        setSelectedProduct(null);
    };

    // cart functions
    const addToCart = (customizedProduct) => {
        const cartItem = {
            id: Date.now(),
            product_id: customizedProduct.product_id,
            name: customizedProduct.name || 'Unknown',
            code: `${customizedProduct.product_id}`,
            price: customizedProduct.price || 0,
            customizations: customizedProduct.customizations || 'None',
            quantity: 1,
            categoryColor: customizedProduct.categoryColor
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

    // customer ID functions
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

    // helper for transaction date in CDT
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

    // process payment
    const processPayment = async () => {
        try {
            setProcessingPayment(true);
            setPaymentError('');

            // create transaction data
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

            // process payment
            console.log('Processing payment for transaction:', transactionData);

            try {
                // send transaction to the server
                const result = await createTransaction(transactionData);
                console.log('Transaction saved:', result);

                // payment successful
                setPaymentSuccess(true);

                // get updated transaction list
                const transactions = await fetchTransactions();
                setTransactionNumber(transactions.length);

                // generate receipt data
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

                // reset cart
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

    // filter products based on category and search
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

    // handle category change
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    // receipt dialog functions
    const closeReceiptDialog = () => {
        setReceiptDialog(false);
        setCurrentReceipt(null);
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 112px)'
            }}>
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

    return (
        <Box sx={{display: 'flex', flexGrow: 1, overflow: 'hidden'}}>
            {/* Left side - Product selection */}
            <Box sx={{
                width: '65%',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                <CategorySelector
                    categories={categories}
                    activeCategory={activeCategory}
                    handleCategoryChange={handleCategoryChange}
                />

                <ProductGrid
                    products={getFilteredProducts()}
                    handleProductClick={handleProductClick}
                    categories={categories}
                />
            </Box>

            {/* Right side - Cart summary */}
            <CartSummary
                cart={cart}
                orderTotal={orderTotal}
                customerId={customerId}
                handleCustomerIdOpen={handleCustomerIdOpen}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                clearCart={clearCart}
                processPayment={processPayment}
                processingPayment={processingPayment}
                paymentError={paymentError}
            />

            {/* Drink Customization Modal */}
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
            {receiptDialog && currentReceipt && (
                <ReceiptDialog
                    open={receiptDialog}
                    onClose={closeReceiptDialog}
                    receipt={currentReceipt}
                />
            )}

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

export default OrderEntryTab;