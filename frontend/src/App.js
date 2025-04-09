// App.js
import React, {useState} from 'react';
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
    CardActionArea
} from '@mui/material';
import {
    LocalCafe as CoffeeIcon,
    MenuBook as MenuIcon,
    SupervisorAccount as ManagerIcon,
    ShoppingCart as CartIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';

import theme from './theme';
import KioskView from './views/KioskView';
import ManagerView from './views/ManagerView';
import CashierView from './views/CashierViews';
import MenuBoardView from './views/MenuBoardView';

function App() {
    const [currentView, setCurrentView] = useState('main');

    // navigation card data for main menu
    const navigationCards = [
        {
            id: 'kiosk',
            title: 'Customer Kiosk',
            description: 'Self-service ordering system for customers',
            icon: <CoffeeIcon fontSize="large"/>,
            color: theme.palette.primary.main
        },
        {
            id: 'menuBoard',
            title: 'Menu Board',
            description: 'Digital menu display for store front',
            icon: <MenuIcon fontSize="large"/>,
            color: theme.palette.secondary.main
        },
        {
            id: 'manager',
            title: 'Manager Dashboard',
            description: 'Inventory and product management system',
            icon: <ManagerIcon fontSize="large"/>,
            color: theme.palette.warning.main
        },
        {
            id: 'cashier',
            title: 'Cashier System',
            description: 'Point of sale system for staff',
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
                        Sharetea POS System
                    </Typography>
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{
                            mb: 4,
                            maxWidth: 600,
                            mx: 'auto'
                        }}
                    >
                        Select a module to continue.
                    </Typography>
                </Box>

                {/* Menu cards grid */}
                <Grid
                    container
                    spacing={3}
                    justifyContent="center"
                    sx={{
                        maxWidth: 1200,
                        mx: 'auto'
                    }}
                >
                    {navigationCards.map((card) => (
                        <Grid item key={card.id} xs={12} sm={6} md={6} lg={3}>
                            <Card
                                elevation={4}
                                sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    transition: 'all 0.3s',
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
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 3
                                    }}
                                >
                                    {/* Icon circle */}
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: `${card.color}20`,
                                            color: card.color,
                                            mb: 2,
                                            transition: 'all 0.3s',
                                            '& svg': {fontSize: 40},
                                            '.MuiCardActionArea-root:hover &': {
                                                bgcolor: card.color,
                                                color: 'white',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        {card.icon}
                                    </Box>

                                    {/* Card content */}
                                    <CardContent sx={{textAlign: 'center', flexGrow: 1}}>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.primary'
                                            }}
                                        >
                                            {card.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {card.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
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
                return <CashierView/>;
            case 'manager':
                return <ManagerView/>;
            default:
                return renderMainMenu();
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                position: 'relative'
            }}>
                {currentView !== 'main' && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BackIcon/>}
                        onClick={() => setCurrentView('main')}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            zIndex: 10,
                            borderRadius: 8,
                            px: 2
                        }}
                    >
                        Back to Main Menu
                    </Button>
                )}
                {renderView()}
            </Box>
        </ThemeProvider>
    );
}

export default App;