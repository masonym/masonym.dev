import React, { useState } from 'react';
import ItemList from './ItemList';
import AdvancedItemList from './AdvancedItemList';
import styles from '../assets/ItemListMain.module.css';

function ItemListMain() {
  const [isAdvanced, setIsAdvanced] = useState(true);

  const toggleView = () => {
    setIsAdvanced(!isAdvanced);
  };

  return (
    <div className={`${styles.itemListMain} ${isAdvanced ? styles.advancedView : styles.simpleView}`}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>MapleStory Upcoming Cash Shop Sales</h1> */}
        {/* <div className={styles.toggleContainer}>
          <div className={styles.toggleSwitch} onClick={toggleView}>
            <div className={`${styles.slider} ${isAdvanced ? styles.right : styles.left}`}>
              <span className={styles.icon}>{isAdvanced ? '' : ''}</span>
            </div>
          </div>
          <span className={`${styles.label} ${isAdvanced ? styles.advancedLabel : styles.simpleLabel}`}>
            {isAdvanced ? 'Advanced View' : 'Simple View'}
          </span>
        </div> */}
      </div>
      <div className={styles.content}>
        {isAdvanced ? <AdvancedItemList /> : <ItemList />}
      </div>
    </div>
  );
}

export default ItemListMain;