import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';

const WeatherModal = ({
                          open,
                          onClose,
                          weatherData,
                          weatherLoading,
                          weatherError,
                          weatherCity,
                          theme
                      }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="weather-dialog-title"
            PaperProps={{sx: {borderRadius: 3, minWidth: '300px', bgcolor: 'background.paper'}}}
        >
            <DialogTitle
                id="weather-dialog-title"
                sx={{textAlign: 'center', fontWeight: 'bold', pb: 1, color: theme.palette.primary.main}}
            >
                Weather in {weatherCity}
            </DialogTitle>
            <DialogContent dividers sx={{
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {weatherLoading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1}}>
                        <CircularProgress color="primary"/>
                    </Box>
                )}

                {weatherError && !weatherLoading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1}}>
                        <Alert severity="warning" sx={{width: '100%'}}>
                            {weatherError}
                        </Alert>
                    </Box>
                )}

                {weatherData && !weatherLoading && !weatherError && (
                    <Box sx={{textAlign: 'center', py: 1}}>
                        <Typography variant="h3" gutterBottom sx={{fontWeight: 600, color: theme.palette.primary.main}}>
                            {Math.round(weatherData.main.temp)}°F
                        </Typography>
                        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1}}>
                            {weatherData.weather[0].icon && (
                                <img
                                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                    alt={weatherData.weather[0].description}
                                    style={{width: 60, height: 60, verticalAlign: 'middle'}}
                                />
                            )}
                            <Typography variant="h6" sx={{textTransform: 'capitalize', ml: 1}}>
                                {weatherData.weather[0].description}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Feels like: {Math.round(weatherData.main.feels_like)}°F
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Humidity: {weatherData.main.humidity}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Wind: {Math.round(weatherData.wind.speed)} mph
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{justifyContent: 'center', p: 1.5}}>
                <Button onClick={onClose} variant="outlined" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WeatherModal;