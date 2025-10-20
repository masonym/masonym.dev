import React, { useState } from 'react';

const FilterControls = ({ filters, viewMode, onFilterChange, onViewModeChange }) => {
    const [quickSelectOpen, setQuickSelectOpen] = useState(false);

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}-${day}-${year}`;
    };

    const getDefaultStartDate = () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return formatDateForInput(thirtyDaysAgo);
    };

    const getDefaultEndDate = () => {
        return formatDateForInput(new Date());
    };

    const handleDateRangeChange = (field, value) => {
        onFilterChange('dateRange', { ...filters.dateRange, [field]: value });
    };

    const setQuickRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        onFilterChange('dateRange', {
            start: formatDateForInput(start),
            end: formatDateForInput(end)
        });
        setQuickSelectOpen(false);
    };

    const setMonthRange = (monthOffset = 0) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() - monthOffset;
        
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        
        if (end > now) {
            end.setTime(now.getTime());
        }
        
        onFilterChange('dateRange', {
            start: formatDateForInput(start),
            end: formatDateForInput(end)
        });
        setQuickSelectOpen(false);
    };

    const setYearRange = (year) => {
        const now = new Date();
        const start = new Date(year, 0, 1);
        const end = year === now.getFullYear() 
            ? now 
            : new Date(year, 11, 31);
        
        onFilterChange('dateRange', {
            start: formatDateForInput(start),
            end: formatDateForInput(end)
        });
        setQuickSelectOpen(false);
    };

    const setAllTime = () => {
        const end = new Date();
        const start = new Date(2024, 0, 1);
        onFilterChange('dateRange', {
            start: formatDateForInput(start),
            end: formatDateForInput(end)
        });
        setQuickSelectOpen(false);
    };

    const getRecentMonths = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const result = [];
        
        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push({
                label: `${months[date.getMonth()]} ${date.getFullYear()}`,
                offset: i
            });
        }
        return result;
    };

    const getRecentYears = () => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    };

    return (
        <div className="flex flex-col items-center mb-6 w-full max-w-4xl mx-auto px-4">
            {/* view mode tabs */}
            <div className="grid grid-cols-3 gap-3 mb-6 w-full">
                {[
                    { text: 'Upcoming', mode: 'upcoming' },
                    { text: 'Current', mode: 'current' },
                    { text: 'Past', mode: 'past' }
                ].map((tab) => (
                    <button
                        key={tab.mode}
                        className={`
                            h-16 sm:h-20 w-full font-bold py-3 px-4 border-2 rounded-xl
                            transition-all duration-300 text-center 
                            flex flex-col items-center justify-center gap-1
                            hover:scale-105 hover:shadow-lg
                            ${
                                viewMode === tab.mode
                                    ? 'bg-[#5a8859] text-white border-[#4a7749] shadow-lg scale-105'
                                    : 'bg-[#8abf88] text-[#2e4d2e] border-[#d2b48c] hover:bg-[#6fa96d]'
                            }
                        `}
                        onClick={() => onViewModeChange(tab.mode)}
                    >
                        <span className="text-sm sm:text-base">{tab.text}</span>
                    </button>
                ))}
            </div>

            {/* date range picker for past items */}
            {viewMode === 'past' && (
                <div className="w-full mb-4 p-4 bg-white bg-opacity-90 rounded-xl border-2 border-[#d2b48c] shadow-md">
                    <h3 className="text-center text-[#2e4d2e] font-bold mb-3 text-sm">Select Date Range</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#2e4d2e] mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.dateRange.start || getDefaultStartDate()}
                                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                                max={filters.dateRange.end || getDefaultEndDate()}
                                className="w-full px-3 py-2 border-2 border-[#d2b48c] rounded-lg bg-[#fff5e6] text-[#2e4d2e] outline-none focus:border-[#5a8859] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#2e4d2e] mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.dateRange.end || getDefaultEndDate()}
                                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                                min={filters.dateRange.start || getDefaultStartDate()}
                                max={getDefaultEndDate()}
                                className="w-full px-3 py-2 border-2 border-[#d2b48c] rounded-lg bg-[#fff5e6] text-[#2e4d2e] outline-none focus:border-[#5a8859] transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-[#d2b48c]">
                        <button
                            onClick={() => setQuickSelectOpen(!quickSelectOpen)}
                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#2e4d2e] mb-2 hover:text-[#5a8859] transition-colors"
                        >
                            <span>Quick Select</span>
                            <span className="text-[10px]">{quickSelectOpen ? '▼' : '▶'}</span>
                        </button>
                        
                        {quickSelectOpen && (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1.5">Common Ranges:</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={setAllTime}
                                            className="px-3 py-1.5 text-xs bg-[#5a8859] hover:bg-[#4a7749] text-white rounded-full border border-[#4a7749] transition-all hover:scale-105 font-bold"
                                        >
                                            All Time
                                        </button>
                                        {[
                                            { label: 'Last 7 Days', days: 7 },
                                            { label: 'Last 30 Days', days: 30 },
                                            { label: 'Last 3 Months', days: 90 },
                                            { label: 'Last 6 Months', days: 180 },
                                        ].map(({ label, days }) => (
                                            <button
                                                key={label}
                                                onClick={() => setQuickRange(days)}
                                                className="px-3 py-1.5 text-xs bg-[#8abf88] hover:bg-[#6fa96d] text-[#2e4d2e] rounded-full border border-[#d2b48c] transition-all hover:scale-105 font-medium"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 mb-1.5">By Month:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {getRecentMonths().map(({ label, offset }) => (
                                            <button
                                                key={label}
                                                onClick={() => setMonthRange(offset)}
                                                className="px-3 py-1.5 text-xs bg-[#8abf88] hover:bg-[#6fa96d] text-[#2e4d2e] rounded-full border border-[#d2b48c] transition-all hover:scale-105 font-medium"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 mb-1.5">By Year:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {getRecentYears().map((year) => (
                                            <button
                                                key={year}
                                                onClick={() => setYearRange(year)}
                                                className="px-4 py-1.5 text-xs bg-[#8abf88] hover:bg-[#6fa96d] text-[#2e4d2e] rounded-full border border-[#d2b48c] transition-all hover:scale-105 font-medium"
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-center text-gray-600 mt-3 pt-2 border-t border-[#d2b48c]">
                        {filters.dateRange.start && filters.dateRange.end
                            ? `Showing items from ${filters.dateRange.start} to ${filters.dateRange.end}`
                            : 'Showing last 30 days by default'}
                    </p>
                </div>
            )}

            {/* world filter buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 w-full">
                {[
                    { text: 'All Worlds', filter: '' },
                    { text: 'Interactive Worlds', filter: 'intWorlds' },
                    { text: 'Heroic Worlds', filter: 'heroWorlds' }
                ].map((button) => (
                    <button
                        key={button.filter}
                        className={`
                            h-12 w-full font-bold py-2 px-3 border-2 border-[#d2b48c] rounded-full 
                            text-[#2e4d2e] transition-all duration-300 text-center 
                            flex items-center justify-center text-sm
                            hover:scale-105
                            ${
                                filters.worldFilter === button.filter
                                    ? 'bg-[#5a8859] text-white border-[#4a7749] shadow-md'
                                    : 'bg-[#8abf88] hover:bg-[#6fa96d]'
                            }
                        `}
                        onClick={() => onFilterChange('worldFilter', button.filter)}
                    >
                        {button.text}
                    </button>
                ))}
            </div>

            {/* search bar */}
            <div className="w-full">
                <input
                    type="text"
                    name="search"
                    placeholder="Search items by name..."
                    onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                    value={filters.searchTerm}
                    className="w-full font-inherit py-3 px-4 border-2 border-[#d2b48c] rounded-full bg-[#fff5e6] text-[#2e4d2e] outline-none focus:border-[#5a8859] transition-colors placeholder:text-gray-500"
                />
            </div>
        </div>
    );
};

export default FilterControls;