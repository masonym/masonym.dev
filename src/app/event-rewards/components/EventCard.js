"use client";

import React, { useState } from "react";
import RewardSlot from "./RewardSlot";
import { groupRewards } from "../data/sections";

const slotKey = (eventId, slot) => `${eventId}::${slot.parent_path}/${slot.slot}::${slot.itemID}`;

const EventCard = ({ eventId, name, details, eventData, isTouchDevice }) => {
    const [openSlotKey, setOpenSlotKey] = useState(null);
    const groups = groupRewards(eventId, eventData);
    const hasDetails = details?.premiumCost || details?.startDate || details?.endDate;

    if (groups.length === 0) return null;

    return (
        <section className="my-8 px-4">
            <header className="mb-3">
                <h2 className="text-2xl font-bold text-primary-bright">{name}</h2>
                {hasDetails && (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-dim">
                        {details.startDate && (
                            <span>
                                Starts: <span className="text-primary">{details.startDate}</span>
                            </span>
                        )}
                        {details.endDate && (
                            <span>
                                Ends: <span className="text-primary">{details.endDate}</span>
                            </span>
                        )}
                        {details.premiumCost && (
                            <span>
                                Premium: <span className="text-primary">{details.premiumCost}</span>
                            </span>
                        )}
                    </div>
                )}
            </header>

            <div className="space-y-5">
                {groups.map((group, gi) => (
                    <div key={`${eventId}-${gi}-${group.name ?? "_"}`}>
                        {group.name && (
                            <h3 className="text-sm uppercase tracking-wide text-primary mb-2 border-b border-primary-dim/30 pb-1">
                                {group.name}
                            </h3>
                        )}
                        <ul className="flex flex-wrap items-start">
                            {group.slots.map((slot) => {
                                const key = slotKey(eventId, slot);
                                return (
                                    <RewardSlot
                                        key={key}
                                        slot={slot}
                                        isOpen={openSlotKey === key}
                                        onSlotClick={() => setOpenSlotKey(openSlotKey === key ? null : key)}
                                        isTouchDevice={isTouchDevice}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EventCard;
