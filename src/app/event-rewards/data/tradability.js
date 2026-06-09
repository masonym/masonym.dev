// Renders the tradability flag dict (from event_rewards.json item.tradability)
// into a small ordered list of human-readable badges.

const FLAG_LABELS = [
    { key: "tradeBlock", on: 1, label: "Untradeable" },
    { key: "accountSharable", on: 1, label: "Account shareable" },
    { key: "sharableOnce", on: 1, label: "Shareable once" },
    { key: "quest", on: 1, label: "Quest item" },
    { key: "only", on: 1, label: "Unique equipped" },
    { key: "notSale", on: 1, label: "Cannot sell" },
    { key: "noDrop", on: 1, label: "Cannot drop" },
    { key: "noMoveToLocker", on: 1, label: "Cannot move to locker" },
    { key: "noCancelMouse", on: 1, label: "No cancel" },
];

export const tradabilityBadges = (tradability) => {
    if (!tradability) return [];
    return FLAG_LABELS
        .filter(({ key, on }) => tradability[key] === on)
        .map(({ label }) => label);
};
