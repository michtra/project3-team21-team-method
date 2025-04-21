import React, {useEffect, useState} from 'react';
import {Box, Typography, Paper, CircularProgress, useTheme} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

function TranslationControl() {
    const [loading, setLoading] = useState(true);
    // Get the current theme to access the text color
    const theme = useTheme();

    useEffect(() => {
        // Set the CSS variable for the text color in the accessibility widget
        document.documentElement.style.setProperty(
            '--accessibility-text-color',
            theme.palette.text.primary
        );

        // Only add the translation element if it doesn't already exist
        if (!document.getElementById('accessibility_google_translate_element')) {
            // Create a placeholder div for Google Translate to initialize on
            const translationContainer = document.createElement('div');
            translationContainer.id = 'accessibility_google_translate_element';

            // Add it to a known DOM element that always exists
            const containerElement = document.getElementById('accessibility_translation_container');
            if (containerElement) {
                // Clean any previous content to prevent duplication
                containerElement.innerHTML = '';
                containerElement.appendChild(translationContainer);

                // Initialize Google Translate
                if (window.google && window.google.translate) {
                    new window.google.translate.TranslateElement(
                        {
                            //pageLanguage: 'en', // this is buggy
                            includedLanguages: 'ar,zh-CN,en,fr,hi,ja,ko,es,ru,vi',
                            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                            autoDisplay: false
                        },
                        'accessibility_google_translate_element'
                    );
                    setLoading(false);
                }
                else {
                    // Set up a check for the Google Translate API
                    const checkGoogleInterval = setInterval(() => {
                        if (window.google && window.google.translate) {
                            clearInterval(checkGoogleInterval);

                            // Try initializing again
                            try {
                                new window.google.translate.TranslateElement(
                                    {
                                        //pageLanguage: 'en', // this is buggy
                                        includedLanguages: 'ar,zh-CN,en,fr,hi,ja,ko,es,ru,vi',
                                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                                        autoDisplay: false
                                    },
                                    'accessibility_google_translate_element'
                                );
                                setLoading(false);
                            }
                            catch (e) {
                                console.error('Failed to initialize Google Translate:', e);
                                setLoading(false);
                            }
                        }
                    }, 500);

                    // Set a timeout to stop checking after 10 seconds
                    setTimeout(() => {
                        clearInterval(checkGoogleInterval);
                        setLoading(false);
                    }, 10000);
                }
            }
        }
        else {
            // Element already exists, no need to reload
            setLoading(false);
        }
    }, [theme.palette.text.primary]);

    // Update the text color when the theme changes
    useEffect(() => {
        document.documentElement.style.setProperty(
            '--accessibility-text-color',
            theme.palette.text.primary
        );
    }, [theme.palette.text.primary]);

    return (
        <Paper sx={{p: 2, mb: 3}}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                <TranslateIcon sx={{mr: 1}}/>
                <Typography variant="body1" className="text-sizeable">
                    Translation
                </Typography>
            </Box>

            <Box sx={{minHeight: 40}}>
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p: 1}}>
                        <CircularProgress size={24}/>
                    </Box>
                ) : null}

                {/* This div will be controlled by React, and Google Translate will initialize on a child of this */}
                <div
                    id="accessibility_translation_container"
                    style={{
                        width: '100%',
                        minHeight: loading ? '0' : '40px'
                    }}
                />
            </Box>
        </Paper>
    );
}

export default TranslationControl;