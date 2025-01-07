'use client'

import React from 'react';
import Script from 'next/script';
import BuffChecker from './components/BuffChecker';

export default function Page() {
    return (
        <div className="min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Buff Checker</h1>
            <Script
                src="https://docs.opencv.org/4.8.0/opencv.js"
                strategy="beforeInteractive"
                onLoad={() => {
                    console.log('OpenCV.js loaded')
                }}
            />
            <BuffChecker />
        </div>
    );
}
