"use client";

import React, { useEffect, useRef } from 'react';
import styles from './HamburgerMenu.module.css';
import Collapsible from '../Collapsible/Collapsible';
import { navigationItems } from '@/data/navigationItems.js'
import NavigationList from '../NavigationList';

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
                        {navigationItems.map((section, index) => (
                            <Collapsible key={index} title={section.title}>
                                <NavigationList items={section.items} flexDirectionProp='column' />
                            </Collapsible>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default HamburgerMenu;