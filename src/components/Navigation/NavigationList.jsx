import React from "react";
import Link from "next/link";
import Image from "next/image";

const NavigationList = ({ items, onClose, showImages = false, alignItemsProp = 'flex-start', flexDirectionProp = "column", rowGapProp = 0 }) => {
    return (
        <ul className={`flex items-${alignItemsProp} flex-${flexDirectionProp} justify-start flex-wrap gap-4`} style={{ rowGap: rowGapProp }}>
            {items.map((item, index) => (
                <Link key={item.href} href={item.href} onClick={onClose}>
                    <li className="flex items-center py-4 pl-2 h-16 pr-8 hover:bg-primary-dark hover:rounded-lg">
                        {showImages && item.image && (
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={32}
                                height={32}
                                className="mr-8"
                                unoptimized
                            />
                        )}
                        {item.name}
                    </li>
                </Link>
            ))}
        </ul>
    );
};

export default NavigationList;