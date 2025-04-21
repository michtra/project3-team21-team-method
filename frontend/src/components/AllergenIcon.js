import React from 'react';
import {Box, Tooltip} from '@mui/material';
import {GiPeanut} from "react-icons/gi";
import {LuMilk} from "react-icons/lu";
import {SiHoneygain} from "react-icons/si";
import {MdOutlineNoFood} from "react-icons/md";

const AllergenIcon = ({product}) => {
    // determine if this product has any allergens or is a milk tea product
    const categoryKey = product.category_id || product.product_type;
    const isMilkTea = categoryKey && categoryKey.toLowerCase().includes('milk');
    const hasAllergens = product.allergens && product.allergens !== 'None';

    // if no allergens and not milk tea, show allergen-free icon instead of empty space
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
                    <MdOutlineNoFood size={22}/>
                </Box>
            </Tooltip>
        );
    }

    // handle milk tea category
    if (isMilkTea) {
        return (
            <Tooltip title="Contains Dairy" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)',
                    height: '28px'
                }}>
                    <LuMilk size={22}/>
                </Box>
            </Tooltip>
        );
    }

    // parse allergens if any
    let allergenList = [];
    if (typeof product.allergens === 'string') {
        allergenList = product.allergens.split(',').map(item => item.trim());
    }
    else if (Array.isArray(product.allergens)) {
        allergenList = product.allergens;
    }

    // determine which icon to show; prioritize in order: nuts, honey, dairy
    if (allergenList.some(allergen => allergen.toLowerCase().includes('nut') || allergen.toLowerCase().includes('peanut'))) {
        return (
            <Tooltip title="Contains Nuts" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)',
                    height: '28px'
                }}>
                    <GiPeanut size={22}/>
                </Box>
            </Tooltip>
        );
    }
    else if (allergenList.some(allergen => allergen.toLowerCase().includes('honey'))) {
        return (
            <Tooltip title="Contains Honey" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)', // Light amber background
                    height: '28px'
                }}>
                    <SiHoneygain size={22}/>
                </Box>
            </Tooltip>
        );
    }
    else if (allergenList.some(allergen => allergen.toLowerCase().includes('milk') || allergen.toLowerCase().includes('dairy'))) {
        return (
            <Tooltip title="Contains Dairy" arrow>
                <Box sx={{
                    color: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(245, 166, 35, 0.1)',
                    height: '28px'
                }}>
                    <LuMilk size={22}/>
                </Box>
            </Tooltip>
        );
    }

    // if we reach here, we didn't find specific allergens in the list
    // show allergen-free icon as a fallback
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
                <MdOutlineNoFood size={22}/>
            </Box>
        </Tooltip>
    );
};

export default AllergenIcon;