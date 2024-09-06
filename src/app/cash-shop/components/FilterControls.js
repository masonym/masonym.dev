import React from 'react';

const FilterControls = ({ filters, onFilterChange }) => {
    return (
        <div className="flex flex-col items-center mb-5 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 m-0 mb-2.5 w-full max-w-3xl">
                {[
                    { text: 'All Worlds', filter: '' },
                    { text: 'Interactive Worlds', filter: 'intWorlds' },
                    { text: 'Heroic Worlds', filter: 'heroWorlds' }
                ].map((button) => (
                    <button
                        key={button.filter}
                        className={`
                            h-14 sm:h-20 w-full font-inherit py-2 px-3 border-2 border-[#d2b48c] rounded-full 
                            text-[#2e4d2e] transition-all duration-300 text-center 
                            flex items-center justify-center text-sm whitespace-normal 
                            hover:scale-105
                            ${filters.worldFilter === button.filter
                                ? 'bg-[#5a8859] text-white'
                                : 'bg-[#8abf88] hover:bg-[#6fa96d]'
                            }
                        `}
                        onClick={() => onFilterChange('worldFilter', button.filter)}
                    >
                        {button.text}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-center mt-2.5">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by name"
                    onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                    value={filters.searchTerm}
                    className="w-full font-inherit py-1.5 px-3 border-2 border-[#d2b48c] rounded-full bg-[#fff5e6] text-[#2e4d2e] outline-none"
                />
            </div>
            <div className="flex justify-center items-center mt-2.5">
                <label className="flex items-center cursor-custom-click select-none text-primary">
                    <input
                        type="checkbox"
                        checked={filters.hidePastItems}
                        onChange={(e) => onFilterChange('hidePastItems', e.target.checked)}
                        className="mr-2 w-[18px] h-[18px] rounded-full border-2 border-[#007bff] cursor-custom-click appearance-none bg-white relative checked:border-[#007bff] checked:before:content-['✓'] checked:before:absolute checked:before:left-1/2 checked:before:top-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:text-black checked:before:text-[14px] checked:before:font-bold checked:before:leading-none checked:before:antialiased"
                    />
                    Show Past Items
                </label>
            </div>
            <div className="flex justify-center items-center mt-2.5">
                <label className="flex items-center cursor-pointer select-none text-primary">
                    <input
                        type="checkbox"
                        checked={filters.showCurrentItems}
                        onChange={(e) => onFilterChange('showCurrentItems', e.target.checked)}
                        className="mr-2 w-[18px] h-[18px] rounded-full border-2 border-[#007bff] cursor-custom-click appearance-none bg-white relative checked:border-[#007bff] checked:before:content-['✓'] checked:before:absolute checked:before:left-1/2 checked:before:top-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:text-black checked:before:text-[14px] checked:before:font-bold checked:before:leading-none checked:before:antialiased"
                    />
                    Show Current Items
                </label>
            </div>
        </div>
    );
};

export default FilterControls;