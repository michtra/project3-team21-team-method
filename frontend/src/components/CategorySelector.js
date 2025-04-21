import React from 'react';
import {Box, Chip, Fade} from '@mui/material';

const CategorySelector = ({categories, activeCategory, handleCategoryChange, theme}) => {
    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flexShrink: 0}}>
            {categories.map((category, index) => (
                <Fade in={true} key={category.id} style={{transitionDelay: `${index * 50}ms`}}>
                    <Chip
                        label={category.name}
                        onClick={() => handleCategoryChange(category.id)}
                        color={activeCategory === category.id ? 'secondary' : 'default'}
                        variant={activeCategory === category.id ? 'filled' : 'outlined'}
                        sx={{
                            borderRadius: 6,
                            px: 2,
                            py: {xs: 1.5, sm: 3},
                            fontSize: {xs: '0.8rem', sm: '1rem'},
                            fontWeight: activeCategory === category.id ? 600 : 400,
                            ...(category.color && activeCategory !== category.id ? {
                                color: category.color,
                                borderColor: category.color
                            } : {})
                        }}
                    />
                </Fade>
            ))}
        </Box>
    );
};

export default CategorySelector;