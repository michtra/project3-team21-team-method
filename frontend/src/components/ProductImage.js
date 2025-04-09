// ProductImage.js
import React, {useState} from 'react';
import {Box} from '@mui/material';

/**
 * A component that handles product image loading with proper fallback
 * This prevents stuttering/flickering of alt text by managing image state
 */
const ProductImage = ({
                          productId,
                          productName,
                          categoryName = "bubble tea",
                          width = "100%",
                          height = "100%",
                          style = {}
                      }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [useFallback, setUseFallback] = useState(false);

    // alt text for accessibility
    const altText = `${productName} - a ${categoryName} beverage`;

    // primary image path
    const imagePath = `/images/${productId}.jpg`;

    // fallback placeholder
    const fallbackPath = `/api/placeholder/200/200?text=${productId}`;

    const handleImageError = () => {
        // only switch to fallback if we haven't already
        if (!useFallback) {
            setUseFallback(true);
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width,
                height,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                ...style
            }}
        >
            <img
                src={useFallback ? fallbackPath : imagePath}
                alt={altText}
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: imageLoaded ? 1 : 0, // only show when loaded
                    transition: 'opacity 0.2s'
                }}
            />

            {/* Show loading state if neither primary nor fallback has loaded */}
            {!imageLoaded && (
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.05)'
                    }}
                >
                    {productId}
                </Box>
            )}
        </Box>
    );
};

export default ProductImage;