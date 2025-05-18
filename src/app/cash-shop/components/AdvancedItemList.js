"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FilterControls from './FilterControls';
import Footer from '@/components/Footer';
import { formatDate } from '@/utils';
import AdvancedItemCard from './AdvancedItemCard';
import Image from 'next/image';
import noItemsImage from '../assets/noItem_mini.png';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const INT_WORLDS = [0, 1, 17, 18, 30, 48, 49];
const HERO_WORLDS = [45, 46, 70];

// AWS Configuration
const REGION = 'us-west-2';
const IDENTITY_POOL_ID = 'us-west-2:da6d0910-c897-4cdc-9b36-d044925269bf'; 
const CACHE_BUCKET = 'maplestory-items-cache';
const TABLE_NAME = 'MapleStoryItems';

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
        if (!dateString) {
            // Default to a far future date if no date string is provided
            return new Date(Date.UTC(2099, 11, 31, 23, 59));
        }
        
        try {
            // Handle format: "MM-DD-YYYY HH:MM UTC"
            if (dateString.includes(' ') && dateString.includes('-')) {
                const [datePart, timePart] = dateString.split(' ');
                if (!datePart || !timePart) {
                    return new Date(Date.UTC(2099, 11, 31, 23, 59));
                }
                
                const [month, day, year] = datePart.split('-').map(Number);
                
                // Handle time part which might be "HH:MM UTC" or just "HH:MM"
                let hour = 0, minute = 0;
                if (timePart.includes(':')) {
                    [hour, minute] = timePart.split(':').map(part => parseInt(part, 10));
                }
                
                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    return new Date(Date.UTC(2099, 11, 31, 23, 59));
                }
                
                return new Date(Date.UTC(year, month - 1, day, hour, minute));
            }
            
            // Handle ISO format if the data comes in that format
            if (dateString.includes('T') && dateString.includes('-')) {
                return new Date(dateString);
            }
            
            // Default fallback
            return new Date(dateString);
        } catch (error) {
            console.error('Error parsing date:', error, 'for input:', dateString);
            return new Date(Date.UTC(2099, 11, 31, 23, 59));
        }
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

    // Convert date string to ISO8601 format for comparison
    const convertToIso8601 = (dateStr) => {
        if (!dateStr) {
            // Return a far future date for undefined end dates
            return new Date(Date.UTC(2099, 11, 31, 23, 59)).toISOString();
        }
        
        try {
            const dt = parseDate(dateStr);
            return dt.toISOString();
        } catch (error) {
            console.error('Error parsing date:', error, 'for input:', dateStr);
            return new Date(Date.UTC(2099, 11, 31, 23, 59)).toISOString();
        }
    };

    // Generate cache key based on query parameters
    const makeCacheKey = (params) => {
        const sortedItems = Object.entries(params).sort();
        const joined = sortedItems.map(([k, v]) => `${k}=${v}`).join('&');
        // Simple hash function for demo purposes
        let hash = 0;
        for (let i = 0; i < joined.length; i++) {
            const char = joined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `cache/items/${Math.abs(hash).toString(16)}.json`;
    };

    // Try to get cached data from S3
    const tryGetCached = async (cacheKey) => {
        try {
            // Fall back to sample data if in development or if AWS credentials aren't available
            if (process.env.NODE_ENV === 'development') {
                console.log('Using sample data in development mode');
                return null;
            }

            const credentials = fromCognitoIdentityPool({
                clientConfig: { region: REGION },
                identityPoolId: IDENTITY_POOL_ID
            });

            const s3Client = new S3Client({
                region: REGION,
                credentials
            });

            const command = new GetObjectCommand({
                Bucket: CACHE_BUCKET,
                Key: cacheKey
            });

            const response = await s3Client.send(command);
            const streamToString = (stream) =>
                new Promise((resolve, reject) => {
                    const chunks = [];
                    stream.on('data', (chunk) => chunks.push(chunk));
                    stream.on('error', reject);
                    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
                });

            const bodyContents = await streamToString(response.Body);
            return JSON.parse(bodyContents);
        } catch (error) {
            console.log('Cache miss or error:', error);
            return null;
        }
    };

    // Set cache in S3
    const setCache = async (cacheKey, data) => {
        try {
            // Skip caching in development
            if (process.env.NODE_ENV === 'development') {
                return;
            }

            const credentials = fromCognitoIdentityPool({
                clientConfig: { region: REGION },
                identityPoolId: IDENTITY_POOL_ID
            });

            const s3Client = new S3Client({
                region: REGION,
                credentials
            });

            const command = new PutObjectCommand({
                Bucket: CACHE_BUCKET,
                Key: cacheKey,
                Body: JSON.stringify(data),
                ContentType: 'application/json',
                CacheControl: 'max-age=86400',
            });

            await s3Client.send(command);
            console.log('Cache set successfully');
        } catch (error) {
            console.error('Error writing cache:', error);
        }
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            // Prepare query parameters similar to the Lambda function
            const queryParams = getApiParams();
            const cacheKey = makeCacheKey(queryParams);
            
            // Try to get from cache first
            const cachedData = await tryGetCached(cacheKey);
            if (cachedData) {
                console.log('Serving from cache');
                setItems(cachedData);
                setCategorizedItems(categorizeAndSortItems(cachedData));
                setLoading(false);
                return;
            }
            
            // If not in cache or error, try to fetch from DynamoDB
            try {
                // Create DynamoDB client
                const credentials = fromCognitoIdentityPool({
                    clientConfig: { region: REGION },
                    identityPoolId: IDENTITY_POOL_ID
                });
                
                const client = new DynamoDBClient({
                    region: REGION,
                    credentials
                });
                
                const docClient = DynamoDBDocumentClient.from(client);
                
                // Scan DynamoDB table
                const command = new ScanCommand({
                    TableName: TABLE_NAME
                });
                
                const response = await docClient.send(command);
                const items = response.Items || [];
                
                // Post-filter by date (similar to Lambda function)
                const now = new Date();
                const nowIso = now.toISOString();
                
                const filtered = items.filter(item => {
                    // Skip items without required date fields
                    if (!item || typeof item !== 'object') {
                        console.log('Skipping invalid item:', item);
                        return false;
                    }
                    
                    const termStartIso = convertToIso8601(item.termStart);
                    const termEndIso = convertToIso8601(item.termEnd || "12-31-2099 23:59 UTC");
                    
                    if (queryParams.startDate && termStartIso < convertToIso8601(queryParams.startDate)) {
                        return false;
                    }
                    if (queryParams.endDate && termStartIso > convertToIso8601(queryParams.endDate)) {
                        return false;
                    }
                    if (queryParams.currentItems === 'true') {
                        return termStartIso <= nowIso && nowIso <= termEndIso;
                    }
                    return true;
                });
                
                // Convert array to object with ID as key
                const itemsObject = filtered.reduce((acc, item) => {
                    // Use item.id if available, otherwise generate a unique key
                    const key = item.id || `item_${Object.keys(acc).length}`;
                    acc[key] = item;
                    return acc;
                }, {});
                
                // Cache the results
                await setCache(cacheKey, itemsObject);
                
                setItems(itemsObject);
                setCategorizedItems(categorizeAndSortItems(itemsObject));
            } catch (dynamoError) {
                console.error('Error fetching from DynamoDB:', dynamoError);
                console.log('Falling back to sample data');
                
            }
        } catch (error) {
            console.error('Error processing items:', error);
            // Final fallback to sample data
            setItems(sampleItems);
            setCategorizedItems(categorizeAndSortItems(sampleItems));
        } finally {
            setLoading(false);
        }
    }, [filters.hidePastItems, filters.showCurrentItems, categorizeAndSortItems]);

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
                Last Updated for v.259 (April 29th, 2025)
            </h4>
            <div className="text-center text-primary-dim bg-primary-dim p-2 mx-auto max-w-md rounded-md mb-4">
                <p>⚠️ Regarding the recent outage: AWS Support is slow as hell and still has not restored my account - I have decided to use a temporary workaround, so the data may load a little slower for now.</p>
            </div>

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
                    <p className="text-center text-2xl text-gray-700 bg-white bg-opacity-80 absolute w-96 p-4 rounded-lg z-50">
                        No items match your current filter criteria. Try adjusting your filters.
                    </p>
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
