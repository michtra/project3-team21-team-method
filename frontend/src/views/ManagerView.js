// ManagerView.js
import React, {useState} from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    AppBar,
    Toolbar
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    LocalCafe as ProductsIcon,
    BarChart as ReportIcon,
    AccountCircle as UserIcon
} from '@mui/icons-material';
import ManagerInventoryView from './ManagerInventoryView';
import ManagerProductView from './ManagerProductView';
import ManagerReportView from './ManagerReportView';
import ManagerInfoView from './ManagerInfoView';

const ManagerView = ({user}) => {
    const [activeTab, setActiveTab] = useState('inventory');

    const handleTabChange = (event, newTab) => {
        setActiveTab(newTab);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'inventory':
                return <ManagerInventoryView/>;
            case 'products':
                return <ManagerProductView/>;
            case 'report':
                return <ManagerReportView/>;
            case 'info':
                return <ManagerInfoView user={user}/>;
            default:
                return <ManagerInventoryView/>;
        }
    };

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar sx={{display: 'flex', justifyContent: 'center'}}>
                    <Typography variant="h4" component="h1">
                        Manager Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{mt: 4, mb: 4}}>
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        indicatorColor="secondary"
                        textColor="inherit"
                        aria-label="manager dashboard tabs"
                        sx={{
                            bgcolor: 'background.paper',
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                py: 2
                            }
                        }}
                    >
                        <Tab
                            icon={<InventoryIcon/>}
                            iconPosition="start"
                            label="Inventory"
                            value="inventory"
                            sx={{minHeight: 64}}
                        />
                        <Tab
                            icon={<ProductsIcon/>}
                            iconPosition="start"
                            label="Products"
                            value="products"
                            sx={{minHeight: 64}}
                        />
                        <Tab
                            icon={<ReportIcon/>}
                            iconPosition="start"
                            label="Reports"
                            value="report"
                            sx={{minHeight: 64}}
                        />
                        <Tab
                            icon={<UserIcon/>}
                            iconPosition="start"
                            label="Manager Info"
                            value="info"
                            sx={{minHeight: 64}}
                        />
                    </Tabs>

                    <Box sx={{p: 3}}>
                        {renderActiveTab()}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ManagerView;