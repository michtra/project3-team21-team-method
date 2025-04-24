// accessibility widget that provides font size adjustment, high contrast mode, and translation options
import React, {useState, useEffect} from 'react';
import {
    Box,
    Typography,
    Slider,
    Switch,
    IconButton,
    Paper,
    Drawer,
    Tooltip,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseIcon from '@mui/icons-material/Close';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ContrastIcon from '@mui/icons-material/Contrast';
import RefreshIcon from '@mui/icons-material/Refresh';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import baseTheme from '../theme';
import {createTheme} from '@mui/material/styles';
import TranslationControl from './TranslationControl';

// create high contrast themes outside the component to prevent recreation on each render
const darkHighContrastTheme = createTheme({
    ...baseTheme,
    palette: {
        ...baseTheme.palette,
        mode: 'dark',
        primary: {
            main: '#ffffff',
            light: '#ffffff',
            dark: '#dddddd',
            contrastText: '#000000',
        },
        secondary: {
            main: '#ffff00', // bright yellow
            light: '#ffff66',
            dark: '#cccc00',
            contrastText: '#000000',
        },
        background: {
            default: '#000000',
            paper: '#000000',
        },
        text: {
            primary: '#ffffff',
            secondary: '#eeeeee',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
    },
    components: {
        ...baseTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    border: '2px solid white',
                    fontWeight: 700,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: '1px solid white',
                },
            },
        },
    },
});

const lightHighContrastTheme = createTheme({
    ...baseTheme,
    palette: {
        ...baseTheme.palette,
        mode: 'light',
        primary: {
            main: '#000000',
            light: '#333333',
            dark: '#000000',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0000cc', // dark blue
            light: '#0000ff',
            dark: '#000099',
            contrastText: '#ffffff',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: '#000000',
            secondary: '#222222',
            disabled: 'rgba(0, 0, 0, 0.5)',
        },
    },
    components: {
        ...baseTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    border: '2px solid black',
                    fontWeight: 700,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: '1px solid black',
                },
            },
        },
    },
});

// helper function to determine which theme to use based on user's settings
const getThemeFromSettings = (highContrast, contrastMode) => {
    if (highContrast) {
        return contrastMode === 'dark' ? darkHighContrastTheme : lightHighContrastTheme;
    }
    return baseTheme;
};

function AccessibilityWidget({onThemeChange}) {
    // state variables
    const [open, setOpen] = useState(false);
    const [fontSize, setFontSize] = useState(1);
    const [highContrast, setHighContrast] = useState(false);
    const [contrastMode, setContrastMode] = useState('dark');

    // load previously saved accessibility settings when component first mounts
    useEffect(() => {
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);

                // Set state without triggering multiple re-renders
                const newState = {};
                if (parsedSettings.fontSize) newState.fontSize = parsedSettings.fontSize;
                if (parsedSettings.highContrast !== undefined) newState.highContrast = parsedSettings.highContrast;
                if (parsedSettings.contrastMode) newState.contrastMode = parsedSettings.contrastMode;

                // Update state based on saved settings
                if (newState.fontSize) setFontSize(newState.fontSize);
                if (newState.highContrast !== undefined) setHighContrast(newState.highContrast);
                if (newState.contrastMode) setContrastMode(newState.contrastMode);

                // Apply saved font size after a small delay to ensure DOM is ready
                if (newState.fontSize) {
                    setTimeout(() => {
                        adjustFontSize(newState.fontSize);
                    }, 100);
                }

                // Notify the parent component of theme change
                const theme = getThemeFromSettings(
                    newState.highContrast !== undefined ? newState.highContrast : highContrast,
                    newState.contrastMode || contrastMode
                );
                onThemeChange(theme);
            }
            catch (err) {
                console.error('Error parsing saved accessibility settings', err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Empty dependency array - run only once on mount

    // Save settings when they change
    useEffect(() => {
        localStorage.setItem('accessibilitySettings', JSON.stringify({
            fontSize,
            highContrast,
            contrastMode
        }));
    }, [fontSize, highContrast, contrastMode]);

    // Apply font size changes when fontSize state changes
    useEffect(() => {
        adjustFontSize(fontSize);
    }, [fontSize]);

    // Notify parent component when theme-related settings change
    useEffect(() => {
        const theme = getThemeFromSettings(highContrast, contrastMode);
        onThemeChange(theme);
    }, [highContrast, contrastMode, onThemeChange]);

    // applies font size scaling to all text elements on the page
    function adjustFontSize(scale) {
        // get all text elements that should be affected by the font size change
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, dl, dt, li, ol, th, td, span, blockquote, .text-sizeable, .MuiTypography-root');

        // Apply font size changes to each element
        elements.forEach((element) => {
            // Skip icon elements and control components, but allow text elements to be resized
            // even within the accessibility widget
            if (element.classList.contains('material-icons') ||
                element.classList.contains('fa') ||
                element.closest('[class*="MuiSvgIcon"]') ||
                element.closest('.MuiSlider-thumb') ||
                element.closest('.MuiSwitch-switchBase')) {
                return;
            }

            // Allow text labels and marks inside the accessibility widget to resize
            // but exclude functional elements that would break the UI
            const isInAccessibilityWidget = element.closest('.accessibility-widget');
            if (isInAccessibilityWidget) {
                // Skip only specific control elements within the widget
                if (element.closest('input') ||
                    (element.closest('button') && !element.textContent) || // Skip buttonless icons
                    element.classList.contains('MuiSlider-track') ||
                    element.classList.contains('MuiSlider-rail')) {
                    return;
                }
            }

            try {
                // Get or store original font size
                let originalSize = element.getAttribute('data-original-font-size');
                if (!originalSize) {
                    const computedStyle = window.getComputedStyle(element);
                    originalSize = parseInt(computedStyle.getPropertyValue('font-size'));

                    // Only store values that are valid numbers
                    if (!isNaN(originalSize) && originalSize > 0) {
                        element.setAttribute('data-original-font-size', String(originalSize));
                    }
                    else {
                        return; // Skip this element if we can't get a valid size
                    }
                }
                else {
                    originalSize = parseInt(originalSize);
                }

                // Apply the new font size
                const newSize = originalSize * scale;
                element.style.fontSize = `${newSize}px`;
            }
            catch (err) {
                console.error('Error adjusting font size for element:', element, err);
            }
        });

        // Store the current font size scale in a data attribute on the body
        // This helps with newly added elements
        document.body.setAttribute('data-font-scale', String(scale));
    }

    // resets all accessibility settings to their default values
    function resetSettings() {
        setFontSize(1);
        setHighContrast(false);
        setContrastMode('dark');

        // Reset font sizes on elements
        document.querySelectorAll('[data-original-font-size]').forEach((element) => {
            const originalSize = element.getAttribute('data-original-font-size');
            if (originalSize) {
                element.style.fontSize = `${originalSize}px`;
            }
        });

        localStorage.removeItem('accessibilitySettings');
        onThemeChange(baseTheme);
    }

    // Get current theme for the widget
    const currentTheme = getThemeFromSettings(highContrast, contrastMode);

    return (
        <>
            {/* Floating accessibility button */}
            <Tooltip title="Accessibility Options" arrow placement="left">
                <IconButton
                    onClick={() => setOpen(true)}
                    aria-label="Open accessibility options"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 2000,
                        width: 56,
                        height: 56,
                        bgcolor: highContrast
                            ? (contrastMode === 'dark' ? '#ffffff' : '#000000')
                            : baseTheme.palette.primary.main,
                        color: highContrast
                            ? (contrastMode === 'dark' ? '#000000' : '#ffffff')
                            : '#ffffff',
                        '&:hover': {
                            bgcolor: highContrast
                                ? (contrastMode === 'dark' ? '#dddddd' : '#333333')
                                : baseTheme.palette.primary.dark,
                        },
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                        border: highContrast
                            ? (contrastMode === 'dark' ? '2px solid #000000' : '2px solid #ffffff')
                            : 'none',
                    }}
                >
                    <AccessibilityNewIcon/>
                </IconButton>
            </Tooltip>

            {/* Accessibility controls drawer */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    className: 'accessibility-widget',
                    sx: {
                        width: 320,
                        p: 3,
                        bgcolor: currentTheme.palette.background.paper,
                        color: currentTheme.palette.text.primary
                    }
                }}
            >
                {/* Header with title and close button */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h6" component="h2" className="text-sizeable">
                        Accessibility Controls
                    </Typography>
                    <Box>
                        <IconButton
                            onClick={resetSettings}
                            size="small"
                            sx={{mr: 1}}
                            aria-label="Reset accessibility settings"
                            color="inherit"
                        >
                            <RefreshIcon/>
                        </IconButton>
                        <IconButton
                            onClick={() => setOpen(false)}
                            size="small"
                            aria-label="Close accessibility panel"
                            color="inherit"
                        >
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </Box>

                {/* Add Translation control at the top */}
                <TranslationControl/>

                {/* Font size control */}
                <Paper sx={{mb: 3, p: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <TextFieldsIcon sx={{mr: 1}}/>
                        <Typography variant="body1" className="text-sizeable">
                            Font Size
                        </Typography>
                        <Typography variant="body2" sx={{ml: 'auto', fontWeight: 'medium'}} className="text-sizeable">
                            {Math.round(fontSize * 100)}%
                        </Typography>
                    </Box>

                    <Slider
                        aria-label="Font size"
                        value={Math.round(fontSize * 100)} // ensure the value prop is a clean integer
                        min={100}
                        max={200}
                        step={10}
                        marks={[
                            {value: 100, label: '100%'},
                            {value: 150, label: '150%'},
                            {value: 200, label: '200%'},
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${Math.round(value)}%`}
                        onChange={(_, newValue) => {
                            // clean integer math and division to avoid floating-point issues
                            const roundedValue = Math.round(newValue);
                            setFontSize(roundedValue / 100);
                        }}
                        color="primary"
                        sx={{
                            '& .MuiSlider-markLabel': {
                                '&.text-sizeable': {
                                    fontSize: 'inherit',
                                }
                            }
                        }}
                    />
                </Paper>

                {/* High contrast toggle */}
                <Paper sx={{p: 2, mb: 3}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <ContrastIcon sx={{mr: 1}}/>
                            <Typography variant="body1" className="text-sizeable">
                                High Contrast
                            </Typography>
                        </Box>
                        <Switch
                            checked={highContrast}
                            onChange={(e) => setHighContrast(e.target.checked)}
                            inputProps={{'aria-label': 'Toggle high contrast mode'}}
                        />
                    </Box>
                </Paper>

                {/* Contrast mode selection (only shown when high contrast is enabled) */}
                {highContrast && (
                    <Paper sx={{p: 2}}>
                        <Typography variant="body1" sx={{mb: 2}} className="text-sizeable">
                            Contrast Mode
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                aria-label="contrast mode"
                                name="contrast-mode"
                                value={contrastMode}
                                onChange={(e) => setContrastMode(e.target.value)}
                            >
                                <FormControlLabel
                                    value="dark"
                                    control={<Radio/>}
                                    label={
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <DarkModeIcon sx={{mr: 1}}/>
                                            <Typography className="text-sizeable">Dark (White on Black)</Typography>
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="light"
                                    control={<Radio/>}
                                    label={
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <LightModeIcon sx={{mr: 1}}/>
                                            <Typography className="text-sizeable">Light (Black on White)</Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                )}
            </Drawer>
        </>
    );
}

export default AccessibilityWidget;