import React from 'react';
import styles from '../assets/ItemList.module.css';
import { formatNumber, convertNewlinesToBreaks, formatSaleTimesDate, calculateDateDifference } from '../utils';
import PackageContents from './PackageContents';

const ItemCard = ({ itemKey, item }) => {
    return (
        <li key={item.itemID} className={styles.item}>
            <div className={styles.gameWorldContainer}>
                {item.gameWorld.split('/').map((gameWorldId) => (
                    <img className={styles.gameWorld}
                        key={gameWorldId}
                        src={`./gameWorlds/${gameWorldId}.png`}
                        alt={`Game World ${gameWorldId}`}
                        onError={(e) => { e.target.style.display = 'none'; }} // hide the image if it doesn't exist
                    />
                ))}
            </div>
            <div className={styles.itemContent}>
                <div className={styles.saleTimes}>
                    <p>{formatSaleTimesDate(item.termStart)} ~ {formatSaleTimesDate(item.termEnd)} UTC</p>
                    <p>({calculateDateDifference(item.termStart, item.termEnd)})</p>
                </div>
                <div className={styles.itemFlexContainer}>
                    <img
                        src={`./images/${item.itemID}.png`}
                        className={styles.itemImage}
                        alt={item.name}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p>{item.name}{item.count > 1 ? ` (x${item.count})` : ''}</p>
                </div>
                <p>{convertNewlinesToBreaks(item.description)}</p>
                <hr />
                <p>Duration: {item.period === '0' ? 'Permanent' : `${item.period} days`}</p>
                <p>Price: {formatNumber(item.price)}{itemKey.toString().startsWith('870') ? ' Mesos' : ' NX'} {item.discount == 1 ? `(was ${formatNumber(item.originalPrice)}${itemKey.toString().startsWith('870') ? ' Mesos' : ' NX'})` : ''}</p>
                <PackageContents contents={item.packageContents} />
            </div>
        </li>
    );
};

export default ItemCard;
