import React from 'react';
import styles from '../assets/ItemList.module.css';
import { convertNewlinesToBreaks, magicText } from '../utils';

const PackageContents = ({ contents }) => {
    if (!contents) return null;

    return (
        <ul className={styles.packageContents}>
            {Object.entries(contents).map(([packageKey, packageItems]) => (
                <li key={packageKey}>
                    <strong>Includes:</strong>
                    <ul className={styles.packageItems}>
                        {Object.entries(packageItems).map(([itemIndex, itemDetails]) => {
                            const countText = itemDetails.count > 1 ? ` (x${itemDetails.count})` : '';
                            return (
                                <li key={itemIndex} className={styles.packageItem}>
                                    <div className={styles.packageItemFlexContainer}>
                                        <img
                                            src={`./images/${itemDetails.itemID}.png`}
                                            alt={itemDetails.name}
                                            className={styles.packageItemImage}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div>
                                            <p>{itemDetails.name}{countText}</p>
                                            {itemDetails.description && <p><i>{convertNewlinesToBreaks(itemDetails.description)}</i></p>}
                                            <p>{magicText(itemDetails.itemID)}Duration: {itemDetails.period === '0' ? 'Permanent' : `${itemDetails.period} days`}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            ))}
        </ul>
    );
};

export default PackageContents;