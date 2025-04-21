import React, {useState, useEffect} from 'react';
import {fetchInventory, createInventory, updateInventory} from '../api';
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
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    AddCircle as IncrementIcon
} from '@mui/icons-material';

const ManagerInventoryView = () => {
    const [inventory, setInventory] = useState([]);
    const [formData, setFormData] = useState({name: '', quantity: 0});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadInventory = () => {
        setLoading(true);
        if (!isModalOpen) setError(null);
        fetchInventory()
            .then(data => {
                if (Array.isArray(data)) setInventory(data);
                else {
                    setError("Invalid data format received.");
                    setInventory([]);
                }
            })
            .catch(err => {
                setError(`Failed to load inventory: ${err.message}`);
                setInventory([]);
            })
            .finally(() => setLoading(false));
    };

    // initial load
    useEffect(() => {
        loadInventory();
        // eslint-disable-next-line
    }, []);

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditingItemId(null);
        setFormData({name: '', quantity: 0});
        setError(null);
        setIsModalOpen(true);
    };

    const handleStartEdit = (item) => {
        setIsEditing(true);
        setEditingItemId(item.item_id);
        setFormData({name: item.item_name, quantity: item.amount});
        setError(null);
        setIsModalOpen(true);
    };

    const closeModalAndReset = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setIsEditing(false);
            setEditingItemId(null);
            setFormData({name: '', quantity: 0});
            setError(null);
        }, 300);
    };

    // form submission (inside Modal)
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const currentQuantity = Number(formData.quantity);
        if (isNaN(currentQuantity) || currentQuantity < 0) {
            setError("Quantity must be a non-negative number.");
            return;
        }

        const currentName = formData.name.trim();
        if (!currentName) {
            setError("Item Name cannot be empty.");
            return;
        }

        const payload = {item_name: currentName, amount: currentQuantity};

        const apiCall = isEditing ? updateInventory(editingItemId, payload) : createInventory(payload);
        apiCall
            .then(result => {
                if (result && typeof result === 'object') {
                    loadInventory();
                    closeModalAndReset();
                }
                else {
                    setError(isEditing ? "Update failed: Invalid response." : "Add failed: Invalid response.");
                }
            })
            .catch(err => {
                setError(`Failed to ${isEditing ? 'update' : 'add'} item: ${err.message || 'Unknown error'}`);
            });
    };

    // increment button action
    const handleIncrement = (itemId, currentItemName, currentAmount) => {
        setError(null);
        const payload = {item_name: currentItemName, amount: Number(currentAmount) + 1};
        updateInventory(itemId, payload)
            .then(updatedItem => {
                if (updatedItem?.item_id) {
                    setInventory(prev => prev.map(item => (item.item_id === itemId ? updatedItem : item)));
                }
                else {
                    setError("Increment failed: Invalid response.");
                }
            })
            .catch(err => {
                setError(`Failed to increment item ${currentItemName}: ${err.message}`);
            });
    };

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h5" component="h2">
                    Inventory Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={handleOpenAddModal}
                >
                    Add New Item
                </Button>
            </Box>

            {loading && (
                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                    <CircularProgress/>
                </Box>
            )}

            {error && !isModalOpen && (
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            )}

            {!loading && (
                <TableContainer component={Paper} sx={{mb: 4, borderRadius: 2}}>
                    <Table>
                        <TableHead sx={{bgcolor: 'primary.dark'}}>
                            <TableRow>
                                <TableCell sx={{color: 'primary.contrastText'}}>Name</TableCell>
                                <TableCell align="right" sx={{color: 'primary.contrastText'}}>Quantity</TableCell>
                                <TableCell align="center" sx={{color: 'primary.contrastText'}}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{py: 3}}>
                                        No inventory items found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inventory.map(item => (
                                    <TableRow key={item.item_id} hover>
                                        <TableCell>{item.item_name}</TableCell>
                                        <TableCell align="right">{item.amount}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{display: 'flex', justifyContent: 'center', gap: 1}}>
                                                <Tooltip title="Increment quantity">
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleIncrement(item.item_id, item.item_name, item.amount)}
                                                        size="small"
                                                    >
                                                        <IncrementIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit item">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleStartEdit(item)}
                                                        size="small"
                                                    >
                                                        <EditIcon/>
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
                    {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </DialogTitle>

                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <DialogContentText sx={{mb: 3}}>
                        {isEditing
                            ? 'Update the information for this inventory item.'
                            : 'Enter the details for the new inventory item.'}
                    </DialogContentText>

                    <Box component="form" id="modalInventoryForm" onSubmit={handleSubmit} sx={{mt: 1}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Item Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            variant="outlined"
                            required
                            sx={{mb: 3}}
                        />

                        <TextField
                            margin="dense"
                            label="Quantity"
                            type="number"
                            fullWidth
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            variant="outlined"
                            required
                            InputProps={{inputProps: {min: 0}}}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button onClick={closeModalAndReset} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="modalInventoryForm"
                        variant="contained"
                        color="primary"
                    >
                        {isEditing ? 'Save Changes' : 'Add Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagerInventoryView;