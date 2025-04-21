import React from 'react';
import {Container, Paper, Box, Avatar, Typography} from '@mui/material';
import {AccountCircle as UserIcon} from '@mui/icons-material';

function CashierInfoTab({user}) {
    // get employee name from user prop if available, otherwise use default
    const cashierName = user ? user.name : 'John Doe';

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Paper elevation={3} sx={{p: 4, borderRadius: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                    <Avatar
                        src={user?.photo || ''}
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'primary.main',
                            mr: 3,
                            border: '4px solid',
                            borderColor: 'primary.light'
                        }}
                    >
                        {!user?.photo && <UserIcon sx={{fontSize: 60}}/>}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" gutterBottom>{cashierName}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Cashier</Typography>
                        {user?.email && (
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                {user.email}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default CashierInfoTab;
