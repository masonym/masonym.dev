"use client";

import React, { useEffect, useMemo, useState } from "react";
import EventCard from "./EventCard";
import { displayName, eventSections } from "../data/sections";

const EventRewardsList = ({ events }) => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
        }
    }, []);

    const ordered = useMemo(() => {
        const ids = Object.keys(events || {});
        const mappedOrder = Object.keys(eventSections);
        ids.sort((a, b) => {
            const ai = mappedOrder.indexOf(a);
            const bi = mappedOrder.indexOf(b);
            if (ai === -1 && bi === -1) return a.localeCompare(b);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });
        return ids;
    }, [events]);

    if (ordered.length === 0) {
        return (
            <div className="px-4 py-16 text-center text-primary-dim">
                <p>No event data loaded yet.</p>
                <p className="text-xs mt-2">
                    Drop <code>event_rewards.json</code> into{" "}
                    <code>src/app/event-rewards/data/</code> and icons into{" "}
                    <code>public/images/event-rewards/</code>.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-dvh pb-20">
            <h1 className="text-center text-3xl font-bold mt-16 mb-2 text-primary-bright">
                Event Rewards
            </h1>
            <p className="text-center text-sm italic text-primary-dim mb-6 px-4">
                Reward slots dumped from Wz files. Hover an icon for details. Not sure what the Bonus Brights will be replaced with in the Frontier pass.
            </p>

            <div className="max-w-6xl w-full mx-auto">
                {ordered.map((eventId) => (
                    <EventCard
                        key={eventId}
                        eventId={eventId}
                        name={displayName(eventId)}
                        eventData={events[eventId]}
                        isTouchDevice={isTouchDevice}
                    />
                ))}
            </div>
        </div>
    );
};

export default EventRewardsList;
