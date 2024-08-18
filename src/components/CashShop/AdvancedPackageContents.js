import React from 'react';
import styles from './AdvancedItemList.module.css';
import { convertNewlinesToBreaks, magicText } from '../../utils';
import itemBase from '../../assets/itemBase.png';

const CLOUDFRONT_URL = "https://dkxt2zgwekugu.cloudfront.net/images"

const AdvancedPackageContents = ({ contents }) => {
    if (!contents || !Array.isArray(contents)) return null;

    return (
        <ul className={styles.packageContents}>
            <li>
                <strong>Includes:</strong>
                <ul className={styles.packageItems}>
                    {contents.map((itemDetails, index) => {
                        const countText = itemDetails.count > 1 ? ` (x${itemDetails.count})` : '';
                        return (
                            <li key={index} className={styles.packageItem}>
                                <div className={styles.packageItemFlexContainer}>
                                    <div className={styles.itemImageContainer}>
                                        <img
                                            src={`${CLOUDFRONT_URL}/${itemDetails.itemID}.png`}
                                            alt={itemDetails.name}
                                            className={styles.packageItemImage}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <img
                                            src={itemBase.src}
                                            className={styles.itemImageBase}
                                        />
                                    </div>
                                    <div>
                                        <p><strong>{itemDetails.name}{countText}</strong></p>
                                        {itemDetails.description && <p><i>{convertNewlinesToBreaks(itemDetails.description)}</i></p>}
                                        <p>{magicText(itemDetails.itemID)} Duration: {itemDetails.period === '0' ? 'Permanent' : `${itemDetails.period} days`}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </li>
        </ul>
    );
};

export default AdvancedPackageContents;
