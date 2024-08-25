// Footer.js
import React from 'react';
import styles from '../assets/Footer.module.css';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.footerItem}><Link href="https://www.paypal.com/donate/?hosted_button_id=PDMFY3KMSNWQ2" target="_blank" rel="noopener noreferrer">Donate here</Link></p>
            <p className={styles.footerItem}>Developed by <Link href="https://www.youtube.com/@Masonym/videos" target="_blank" rel="noopener noreferrer">Masonym</Link></p>
        </footer>
    );
};

export default Footer;
