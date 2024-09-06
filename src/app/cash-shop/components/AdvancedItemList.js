import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import FilterControls from './FilterControls';
import Footer from '@/components/Footer';
import { formatDate } from '@/utils';
import AdvancedItemCard from './AdvancedItemCard';
import backgroundDark from '../assets/backgrnd_cr.png';
import backgroundLight from '../assets/backgrnd_cr_light.png';
import noItemsImage from '../assets/noItem_mini.png';
import Image from 'next/image';

const intWorlds = [0, 1, 17, 18, 30, 48, 49];
const heroWorlds = [45, 46, 70];

function AdvancedItemList() {
    const [items, setItems] = useState({});
    const [categorizedItems, setCategorizedItems] = useState({});
    const [hidePastItems, setHidePastItems] = useState(false);
    const [showCurrentItems, setShowCurrentItems] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [worldFilter, setWorldFilter] = useState('');
    const [noItems, setNoItems] = useState(false);
    const [openItemId, setOpenItemId] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [filteredCategories, setFilteredCategories] = useState({});

    const toggleHidePastItems = useCallback((event) => {
        setHidePastItems(event.target.checked);
        if (event.target.checked) {
            setShowCurrentItems(false);
        }
    }, []);

    const toggleShowCurrentItems = useCallback((event) => {
        setShowCurrentItems(event.target.checked);
        if (event.target.checked) {
            setHidePastItems(false);
        }
    }, []);

    const toggleCategory = (dateKey) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    const handleSearchTermChange = (event) => setSearchTerm(event.target.value.toLowerCase());
    const handleWorldFilterChange = (filter) => setWorldFilter(filter);

    const parseDate = (dateString) => {
        const [datePart, timePart] = dateString.split(' ');
        const [month, day, year] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        return new Date(Date.UTC(year, month - 1, day, hour, minute));
    };

    const formatDateForAPI = (date) => {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    const [apiParams, setApiParams] = useState(() => {
        const now = new Date();
        return { startDate: formatDateForAPI(now) };
    });

    const categorizeAndSortItems = useMemo(() => (items) => {
        console.log('Raw items:', items);

        const categorized = {};
        
        Object.keys(items).forEach((key) => {
            const item = items[key];
            const startDate = parseDate(item.termStart);
            const dateKey = `${startDate.getUTCFullYear()}-${(startDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${startDate.getUTCDate().toString().padStart(2, '0')}`;

            if (!categorized[dateKey]) {
                categorized[dateKey] = [];
            }
            categorized[dateKey].push({ key, item });
        });

        Object.keys(categorized).forEach(dateKey => {
            categorized[dateKey].sort((a, b) => {
                const nameA = (a.item.name || '').toString().toLowerCase();
                const nameB = (b.item.name || '').toString().toLowerCase();
                return nameA.localeCompare(nameB);
            });
        });

        console.log('Categorized and sorted items:', categorized);

        return categorized;
    }, []);


    useEffect(() => {
        const now = new Date();

        let params = {};

        if (hidePastItems) {
            params.endDate = formatDateForAPI(now);
        } else if (showCurrentItems) {
            params.currentItems = 'true';
        } else {
            params.startDate = formatDateForAPI(now);
        }

        setApiParams(params);
    }, [hidePastItems, showCurrentItems]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://yaiphhwge8.execute-api.us-west-2.amazonaws.com/prod/query-items-by-date', {
                params: apiParams
            });
            const allItems = response.data;
            console.log('Fetched items:', allItems); // Log fetched items
            setItems(allItems);
            const sortedAndCategorized = categorizeAndSortItems(allItems);
            setCategorizedItems(sortedAndCategorized);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    }, [apiParams, categorizeAndSortItems]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        const filterAndSortItems = () => {
            const now = new Date();

            const filteredCategories = {};
            Object.keys(categorizedItems).forEach(dateKey => {
                const filteredItems = categorizedItems[dateKey].filter(({ item }) => {
                    const termStart = parseDate(item.termStart);
                    const termEnd = parseDate(item.termEnd);

                    let dateCondition;
                    if (hidePastItems) {
                        // Show items that have ended (past items)
                        dateCondition = termEnd < now;
                    } else if (showCurrentItems) {
                        // Show items that are currently active
                        dateCondition = termStart <= now && termEnd > now;
                    } else {
                        // Default view: show future items
                        dateCondition = termStart > now;
                    }

                    const nameCondition = item.name.toLowerCase().includes(searchTerm);

                    const worldCondition = !worldFilter || (
                        worldFilter === 'intWorlds' ? item.gameWorld.split('/').some(id => intWorlds.includes(Number(id))) :
                        worldFilter === 'heroWorlds' ? item.gameWorld.split('/').some(id => heroWorlds.includes(Number(id))) :
                        true
                    );

                    return dateCondition && nameCondition && worldCondition;
                });

                if (filteredItems.length > 0) {
                    filteredCategories[dateKey] = filteredItems;
                }
            });

            setNoItems(Object.keys(filteredCategories).length === 0);
            setFilteredCategories(filteredCategories);
        };

        filterAndSortItems();
    }, [categorizedItems, hidePastItems, showCurrentItems, searchTerm, worldFilter]);


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
                Last Updated for v.253 (August 28th, 2024)
            </h4>

            {/* Filter Controls */}
            <FilterControls
                searchTerm={searchTerm}
                hidePastItems={hidePastItems}
                showCurrentItems={showCurrentItems}
                worldFilter={worldFilter}
                onSearchTermChange={handleSearchTermChange}
                onHidePastItemsChange={toggleHidePastItems}
                onShowCurrentItemsChange={toggleShowCurrentItems}
                onWorldFilterChange={handleWorldFilterChange}
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
                    {Object.keys(filteredCategories).sort().map((dateKey) => (
                        <div key={dateKey}>
                            <h2
                                className="flex items-center text-[28px] font-bold justify-center p-2 cursor-pointer select-none transition-colors duration-200 rounded-md text-primary-bright text-center hover:bg-primary-dark"
                                onClick={() => toggleCategory(dateKey)}
                            >
                                <span className="flex-grow-0">{formatDate(dateKey)}</span>
                                <span className="mx-2 text-xs">{collapsedCategories[dateKey] ? '▶' : '▼'}</span>
                            </h2>
                            {!collapsedCategories[dateKey] && (
                                <ul className="flex flex-wrap justify-center items-center mx-[5%]">
                                    {filteredCategories[dateKey].map(({ key, item }) => (
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