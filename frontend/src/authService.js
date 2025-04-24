// handles all authentication-related functionality with google oauth
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const REDIRECT_URL = window.location.origin + '/oauth2callback';

// permission scopes we need from google - just basic profile info and email
const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

// creates the oauth url for redirecting users to google login
export const getAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URL,
        response_type: 'token',
        scope: SCOPES.join(' '),
        prompt: 'consent',
        access_type: 'online'
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

// get user info using access token
export const getUserInfo = async (accessToken) => {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        return response.json();
    } catch (error) {
        console.error('Error getting user info:', error);
        throw error;
    }
};

// check if user info exists in storage
export const getUserFromStorage = () => {
    const userInfo = sessionStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
};

// save user info to storage
export const saveUserToStorage = (user) => {
    sessionStorage.setItem('user_info', JSON.stringify(user));
};

// clear user info from storage
export const logout = () => {
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('access_token');
};

// save token to storage
export const saveToken = (token) => {
    sessionStorage.setItem('access_token', token);
};

// get token from storage
export const getToken = () => {
    return sessionStorage.getItem('access_token');
};