'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

const ELEMENT_COLORS = {
  N: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
  F: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  I: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  P: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  D: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  H: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  L: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
};

const TYPE_COLORS = {
  1: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  2: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  3: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  4: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  5: { bg: 'bg-lime-500/20', text: 'text-lime-400' },
  6: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
  7: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  8: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
};

const FamiliarHoverCard = ({ familiar, anchorRect, onClose, isTouchDevice = false }) => {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!anchorRect || isTouchDevice) return;

    const updatePosition = () => {
      const cardEl = cardRef.current;
      if (!cardEl) return;

      const cardRect = cardEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 12;

      let x = anchorRect.right + padding;
      let y = anchorRect.top;

      if (x + cardRect.width > viewportWidth - padding) {
        x = anchorRect.left - cardRect.width - padding;
      }

      if (x < padding) {
        x = padding;
      }

      if (y + cardRect.height > viewportHeight - padding) {
        y = viewportHeight - cardRect.height - padding;
      }

      if (y < padding) {
        y = padding;
      }

      setPosition({ x, y });
      setIsPositioned(true);
    };

    requestAnimationFrame(updatePosition);
  }, [anchorRect, isTouchDevice]);

  const elementStyle = ELEMENT_COLORS[familiar.ElementCode] || ELEMENT_COLORS.N;
  const typeStyle = TYPE_COLORS[familiar.TypeId] || TYPE_COLORS[1];

  const content = (
    <div
      ref={cardRef}
      className={`
        ${isTouchDevice 
          ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-[1000]' 
          : 'fixed z-[1000] pointer-events-none w-72'
        }
        bg-[var(--background-dim)] border border-[var(--primary-dim)] rounded-xl shadow-2xl
        transition-opacity duration-150
        ${isPositioned || isTouchDevice ? 'opacity-100' : 'opacity-0'}
      `}
      style={isTouchDevice ? {} : { left: `${position.x}px`, top: `${position.y}px` }}
    >
      {isTouchDevice && (
        <button
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-[var(--primary)] hover:text-[var(--primary-bright)] text-2xl z-10"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          ×
        </button>
      )}

      <div className="relative h-32 bg-[var(--background-bright)] rounded-t-xl overflow-hidden">
        {!imgError ? (
          <Image
            src={`/familiar_data/${familiar.JumpImage}`}
            alt={familiar.MobName}
            fill
            className="object-contain p-2"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--primary-dim)]">
            No Image
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-bright)] leading-tight">
            {familiar.MobName}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--background-bright)] rounded-lg p-2 text-center">
            <div className="text-xs text-[var(--primary-dim)] uppercase tracking-wide">Level</div>
            <div className="text-lg font-bold text-[var(--secondary)]">{familiar.Level}</div>
          </div>

          <div className={`rounded-lg p-2 text-center border ${elementStyle.bg} ${elementStyle.border}`}>
            <div className="text-xs text-[var(--primary-dim)] uppercase tracking-wide">Element</div>
            <div className="flex items-center justify-center gap-2 mt-1">
              {familiar.ElementCode !== 'all' && (
                <Image 
                  src={`/familiar_data/familiars/types/${familiar.ElementName.toLowerCase()}.png`} 
                  alt={familiar.ElementName} 
                  width={20} 
                  height={20} 
                  className="w-5 h-5" 
                />
              )}
              <div className={`text-lg font-bold ${elementStyle.text}`}>{familiar.ElementName}</div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-2 text-center ${typeStyle.bg}`}>
          <div className="text-xs text-[var(--primary-dim)] uppercase tracking-wide">Type</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Image 
              src={`/familiar_data/familiars/elements/${familiar.TypeName.toLowerCase()}.png`} 
              alt={familiar.TypeName} 
              width={20} 
              height={20} 
              className="w-5 h-5" 
            />
            <div className={`text-base font-bold ${typeStyle.text}`}>{familiar.TypeName}</div>
          </div>
        </div>

      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {isTouchDevice && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999]" 
          onClick={onClose}
        />
      )}
      {content}
    </>,
    document.body
  );
};

export default memo(FamiliarHoverCard);
