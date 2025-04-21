import React from 'react';
import {Paper, IconButton, InputBase} from '@mui/material';
import {Search as SearchIcon} from '@mui/icons-material';

function SearchBar({searchQuery, setSearchQuery}) {
    return (
        <Paper
            elevation={1}
            sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                borderRadius: 2
            }}
        >
            <IconButton sx={{p: '10px'}} aria-label="search">
                <SearchIcon/>
            </IconButton>
            <InputBase
                sx={{ml: 1, flex: 1}}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </Paper>
    );
}

export default SearchBar;