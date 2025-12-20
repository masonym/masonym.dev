'use client';

import React, { memo, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import FamiliarHoverCard from './FamiliarHoverCard';

const FamiliarCard = ({ familiar }) => {
  const [showHover, setShowHover] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const cardRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const cardIcon = familiar.Cards?.[0]?.Icon;

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        setAnchorRect(cardRef.current.getBoundingClientRect());
        setShowHover(true);
      }
    }, 100);
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowHover(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    setIsTouchDevice(true);
    e.preventDefault();
    if (cardRef.current) {
      setAnchorRect(cardRef.current.getBoundingClientRect());
      setShowHover(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setShowHover(false);
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className="
          relative group
          bg-[var(--background-dim)] hover:bg-[var(--background-bright)]
          border border-[var(--primary-dim)]/30 hover:border-[var(--secondary)]/50
          rounded-lg overflow-hidden
          transition-all duration-200
          cursor-pointer
        "
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        <div className="relative aspect-[3/4] bg-[var(--background-bright)]">
          {cardIcon && !imgError ? (
            <Image
              src={`/familiar_data/${cardIcon}`}
              alt={familiar.MobName}
              fill
              className="object-contain p-1"
              onError={() => setImgError(true)}
              unoptimized
              sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 10vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--primary-dim)] text-xs text-center p-2">
              {familiar.MobName}
            </div>
          )}
        </div>

        <div className="p-2">
          <p className="text-xs text-[var(--primary)] truncate font-medium">
            {familiar.MobName}
          </p>
          <p className="text-[10px] text-[var(--primary-dim)]">
            Lv. {familiar.Level}
          </p>
        </div>

        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-[var(--secondary)]" />
        </div>
      </div>

      {showHover && (
        <FamiliarHoverCard
          familiar={familiar}
          anchorRect={anchorRect}
          onClose={handleClose}
          isTouchDevice={isTouchDevice}
        />
      )}
    </>
  );
};

export default memo(FamiliarCard);
