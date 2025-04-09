// theme.js - Custom Material UI theme configuration
import {createTheme} from '@mui/material/styles';

// Create a dark theme with teal and amber accents
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#009688', // teal
            light: '#4db6ac',
            dark: '#00796b',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ff9800', // amber
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: '#000000',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        error: {
            main: '#f44336',
        },
        warning: {
            main: '#ff9800',
        },
        info: {
            main: '#2196f3',
        },
        success: {
            main: '#4caf50',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        // custom colors for specific product categories
        categories: {
            milkTea: '#e0ba6e',
            fruitTea: '#4caf50',
            classicTea: '#1793d1',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 300,
            fontSize: '3rem',
        },
        h2: {
            fontWeight: 400,
            fontSize: '2.5rem',
        },
        h3: {
            fontWeight: 500,
            fontSize: '2rem',
        },
        h4: {
            fontWeight: 500,
            fontSize: '1.75rem',
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.5rem',
        },
        h6: {
            fontWeight: 500,
            fontSize: '1.25rem',
        },
        button: {
            textTransform: 'none', // disable automatic uppercase
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                containedPrimary: {
                    boxShadow: '0 4px 10px rgba(0, 150, 136, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(0, 150, 136, 0.35)',
                    },
                },
                containedSecondary: {
                    boxShadow: '0 4px 10px rgba(255, 152, 0, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(255, 152, 0, 0.35)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

export default theme;