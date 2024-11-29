'use client'

import React from 'react';
import StarForceSimulator from './components/StarForceSimulator';

export default function Page() {
    return (
        <div className="min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Star Force Calculator</h1>
            <StarForceSimulator />
        </div>
    );
}
