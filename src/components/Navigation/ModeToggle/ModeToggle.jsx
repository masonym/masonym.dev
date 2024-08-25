"use client";

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

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
            className={`${
                isDarkMode ? 'bg-[#d8db21] text-[#5e5e5e]' : 'bg-[hsl(217,24%,15%)] text-[hsl(216,15%,65%)]'
            } w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-md hover:${
                isDarkMode ? 'bg-[#c5c81e]' : 'bg-[hsl(217,24%,20%)]'
            } focus:outline-2 focus:outline-[#4299e1] focus:outline-offset-2`}
            onClick={handleThemeToggle}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
            <div
                className={`flex items-center justify-center w-6 h-6 transition-all duration-300 ease-in-out relative z-1 ${
                    isDarkMode ? 'text-[#5e5e5e]' : 'text-[hsl(44,82%,24%)]'
                }`}
            >
                {isDarkMode ? <Sun size={24}/> : <Moon size={24} />}
            </div>
        </button>
    );
};

export default ModeToggle;