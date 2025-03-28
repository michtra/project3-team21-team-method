// api.js: frontend API

// use the correct API based on local testing or VPS hosting
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

// Headers with API key
const getHeaders = () => {
    return {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
    };
};

export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const fetchProductDetails = async (productId) => {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching product details:", error);
        throw error;
    }
};

export const createTransaction = async (transactionData) => {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
};
