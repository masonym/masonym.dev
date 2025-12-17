"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import FilterControls from './FilterControls';
import { formatDate } from '@/utils';
import AdvancedItemCard from './AdvancedItemCard';
import Image from 'next/image';
import noItemsImage from '../assets/noItem_mini.png';

// 0/1/17/18/30/45/46/70/48/49/52/54"
// 0 = Scania
// 1 = Bera
// 17 = Aurora?
// 18 = Elysium?
// 30 = ???
// 48 = Challenger Interactive NA
// 49 = Challenger Interactive EU
// 45 = Kronos
// 46 = Luna
// 70 = Hyperion
// 52 = Challenger Heroic NA
// 54 = Challenger Heroic EU
const INT_WORLDS = [1, 19, 30, 48, 49];
const HERO_WORLDS = [45, 46, 52, 54, 70];


const API_URL = 'https://yaiphhwge8.execute-api.us-west-2.amazonaws.com/prod/query-items-by-date';

function AdvancedItemList() {
    const [items, setItems] = useState({});
    const [categorizedItems, setCategorizedItems] = useState({});
    const [viewMode, setViewMode] = useState('upcoming');
    const [filters, setFilters] = useState({
        searchTerm: '',
        worldFilter: '',
        dateRange: { start: '', end: '' },
    });
    const [noItems, setNoItems] = useState(false);
    const [openItemId, setOpenItemId] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [filteredCategories, setFilteredCategories] = useState({});
    const [itemsPerPage] = useState(50);
    const [displayedDates, setDisplayedDates] = useState([]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setDisplayedDates([]);
        setCollapsedCategories({});
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
        if (viewMode === 'past') {
            if (filters.dateRange.start && filters.dateRange.end) {
                return { 
                    startDate: filters.dateRange.start,
                    endDate: filters.dateRange.end
                };
            }
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return { 
                startDate: formatDateForAPI(thirtyDaysAgo),
                endDate: formatDateForAPI(now)
            };
        } else if (viewMode === 'current') {
            return { currentItems: 'true' };
        } else {
            return { startDate: formatDateForAPI(now) };
        }
    }, [viewMode, filters.dateRange]);

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
                    if (viewMode === 'past') {
                        dateCondition = termEnd < now;
                    } else if (viewMode === 'current') {
                        dateCondition = termStart <= now && termEnd >= now;
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
            
            const sortedDates = Object.keys(filtered).sort();
            if (viewMode === 'past') {
                sortedDates.reverse();
            }
            setDisplayedDates(sortedDates.slice(0, itemsPerPage));
        };

        filterItems();
    }, [categorizedItems, filters, viewMode, itemsPerPage]);

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
            <h1 className="text-center text-3xl mb-0 mt-16 text-primary-bright font-bold">Cash Shop Sales</h1>
            <h4 className="text-center text-xl my-5 mb-4 italic text-primary">
                Last Updated for v.265 (December 17th, 2025)
            </h4>

            <FilterControls
                filters={filters}
                viewMode={viewMode}
                onFilterChange={updateFilter}
                onViewModeChange={handleViewModeChange}
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
                    {displayedDates.map((dateKey) => {
                        const items = filteredCategories[dateKey];
                        if (!items) return null;
                        return (
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
                        );
                    })}
                    {displayedDates.length < Object.keys(filteredCategories).length && (
                        <div className="flex justify-center my-8">
                            <button
                                onClick={() => {
                                    const allDates = Object.keys(filteredCategories).sort();
                                    const sortedDates = viewMode === 'past' ? allDates.reverse() : allDates;
                                    setDisplayedDates(sortedDates.slice(0, displayedDates.length + itemsPerPage));
                                }}
                                className="px-8 py-3 bg-[#8abf88] hover:bg-[#6fa96d] text-[#2e4d2e] font-bold rounded-full border-2 border-[#d2b48c] transition-all duration-300 hover:scale-105"
                            >
                                Load More ({Object.keys(filteredCategories).length - displayedDates.length} remaining)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdvancedItemList;
