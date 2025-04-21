// App.js (Modified with Accessibility Integration)
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActionArea,
} from '@mui/material';
import {
    LocalCafe as CoffeeIcon,
    MenuBook as MenuIcon,
    SupervisorAccount as ManagerIcon,
    ShoppingCart as CartIcon,
    ArrowBack as BackIcon,
    Logout as LogoutIcon,
    LockOutlined as LockIcon
} from '@mui/icons-material';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import KioskView from './views/KioskView';
import ManagerView from './views/ManagerView';
import CashierView from './views/CashierViews';
import MenuBoardView from './views/MenuBoardView';
import OAuthCallback from './OAuthCallback';
import { getAuthUrl, logout, getUserFromStorage } from './authService';
import AccessibilityWidget from './components/AccessibilityWidget';

import './index.css';
import './TranslationStyles.css'; // Add this line to import translation styles

function App() {
    const [currentView, setCurrentView] = useState('main');
    const [user, setUser] = useState(null);
    const [currentTheme, setCurrentTheme] = useState(theme);

    // Handle theme changes from accessibility widget
    // Wrap in useCallback to prevent unnecessary re-renders
    const handleThemeChange = useCallback((newTheme) => {
        setCurrentTheme(newTheme);
    }, []);

    // check for login on initial load
    useEffect(() => {
        const storedUser = getUserFromStorage();
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // use a listener to detect when localStorage/sessionStorage changes
    useEffect(() => {
        function handleStorageChange() {
            const storedUser = getUserFromStorage();
            if (storedUser && !user) {
                setUser(storedUser);
            }
        }

        window.addEventListener('storage', handleStorageChange);

        // interval to check for changes (backup)
        const checkInterval = setInterval(handleStorageChange, 0);

        // cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(checkInterval);
        };
    }, [user]);

    const handleLogin = () => {
        // redirect to Google OAuth login
        window.location.href = getAuthUrl();
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setCurrentView('main');
    };

    // navigation card data for main menu
    const navigationCards = [
        {
            id: 'kiosk',
            title: 'Customer Kiosk',
            icon: <CoffeeIcon fontSize="large"/>,
            color: theme.palette.primary.main,
            description: 'Self-service ordering for customers',
            requiresAuth: false
        },
        {
            id: 'menuBoard',
            title: 'Menu Board',
            icon: <MenuIcon fontSize="large"/>,
            color: theme.palette.secondary.light,
            description: 'Digital menu display for screens',
            requiresAuth: false
        },
        {
            id: 'manager',
            title: 'Manager Dashboard',
            icon: <ManagerIcon fontSize="large"/>,
            color: theme.palette.warning.main,
            description: 'Sales reports and system management (Login required)',
            requiresAuth: true
        },
        {
            id: 'cashier',
            title: 'Cashier System',
            icon: <CartIcon fontSize="large"/>,
            color: theme.palette.success.main,
            description: 'Process orders and payments (Login required)',
            requiresAuth: true
        }
    ];

    const renderMainMenu = () => (
        <Container maxWidth="lg"
                   sx={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Box sx={{width: '100%', textAlign: 'center'}}>
                {/* Header with logo and title */}
                <Box
                    sx={{
                        mb: 6,
                        mx: 'auto',
                        maxWidth: 'md'
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 2
                        }}
                    >
                        Method POS System
                    </Typography>

                    {user && (
                        <Box sx={{
                            mb: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography variant="body1">
                                Welcome, {user.name}.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<LogoutIcon/>}
                                onClick={handleLogout}
                                size="small"
                                sx={{mt: 2}}
                            >
                                Logout
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Menu cards grid - Modified to 2x2 layout */}
                <Grid
                    container
                    spacing={4}
                    justifyContent="center"
                    sx={{
                        maxWidth: 800,
                        mx: 'auto',
                        px: 2
                    }}
                >
                    {navigationCards.map((card) => (
                        <Grid item key={card.id} xs={12} sm={6} md={6} lg={6} sx={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Box sx={{
                                width: 300,
                                height: 300,
                                position: 'relative'
                            }}>
                                <Card
                                    elevation={4}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: 300,
                                        height: 300,
                                        borderRadius: 3,
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: 8
                                        }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => {
                                            if ((card.id === 'manager' || card.id === 'cashier') && !user) {
                                                // Redirect to login if trying to access protected views without auth
                                                handleLogin();
                                            } else {
                                                setCurrentView(card.id);
                                            }
                                        }}
                                        sx={{
                                            height: '100%',
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 3
                                        }}
                                    >
                                        {/* Icon circle */}
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: `${card.color}20`,
                                                color: card.color,
                                                mb: 3,
                                                transition: 'all 0.3s',
                                                '& svg': {fontSize: 50},
                                                '.MuiCardActionArea-root:hover &': {
                                                    bgcolor: card.color,
                                                    color: 'white',
                                                    transform: 'scale(1.1)'
                                                }
                                            }}
                                        >
                                            {card.icon}
                                        </Box>

                                        {/* Lock icon for auth-protected views */}
                                        {card.requiresAuth && !user && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                borderRadius: '50%',
                                                padding: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <LockIcon fontSize="small" />
                                            </Box>
                                        )}
                                        
                                        {/* Card content - Enhanced typography */}
                                        <CardContent sx={{
                                            textAlign: 'center',
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flexGrow: 0,
                                            padding: 0
                                        }}>
                                            <Typography
                                                variant="h5"
                                                component="h2"
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    mb: 2
                                                }}
                                            >
                                                {card.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '1rem',
                                                    maxHeight: '3rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {card.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Footer attribution */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mt: 8, opacity: 0.7}}
                >
                    © 2025 Team Method
                </Typography>
            </Box>
        </Container>
    );

    const renderView = () => {
        // Check for protected views and redirect to login if not authenticated
        if ((currentView === 'manager' || currentView === 'cashier') && !user) {
            // Force login for protected views
            handleLogin();
            return renderMainMenu();
        }
        
        switch (currentView) {
            case 'kiosk':
                return <KioskView/>;
            case 'menuBoard':
                return <MenuBoardView/>;
            case 'cashier':
                return <CashierView user={user}/>;
            case 'manager':
                return <ManagerView user={user}/>;
            default:
                return renderMainMenu();
        }
    };

    // Add a global MutationObserver to handle font size adjustments for dynamically added elements
    useEffect(() => {
        // Function to apply font size to new elements
        const applyFontSizeToNewElements = (mutations) => {
            const fontScale = document.body.getAttribute('data-font-scale');
            if (!fontScale) return; // No custom font size is set

            const scale = parseFloat(fontScale);
            if (isNaN(scale) || scale === 1) return; // Default or invalid scale

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            // Apply to the element itself if it's a text element
                            if (node.matches('h1, h2, h3, h4, h5, h6, p, a, span, li, td, th')) {
                                if (!node.getAttribute('data-original-font-size')) {
                                    const size = parseInt(window.getComputedStyle(node).fontSize);
                                    if (!isNaN(size)) {
                                        node.setAttribute('data-original-font-size', size);
                                        node.style.fontSize = `${size * scale}px`;
                                    }
                                }
                            }

                            // Apply to child elements
                            node.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, li, td, th').forEach(el => {
                                if (!el.getAttribute('data-original-font-size')) {
                                    const size = parseInt(window.getComputedStyle(el).fontSize);
                                    if (!isNaN(size)) {
                                        el.setAttribute('data-original-font-size', size);
                                        el.style.fontSize = `${size * scale}px`;
                                    }
                                }
                            });
                        }
                    });
                }
            });
        };

        // Create and start the observer
        const observer = new MutationObserver(applyFontSizeToNewElements);
        observer.observe(document.body, { childList: true, subtree: true });

        // Cleanup function
        return () => observer.disconnect();
    }, []);

    return (
        <Router>
            <ThemeProvider theme={currentTheme}>
                <CssBaseline/>
                <Box sx={{
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    position: 'relative'
                }}>
                    {/* Top Bar with Back button and User Menu */}
                    {currentView !== 'main' && (
                        <Box sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            width: 'auto', // Only take width needed for button
                            zIndex: 1,
                            pointerEvents: 'auto' // Ensure clicks register correctly
                        }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<BackIcon/>}
                                onClick={() => setCurrentView('main')}
                                sx={{
                                    borderRadius: 8,
                                    px: 2
                                }}
                            >
                                Back to Main Menu
                            </Button>
                        </Box>
                    )}

                    <Routes>
                        <Route
                            path="/oauth2callback"
                            element={<OAuthCallback/>}
                        />
                        <Route path="*" element={renderView()}/>
                    </Routes>

                    {/* Add the AccessibilityWidget component */}
                    <AccessibilityWidget onThemeChange={handleThemeChange} />
                </Box>
            </ThemeProvider>
        </Router>
    );
}

export default App;