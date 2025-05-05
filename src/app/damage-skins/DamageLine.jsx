"use client";
import React, { useEffect } from 'react';

export default function DamageLine({ id, damage, isCrit, skinPath, x, y }) {
  const digits = String(damage).split('');

  useEffect(() => {
    const timer = setTimeout(() => { }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="absolute z-10"
      style={{
        left: `calc(50% + ${x}px)`,
        bottom: `calc(50% + ${y}px)`,
        animation: 'moveUpFade 1s ease-out forwards',
      }}
    >
      {digits.map((d, idx) => (
        <img
          key={idx}
          src={`${skinPath}${isCrit ? '/NoCri1' : '/NoRed0'}/${d}.png`}
          alt={d}
          className="inline-block w-[3rem] h-[3rem]"
        />
      ))}
    </div>
  );
}
