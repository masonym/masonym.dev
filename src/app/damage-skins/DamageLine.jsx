"use client";
import React from 'react';

export default function DamageLine({ id, damage, isCrit, skinPath, x, y, fadeDuration }) {
  const digits = String(damage).split('');

  return (
    <div
      className="absolute z-10"
      style={{
        left: `calc(50% + ${x}px)`,
        bottom: `calc(50% + ${y}px)`,
        animation: `moveUpFade ${fadeDuration}ms ease-out forwards`,
      }}
    >
      {digits.map((d, idx) => (
        <img
          key={idx}
          src={`${skinPath}${isCrit ? '/NoCri1' : '/NoRed1'}/${d}.png`}
          alt={d}
          className="inline-block w-[3rem] h-[3rem]"
          draggable="false"
        />
      ))}
    </div>
  );
}
