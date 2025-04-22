import React from 'react';
import {Box, Paper, InputBase, IconButton, Grid, Typography} from '@mui/material';
import {Search as SearchIcon} from '@mui/icons-material';
import CategorySelector from './CategorySelector';
import ProductCard from './ProductCard';

const ProductSection = ({
                            searchQuery,
                            handleSearchChange,
                            categories,
                            activeCategory,
                            handleCategoryChange,
                            filteredProducts,
                            handleProductClick,
                            getCategoryColor,
                            theme
                        }) => {
    return (
        <Box
            sx={{
                width: {xs: '100%', md: '65%'},
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: {xs: 1, sm: 2, md: 3},
                overflow: 'hidden'
            }}
        >
            {/* Search bar */}
            <Paper
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{
                    p: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    flexShrink: 0
                }}
            >
                <IconButton sx={{p: '10px'}} aria-label="search" className="text-sizeable">
                    <SearchIcon/>
                </IconButton>
                <InputBase
                    className="text-sizeable"
                    sx={{ml: 1, flex: 1}}
                    placeholder="Search for a drink..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </Paper>

            {/* Category selector */}
            <CategorySelector
                categories={categories}
                activeCategory={activeCategory}
                handleCategoryChange={handleCategoryChange}
                theme={theme}
            />

            {/* Products grid - Make this scrollable */}
            <Box
                sx={{
                    overflowY: 'auto',
                    pr: 2,
                    flexGrow: 1,
                    '&::-webkit-scrollbar': {width: '8px'},
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-track': {backgroundColor: 'rgba(0,0,0,0.1)'}
                }}
            >
                <Grid container spacing={{xs: 1, sm: 2, md: 3}}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <Grid item xs={6} sm={6} md={4} key={product.product_id}>
                                <ProductCard
                                    product={product}
                                    index={index}
                                    handleProductClick={handleProductClick}
                                    getCategoryColor={getCategoryColor}
                                    categories={categories}
                                    theme={theme}
                                />
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{width: '100%', textAlign: 'center', mt: 4, p: 3}}>
                            <Typography variant="h6" color="text.secondary">
                                No products found matching your criteria.
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default ProductSection;