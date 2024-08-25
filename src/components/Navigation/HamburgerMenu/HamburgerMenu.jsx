"use client";

import React, { useEffect, useRef } from 'react';
import Collapsible from '../Collapsible/Collapsible';
import { navigationItems } from '@/data/navigationItems.js';
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-[1000]">
            <div ref={menuRef} className="bg-background w-[300px] h-full p-5 shadow-[2px_0_5px_rgba(0,0,0,0.1)] animate-slideIn">
                <nav>
                    <ul className="list-none p-0">
                        <h1>Navigation</h1>
                        <hr />
                        {navigationItems.map((section, index) => (
                            <Collapsible key={index} title={section.title}>
                                <NavigationList items={section.items} onClose={onClose} flexDirectionProp='column' />
                            </Collapsible>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default HamburgerMenu;