"use client";

import React, { useEffect, useMemo, useState } from "react";
import EventCard from "./EventCard";
import RewardSlot from "./RewardSlot";
import { displayName, eventDetails, eventSections } from "../data/sections";

const EventRewardsList = ({ events }) => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showAggregatedRewards, setShowAggregatedRewards] = useState(false);
    const [openSlotKey, setOpenSlotKey] = useState(null);

    const handleSummaryClick = (eventId) => {
        setShowAggregatedRewards(false);
        window.requestAnimationFrame(() => {
            document.getElementById(`event-${eventId}`)?.scrollIntoView({ behavior: "smooth" });
        });
    };

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

    const eventSummaries = useMemo(() => {
        return ordered.map((eventId) => ({
            eventId,
            name: displayName(eventId),
            details: eventDetails(eventId),
            sectionNames: eventSections[eventId]?.sections?.map((section) => section.name) ?? [],
        }));
    }, [ordered]);

    const aggregatedRewards = useMemo(() => {
        const byItemId = new Map();
        for (const eventId of ordered) {
            for (const reward of events[eventId]?.rewards ?? []) {
                const existing = byItemId.get(reward.itemID);
                if (existing) {
                    existing.count += reward.count || 1;
                } else {
                    byItemId.set(reward.itemID, {
                        ...reward,
                        slot: `aggregated:${reward.itemID}`,
                        parent_path: "aggregated",
                        count: reward.count || 1,
                    });
                }
            }
        }
        return Array.from(byItemId.values()).sort((a, b) => {
            const aName = a.item?.name || "";
            const bName = b.item?.name || "";
            return aName.localeCompare(bName) || a.itemID - b.itemID;
        });
    }, [events, ordered]);

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
                Reward slots dumped from Wz files. Hover an icon for details. Not sure how to see Heroic vs. Interactive rewards yet :)
            </p>

            <div className="max-w-6xl w-full mx-auto">
                <section className="mx-4 mb-8 rounded-lg border border-primary-dim/30 bg-background-bright/30 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-primary-bright">Event Summary</h2>
                            <p className="mt-1 text-sm text-primary-dim">
                                {ordered.length} events, {aggregatedRewards.length} unique reward items.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="rounded-md border border-primary-dim/50 px-4 py-2 text-sm font-semibold text-primary-bright hover:bg-primary-dim/10"
                            onClick={() => {
                                setOpenSlotKey(null);
                                setShowAggregatedRewards((value) => !value);
                            }}
                        >
                            {showAggregatedRewards ? "Show Events" : "Show Total Rewards"}
                        </button>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {eventSummaries.map(({ eventId, name, details, sectionNames }) => (
                            <button
                                key={eventId}
                                type="button"
                                className="rounded-md border border-primary-dim/20 p-3 text-left transition hover:border-primary-dim/60 hover:bg-primary-dim/10"
                                onClick={() => handleSummaryClick(eventId)}
                            >
                                <h3 className="font-semibold text-primary-bright">{name}</h3>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-primary-dim">
                                    {details.startDate && <span>Starts: {details.startDate}</span>}
                                    {details.endDate && <span>Ends: {details.endDate}</span>}
                                    {details.premiumCost && <span>Premium: {details.premiumCost}</span>}
                                </div>
                                {sectionNames.length > 0 && (
                                    <p className="mt-2 text-xs text-primary-dim">
                                        {sectionNames.join(", ")}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {showAggregatedRewards ? (
                    <section className="my-8 px-4">
                        <header className="mb-3">
                            <h2 className="text-2xl font-bold text-primary-bright">Total Rewards</h2>
                            <p className="mt-1 text-sm text-primary-dim">
                                Combined totals across every listed event.
                            </p>
                        </header>
                        <ul className="flex flex-wrap items-start">
                            {aggregatedRewards.map((slot) => {
                                const key = `aggregated::${slot.itemID}`;
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
                    </section>
                ) : (
                    ordered.map((eventId) => (
                        <EventCard
                            key={eventId}
                            eventId={eventId}
                            name={displayName(eventId)}
                            details={eventDetails(eventId)}
                            eventData={events[eventId]}
                            isTouchDevice={isTouchDevice}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default EventRewardsList;
