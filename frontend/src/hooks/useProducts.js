import {useState, useEffect, useCallback} from 'react';
import {fetchProducts, fetchInventory} from '../api';

const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // data fetching
    const fetchInventoryData = async () => {
        try {
            await fetchInventory();
        }
        catch (err) {
            console.error('Error fetching inventory:', err);
        }
    };

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching Kiosk products...');
            const productData = await fetchProducts();
            console.log('Kiosk products received:', productData);
            setProducts(productData);
            await fetchInventoryData();
        }
        catch (err) {
            console.error('Error loading initial data:', err);
            setError('Failed to load initial kiosk data. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    }, []); // no dependencies, runs once on mount

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]); // correct dependency for initial load

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const getFilteredProducts = () => {
        let filtered = products;

        if (activeCategory !== 'all') {
            filtered = filtered.filter(product => {
                const categoryKey = product.category_id || product.product_type;
                if (categoryKey) {
                    const normalized = categoryKey.toLowerCase().replace(/\s+/g, '_');
                    return normalized === activeCategory;
                }
                return false;
            });
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.product_name?.toLowerCase().includes(query)
            );
        }

        // sort products by product_id numerically
        filtered = filtered.sort((a, b) => a.product_id - b.product_id);

        return filtered;
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    return {
        products,
        loading,
        error,
        activeCategory,
        searchQuery,
        loadInitialData,
        handleCategoryChange,
        handleSearchChange,
        getFilteredProducts
    };
};

export default useProducts;