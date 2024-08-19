import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from '@/app/page.module.css'

const NavigationList = ({ items, showImages = false, alignItemsProp = 'flex-start', flexDirectionProp = "column", rowGapProp = 0 }) => {
    return (
        <ul style={{
            display: 'flex',
            alignItems: alignItemsProp,
            flexDirection: flexDirectionProp,
            justifyContent: "flex-start",
            flexWrap: 'wrap',
            rowGap: rowGapProp
        }}>
            {items.map((item, index) => (
                <Link href={item.href}>
                    <li key={index} className={styles.pageButton}>
                        {showImages && item.image && (
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={0}
                                height={0}
                                unoptimized
                                style={{ marginRight: 32, width: '32px', height: 'auto' }} // optional
                            />
                        )}
                        {item.name}
                    </li>
                </Link>
            ))
            }
        </ul >
    );
};

export default NavigationList;