import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import AdvancedItemCardHover from './AdvancedItemCardHover';
import { formatNumber } from '@/utils';
import background from '../assets/productBg.png';

const CLOUDFRONT_URL = "https://dkxt2zgwekugu.cloudfront.net/images";

const AdvancedItemCard = ({ item, isOpen, onItemClick, isTouchDevice }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const hoverCardRef = useRef(null);

    const handleMouseEnter = () => {
        if (!isTouchDevice) {
            setIsHovering(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isTouchDevice) {
            setIsHovering(false);
        }
    };

    const handleMouseMove = (e) => {
        if (!isTouchDevice) {
            updateHoverPosition(e.pageX, e.pageY);
        }
    };

    const handleClick = (e) => {
        if (isTouchDevice) {
            e.preventDefault();
            e.stopPropagation();  // Stop the event from bubbling up to the parent elements
            onItemClick();
        }
    };

    const updateHoverPosition = useCallback((pageX, pageY) => {
        const hoverCardWidth = hoverCardRef.current ? hoverCardRef.current.offsetWidth : 0;
        const hoverCardHeight = hoverCardRef.current ? hoverCardRef.current.offsetHeight : 0;
        const offsetX = 10;
        const offsetY = 10;

        let newX = pageX + offsetX;
        const newY = Math.min(pageY + offsetY, window.innerHeight + window.scrollY - hoverCardHeight - offsetY);

        if (newX + hoverCardWidth > window.innerWidth + window.scrollX) {
            newX = pageX - hoverCardWidth - offsetX;
        }

        setHoverPosition({ x: newX, y: newY });
    }, []);

    return (
        <li
            className="list-none m-[0.5%] p-0 flex flex-col items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <div
                className="flex flex-col items-center justify-start w-[178.5px] h-[234px] bg-no-repeat bg-cover relative pt-[2rem]"
                style={{ backgroundImage: `url(${background.src})` }}
            >
                <Image
                    src={`${CLOUDFRONT_URL}/${item.itemID}.png`}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="w-[40%] h-[40%] object-contain absolute top-[46%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    priority
                />
                <div className="relative top-[60%] w-[95%] text-center">
                    <p className="text-[13.5px] m-0 px-[5%] leading-[1.2em] h-[2.4em] max-h-[2.4em] overflow-hidden text-black">
                        {item.name}{item.count > 1 ? ` (x${item.count})` : ''}
                    </p>
                    <p className="text-[12px] text-[#8e8e8e] m-0 pt-[0.25em]">
                        {formatNumber(item.price)}
                        {item.sn_id.toString().startsWith('870') ? ' Mesos' : ' NX'}
                        {item.discount == 1 ? (
                            <>
                                <br />
                                <s>{formatNumber(item.originalPrice)}{item.sn_id.toString().startsWith('870') ? ' Mesos' : ' NX'}</s>
                            </>
                        ) : null}
                    </p>
                </div>
            </div>
            {(isHovering || (isTouchDevice && isOpen)) && (
                <AdvancedItemCardHover
                    item={item}
                    position={hoverPosition}
                    isTouchDevice={isTouchDevice}
                    hoverCardRef={hoverCardRef}
                    onClose={onItemClick}
                />
            )}
        </li>
    );
};

export default AdvancedItemCard;