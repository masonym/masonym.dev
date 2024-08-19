"use client";

import React, { useEffect, useRef } from 'react';
import styles from './HamburgerMenu.module.css';
import Collapsible from '../Collapsible/Collapsible';

const HamburgerMenu = ({ isOpen, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div ref={menuRef} className={styles.menu}>
                <nav>
                    <ul>
                        <h1>Navigation</h1>
                        <hr></hr>
                        <Collapsible title="Tools">
                            <li><a href="/cash-shop">Cash Shop Sales</a></li>
                        </Collapsible>
                        <Collapsible title="Calculators">
                            <li><a>Hexa</a></li>
                        </Collapsible>
                        <Collapsible title="Info">
                            <li><a>Flames</a></li>
                            <li><a>Potentials</a></li>
                            <li><a>Familiars</a></li>
                            <li><a>Souls</a></li>
                            <li><a>MAPLE Daily Gift</a></li>
                            <li><a>Inner Ability</a></li>
                            <li><a>Formulas</a></li>
                        </Collapsible>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default HamburgerMenu;