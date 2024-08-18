import React, { memo } from 'react';
import styles from '../assets/AdvancedItemCardHover.module.css';
import { formatPriceDisplay, convertNewlinesToBreaks, formatSaleTimesDate, calculateDateDifference, magicText, worldNumbersToString } from '../utils';
import AdvancedPackageContents from './AdvancedPackageContents';
import itemBase from '../assets/itemBase.png';
import Image from 'next/image';

const CLOUDFRONT_URL = "https://dkxt2zgwekugu.cloudfront.net/images"

const AdvancedItemCardHover = ({ itemKey, item, position, isTouchDevice, hoverCardRef, onClose }) => {
    const hoverCardStyle = isTouchDevice ? styles.mobileHoverCard : styles.desktopHoverCard;
    const hoverCardPosition = isTouchDevice ? {} : { left: `${position.x}px`, top: `${position.y}px` };

    return (
        <div ref={hoverCardRef} className={`${styles.hoverCard} ${hoverCardStyle}`} style={hoverCardPosition}>
            {isTouchDevice && (
                <button className={styles.closeButton} onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}>
                    &times;
                </button>
            )}
            <p style={{ fontSize: '1.15em' }}>{item.name}{item.count > 1 ? ` (x${item.count})` : ''}</p>
            <div className={styles.saleTimes}>
                <p>{formatSaleTimesDate(item.termStart)} ~ {formatSaleTimesDate(item.termEnd)} UTC</p>
                <p>({calculateDateDifference(item.termStart, item.termEnd)})</p>
            </div>
            <p>{magicText(item.itemID)}Duration: {item.period === '0' ? 'Permanent' : `${item.period} days`}</p>
            <div className={styles.itemFlexContainer}>
                <div className={styles.itemImageContainer}>
                    <Image
                        width={80} // Set appropriate dimensions
                        height={80} // Set appropriate dimensions
                        src={`${CLOUDFRONT_URL}/${item.itemID}.png`}
                        className={styles.itemImage}
                        alt={item.name}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <Image
                        width={80} // Set appropriate dimensions
                        height={80} // Set appropriate dimensions
                        src={itemBase.src}
                        className={styles.itemImageBase}
                        alt="Item Base"
                    />
                </div>
                <p>{convertNewlinesToBreaks(item.description)}</p>
            </div>
            <AdvancedPackageContents contents={item.packageContents} />
            <hr className={styles.hr} />
            <p>
                {formatPriceDisplay(item.originalPrice, item.price, itemKey, item.discount)}
            </p>
            <p style={{ marginTop: '10px' }}>
                {worldNumbersToString(item.gameWorld)}
            </p>
        </div>
    );
};

export default memo(AdvancedItemCardHover);
