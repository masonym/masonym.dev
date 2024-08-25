import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import FilterControls from './FilterControls';
import Footer from '@/components/Footer';
import { formatDate } from '@/utils';
import AdvancedItemCard from './AdvancedItemCard';
import backgroundDark from '../assets/backgrnd_cr.png';
import backgroundLight from '../assets/backgrnd_cr_light.png';
import noItemsImage from '../assets/noItem_mini.png';

const intWorlds = [0, 1, 17, 18, 30, 48, 49];
const heroWorlds = [45, 46, 70];

function AdvancedItemList() {
    const [items, setItems] = useState({});
    const [categorizedItems, setCategorizedItems] = useState({});
    const [sortKey, setSortKey] = useState('termStart');
    const [sortOrder, setSortOrder] = useState('asc');
    const [hidePastItems, setHidePastItems] = useState(false);
    const [showCurrentItems, setShowCurrentItems] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [worldFilter, setWorldFilter] = useState('');
    const [noItems, setNoItems] = useState(false);
    const [openItemId, setOpenItemId] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [backgroundImage, setBackgroundImage] = useState(backgroundDark);

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setBackgroundImage(currentTheme === 'light' ? backgroundLight : backgroundDark);
    }, []);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    setBackgroundImage(currentTheme === 'light' ? backgroundLight : backgroundDark);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
        });

        return () => observer.disconnect();
    }, []);

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

    const categorizeItems = (items) => {
        const categorized = {};

        Object.keys(items).forEach((key) => {
            const startDate = parseDate(items[key].termStart);
            const dateKey = `${startDate.getUTCFullYear()}-${(startDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${startDate.getUTCDate().toString().padStart(2, '0')}`;

            if (!categorized[dateKey]) {
                categorized[dateKey] = [];
            }
            categorized[dateKey].push({ key, item: items[key] });
        });

        return categorized;
    };

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
        setLoading(true);  // Set loading to true before the API call
        try {
            const response = await axios.get('https://yaiphhwge8.execute-api.us-west-2.amazonaws.com/prod/query-items-by-date', {
                params: apiParams
            });
            const allItems = response.data;
            setItems(allItems);
            const categorized = categorizeItems(allItems);
            setCategorizedItems(categorized);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);  // Set loading to false after the API call
        }
    }, [apiParams]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        const sortAndFilterItems = () => {
            const now = new Date();

            const filteredKeys = Object.keys(items).filter(key => {
                const termStart = parseDate(items[key].termStart);
                const termEnd = parseDate(items[key].termEnd);

                if (hidePastItems) {
                    return termEnd < now;
                } else if (showCurrentItems) {
                    return termStart <= now && termEnd >= now;
                } else {
                    return termStart > now;
                }
            })
                .filter(key => items[key].name.toLowerCase().includes(searchTerm))
                .filter(key => {
                    if (!worldFilter) return true;
                    const worldIds = items[key].gameWorld.split('/').map(Number);
                    if (worldFilter === 'intWorlds') {
                        return worldIds.some(id => intWorlds.includes(id));
                    }
                    if (worldFilter === 'heroWorlds') {
                        return worldIds.some(id => heroWorlds.includes(id));
                    }
                    return true;
                });

            filteredKeys.sort((a, b) => {
                let valA = items[a][sortKey];
                let valB = items[b][sortKey];

                if (sortKey === 'termStart' || sortKey === 'termEnd') {
                    valA = parseDate(valA).getTime();
                    valB = parseDate(valB).getTime();
                }

                if (sortKey === 'price') {
                    valA = Number(valA);
                    valB = Number(valB);
                }

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });

            setNoItems(filteredKeys.length === 0);

            const sortedAndFilteredItems = {};
            filteredKeys.forEach(key => {
                const startDate = parseDate(items[key].termStart);
                const dateKey = `${startDate.getUTCFullYear()}-${(startDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${startDate.getUTCDate().toString().padStart(2, '0')}`;
                if (!sortedAndFilteredItems[dateKey]) {
                    sortedAndFilteredItems[dateKey] = [];
                }
                sortedAndFilteredItems[dateKey].push({ key, item: items[key] });
            });

            setCategorizedItems(sortedAndFilteredItems);
        };
        sortAndFilterItems();
    }, [sortKey, sortOrder, items, hidePastItems, showCurrentItems, searchTerm, worldFilter]);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const handleItemClick = (itemId) => {
        if (isTouchDevice) {
            setOpenItemId(prevId => prevId === itemId ? null : itemId);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20" style={{ backgroundImage: `url(${backgroundImage.src})`, backgroundAttachment: 'fixed' }}>
            <h1 className="text-center text-3xl mb-0 mt-16 text-primary-bright font-bold">Upcoming Cash Shop Sales</h1>
            <h4 className="text-center text-xl my-5 mb-8 italic text-primary">
                Last Updated for v.252 (July 17th, 2024)
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
                    <img
                        src={noItemsImage.src}
                        alt="No items found"
                        className="w-[202px] h-[118px]"
                    />
                </div>
            ) : (
                <div>
                    {Object.keys(categorizedItems).map((dateKey) => (
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
                                    {categorizedItems[dateKey].map(({ key, item }) => (
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