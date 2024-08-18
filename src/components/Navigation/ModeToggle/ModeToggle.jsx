"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './ModeToggle.module.css';
import { useState, useEffect } from 'react';

const ModeToggle = () => {

    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleThemeToggle = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    
    return (
        <button
            className={`${styles.themeToggle} ${isDarkMode ? styles.dark : styles.light}`}
            onClick={handleThemeToggle}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
            <div className={`${styles.toggleIcon} ${isDarkMode ? styles.darkIcon : styles.lightIcon}`}>
                {isDarkMode ? <Sun size={24}/> : <Moon size={24} />} {/* Icons swapped */}
            </div>
        </button>
    );
};

export default ModeToggle;
