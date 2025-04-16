// ManagerReportView.js
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    Assessment as XReportIcon,
    Receipt as ZReportIcon,
    ShowChart as SalesIcon,
    Timeline as UsageChartIcon,
} from '@mui/icons-material';

// import API functions from api.js
import {
    closeBusinessDay as apiCloseBusinessDay,
    fetchInventoryUsage as apiFetchInventoryUsage,
    fetchSalesReport as apiFetchSalesReport,
    fetchXReport as apiFetchXReport,
    fetchZReport as apiFetchZReport
} from '../api';

// improved API functions with better error handling
const fetchXReport = async () => {
    try {
        return await apiFetchXReport();
    }
    catch (error) {
        console.error('Error fetching X-report:', error);
        throw error;
    }
};

// Z-Report
const fetchZReport = async () => {
    try {
        return await apiFetchZReport();
    }
    catch (error) {
        console.error('Error fetching Z-report:', error);
        throw error;
    }
};

// updated inventory usage fetch
const fetchInventoryUsage = async (startDate, endDate) => {
    try {
        return await apiFetchInventoryUsage(startDate, endDate);
    }
    catch (error) {
        console.error('Error fetching inventory usage data:', error);
        throw error;
    }
};

// updated sales report fetch
const fetchSalesReport = async (startDate, endDate) => {
    try {
        return await apiFetchSalesReport(startDate, endDate);
    }
    catch (error) {
        console.error('Error fetching sales report data:', error);
        throw error;
    }
};

const formatDateToString = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }

    // create a local date string in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// format date for display, ensuring it matches the input value
const formatDateForDisplay = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
};

// create a date from string safely, preserving the exact date in local timezone
const createDateFromString = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate ||
        !(startDate instanceof Date) || !(endDate instanceof Date) ||
        isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false;
    }

    if (startDate > endDate) {
        return false;
    }
    return true;
};

const ManagerReportView = () => {
    // state for report view and selection
    const [activeReport, setActiveReport] = useState(null);

    // initialize with a consistent format
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [dateRange, setDateRange] = useState({
        startDate: sevenDaysAgo,
        endDate: today
    });

    // state for date form inputs
    const [dateInputs, setDateInputs] = useState({
        startDate: formatDateToString(dateRange.startDate),
        endDate: formatDateToString(dateRange.endDate)
    });

    // report data
    const [xReportData, setXReportData] = useState(null);
    const [zReportData, setZReportData] = useState(null);
    const [usageData, setUsageData] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // report types definition
    const reportTypes = [
        {
            id: 'usage_chart',
            title: 'Product Usage Chart',
            description: 'Track inventory usage during a specific time period',
            icon: <UsageChartIcon fontSize="large"/>,
            color: '#4caf50', // success green
        },
        {
            id: 'sales_report',
            title: 'Sales Report',
            description: 'Sales breakdown by item for a specified period',
            icon: <SalesIcon fontSize="large"/>,
            color: '#009688', // teal
        },
        {
            id: 'x_report',
            title: 'X-Report',
            description: 'View sales data since last Z-Report',
            icon: <XReportIcon fontSize="large"/>,
            color: '#2196f3', // info blue
        },
        {
            id: 'z_report',
            title: 'Z-Report',
            description: 'Sales totals since last business closure',
            icon: <ZReportIcon fontSize="large"/>,
            color: '#ff9800', // warning orange
        }
    ];

    // handle date input changes
    const handleDateInputChange = (field, value) => {
        setDateInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // apply date filters when update button is clicked
    const handleDateUpdate = () => {
        const newStartDate = createDateFromString(dateInputs.startDate);
        const newEndDate = createDateFromString(dateInputs.endDate);

        // validate dates
        if (!newStartDate || !newEndDate) {
            setError('Please enter valid dates');
            return;
        }

        if (newStartDate > newEndDate) {
            setError('Start date cannot be after end date');
            return;
        }

        setError(null);
        setDateRange({
            startDate: newStartDate,
            endDate: newEndDate
        });

        // refresh the report with new date range
        if (activeReport) {
            generateReport(activeReport, newStartDate, newEndDate).then();
        }
    };

    // handles closing business functionality for Z-Report
    const handleCloseRegister = async () => {
        if (!zReportData) return;

        // confirm with the user before closing business
        if (window.confirm("Are you sure you want to close the business day? This will generate a Z-Report and reset the X-Report data.")) {
            try {
                setLoading(true);

                // call the API endpoint to close the business
                await apiCloseBusinessDay();

                // refresh both reports to get updated data
                const freshZReport = await fetchZReport();
                const freshXReport = await fetchXReport();

                setZReportData(freshZReport);
                setXReportData(freshXReport);
                setLoading(false);
                alert("Business day successfully closed.");
            }
            catch (err) {
                setError("Failed to close business day: " + err.message);
                setLoading(false);
            }
        }
    };

    // generate report data
    const generateReport = async (reportType, startDate = dateRange.startDate, endDate = dateRange.endDate) => {
        setActiveReport(reportType);
        setLoading(true);
        setError(null);

        try {
            switch (reportType) {
                case 'x_report':
                    try {
                        const data = await fetchXReport();
                        setXReportData(data);
                    }
                    catch (err) {
                        console.error('Failed to get X-report data:', err);
                        setError('Could not load X-report: ' + err.message);
                    }
                    break;
                case 'z_report':
                    try {
                        const data = await fetchZReport();
                        setZReportData(data);
                    }
                    catch (err) {
                        console.error('Failed to get Z-report data:', err);
                        setError('Could not load Z-report: ' + err.message);
                    }
                    break;
                case 'usage_chart':
                    try {
                        // format dates for API consistently
                        const formattedStartDate = formatDateToString(startDate);
                        const formattedEndDate = formatDateToString(endDate);

                        if (!validateDateRange(startDate, endDate)) {
                            throw new Error('Invalid date range');
                        }

                        const data = await fetchInventoryUsage(formattedStartDate, formattedEndDate);
                        setUsageData(data);
                    }
                    catch (err) {
                        console.error('Failed to get inventory usage data:', err);
                        setError('Could not load inventory usage data: ' + err.message);
                    }
                    break;
                case 'sales_report':
                    try {
                        // format dates for API consistently
                        const formattedStartDate = formatDateToString(startDate);
                        const formattedEndDate = formatDateToString(endDate);

                        if (!validateDateRange(startDate, endDate)) {
                            throw new Error('Invalid date range');
                        }

                        const data = await fetchSalesReport(formattedStartDate, formattedEndDate);
                        setSalesData(data);
                    }
                    catch (err) {
                        console.error('Failed to get sales report data:', err);
                        setError('Could not load sales data: ' + err.message);
                    }
                    break;
                default:
                    setActiveReport(null);
            }
        }
        catch (err) {
            console.error(`Error generating report: ${err.message}`);
            setError(`Error generating report: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // render the selected report view
    const renderReportContent = () => {
        if (loading) {
            return (
                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                    <CircularProgress/>
                </Box>
            );
        }

        if (error) {
            return (
                <Alert severity="error" sx={{mt: 4}}>
                    {error}
                </Alert>
            );
        }

        if (!activeReport) {
            return (
                <Alert severity="info" sx={{mt: 4}}>
                    Please select a report type from above to generate a report.
                </Alert>
            );
        }

        switch (activeReport) {
            case 'x_report':
                return renderXReport();
            case 'z_report':
                return renderZReport();
            case 'usage_chart':
                return renderUsageChart();
            case 'sales_report':
                return renderSalesReport();
            default:
                return (
                    <Typography>Report not available</Typography>
                );
        }
    };

    // X-Report view
    const renderXReport = () => {
        if (!xReportData) return null;

        return (
            <Paper sx={{p: 3, mt: 3}}>
                <Typography variant="h5" gutterBottom>X Report - Current Business Day</Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{mt: 3}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{backgroundColor: 'background.default'}}>
                                <TableCell>Hour</TableCell>
                                <TableCell align="right">Orders</TableCell>
                                <TableCell align="right">Sales Total</TableCell>
                                <TableCell align="right">Avg. Order</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {xReportData.hours && xReportData.hours.length > 0 ? (
                                xReportData.hours.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.hour}</TableCell>
                                        <TableCell align="right">{row.orderCount}</TableCell>
                                        <TableCell align="right">{row.salesTotal}</TableCell>
                                        <TableCell align="right">{row.avgSale}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No sales data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1}}>
                    <Typography variant="h6" gutterBottom>Summary</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                            <Typography variant="h5">{xReportData.totalOrders}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                            <Typography variant="h5">${xReportData.totalSales}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Average Ticket</Typography>
                            <Typography variant="h5">
                                ${(xReportData.totalOrders > 0
                                ? (parseFloat(xReportData.totalSales) / xReportData.totalOrders).toFixed(2)
                                : '0.00')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        );
    };

    // Z-Report view
    const renderZReport = () => {
        if (!zReportData) return null;

        // calculate average transaction
        const avgTransaction = zReportData.totalTransactions > 0 ?
            (parseFloat(zReportData.totalSales) / zReportData.totalTransactions).toFixed(2) :
            '0.00';

        return (
            <Paper sx={{p: 3, mt: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <Typography variant="h5" gutterBottom>Z Report - Since Last Business Closure</Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>
                    </div>
                </Box>

                <Divider sx={{my: 3}}/>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={6} sx={{display: 'flex', justifyContent: 'center'}}>
                        <Paper variant="outlined" sx={{p: 2, width: '100%', maxWidth: '500px'}}>
                            <Typography variant="h6" gutterBottom align="center">Sales Summary</Typography>
                            <Box sx={{mt: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                    <Typography>Total Sales</Typography>
                                    <Typography variant="h6">${zReportData.totalSales}</Typography>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                    <Typography>Total Transactions</Typography>
                                    <Typography variant="h6">{zReportData.totalTransactions}</Typography>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                    <Typography>Average Transaction</Typography>
                                    <Typography variant="h6">
                                        ${avgTransaction}
                                    </Typography>
                                </Box>
                                <Divider sx={{my: 2}}/>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography>Most Sold Item</Typography>
                                    <Typography sx={{textAlign: 'right', ml: 2}}>
                                        {zReportData.topItem ?
                                            `${zReportData.topItem} (${zReportData.topItemCount} orders)` :
                                            "No sales today"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{mt: 4, display: 'flex', justifyContent: 'center', gap: 2}}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCloseRegister}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Close Business Day'}
                    </Button>
                </Box>
            </Paper>
        );
    };

    // product usage chart
    const renderUsageChart = () => {
        if (!usageData) return null;

        return (
            <Paper sx={{p: 3, mt: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h5">Product Usage Chart</Typography>

                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            label="From"
                            type="date"
                            size="small"
                            InputLabelProps={{shrink: true}}
                            value={dateInputs.startDate}
                            onChange={(e) => handleDateInputChange('startDate', e.target.value)}
                        />
                        <TextField
                            label="To"
                            type="date"
                            size="small"
                            InputLabelProps={{shrink: true}}
                            value={dateInputs.endDate}
                            onChange={(e) => handleDateInputChange('endDate', e.target.value)}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDateUpdate}
                        >
                            Update
                        </Button>
                    </Box>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow sx={{backgroundColor: 'background.default'}}>
                                <TableCell>Item ID</TableCell>
                                <TableCell>Item Name</TableCell>
                                <TableCell align="right">Initial Stock</TableCell>
                                <TableCell align="right">Current Stock</TableCell>
                                <TableCell align="right">Used</TableCell>
                                <TableCell align="right">Usage %</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usageData.map((item) => (
                                <TableRow key={item.itemId || item.item_id}>
                                    <TableCell>{item.itemId || item.item_id}</TableCell>
                                    <TableCell>{item.itemName || item.item_name}</TableCell>
                                    <TableCell align="right">{item.initialStock || item.initial_stock}</TableCell>
                                    <TableCell
                                        align="right">{item.currentStock || item.amount || item.current_stock}</TableCell>
                                    <TableCell align="right">{item.used || item.total_inventory_used}</TableCell>
                                    <TableCell align="right">
                                        {item.usagePercentage || item.usage_percentage ||
                                            Math.round(((item.used || item.total_inventory_used) /
                                                (item.initialStock || item.initial_stock)) * 100)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 3}}>
                    <Typography variant="subtitle1">
                        Report
                        Period: {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
                    </Typography>
                </Box>
            </Paper>
        );
    };

    // sales report
    const renderSalesReport = () => {
        if (!salesData) return null;

        // calculate totals
        const totalQuantity = salesData.reduce((acc, item) =>
            acc + (Number(item.quantitySold || item.quantity_sold) || 0), 0);

        const totalSales = salesData.reduce((acc, item) =>
            acc + (item.totalCost || item.total_cost || 0), 0);

        return (
            <Paper sx={{p: 3, mt: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h5">Sales Report by Item</Typography>

                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            label="From"
                            type="date"
                            size="small"
                            InputLabelProps={{shrink: true}}
                            value={dateInputs.startDate}
                            onChange={(e) => handleDateInputChange('startDate', e.target.value)}
                        />
                        <TextField
                            label="To"
                            type="date"
                            size="small"
                            InputLabelProps={{shrink: true}}
                            value={dateInputs.endDate}
                            onChange={(e) => handleDateInputChange('endDate', e.target.value)}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDateUpdate}
                        >
                            Update
                        </Button>
                    </Box>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow sx={{backgroundColor: 'background.default'}}>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Product Type</TableCell>
                                <TableCell align="right">Quantity Sold</TableCell>
                                <TableCell align="right">Sales Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salesData.map((item) => {
                                const salesAmount = item.totalCost || item.total_cost || 0;
                                const quantity = item.quantitySold || item.quantity_sold || 0;
                                return (
                                    <TableRow key={item.productId || item.product_id}>
                                        <TableCell>{item.productId || item.product_id}</TableCell>
                                        <TableCell>{item.productName || item.product_name}</TableCell>
                                        <TableCell>{item.productType || item.product_type}</TableCell>
                                        <TableCell align="right">{quantity}</TableCell>
                                        <TableCell align="right">${salesAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        <TableHead>
                            <TableRow sx={{backgroundColor: 'background.default'}}>
                                <TableCell colSpan={3}>
                                    <Typography fontWeight="bold">Total</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight="bold">{totalQuantity}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight="bold">${totalSales.toFixed(2)}</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 3}}>
                    <Typography variant="subtitle1">
                        Report
                        Period: {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
                    </Typography>
                </Box>
            </Paper>
        );
    };

    return (
        <Box>
            <Box sx={{mb: 4}}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Business Reports
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Select a report type to generate detailed analytics and insights.
                </Typography>
                <Divider sx={{mt: 2}}/>
            </Box>

            <Grid container spacing={3}>
                {reportTypes.map((report) => (
                    <Grid item xs={12} sm={6} md={3} key={report.id}>
                        <Card
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            <CardActionArea
                                sx={{height: '100%'}}
                                onClick={() => generateReport(report.id)}
                            >
                                <Box sx={{p: 2, display: 'flex', alignItems: 'center'}}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: `${report.color}20`,
                                            color: report.color,
                                            mr: 2
                                        }}
                                    >
                                        {report.icon}
                                    </Box>
                                    <Typography variant="h6" component="h3">
                                        {report.title}
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">
                                        {report.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Report content area */}
            {renderReportContent()}
        </Box>
    );
};

export default ManagerReportView;