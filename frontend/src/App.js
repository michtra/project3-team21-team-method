// App.js (Simplified)
import React, {useState, useEffect} from 'react';
import {ThemeProvider} from '@mui/material/styles';
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
    Login as LoginIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import theme from './theme';
import KioskView from './views/KioskView';
import ManagerView from './views/ManagerView';
import CashierView from './views/CashierViews';
import MenuBoardView from './views/MenuBoardView';
import OAuthCallback from './OAuthCallback';
import {getAuthUrl, logout, getUserFromStorage} from './authService';

function App() {
    const [currentView, setCurrentView] = useState('main');
    const [user, setUser] = useState(null);
    const [setAnchorEl] = useState(null);

    // check for login on initial load
    useEffect(() => {
        const storedUser = getUserFromStorage();
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // use a listener to detect when localStorage/sessionStorage changes
    // avoid logging in twice :P
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
        setAnchorEl(null);
    };

    // navigation card data for main menu
    const navigationCards = [
        {
            id: 'kiosk',
            title: 'Customer Kiosk',
            icon: <CoffeeIcon fontSize="large"/>,
            color: theme.palette.primary.main
        },
        {
            id: 'menuBoard',
            title: 'Menu Board',
            icon: <MenuIcon fontSize="large"/>,
            color: theme.palette.secondary.light
        },
        {
            id: 'manager',
            title: 'Manager Dashboard',
            icon: <ManagerIcon fontSize="large"/>,
            color: theme.palette.warning.main
        },
        {
            id: 'cashier',
            title: 'Cashier System',
            icon: <CartIcon fontSize="large"/>,
            color: theme.palette.success.main
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

                    {!user ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<LoginIcon/>}
                            onClick={handleLogin}
                        >
                            Log in with Google
                        </Button>
                    ) : (
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
                                        onClick={() => setCurrentView(card.id)}
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

    return (
        <Router>
            <ThemeProvider theme={theme}>
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
                            right: 16,
                            zIndex: 10,
                            display: 'flex',
                            justifyContent: 'space-between'
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
                </Box>
            </ThemeProvider>
        </Router>
    );
}

export default App;