"use client";

import React, { useState } from "react";
import { ListFilter } from 'lucide-react';
import { ListCollapse } from "lucide-react";
import cursorClick from '@/assets/cursorClick.png';

const Collapsible = ({ title, children, isOpenDefault = true }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div
                onClick={toggleOpen}
                style={{
                    cursor: `url(${cursorClick.src}), auto`,
                    fontWeight: "bold",
                    marginBottom: "5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--primary-bright)"
                }}
            >
                {isOpen ? <ListFilter /> : <ListCollapse />} {title}
            </div>
            {isOpen && <div style={{ paddingLeft: "20px" }}>{children}</div>}
        </div>
    );
};

export default Collapsible;