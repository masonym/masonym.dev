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
        <div className="fixed inset-0 bg-black/50 flex z-[1000] backdrop-blur-sm">
            <div 
                ref={menuRef} 
                className="bg-background w-[300px] h-full shadow-lg animate-slideIn overflow-y-auto"
            >
                <nav className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Navigation</h2>
                    <div className="space-y-4">
                        {navigationItems.map((section, index) => (
                            <Collapsible 
                                key={index} 
                                title={section.title}
                            >
                                <div className="pt-2">
                                    <NavigationList items={section.items} onClose={onClose} layout="row" />
                                </div>
                            </Collapsible>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default HamburgerMenu;