import React from "react";
import Link from "next/link";
import Image from "next/image";

const NavigationList = ({ items, onClose, layout = "row" }) => {
    const containerClasses = {
        row: "flex flex-row flex-wrap gap-2 w-full",
        column: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full"
    };

    const itemClasses = {
        row: "flex items-center px-4 py-2 hover:bg-primary-dark hover:rounded-lg transition-colors duration-200",
        column: "flex flex-col items-center p-4 hover:bg-primary-dark hover:rounded-lg transition-colors duration-200 text-center"
    };

    const imageWrapperClasses = {
        row: "w-6 h-6 relative flex-shrink-0",
        column: "w-12 h-12 relative flex-shrink-0 mb-2"
    };

    return (
        <ul className={containerClasses[layout]}>
            {items.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose} className={layout === "column" ? "w-full" : ""}>
                    <li className={itemClasses[layout]}>
                        <div className={layout === "row" ? "flex items-center gap-3" : "flex flex-col items-center"}>
                            {item.image && (
                                <div className={imageWrapperClasses[layout]}>
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            )}
                            <span>{item.name}</span>
                        </div>
                    </li>
                </Link>
            ))}
        </ul>
    );
};

export default NavigationList;