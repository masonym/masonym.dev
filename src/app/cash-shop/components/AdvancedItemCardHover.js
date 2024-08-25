import React, { memo } from 'react';
import Image from 'next/image';
import { formatPriceDisplay, convertNewlinesToBreaks, formatSaleTimesDate, calculateDateDifference, magicText, worldNumbersToString } from '@/utils';
import AdvancedPackageContents from './AdvancedPackageContents';
import itemBase from '../assets/itemBase.png';

const CLOUDFRONT_URL = "https://dkxt2zgwekugu.cloudfront.net/images";

const AdvancedItemCardHover = ({ itemKey, item, position, isTouchDevice, hoverCardRef, onClose }) => {
    const hoverCardStyle = isTouchDevice ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-h-[90vh] z-[1000]" : "absolute z-[1000] pointer-events-none max-w-[35%] lg:max-w-[50%] min-w-[25%]";
    const hoverCardPosition = isTouchDevice ? {} : { left: `${position.x}px`, top: `${position.y}px` };

    return (
        <div
            ref={hoverCardRef}
            className={`bg-black bg-opacity-85 border border-gray-200 rounded-lg p-4 shadow-lg font-maplestory font-light overflow-y-auto ${hoverCardStyle}`}
            style={hoverCardPosition}
        >
            {isTouchDevice && (
                <button
                    className="absolute top-2.5 right-2.5 bg-none border-none text-white text-2xl cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    &times;
                </button>
            )}
            <p className="text-[1.15em] text-white">{item.name}{item.count > 1 ? ` (x${item.count})` : ''}</p>
            <div className="text-center my-2.5">
                <p className="text-orange-500">{formatSaleTimesDate(item.termStart)} ~ {formatSaleTimesDate(item.termEnd)} UTC</p>
                <p className="text-orange-500">({calculateDateDifference(item.termStart, item.termEnd)})</p>
            </div>
            <p className="text-white">{magicText(item.itemID)}Duration: {item.period === '0' ? 'Permanent' : `${item.period} days`}</p>
            <div className="flex items-start mb-2.5">
                <div className="relative flex items-center justify-center" style={{ width: '128px', height: '128px' }}>
                    <Image
                        src={itemBase.src}
                        alt="Item Base"
                        layout="fill"
                        className="object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                            src={`${CLOUDFRONT_URL}/${item.itemID}.png`}
                            alt={item.name}
                            layout="intrinsic"
                            width={80} // Adjust width as needed
                            height={80} // Adjust height as needed
                            className="object-contain"
                        />
                    </div>
                </div>
                <p className="ml-4 flex-1 text-sm text-white">{convertNewlinesToBreaks(item.description)}</p>
            </div>
            <AdvancedPackageContents contents={item.packageContents} />
            <hr className="border-t-2 border-dotted border-gray-200 my-[2.5%]" />
            <p className="text-white">
                {formatPriceDisplay(item.originalPrice, item.price, item.sn_id, item.discount)}
            </p>
            <p className="text-white mt-2.5">
                {worldNumbersToString(item.gameWorld)}
            </p>
        </div>
    );
};

export default memo(AdvancedItemCardHover);