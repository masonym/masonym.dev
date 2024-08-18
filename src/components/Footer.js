// Footer.js
import React from 'react';
import styles from '../assets/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.footerItem}><a href="https://www.paypal.com/donate/?hosted_button_id=PDMFY3KMSNWQ2" target="_blank" rel="noopener noreferrer">Donate here</a></p>
            <p className={styles.footerItem}>Developed by <a href="https://www.youtube.com/@Masonym/videos" target="_blank" rel="noopener noreferrer">Masonym</a></p>
        </footer>
    );
};

export default Footer;
