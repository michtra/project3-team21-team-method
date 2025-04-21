import { useState, useCallback, useEffect } from 'react';

const useCart = () => {
    const [cart, setCart] = useState([]);
    const [orderTotal, setOrderTotal] = useState({ subtotal: 0, tax: 0, total: 0 });

    const calculateTotals = useCallback(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.0825;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        setOrderTotal({ subtotal, tax, total });
    }, [cart]);

    useEffect(() => {
        calculateTotals();
    }, [cart, calculateTotals]);

    const addToCart = (customizedProduct) => {
        // generate a unique ID for the cart item
        const cartItemId = Date.now() + Math.random();

        // process allergens data
        let allergenInfo = customizedProduct.allergens;
        // if no allergens or 'None', set it to a specific "allergen-free" indicator
        if (!allergenInfo || allergenInfo === 'None') {
            allergenInfo = { type: 'allergen-free', text: 'Allergen-Free' };
        }

        const cartItem = {
            id: cartItemId,
            product_id: customizedProduct.product_id,
            name: customizedProduct.name || 'Unknown Product', // Provide default
            code: `${customizedProduct.product_id}`, // Use product ID as code
            price: customizedProduct.price || 0,
            customizations: customizedProduct.customizations || {}, // Ensure object
            quantity: 1,
            categoryColor: customizedProduct.categoryColor, // Store the category color
            allergens: allergenInfo // Store allergens with improved structure
        };

        setCart(prev => [...prev, cartItem]);
    };

    const removeFromCart = (cartItemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }
        setCart(prevCart => prevCart.map(item =>
            item.id === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        setOrderTotal({ subtotal: 0, tax: 0, total: 0 }); // Reset totals too
    };

    const getIceText = (iceValue) => {
        // ensure iceValue is treated as a number
        const numericIceValue = Number(iceValue);
        switch (numericIceValue) {
            case 0:
                return 'No Ice';
            case 0.25:
                return 'Less Ice';
            case 0.5:
                return 'Regular Ice';
            case 0.75:
                return 'Extra Ice';
            default:
                return 'Regular Ice'; // Default case
        }
    };

    return {
        cart,
        orderTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getIceText
    };
};

export default useCart;