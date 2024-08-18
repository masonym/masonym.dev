import React from 'react';
import itemListStyles from '../assets/ItemList.module.css';
import advancedItemListStyles from '../assets/AdvancedItemList.module.css';

const SortControls = ({ sortKey, sortOrder, onSortKeyChange, onSortOrderChange, className }) => {
    const styles = className === advancedItemListStyles ? advancedItemListStyles : itemListStyles;

    return (
        <div className={styles.sortControls}>
            <label htmlFor="sortKey">Sort by: </label>
            <select id="sortKey" value={sortKey} onChange={onSortKeyChange} className={styles.dropdown}>
                <option value="name">Name</option>
                <option value="price">Price</option>
            </select>
            <label htmlFor="sortOrder">Order: </label>
            <select id="sortOrder" value={sortOrder} onChange={onSortOrderChange} className={styles.dropdown}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
    );
};

export default SortControls;
