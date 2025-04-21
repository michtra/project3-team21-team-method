import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    WbSunny as WeatherIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import {LuMilk} from "react-icons/lu";
import {GiPeanut} from "react-icons/gi";
import {SiHoneygain} from "react-icons/si";
import {MdOutlineNoFood} from "react-icons/md";

const KioskHeader = ({
                         theme,
                         showAllergenInfo,
                         setShowAllergenInfo,
                         handleOpenWeatherModal,
                         weatherCity
                     }) => {
    return (
        <Box
            sx={{
                p: 3,
                textAlign: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                position: 'relative',
                flexShrink: 0
            }}
        >
            <Typography
                variant="h3"
                component="h1"
                sx={{fontWeight: 700, color: 'text.primary', mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}
            >
                🧋 Sharetea Kiosk 🧋
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Customize and order your favorite bubble tea!
            </Typography>

            {/* Weather Button */}
            <IconButton
                aria-label="show weather"
                onClick={handleOpenWeatherModal}
                sx={{
                    position: 'absolute',
                    top: {xs: 8, sm: 16},
                    right: {xs: 8, sm: 16},
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s',
                    zIndex: 2,
                    pointerEvents: 'auto',
                    '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.4)',
                    }
                }}
                title={`Weather in ${weatherCity}`}
            >
                <WeatherIcon/>
            </IconButton>

            {/* Allergen Information Button */}
            <IconButton
                aria-label="allergen information"
                onClick={() => setShowAllergenInfo(true)}
                sx={{
                    position: 'absolute',
                    top: {xs: 8, sm: 16},
                    right: {xs: 70, sm: 80},
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s',
                    zIndex: 2,
                    pointerEvents: 'auto',
                    '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.4)',
                    }
                }}
                title="Allergen Information"
            >
                <InfoIcon/>
            </IconButton>

            {/* Allergen Info Dialog */}
            <Dialog
                open={showAllergenInfo}
                onClose={() => setShowAllergenInfo(false)}
                maxWidth="sm"
                PaperProps={{sx: {borderRadius: 3}}}
            >
                <DialogTitle sx={{fontWeight: 'bold', pb: 1}}>
                    Allergen Information
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" paragraph>
                        We want to make sure you're aware of any potential allergens in our products:
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box sx={{display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2}}>
                                <LuMilk size={24} color={theme.palette.warning.main}/>
                            </Box>
                            <Typography variant="body1">
                                <strong>Dairy:</strong> All "Milk Tea" drinks contain dairy products.
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box sx={{display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2}}>
                                <GiPeanut size={24} color={theme.palette.warning.main}/>
                            </Box>
                            <Typography variant="body1">
                                <strong>Nuts:</strong> Some drinks may contain nuts or be processed in facilities that
                                handle nuts.
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box sx={{display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2}}>
                                <SiHoneygain size={24} color={theme.palette.warning.main}/>
                            </Box>
                            <Typography variant="body1">
                                <strong>Honey:</strong> Some of our teas contain honey.
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box sx={{display: 'flex', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2}}>
                                <MdOutlineNoFood size={24} color={theme.palette.success.main}/>
                            </Box>
                            <Typography variant="body1">
                                <strong>Allergen-Free:</strong> Drinks marked with this icon contain no known common
                                allergens.
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="body1" paragraph sx={{mt: 2}}>
                        If you have any allergies or dietary restrictions, please inform our staff before ordering.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{justifyContent: 'center', p: 2}}>
                    <Button variant="contained" color="primary" onClick={() => setShowAllergenInfo(false)}>
                        I Understand
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default KioskHeader;