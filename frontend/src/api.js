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
    }
    catch (error) {
        console.error("Error fetching products:", error);
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
    }
    catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
};

export const fetchTransactions = async () => {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    }
    catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

export const fetchInventory = async () => {
    try {
        const response = await fetch(`${API_URL}/inventory`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            // error handling
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        throw error; // re-throw to be caught by the component
    }
};

export const createInventory = async (inventoryData) => {
    try {
        const response = await fetch(`${API_URL}/inventory`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(inventoryData), // sends the payload as received
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error creating inventory:', error);
        throw error;
    }
};

export const updateInventory = async (id, inventoryData) => {
    try {
        const response = await fetch(`${API_URL}/inventory/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(inventoryData), // sends the payload as received
        });
        if (!response.ok) {
            let errorBody = null;
            try {
                errorBody = await response.json();
            }
            catch (e) { /* ignore parsing error */
            }
            const errorMessage = errorBody?.error || `Network response was not ok: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error updating inventory:', error);
        throw error;
    }
};

export const fetchXReport = async () => {
    try {
        const response = await fetch(`${API_URL}/reports/x-report`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch X-report');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error fetching X-report:', error);
        throw error;
    }
};

export const fetchZReport = async () => {
    try {
        const response = await fetch(`${API_URL}/reports/z-report`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Z-report');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error fetching Z-report:', error);
        throw error;
    }
};

export const fetchInventoryUsage = async (startDate, endDate) => {
    try {
        const response = await fetch(`${API_URL}/reports/inventory-usage?startDate=${startDate}&endDate=${endDate}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch inventory usage data');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error fetching inventory usage data:', error);
        throw error;
    }
};

export const fetchSalesReport = async (startDate, endDate) => {
    try {
        const response = await fetch(`${API_URL}/reports/sales?startDate=${startDate}&endDate=${endDate}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch sales report data');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error fetching sales report data:', error);
        throw error;
    }
};