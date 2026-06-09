import React, { memo } from "react";
import Image from "next/image";
import { tradabilityBadges } from "../data/tradability";

const ICON_DIR = "/images/event-rewards";

const convertNewlines = (text) =>
    (text || "")
        .replace(/\\n/g, "\n")
        .split("\n")
        .map((line, i, arr) => (
            <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
            </React.Fragment>
        ));

const RewardSlotHover = ({ slot, position, isTouchDevice, hoverCardRef, onClose }) => {
    const { item, itemID, count } = slot;
    const name = item?.name || `Item #${itemID}`;
    const badges = tradabilityBadges(item?.tradability);

    const hoverCardStyle = isTouchDevice
        ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-h-[90vh] z-[1000]"
        : "absolute z-[1000] pointer-events-none max-w-[35%] lg:max-w-[28rem] min-w-[18rem]";
    const hoverCardPosition = isTouchDevice
        ? {}
        : { left: `${position.x}px`, top: `${position.y}px` };

    return (
        <div
            ref={hoverCardRef}
            className={`bg-background-dim border border-primary-dim text-primary-bright rounded-lg p-4 shadow-lg font-maplestory font-light overflow-y-auto ${hoverCardStyle}`}
            style={hoverCardPosition}
        >
            {isTouchDevice && (
                <button
                    className="absolute top-2.5 right-2.5 bg-none border-none text-primary-bright text-2xl cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose?.();
                    }}
                >
                    &times;
                </button>
            )}

            <p className="text-[1.15em] text-primary-bright">
                {name}
                {count > 1 ? ` (x${count})` : ""}
            </p>
            <p className="text-[0.75em] text-primary-dim mb-2">
                ID {itemID}
                {item?.category ? ` • ${item.category}` : ""}
            </p>

            <div className="flex items-start mb-2.5">
                <div
                    className="relative flex items-center justify-center bg-background-bright border border-primary-dim/40 rounded-md"
                    style={{ width: "72px", height: "72px" }}
                >
                    <Image
                        src={`${ICON_DIR}/${itemID}.png`}
                        alt={name}
                        width={56}
                        height={56}
                        className="object-contain"
                        onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                        }}
                    />
                </div>
                <p className="ml-4 flex-1 text-sm text-primary whitespace-pre-line">
                    {convertNewlines(item?.desc)}
                </p>
            </div>

            {badges.length > 0 && (
                <>
                    <hr className="border-t border-dotted border-primary-dim my-2" />
                    <div className="flex flex-wrap gap-1.5">
                        {badges.map((label) => (
                            <span
                                key={label}
                                className="text-[0.7em] px-2 py-0.5 rounded-full bg-background-bright text-primary border border-primary-dim/40"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default memo(RewardSlotHover);
