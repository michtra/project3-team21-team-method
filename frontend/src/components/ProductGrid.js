import React from 'react';
import {Grid, Card, CardActionArea, CardContent, Typography, Box, useTheme} from '@mui/material';

function ProductGrid({products, handleProductClick, categories}) {
    const theme = useTheme();

    // function to get category color based on product type
    const getCategoryColor = (product) => {
        const categoryKey = product.category_id || product.product_type;
        if (categoryKey) {
            const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
            const category = categories.find(cat => cat.id === normalized);
            return category ? category.color : theme.palette.primary.main;
        }
        return theme.palette.primary.main;
    };

    return (
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
                {products.length > 0 ? (
                    products.map(product => {
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
                                            <Typography variant="h5" sx={{fontWeight: 600, color: categoryColor}}>
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
    );
}

export default ProductGrid;