import React from 'react';
import { convertNewlinesToBreaks, magicText } from '@/utils';
import itemBase from '../assets/itemBase.png';
import Image from 'next/image';

const CLOUDFRONT_URL = "https://dkxt2zgwekugu.cloudfront.net/images";

const AdvancedPackageContents = ({ contents }) => {
    if (!contents || !Array.isArray(contents)) return null;

    return (
        <ul className="pl-0 list-none">
            <li className="py-1">
                <strong>Includes:</strong>
                <ul className="pl-0 list-none">
                    {contents.map((itemDetails, index) => {
                        const countText = itemDetails.count > 1 ? ` (x${itemDetails.count})` : '';
                        return (
                            <li
                                key={index}
                                className="p-1.5 mb-1.5 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-2">


                                    <div className="relative flex-shrink-0 gap" style={{ width: '64px', height: '64px' }}>
                                        <Image
                                            src={itemBase.src}
                                            alt="Item Base"
                                            fill
                                            sizes='(max-width: 64px)'
                                            className="object-contain"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Image
                                                src={`${CLOUDFRONT_URL}/${itemDetails.itemID}.png`}
                                                alt={itemDetails.name}
                                                fill
                                                sizes='(max-width: 64px)'
                                                className="object-contain p-2"
                                            />
                                        </div>
                                    </div>


                                    <div>
                                        <p className="text-white"><strong>{itemDetails.name}{countText}</strong></p>
                                        {itemDetails.description && <p className="italic text-white">{convertNewlinesToBreaks(itemDetails.description)}</p>}
                                        <p className="text-white">{magicText(itemDetails.itemID)} Duration: {itemDetails.period === '0' ? 'Permanent' : `${itemDetails.period} days`}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </li>
        </ul>
    );
};

export default AdvancedPackageContents;