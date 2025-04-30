// component for displaying individual product info and image on the menu
import React from 'react';
import {Card, CardActionArea, Box, CardContent, Typography, Chip, Fade, Tooltip} from '@mui/material';
import ProductImage from './ProductImage';
import AllergenIcon from './AllergenIcon';
import {TrendingUp as TrendingUpIcon} from '@mui/icons-material';

const ProductCard = ({product, index, handleProductClick, getCategoryColor, categories, theme}) => {
    const categoryColor = getCategoryColor(product);
    const categoryKey = product.category_id || product.product_type;
    let categoryName = "bubble tea";

    if (categoryKey) {
        const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
        const category = categories.find(cat => cat.id === normalized);
        if (category) categoryName = category.name.toLowerCase();
    }

    return (
        <Fade in={true} style={{transitionDelay: `${index * 30}ms`}}>
            <Card
                sx={{
                    height: {xs: 280, sm: 320},
                    width: '100%',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${categoryColor}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 10px 24px ${categoryColor}40`,
                        borderColor: categoryColor
                    }
                }}
            >
                <CardActionArea
                    onClick={() => handleProductClick({...product, categoryColor, allergens: product.allergens})}
                    sx={{
                        height: '100%',
                        p: {xs: 1, sm: 2},
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: {xs: 130, sm: 160},
                            position: 'relative',
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0
                        }}
                    >
                        <Box
                            sx={{
                                width: {xs: 110, sm: 140},
                                height: {xs: 110, sm: 140},
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <ProductImage
                                productId={product.product_id}
                                productName={product.product_name}
                                categoryName={categoryName}
                                height="100%"
                                style={{
                                    borderRadius: 8,
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    objectFit: 'contain',
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                            />
                        </Box>
                        <Box sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            zIndex: 2
                        }}>
                            #{product.product_id}
                        </Box>
                    </Box>

                    <CardContent
                        sx={{
                            p: 1,
                            width: '100%',
                            textAlign: 'center',
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="div"
                            className="text-sizeable"
                            sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                fontSize: {xs: '1rem', sm: '1.25rem'},
                                maxHeight: '2.5rem',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {product.product_name}
                        </Typography>

                        {/* Add allergen icon below the name - now with consistent height */}
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 0.5, mb: 1}}>
                            <AllergenIcon product={product}/>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 1,
                            width: '100%'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography 
                                    variant="h5" 
                                    className="text-sizeable"
                                    sx={{
                                        fontWeight: 700,
                                        color: categoryColor,
                                        fontSize: {xs: '1.1rem', sm: '1.5rem'}
                                    }}
                                >
                                    ${product.product_cost.toFixed(2)}
                                </Typography>
                                {product.price_increased && (
                                    <Tooltip
                                        title={`Price increased ${product.order_count}% due to popularity (${product.order_count} orders today)`}>
                                        <TrendingUpIcon
                                            fontSize="small"
                                            sx={{
                                                ml: 0.5,
                                                color: theme.palette.warning.main
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                            <Chip label="ADD" size="small" sx={{
                                borderRadius: 3,
                                bgcolor: categoryColor,
                                color: '#000',
                                fontWeight: 'bold'
                            }}/>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Fade>
    );
};

export default ProductCard;