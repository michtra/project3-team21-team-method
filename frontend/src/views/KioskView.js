// main view for customer-facing kiosk allowing product browsing and ordering
import React, {useState, useCallback, useMemo} from 'react';
import {Box, CircularProgress, Typography, Alert, Button, Container, Snackbar, useTheme} from '@mui/material';

// custom hooks for managing products, cart, payment and weather data
import useProducts from '../hooks/useProducts';
import useCart from '../hooks/useCart';
import useTransaction from '../hooks/useTransaction';
import useWeather from '../hooks/useWeather';

// ui components for different sections of the kiosk interface
import KioskHeader from '../components/KioskHeader';
import ProductSection from '../components/ProductSection';
import CartSection from '../components/CartSection';
import DrinkCustomizationModal from '../components/DrinkCustomizationModal';
import WeatherModal from '../components/WeatherModal';
import OrderConfirmationDialog from '../components/OrderConfirmationDialog';

function KioskView() {
    const theme = useTheme();
    const [showAllergenInfo, setShowAllergenInfo] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // define product categories with their display names and colors
    const categories = useMemo(() => [
        {id: 'all', name: 'All Drinks', color: theme.palette.primary.main},
        {id: 'milk_tea', name: 'Milk Tea', color: theme.palette.categories?.milkTea || '#e0ba6e'},
        {id: 'fruit_tea', name: 'Fruit Tea', color: theme.palette.categories?.fruitTea || '#4caf50'},
        {id: 'classic_tea', name: 'Classic Tea', color: theme.palette.categories?.classicTea || '#1793d1'},
    ], [theme.palette.primary.main, theme.palette.categories]);

    // initialize custom hooks
    const {
        loading,
        error,
        activeCategory,
        searchQuery,
        loadInitialData,
        handleCategoryChange,
        handleSearchChange,
        getFilteredProducts
    } = useProducts();

    const {
        cart,
        orderTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getIceText
    } = useCart();

    const {
        processingPayment,
        paymentSuccess,
        paymentError,
        showConfirmation,
        currentOrder,
        processPayment,
        handleConfirmationClose,
        setPaymentSuccess
    } = useTransaction(cart, orderTotal, clearCart);

    const {
        weatherCity,
        weatherData,
        weatherLoading,
        weatherError,
        showWeatherModal,
        handleOpenWeatherModal,
        handleCloseWeatherModal
    } = useWeather();

    // opens customization modal when a product is clicked
    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    // closes the customization modal
    const closePopup = () => {
        setSelectedProduct(null);
    };

    // determines the color to use for a product based on its category
    const getCategoryColor = useCallback((product) => {
        const categoryKey = product.category_id || product.product_type;
        if (categoryKey) {
            const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
            const category = categories.find(cat => cat.id === normalized);
            return category ? category.color : theme.palette.secondary.main;
        }
        return theme.palette.secondary.main; // fallback color
    }, [categories, theme.palette.secondary.main]);

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
                <CircularProgress size={60} thickness={4} color="primary"/>
                <Typography variant="h6" color="text.secondary">Loading menu...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{mt: 4, textAlign: 'center'}}>
                <Alert severity="error"
                       sx={{mt: 4, display: 'inline-flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Typography variant="h6">Error Loading Kiosk</Typography>
                    <Typography sx={{mt: 1}}>{error}</Typography>
                    <Button variant="contained" color="primary" onClick={loadInitialData} sx={{mt: 2}}>
                        Retry
                    </Button>
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
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <KioskHeader
                theme={theme}
                showAllergenInfo={showAllergenInfo}
                setShowAllergenInfo={setShowAllergenInfo}
                handleOpenWeatherModal={handleOpenWeatherModal}
                weatherCity={weatherCity}
            />

            <Box 
                sx={{
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    flexGrow: 1, 
                    overflow: 'hidden'
                }}
            >
                {/* Left side - Products catalog */}
                <ProductSection
                    searchQuery={searchQuery}
                    handleSearchChange={handleSearchChange}
                    categories={categories}
                    activeCategory={activeCategory}
                    handleCategoryChange={handleCategoryChange}
                    filteredProducts={filteredProducts}
                    handleProductClick={handleProductClick}
                    getCategoryColor={getCategoryColor}
                    theme={theme}
                />

                {/* Right side - Order summary */}
                <CartSection
                    cart={cart}
                    orderTotal={orderTotal}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    getIceText={getIceText}
                    theme={theme}
                    processingPayment={processingPayment}
                    paymentError={paymentError}
                    processPayment={processPayment}
                    clearCart={clearCart}
                />
            </Box>

            {/* Customization Modal */}
            {selectedProduct && (
                <DrinkCustomizationModal
                    product={selectedProduct}
                    onClose={closePopup}
                    onConfirm={(customizedProduct) => {
                        addToCart({
                            ...customizedProduct,
                            categoryColor: getCategoryColor(selectedProduct)
                        });
                        closePopup();
                    }}
                />
            )}

            {/* Order Confirmation Dialog */}
            <OrderConfirmationDialog
                showConfirmation={showConfirmation}
                handleConfirmationClose={handleConfirmationClose}
                currentOrder={currentOrder}
                theme={theme}
            />

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
                autoHideDuration={4000}
                onClose={() => setPaymentSuccess(false)}
                message="Payment processed successfully!"
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                sx={{'& .MuiSnackbarContent-root': {backgroundColor: 'success.main'}}}
            />
        </Box>
    );
}

export default KioskView;