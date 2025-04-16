// theme.js - Custom Material UI theme configuration
import {createTheme} from '@mui/material/styles';

// Create a dark theme with blue accents
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2196f3', // bright blue
            light: '#90caf9',
            dark: '#0d47a1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#42a5f5', // lighter blue for better visibility
            light: '#80d6ff',
            dark: '#0077c2',
            contrastText: '#000000',
        },
        background: {
            default: '#000014', // very dark blue-black (close to 0,0,20)
            paper: '#101024', // slightly lighter for better contrast with elements
        },
        error: {
            main: '#f44336',
        },
        warning: {
            main: '#ff9800',
        },
        info: {
            main: '#29b6f6',
        },
        success: {
            main: '#4caf50',
        },
        text: {
            primary: '#ffffff', // white for primary text for maximum contrast
            secondary: '#bbdefb', // very light blue for secondary text
            disabled: 'rgba(255, 255, 255, 0.5)', // semi-transparent white for disabled text
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
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(33, 150, 243, 0.35)',
                    },
                },
                containedSecondary: {
                    boxShadow: '0 4px 10px rgba(13, 71, 161, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(13, 71, 161, 0.35)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
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