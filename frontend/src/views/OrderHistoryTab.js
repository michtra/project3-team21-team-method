import React, {useState, useEffect} from 'react';
import {fetchTransactions, fetchProducts} from '../api';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Grid
} from '@mui/material';
import {
    Search as SearchIcon,
    Receipt as ReceiptIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    LocalCafe as CoffeeIcon
} from '@mui/icons-material';

function OrderHistoryTab() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'all'

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // fetch transactions
                const transactionsData = await fetchTransactions();

                // fetch products to get names and base prices
                const productsData = await fetchProducts();

                // create a lookup map for products
                const productsMap = {};
                productsData.forEach(product => {
                    productsMap[product.product_id] = {
                        ...product,
                        base_cost: product.base_cost || product.product_cost // Ensure we have the base cost
                    };
                });

                // first, sort transactions chronologically by purchase date
                // this is crucial for calculating the progressive dynamic pricing
                const sortedTransactions = [...transactionsData].sort((a, b) => {
                    return new Date(a.purchase_date) - new Date(b.purchase_date);
                });

                // process transactions with correct historical pricing
                const processedTransactions = processTransactionsWithHistoricalPricing(sortedTransactions, productsMap);

                // group by order_id/customer_transaction_num after processing
                const groupedTransactions = groupTransactionsByOrder(processedTransactions);

                setTransactions(groupedTransactions);
                setFilteredTransactions(groupedTransactions);
                setLoading(false);
            }
            catch (err) {
                console.error('Error loading order history:', err);
                setError('Failed to load order history');
                setLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line
    }, []);

    // process transactions with correct historical dynamic pricing
    const processTransactionsWithHistoricalPricing = (sortedTransactions, productsMap) => {
        // create a counts tracking object
        const productCountsByDay = {};
        
        return sortedTransactions.map(transaction => {
            const purchaseDate = new Date(transaction.purchase_date);
            
            // extract date components and create a date-only string (YYYY-MM-DD) in local timezone
            const year = purchaseDate.getFullYear();
            const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
            const day = String(purchaseDate.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            
            const productId = transaction.product_id;
            
            // make sure we have a tracking object for this date
            if (!productCountsByDay[dateKey]) {
                productCountsByDay[dateKey] = {};
            }
            
            // get current count for this product on this day (before this transaction)
            const currentDayCount = productCountsByDay[dateKey][productId] || 0;
            
            // calculate the dynamic price at the time of this purchase
            const product = productsMap[productId];
            let historicalPrice = 0;
            
            if (product) {
                const basePrice = product.base_cost || product.product_cost;
                const priceIncreaseFactor = 1 + (currentDayCount * 0.01); // 1% increase per order
                historicalPrice = parseFloat((basePrice * priceIncreaseFactor).toFixed(2));
            }
            
            // increment the count for future transactions on this same day
            productCountsByDay[dateKey][productId] = currentDayCount + 1;
            
            // add the product info and historical price to the transaction
            return {
                ...transaction,
                productName: product ? product.product_name : 'Unknown Product',
                productPrice: historicalPrice, // Use the calculated historical price
                productType: product ? product.product_type : 'Unknown',
                orderCount: currentDayCount, // Store the order count for reference
                dateKey: dateKey, // Store the date key for debugging
                purchaseTime: purchaseDate.toLocaleTimeString() // Store time for debugging
            };
        });
    };

    // group transactions by order
    const groupTransactionsByOrder = (processedTransactions) => {
        const transactionsByOrder = {};

        processedTransactions.forEach(transaction => {
            if (!transactionsByOrder[transaction.customer_transaction_num]) {
                transactionsByOrder[transaction.customer_transaction_num] = [];
            }

            transactionsByOrder[transaction.customer_transaction_num].push(transaction);
        });

        // convert to array of order groups
        return Object.keys(transactionsByOrder).map(orderNum => {
            const items = transactionsByOrder[orderNum];
            const orderDate = new Date(items[0].purchase_date);

            // calculate total for the order using the historical prices
            const orderTotal = items.reduce((sum, item) => sum + item.productPrice, 0);

            return {
                orderNum: parseInt(orderNum),
                date: orderDate,
                items: items,
                total: orderTotal,
                customer_id: items[0].customer_id
            };
        }).sort((a, b) => {
            // sort by date first (most recent first), then by order number
            const dateCompare = b.date - a.date;
            if (dateCompare !== 0) return dateCompare;
            return b.orderNum - a.orderNum;
        });
    };

    // filter transactions based on search query and date range
    useEffect(() => {
        let filtered = transactions;

        // apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                // search by order number
                order.orderNum.toString().includes(query) ||
                // search by customer ID
                (order.customer_id && order.customer_id.toString().includes(query)) ||
                // search in items (product names)
                order.items.some(item =>
                    item.productName.toLowerCase().includes(query) ||
                    (item.productType && item.productType.toLowerCase().includes(query))
                )
            );
        }

        // apply date filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateFilter === 'today') {
            filtered = filtered.filter(order => order.date >= today);
        }
        else if (dateFilter === 'week') {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            filtered = filtered.filter(order => order.date >= lastWeek);
        }
        else if (dateFilter === 'month') {
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            filtered = filtered.filter(order => order.date >= lastMonth);
        }

        setFilteredTransactions(filtered);
        setPage(0); // reset to first page when filters change
    }, [searchQuery, dateFilter, transactions]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDateFilterChange = (filter) => {
        setDateFilter(filter);
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
        <Container maxWidth="lg" sx={{py: 4}}>
            <Paper elevation={3} sx={{p: 3, mb: 4}}>
                <Typography variant="h5" gutterBottom sx={{mb: 3}}>
                    Order History
                </Typography>

                {/* Filters */}
                <Grid item xs={12} md={8}>
                    <Paper
                        component="form"
                        sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%' // ensure the paper takes full width of its container
                        }}
                    >
                        <IconButton sx={{p: '10px'}} aria-label="search">
                            <SearchIcon/>
                        </IconButton>
                        <TextField
                            sx={{ml: 1, flex: 1}}
                            placeholder="Search orders by number, customer, or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                                sx: {width: '100%'} // ensure input takes full width
                            }}
                            fullWidth // add fullWidth prop to TextField
                        />
                    </Paper>
                </Grid>

                {/* Add space between search bar and date filters*/}
                <Grid item xs={12} sx={{height: 16}}/>

                {/* Date filter chips */}
                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        justifyContent: {xs: 'flex-start', md: 'flex-end'}
                    }}>
                        <Chip
                            label="Today"
                            onClick={() => handleDateFilterChange('today')}
                            color={dateFilter === 'today' ? 'primary' : 'default'}
                            icon={<CalendarIcon/>}
                        />
                        <Chip
                            label="Past Week"
                            onClick={() => handleDateFilterChange('week')}
                            color={dateFilter === 'week' ? 'primary' : 'default'}
                            icon={<CalendarIcon/>}
                        />
                        <Chip
                            label="Past Month"
                            onClick={() => handleDateFilterChange('month')}
                            color={dateFilter === 'month' ? 'primary' : 'default'}
                            icon={<CalendarIcon/>}
                        />
                        <Chip
                            label="All Time"
                            onClick={() => handleDateFilterChange('all')}
                            color={dateFilter === 'all' ? 'primary' : 'default'}
                            icon={<CalendarIcon/>}
                        />
                    </Box>
                </Grid>

                {/* Orders Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Item Subtotal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((order) => (
                                    <TableRow key={order.orderNum} hover>
                                        <TableCell>
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <ReceiptIcon sx={{mr: 1, color: 'primary.main'}}/>
                                                <Typography fontWeight="medium">
                                                    #{order.orderNum}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <CalendarIcon sx={{mr: 1, color: 'text.secondary', fontSize: 20}}/>
                                                {order.date.toLocaleString('en-US', {timeZone: 'America/Chicago'})}
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            {order.customer_id ? (
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <PersonIcon sx={{mr: 1, color: 'text.secondary', fontSize: 20}}/>
                                                    ID: {order.customer_id}
                                                </Box>
                                            ) : (
                                                <Chip size="small" label="Guest" variant="outlined"/>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                                {order.items.map((item, idx) => (
                                                    <Box key={idx} sx={{display: 'flex', alignItems: 'center'}}>
                                                        <CoffeeIcon
                                                            sx={{mr: 1, color: 'text.secondary', fontSize: 16}}/>
                                                        <Typography variant="body2" sx={{mr: 1}}>
                                                            {item.productName}
                                                            {item.orderCount > 0 && (
                                                                <Chip
                                                                    size="small"
                                                                    label={`+${item.orderCount}%`}
                                                                    color="secondary"
                                                                    sx={{ml: 1, height: 20, fontSize: '0.7rem'}}
                                                                    title={`Date: ${item.dateKey} Time: ${item.purchaseTime}`}
                                                                />
                                                            )}
                                                        </Typography>
                                                        {/* Only show ice chip if ice_amount exists and is greater than 0 */}
                                                        {(item.ice_amount !== undefined && item.ice_amount !== null &&
                                                            Math.round(item.ice_amount * 100) > 0) && (
                                                            <Chip
                                                                size="small"
                                                                label={`Ice: ${Math.round(item.ice_amount * 100)}%`}
                                                                sx={{mr: 0.5, height: 20, fontSize: '0.7rem'}}
                                                            />
                                                        )}
                                                        {/* Only show topping if it exists and isn't "None" */}
                                                        {item.topping_type && item.topping_type !== 'None' && (
                                                            <Chip
                                                                size="small"
                                                                label={`${item.topping_type}`}
                                                                sx={{height: 20, fontSize: '0.7rem'}}
                                                            />
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography fontWeight="bold">
                                                ${order.total.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body1" sx={{py: 2}}>
                                            No transactions found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredTransactions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Container>
    );
}

export default OrderHistoryTab;