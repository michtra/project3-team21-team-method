// MenuBoardView.js
import React, {useState, useEffect} from 'react';
import {fetchProducts} from '../api';
import ProductImage from '../components/ProductImage';
import AllergenIcon from '../components/AllergenIcon'; // Import the AllergenIcon component

import {GiPeanut} from "react-icons/gi";
import {LuMilk} from "react-icons/lu";
import {SiHoneygain} from "react-icons/si";
import {MdOutlineNoFood} from "react-icons/md";

import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper,
    useTheme,
    Tooltip
} from '@mui/material';
import {TrendingUp as TrendingUpIcon} from '@mui/icons-material';

function MenuBoardView() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    const categories = [
        {id: 'milk_tea', name: 'Milk Tea'},
        {id: 'fruit_tea', name: 'Fruit Tea'},
        {id: 'classic_tea', name: 'Classic Tea'},
    ];

    // category colors for visual distinction
    const categoryColors = {
        milk_tea: theme.palette.categories.milkTea,
        fruit_tea: theme.palette.categories.fruitTea,
        classic_tea: theme.palette.categories.classicTea
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                console.log('Fetching products for menu board...');
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
    }, []);

    const getProductsByCategory = (categoryId) => {
        let filtered = products.filter(product => {
            if (product.category_id) {
                return product.category_id === categoryId;
            }
            if (product.product_type) {
                const normalizedType = product.product_type.toLowerCase().replace(/\s+/g, '_');
                return normalizedType === categoryId;
            }
            return false;
        });

        // sort products by product_id numerically
        filtered = filtered.sort((a, b) => a.product_id - b.product_id);

        return filtered;
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

    return (
        <Box
            sx={{
                bgcolor: 'background.default',
                minHeight: '100vh',
                py: 4
            }}
        >
            <Container maxWidth="xl">
                {/* Header */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 6,
                        borderRadius: 3,
                        bgcolor: 'background.paper', // use theme background color
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        align="center"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: 1,
                            color: 'text.primary', // use theme text color
                            mb: 2,
                        }}
                    >
                        Sharetea Menu
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary" // use the theme's text.secondary color
                        align="center"
                        sx={{
                            opacity: 0.8,
                            maxWidth: 700
                        }}
                    >
                        Our premium bubble tea is made with fresh ingredients and creative flavors.
                    </Typography>

                    {/* Allergen legend */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        mt: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover' // use theme-appropriate background
                    }}>
                        <Typography variant="caption" color="text.primary">Allergens:</Typography>
                        <Tooltip title="Contains Dairy" arrow>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <LuMilk size={16} color="inherit"/>
                                <Typography variant="caption" color="text.primary">Dairy</Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Contains Nuts" arrow>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <GiPeanut size={16} color="inherit"/>
                                <Typography variant="caption" color="text.primary">Nuts</Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Contains Honey" arrow>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <SiHoneygain size={16} color="inherit"/>
                                <Typography variant="caption" color="text.primary">Honey</Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Allergen-Free" arrow>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <MdOutlineNoFood size={16} color="inherit"/>
                                <Typography variant="caption" color="text.primary">Allergen-Free</Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                </Paper>

                {/* Menu Categories */}
                <Box sx={{mb: 8}}>
                    {categories.map(category => {
                        const categoryProducts = getProductsByCategory(category.id);

                        if (categoryProducts.length === 0) {
                            return null;
                        }

                        return (
                            <Box
                                key={category.id}
                                sx={{
                                    mb: 6,
                                    position: 'relative'
                                }}
                            >
                                <Paper
                                    elevation={2}
                                    sx={{
                                        mb: 3,
                                        p: 2,
                                        pl: 4,
                                        borderRadius: 2,
                                        borderLeft: `8px solid ${
                                            theme.palette.mode === 'light' && theme.palette.primary.main === '#000000' 
                                                ? 'black' 
                                                : theme.palette.mode === 'dark' && theme.palette.primary.main === '#ffffff'
                                                    ? 'white'
                                                    : categoryColors[category.id]
                                        }`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        component="h2"
                                        sx={{
                                            fontWeight: 500,
                                            color: theme.palette.mode === 'light' && theme.palette.primary.main === '#000000' 
                                                ? 'black' 
                                                : theme.palette.mode === 'dark' && theme.palette.primary.main === '#ffffff'
                                                    ? 'white'
                                                    : categoryColors[category.id]
                                        }}
                                    >
                                        {category.name}
                                    </Typography>

                                    {/* Add category-specific allergen warning if needed */}
                                    {category.id === 'milk_tea' && (
                                        <Tooltip title="Contains Dairy" arrow>
                                            <Box sx={{display: 'flex', alignItems: 'center', color: 'warning.main'}}>
                                                <LuMilk size={20}/>
                                            </Box>
                                        </Tooltip>
                                    )}
                                </Paper>

                                <Grid container spacing={3}>
                                    {categoryProducts.map((product) => {
                                        return (
                                            <Grid item xs={12} sm={6} md={4} key={product.product_id}>
                                                <Card
                                                    elevation={2}
                                                    sx={{
                                                        display: 'flex',
                                                        height: '100%',
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                                        }
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 120,
                                                            position: 'relative',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: `${categoryColors[category.id]}15`
                                                        }}
                                                    >
                                                        <ProductImage
                                                            productId={product.product_id}
                                                            productName={product.product_name}
                                                            categoryName={category.name.toLowerCase()}
                                                            height="100%"
                                                            style={{borderRadius: 0}}
                                                        />

                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                left: 8,
                                                                bgcolor: 'rgba(0,0,0,0.6)',
                                                                color: 'white',
                                                                px: 1,
                                                                py: 0.3,
                                                                borderRadius: 1,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                zIndex: 2
                                                            }}
                                                        >
                                                            {product.product_id}
                                                        </Box>
                                                    </Box>
                                                    <CardContent
                                                        sx={{
                                                            flexGrow: 1,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            p: 2
                                                        }}
                                                    >
                                                        <Typography variant="h6" component="h3" gutterBottom>
                                                            {product.product_name}
                                                        </Typography>
                                                        <Typography variant="h5" component="div" color="primary"
                                                                    sx={{fontWeight: 600}}>
                                                            ${product.product_cost.toFixed(2)}
                                                            {product.price_increased && (
                                                                <Tooltip
                                                                    title={`Price increased due to popularity today (${product.order_count} orders)`}>
                                                                    <TrendingUpIcon
                                                                        fontSize="small"
                                                                        sx={{
                                                                            ml: 0.5,
                                                                            color: theme.palette.warning.main,
                                                                            verticalAlign: 'middle'
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                        </Typography>
                                                        {/* Use the AllergenIcon component instead of renderAllergenIcons */}
                                                        <Box
                                                            sx={{mt: 1, display: 'flex', justifyContent: 'flex-start'}}>
                                                            <AllergenIcon product={product}/>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        mt: 6,
                        pt: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Prices and menu items subject to change. Please inform your server of any food allergies.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default MenuBoardView;