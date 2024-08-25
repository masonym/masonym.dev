// Footer.js
import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[color:var(--primary-dark)] text-center sticky top-[100vh] flex justify-center items-center gap-5 text-[#333] z-[2000] mt-[5px] p-5 left-0;">
            <p className="m-0"><Link href="https://www.paypal.com/donate/?hosted_button_id=PDMFY3KMSNWQ2" target="_blank" rel="noopener noreferrer" className="text-[color:var(--footer-text)] no-underline hover:underline;">Donate here</Link></p>
            <p className="m-0">Developed by <Link href="https://www.youtube.com/@Masonym/videos" target="_blank" rel="noopener noreferrer" className="text-[color:var(--footer-text)] no-underline hover:underline;">Masonym</Link></p>
        </footer>
    );
};

export default Footer;
