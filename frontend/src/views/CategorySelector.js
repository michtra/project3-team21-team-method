import React from 'react';
import {Box, Chip} from '@mui/material';

function CategorySelector({categories, activeCategory, handleCategoryChange, theme}) {
    // check if we're using high contrast theme by checking theme primary color
    const isHighContrastLight = theme?.palette?.mode === 'light' && theme?.palette?.primary?.main === '#000000';
    const isHighContrastDark = theme?.palette?.mode === 'dark' && theme?.palette?.primary?.main === '#ffffff';
    const isHighContrast = isHighContrastLight || isHighContrastDark;

    return (
        <Box sx={{display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap'}}>
            {categories.map(category => (
                <Chip
                    key={category.id}
                    label={category.name}
                    icon={category.icon}
                    onClick={() => handleCategoryChange(category.id)}
                    color={activeCategory === category.id ? 'primary' : 'default'}
                    variant={activeCategory === category.id ? 'filled' : 'outlined'}
                    sx={{
                        borderRadius: 2,
                        py: 2.5,
                        ...(!isHighContrast && category.color && activeCategory !== category.id ? {
                            color: category.color,
                            borderColor: category.color,
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
            ))}
        </Box>
    );
}

export default CategorySelector;