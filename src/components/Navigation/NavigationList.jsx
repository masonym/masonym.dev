import React from "react";
import Link from "next/link";
import Image from "next/image";

const NavigationList = ({ items, showImages = false, alignItemsProp = 'flex-start', flexDirectionProp = "column" }) => {
    return (
        <ul style={{
            display: 'flex',
            alignItems: alignItemsProp,
            flexDirection: flexDirectionProp
        }}>
            {items.map((item, index) => (
                <li key={index}>
                    {showImages && item.image && (
                        <Image
                            src={item.image}
                            alt={item.name}
                            width={32}
                            height={32}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Link href={item.href}>{item.name}</Link>
                </li>
            ))}
        </ul>
    );
};

export default NavigationList;