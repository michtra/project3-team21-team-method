// ManagerProductView.js
import React, {useState, useEffect} from 'react';
import {fetchProducts, createProduct, updateProduct, deleteProduct} from '../api';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Tooltip,
    InputAdornment,
    MenuItem,
    DialogContentText as MuiDialogContentText
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import {TrendingUp as TrendingUpIcon} from '@mui/icons-material';

const ManagerProductView = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({name: '', cost: '', type: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // new state for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // predefined product categories for dropdown
    const productCategories = [
        'Milk Tea',
        'Fruit Tea',
        'Classic Tea'
    ];

    const loadProducts = () => {
        setLoading(true);
        if (!isModalOpen && !deleteDialogOpen) setError(null);
        fetchProducts()
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
                else {
                    setError("Invalid data format received.");
                    setProducts([]);
                }
            })
            .catch(err => {
                setError(`Failed to load products: ${err.message}`);
                setProducts([]);
            })
            .finally(() => setLoading(false));
    };

    // initial load
    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line
    }, []);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    // modal open/close/edit handlers
    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditingProductId(null);
        setFormData({name: '', cost: '', type: ''});
        setError(null);
        setIsModalOpen(true);
    };

    const handleStartEdit = (product) => {
        setIsEditing(true);
        setEditingProductId(product.product_id);
        setFormData({
            name: product.product_name,
            cost: product.product_cost.toString(),
            type: product.product_type
        });
        setError(null);
        setIsModalOpen(true);
    };

    // handle starting the delete process
    const handleStartDelete = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    // handle the actual deletion
    const handleConfirmDelete = () => {
        if (!productToDelete) return;

        deleteProduct(productToDelete.product_id)
            .then(() => {
                loadProducts();
                setDeleteDialogOpen(false);
                setProductToDelete(null);
            })
            .catch(err => {
                setError(`Failed to delete product: ${err.message || 'Unknown error'}`);
            });
    };

    const closeModalAndReset = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setIsEditing(false);
            setEditingProductId(null);
            setFormData({name: '', cost: '', type: ''});
            setError(null);
        }, 300);
    };

    // form submission (inside Modal)
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const currentCost = parseFloat(formData.cost);
        if (isNaN(currentCost) || currentCost < 0) {
            setError("Cost must be a valid non-negative number.");
            return;
        }

        const currentName = formData.name.trim();
        const currentType = formData.type.trim();
        if (!currentName || !currentType) {
            setError("Product Name and Type cannot be empty.");
            return;
        }

        const payload = {
            product_name: currentName,
            product_cost: currentCost,
            product_type: currentType
        };

        const apiCall = isEditing ? updateProduct(editingProductId, payload) : createProduct(payload);
        apiCall
            .then(result => {
                if (result && typeof result === 'object') {
                    loadProducts();
                    closeModalAndReset();
                }
                else {
                    setError(isEditing ? "Update failed: Invalid response." : "Add failed: Invalid response.");
                }
            })
            .catch(err => {
                setError(`Failed to ${isEditing ? 'update' : 'add'} product: ${err.message || 'Unknown error'}`);
            });
    };

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h5" component="h2">
                    Product Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={handleOpenAddModal}
                >
                    Add New Product
                </Button>
            </Box>

            {loading && (
                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                    <CircularProgress/>
                </Box>
            )}

            {error && !isModalOpen && !deleteDialogOpen && (
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            )}

            {!loading && (
                <TableContainer component={Paper} sx={{mb: 4, borderRadius: 2}}>
                    <Table>
                        <TableHead sx={{bgcolor: 'primary.dark'}}>
                            <TableRow>
                                <TableCell sx={{color: 'common.white'}}>Name</TableCell>
                                <TableCell align="right" sx={{color: 'common.white'}}>Cost</TableCell>
                                <TableCell sx={{color: 'common.white'}}>Type</TableCell>
                                <TableCell align="center" sx={{color: 'common.white'}}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{py: 3}}>
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map(product => (
                                    <TableRow key={product.product_id} hover>
                                        <TableCell>{product.product_name}</TableCell>
                                        <TableCell align="right">
                                            {product.price_increased ? (
                                                <Tooltip
                                                    title={`Base price: $${product.base_cost.toFixed(2)} + ${(product.order_count)}% (${product.order_count} orders today)`}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <Typography
                                                            component="span">${product.product_cost.toFixed(2)}</Typography>
                                                        <TrendingUpIcon fontSize="small"
                                                                        sx={{ml: 0.5, color: 'warning.main'}}/>
                                                    </Box>
                                                </Tooltip>
                                            ) : (
                                                `$${product.product_cost.toFixed(2)}`
                                            )}
                                        </TableCell>
                                        <TableCell>{product.product_type}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                                <Tooltip title="Edit product">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleStartEdit(product)}
                                                        size="small"
                                                        sx={{mr: 1}}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete product">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleStartDelete(product)}
                                                        size="small"
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal Dialog */}
            <Dialog
                open={isModalOpen}
                onClose={closeModalAndReset}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>

                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <DialogContentText sx={{mb: 3}}>
                        {isEditing
                            ? 'Update the information for this product.'
                            : 'Enter the details for the new product.'}
                    </DialogContentText>

                    <Box component="form" id="modalProductForm" onSubmit={handleSubmit} sx={{mt: 1}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Product Name"
                            name="name"
                            fullWidth
                            value={formData.name}
                            onChange={handleInputChange}
                            variant="outlined"
                            required
                            sx={{mb: 3}}
                        />

                        <TextField
                            margin="dense"
                            label="Cost"
                            name="cost"
                            type="number"
                            fullWidth
                            value={formData.cost}
                            onChange={handleInputChange}
                            variant="outlined"
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                inputProps: {min: 0, step: 0.01}
                            }}
                            sx={{mb: 3}}
                        />

                        <TextField
                            select
                            margin="dense"
                            label="Product Type"
                            name="type"
                            fullWidth
                            value={formData.type}
                            onChange={handleInputChange}
                            variant="outlined"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CategoryIcon/>
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {productCategories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>

                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button onClick={closeModalAndReset} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="modalProductForm"
                        variant="contained"
                        color="primary"
                    >
                        {isEditing ? 'Save Changes' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <MuiDialogContentText>
                        Are you sure you want to delete the product
                        <strong>{productToDelete ? ` "${productToDelete.product_name}"` : ''}?</strong>
                        This action cannot be undone.
                    </MuiDialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerProductView;