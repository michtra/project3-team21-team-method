// component that displays filterable product categories as clickable chips
import React from 'react';
import {Box, Chip, Fade} from '@mui/material';

const CategorySelector = ({categories, activeCategory, handleCategoryChange, theme}) => {
    // check if we're using high contrast theme by checking theme primary color
    const isHighContrastLight = theme?.palette?.mode === 'light' && theme?.palette?.primary?.main === '#000000';
    const isHighContrastDark = theme?.palette?.mode === 'dark' && theme?.palette?.primary?.main === '#ffffff';
    const isHighContrast = isHighContrastLight || isHighContrastDark;

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
                            ...(!isHighContrast && category.color && activeCategory !== category.id ? {
                                color: category.color,
                                borderColor: category.color
                            } : {}),
                            ...(isHighContrastLight && activeCategory !== category.id ? {
                                color: 'black',
                                borderColor: 'black'
                            } : {}),
                            ...(isHighContrastDark && activeCategory !== category.id ? {
                                color: 'white',
                                borderColor: 'white'
                            } : {})
                        }}
                    />
                </Fade>
            ))}
        </Box>
    );
};

export default CategorySelector;