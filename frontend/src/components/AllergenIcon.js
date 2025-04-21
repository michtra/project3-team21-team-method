import React from 'react';
import { Box, Tooltip, Stack } from '@mui/material';
import { GiPeanut } from "react-icons/gi";
import { LuMilk } from "react-icons/lu";
import { SiHoneygain } from "react-icons/si";
import { MdOutlineNoFood } from "react-icons/md";

const AllergenIcon = ({ product }) => {
    // Determine if this product has any allergens or is a milk tea product
    const categoryKey = product.category_id || product.product_type;
    const isMilkTea = categoryKey && categoryKey.toLowerCase().includes('milk');
    const hasAllergens = product.allergens && product.allergens !== 'None';

    // If no allergens and not milk tea, show allergen-free icon
    if (!hasAllergens && !isMilkTea) {
        return (
            <Tooltip title="Allergen-Free" arrow>
                <Box sx={{
                    color: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    height: '28px'
                }}>
                    <MdOutlineNoFood size={22} />
                </Box>
            </Tooltip>
        );
    }

    // Parse allergens if any
    let allergenList = [];
    if (typeof product.allergens === 'string') {
        allergenList = product.allergens.split(',').map(item => item.trim());
    } else if (Array.isArray(product.allergens)) {
        allergenList = product.allergens;
    }

    // Add milk tea category allergen if applicable
    if (isMilkTea && !allergenList.some(allergen => 
        (typeof allergen === 'string' && 
        (allergen.toLowerCase().includes('milk') || allergen.toLowerCase().includes('dairy'))))) {
        allergenList.push('dairy');
    }

    // If no allergens were found after all checks, show allergen-free icon
    if (allergenList.length === 0) {
        return (
            <Tooltip title="Allergen-Free" arrow>
                <Box sx={{
                    color: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    height: '28px'
                }}>
                    <MdOutlineNoFood size={22} />
                </Box>
            </Tooltip>
        );
    }

    // Prepare allergen icons to display
    const allergenIcons = [];

    // Check for nuts
    if (allergenList.some(allergen => 
        typeof allergen === 'string' && allergen.toLowerCase().includes('nuts'))) {
        allergenIcons.push(
            <Tooltip key="nuts" title="Contains Nuts" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)',
                    height: '28px'
                }}>
                    <GiPeanut size={22} />
                </Box>
            </Tooltip>
        );
    }

    // Check for honey
    if (allergenList.some(allergen => 
        typeof allergen === 'string' && allergen.toLowerCase().includes('honey'))) {
        allergenIcons.push(
            <Tooltip key="honey" title="Contains Honey" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)',
                    height: '28px'
                }}>
                    <SiHoneygain size={22} />
                </Box>
            </Tooltip>
        );
    }

    // Check for dairy/milk
    if (allergenList.some(allergen => 
        typeof allergen === 'string' && 
        (allergen.toLowerCase().includes('dairy')))) {
        allergenIcons.push(
            <Tooltip key="dairy" title="Contains Dairy" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)',
                    height: '28px'
                }}>
                    <LuMilk size={22} />
                </Box>
            </Tooltip>
        );
    }

    // If we have multiple icons, display them in a row
    if (allergenIcons.length > 0) {
        return (
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                {allergenIcons}
            </Stack>
        );
    }

    // Fallback to allergen-free icon if no specific allergens were detected
    return (
        <Tooltip title="Allergen-Free" arrow>
            <Box sx={{
                color: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                p: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                height: '28px'
            }}>
                <MdOutlineNoFood size={22} />
            </Box>
        </Tooltip>
    );
};

export default AllergenIcon;