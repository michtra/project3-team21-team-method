// custom hook for managing product data, filtering and categorization
import {useState, useEffect, useCallback} from 'react';
import {fetchProducts, fetchInventory} from '../api';

const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // helper function to fetch inventory data
    const fetchInventoryData = async () => {
        try {
            await fetchInventory();
        }
        catch (err) {
            console.error('Error fetching inventory:', err);
            // we don't set error state here as this is secondary data
        }
    };

    // loads product data when component mounts or when manually triggered
    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching Kiosk products...');
            const productData = await fetchProducts();
            console.log('Kiosk products received:', productData);
            setProducts(productData);
            await fetchInventoryData(); // also fetch inventory as secondary data
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

    // updates the currently selected product category
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    // returns products filtered by current category and search query
    const getFilteredProducts = () => {
        let filtered = products;

        // filter by category if not showing all
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

        // filter by search term if one exists
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.product_name?.toLowerCase().includes(query)
            );
        }

        // sort products by product_id numerically for consistent display
        filtered = filtered.sort((a, b) => a.product_id - b.product_id);

        return filtered;
    };

    // updates the search query for filtering products
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