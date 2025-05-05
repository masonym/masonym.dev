"use client";
import React from 'react';

export default function DamageSkinSelector({ skins, selectedSkin, onSelect }) {
  return (
    <div className="flex space-x-4 overflow-x-auto mb-4">
      {skins.map((skin) => (
        <div
          key={skin.id}
          className={`cursor-pointer p-2 ${selectedSkin.id === skin.id ? 'ring-2 ring-blue-500 rounded' : ''}`}
          onClick={() => onSelect(skin)}
        >
          <img src={skin.icon} alt={skin.name} className="w-12 h-12" />
          <div className="text-center text-sm">{skin.name}</div>
        </div>
      ))}
    </div>
  );
}
