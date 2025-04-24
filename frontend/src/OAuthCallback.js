// handles the oauth callback after redirecting from google login
import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Typography, Paper} from '@mui/material';
import {getUserInfo, saveUserToStorage, saveToken} from './authService';
import {useNavigate} from 'react-router-dom';

function OAuthCallback() {
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // processes the oauth callback and extracts user information
        const processAuth = async () => {
            try {
                // extract token from URL hash fragment (using implicit flow)
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');

                if (!accessToken) {
                    setError('No access token found');
                    return;
                }

                // save token
                saveToken(accessToken);

                // fetch user info with the token
                setStatus('Fetching your profile...');
                const userInfo = await getUserInfo(accessToken);

                // store user info in a simplified format
                const user = {
                    name: userInfo.name || 'Unknown User',
                    email: userInfo.email || '',
                    photo: userInfo.picture || '',
                };

                saveUserToStorage(user);

                // redirect back to main page
                navigate('/');
            }
            catch (err) {
                console.error('Authentication error:', err);
                setError(`Login failed: ${err.message || 'Unknown error'}`);
            }
        };

        processAuth();
    }, [navigate]);

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 400
                }}
            >
                {error ? (
                    <Typography color="error" variant="h6">{error}</Typography>
                ) : (
                    <>
                        <CircularProgress size={60} sx={{mb: 3}}/>
                        <Typography variant="h6">{status}</Typography>
                    </>
                )}
            </Paper>
        </Box>
    );
}

export default OAuthCallback;