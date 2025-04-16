// MenuBoardView.js
import React, {useState, useEffect} from 'react';
import {fetchProducts} from '../api';
import ProductImage from '../components/ProductImage';
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
    useTheme
} from '@mui/material';

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
                        bgcolor: 'background.paper',
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
                            color: 'white',
                            mb: 2,
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                    >
                        Sharetea Menu
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        align="center"
                        sx={{
                            opacity: 0.8,
                            color: 'white',
                            maxWidth: 700
                        }}
                    >
                        Our premium bubble tea is made with fresh ingredients and creative flavors.
                    </Typography>
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
                                        borderLeft: `8px solid ${categoryColors[category.id]}`,
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
                                            color: categoryColors[category.id]
                                        }}
                                    >
                                        {category.name}
                                    </Typography>
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
                                                        </Typography>
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