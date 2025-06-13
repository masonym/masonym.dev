"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import FilterControls from './FilterControls';
import Footer from '@/components/Footer';
import { formatDate } from '@/utils';
import AdvancedItemCard from './AdvancedItemCard';
import Image from 'next/image';
import noItemsImage from '../assets/noItem_mini.png';

// 48 and 49 are Heroic worlds, 52 and 54 are Challenger Heroic worlds, and the rest are Interactive worlds.
// 0/1/17/18/30/45/46/70/48/49/52/54"
const INT_WORLDS = [0, 1, 17, 18, 30, 48, 49, 70];
const HERO_WORLDS = [45, 46, 52, 54];


const API_URL = 'https://yaiphhwge8.execute-api.us-west-2.amazonaws.com/prod/query-items-by-date';

function AdvancedItemList() {
    const [items, setItems] = useState({});
    const [categorizedItems, setCategorizedItems] = useState({});
    const [filters, setFilters] = useState({
        hidePastItems: false,
        showCurrentItems: false,
        searchTerm: '',
        worldFilter: '',
    });
    const [noItems, setNoItems] = useState(false);
    const [openItemId, setOpenItemId] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [filteredCategories, setFilteredCategories] = useState({});

    const updateFilter = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            // Ensure mutual exclusivity between hidePastItems and showCurrentItems
            if (key === 'hidePastItems' && value) {
                newFilters.showCurrentItems = false;
            } else if (key === 'showCurrentItems' && value) {
                newFilters.hidePastItems = false;
            }

            return newFilters;
        });
    };

    const toggleCategory = (dateKey) => {
        setCollapsedCategories(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
    };

    const parseDate = (dateString) => {
        const [datePart, timePart] = dateString.split(' ');
        const [month, day, year] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        return new Date(Date.UTC(year, month - 1, day, hour, minute));
    };

    const formatDateForAPI = (date) => {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    const getApiParams = useCallback(() => {
        const now = new Date();
        if (filters.hidePastItems) {
            return { endDate: formatDateForAPI(now) };
        } else if (filters.showCurrentItems) {
            return { currentItems: 'true' };
        } else {
            return { startDate: formatDateForAPI(now) };
        }
    }, [filters.hidePastItems, filters.showCurrentItems]);

    const categorizeAndSortItems = useMemo(() => (items) => {
        const categorized = Object.entries(items).reduce((acc, [key, item]) => {
            const startDate = parseDate(item.termStart);
            const dateKey = startDate.toISOString().split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push({ key, item });
            return acc;
        }, {});

        Object.values(categorized).forEach(category =>
            category.sort((a, b) => a.item.name.localeCompare(b.item.name))
        );

        return categorized;
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(API_URL, { params: getApiParams() });
            setItems(data);
            setCategorizedItems(categorizeAndSortItems(data));
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    }, [getApiParams, categorizeAndSortItems]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        const filterItems = () => {
            const now = new Date();
            const filtered = Object.entries(categorizedItems).reduce((acc, [dateKey, items]) => {
                const filteredItems = items.filter(({ item }) => {
                    const termStart = parseDate(item.termStart);
                    const termEnd = parseDate(item.termEnd);
                    let dateCondition;
                    if (filters.hidePastItems) {
                        dateCondition = termEnd < now;
                    } else if (filters.showCurrentItems) {
                        dateCondition = termStart <= now && termEnd > now;
                    } else {
                        dateCondition = termStart > now;
                    }
                    const nameCondition = item.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
                    const worldCondition = !filters.worldFilter ||
                        (filters.worldFilter === 'intWorlds' ? item.gameWorld.split('/').some(id => INT_WORLDS.includes(Number(id))) :
                            filters.worldFilter === 'heroWorlds' ? item.gameWorld.split('/').some(id => HERO_WORLDS.includes(Number(id))) :
                                true);
                    return dateCondition && nameCondition && worldCondition;
                });
                if (filteredItems.length > 0) acc[dateKey] = filteredItems;
                return acc;
            }, {});
            setNoItems(Object.keys(filtered).length === 0);
            setFilteredCategories(filtered);
        };

        filterItems();
    }, [categorizedItems, filters]);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const handleItemClick = (itemId) => {
        if (isTouchDevice) {
            setOpenItemId(prevId => prevId === itemId ? null : itemId);
        }
    };

    return (
        <div className="flex flex-col min-h-dvh h-auto pb-20 bg-cs-bg" style={{ backgroundAttachment: 'fixed' }}>
            <h1 className="text-center text-3xl mb-0 mt-16 text-primary-bright font-bold">Upcoming Cash Shop Sales</h1>
            <h4 className="text-center text-xl my-5 mb-8 italic text-primary">
                Last Updated for v.260 (June 11th, 2025)
            </h4>

            <FilterControls
                filters={filters}
                onFilterChange={updateFilter}
            />

            {loading ? (
                <div className="flex justify-center items-center h-screen w-full text-center text-2xl text-gray-700 bg-white bg-opacity-80 absolute top-0 left-0 z-50">
                    <p className="m-0 p-5 bg-white rounded-lg shadow-md">Loading items...</p>
                </div>
            ) : noItems ? (
                <div className="flex justify-center items-center h-52">
                    <Image
                        src={noItemsImage}
                        alt="No items found"
                        className="w-[202px] h-[118px]"
                    />
                </div>
            ) : (
                <div>
                    {Object.entries(filteredCategories).sort().map(([dateKey, items]) => (
                        <div key={dateKey}>
                            <h2
                                className="flex items-center text-[28px] font-bold justify-center p-2 select-none transition-colors duration-200 rounded-md text-primary-bright text-center hover:bg-primary-dark cursor-custom-click"
                                onClick={() => toggleCategory(dateKey)}
                            >
                                <span className="flex-grow-0">{formatDate(dateKey)}</span>
                                <span className="mx-2 text-xs">{collapsedCategories[dateKey] ? '▶' : '▼'}</span>
                            </h2>
                            {!collapsedCategories[dateKey] && (
                                <ul className="flex flex-wrap justify-center items-center mx-[5%]">
                                    {items.map(({ key, item }) => (
                                        <AdvancedItemCard
                                            key={key}
                                            itemKey={key}
                                            item={item}
                                            isOpen={openItemId === item}
                                            onItemClick={() => handleItemClick(item)}
                                            isTouchDevice={isTouchDevice}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdvancedItemList;
