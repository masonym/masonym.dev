"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import RewardSlotHover from "./RewardSlotHover";

const ICON_DIR = "/images/event-rewards";

const RewardSlot = ({ slot, isOpen, onSlotClick, isTouchDevice }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const hoverCardRef = useRef(null);

    const updateHoverPosition = useCallback((pageX, pageY) => {
        const w = hoverCardRef.current?.offsetWidth || 0;
        const h = hoverCardRef.current?.offsetHeight || 0;
        const offset = 12;

        let newX = pageX + offset;
        const newY = Math.min(pageY + offset, window.innerHeight + window.scrollY - h - offset);
        if (newX + w > window.innerWidth + window.scrollX) {
            newX = pageX - w - offset;
        }
        setHoverPosition({ x: newX, y: newY });
    }, []);

    const handleMouseEnter = () => {
        if (!isTouchDevice) setIsHovering(true);
    };
    const handleMouseLeave = () => {
        if (!isTouchDevice) setIsHovering(false);
    };
    const handleMouseMove = (e) => {
        if (!isTouchDevice) updateHoverPosition(e.pageX, e.pageY);
    };
    const handleClick = (e) => {
        if (isTouchDevice) {
            e.preventDefault();
            e.stopPropagation();
            onSlotClick?.();
        }
    };

    const name = slot.item?.name || `Item #${slot.itemID}`;
    const count = slot.count || 1;

    return (
        <li
            className="list-none m-1 flex flex-col items-center cursor-default w-[5.5rem]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <div className="relative w-16 h-16 rounded-md bg-background-bright border border-primary-dim/40 flex items-center justify-center">
                <Image
                    src={`${ICON_DIR}/${slot.itemID}.png`}
                    alt={name}
                    width={48}
                    height={48}
                    className="object-contain"
                    onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                    }}
                />
                {count > 1 && (
                    <span className="absolute bottom-0 right-0 text-[10px] leading-none px-1 py-[1px] rounded bg-background-dim text-primary-bright border border-primary-dim/40 font-bold">
                        x{count}
                    </span>
                )}
            </div>
            <p className="mt-1 w-full h-16 text-[11px] leading-tight text-center text-primary">
                {name}
            </p>

            {(isHovering || (isTouchDevice && isOpen)) && (
                <RewardSlotHover
                    slot={slot}
                    position={hoverPosition}
                    isTouchDevice={isTouchDevice}
                    hoverCardRef={hoverCardRef}
                    onClose={onSlotClick}
                />
            )}
        </li>
    );
};

export default RewardSlot;
