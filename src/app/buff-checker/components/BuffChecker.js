'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { buffCategories } from '../data/buffData';
import { processBuffImage, initializeBuffDetection } from '../utils/imageProcessing';
import { useDropzone } from 'react-dropzone';

const getBuffIconPath = (categoryId, buff) => {
    const prefix = {
        skills: 'skill',
        stackingConsumables: 'stack',
        eventBuffs: 'event',
        alchemy: 'alchemy',
        smithing: 'smithing',
        advStatPotions: 'adv',
    }[categoryId] || 'nonstack';

    return `/images/buffs/${prefix}-${buff.id}.png`;
};

const BuffItem = ({ buff, isActive, categoryId }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className={`p-2 rounded-lg flex items-center justify-center transition-colors
                    ${isActive ? 'bg-green-100' : 'bg-background-bright hover:bg-background-dim'}`}
            >
                <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-1 relative">
                        {!imageError ? (
                            <Image
                                src={getBuffIconPath(categoryId, buff)}
                                alt={buff.name}
                                width={32}
                                height={32}
                                onError={() => setImageError(true)}
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 rounded"></div>
                        )}
                    </div>
                    <span className="text-xs text-primary block truncate w-16">
                        {buff.name}
                    </span>
                </div>
            </div>
            {showTooltip && (
                <div className="absolute z-10 bg-black text-white p-2 rounded text-sm -top-2 left-full ml-2 whitespace-nowrap">
                    {buff.name}
                </div>
            )}
        </div>
    );
};

const BuffCategory = ({ category, categoryId, detectedBuffs }) => {
    if (categoryId === 'nonstackingConsumables') {
        return (
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2">{category.group1.name}</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {category.group1.buffs.map((buff) => (
                                <BuffItem
                                    key={buff.id}
                                    buff={buff}
                                    categoryId="nonstackingConsumables1"
                                    isActive={detectedBuffs?.nonstackingConsumables1?.includes(buff.id)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2">{category.group2.name}</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {category.group2.buffs.map((buff) => (
                                <BuffItem
                                    key={buff.id}
                                    buff={buff}
                                    categoryId="nonstackingConsumables2"
                                    isActive={detectedBuffs?.nonstackingConsumables2?.includes(buff.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{category.name}</h3>
            <div className="grid grid-cols-4 gap-2">
                {category.buffs.map((buff) => (
                    <BuffItem
                        key={buff.id}
                        buff={buff}
                        categoryId={categoryId}
                        isActive={detectedBuffs?.[categoryId]?.includes(buff.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const BuffChecker = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [detectedBuffs, setDetectedBuffs] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('Loading OpenCV...');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const initCV = async () => {
            if (window.cv) {
                try {
                    await initializeBuffDetection();
                    setStatus('Ready! Paste a screenshot of your buff bar.');
                } catch (error) {
                    console.error('Failed to initialize buff detection:', error);
                    setStatus('Error initializing buff detection');
                }
            } else {
                setStatus('Loading OpenCV...');
            }
        };

        const checkCV = () => {
            if (window.cv) {
                initCV();
            } else {
                setTimeout(checkCV, 100);
            }
        };

        checkCV();
    }, []);

    const processImage = async (imageData) => {
        if (!window.cv) {
            setError('OpenCV not loaded yet. Please wait...');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setStatus('Processing screenshot...');

        try {
            const results = await processBuffImage(imageData);
            setDetectedBuffs(results);
            setStatus('');
        } catch (error) {
            console.error('Error processing image:', error);
            setError('Failed to process image. Please try again with a different screenshot.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                processImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handlePaste = useCallback((e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i <items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSelectedImage(e.target.result);
                    processImage(e.target.result);
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept: { 'image/*': [] },
        disabled: isProcessing
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Buff Checker</h1>
            
            {status && (
                <div className="text-center mb-4 text-primary">
                    {status}
                </div>
            )}
            
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />
                {selectedImage ? (
                    <img 
                        src={selectedImage} 
                        alt="Selected screenshot" 
                        className="max-h-96 mx-auto object-contain"
                    />
                ) : (
                    <div>
                        <p className="text-lg mb-2">Drop a screenshot here, or click to select</p>
                        <p className="text-gray-500">You can also paste (Ctrl+V) a screenshot</p>
                    </div>
                )}
            </div>

            {isProcessing && (
                <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2">Processing image...</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            
            {selectedImage && !isProcessing && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Buff Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(buffCategories).map(([categoryId, category]) => (
                            <BuffCategory
                                key={categoryId}
                                category={category}
                                categoryId={categoryId}
                                detectedBuffs={detectedBuffs}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuffChecker;
