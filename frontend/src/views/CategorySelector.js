import React from 'react';
import {Box, Chip} from '@mui/material';

function CategorySelector({categories, activeCategory, handleCategoryChange}) {
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
                        ...(category.color && activeCategory !== category.id ? {
                            color: category.color,
                            borderColor: category.color,
                        } : {})
                    }}
                />
            ))}
        </Box>
    );
}

export default CategorySelector;