// Per-event display config.
//
// Each entry maps an `event_id` (matching the key in event_rewards.json)
// to a display name and an ordered list of sections.
//
// A section matches reward slots using ONE of these strategies:
//   - { slotRange: [start, end] }  — inclusive slot index range; matches
//     "itemslot:N" where N is in [start, end]. Suffixed variants like
//     "itemslot:1_1" inherit the same primary index (1).
//   - { parentPath: "combat/childWnd:1" } — exact match on parent_path.
//   - { slotNames: ["itemslot:0", "itemslot:1"] } — explicit allowlist.
//   - { include: (slot) => boolean } — custom predicate (advanced).
//
// Events not listed here render with auto-grouping by parent_path.

export const eventSections = {
    ErelLight_Pass: {
        name: "Erel Light Pass",
        sections: [
            { name: "Regular Rewards", slotRange: [0, 14] },
            { name: "Premium Rewards", slotRange: [15, 29] },
            { name: "Power of Time", slotRange: [30, 32] },
            { name: "Power of Fate", slotRange: [33, 35] },
            { name: "Power of Life", slotRange: [36, 38] },
            { name: "Fashion Pass", slotRange: [39, 52] },
        ],
    },
    "2512ChallengersPartner": {
        name: "Challenger's Partner",
        sections: [
            { name: "Will (Hard)", parentPath: "combat/childWnd:1" },
            { name: "Verus Hilla (Hard)", parentPath: "combat/childWnd:2" },
            { name: "Lucid (Hard)", parentPath: "combat/childWnd:3" },
            { name: "Damien (Hard)", parentPath: "combat/childWnd:4" },
            { name: "Lotus (Hard)", parentPath: "combat/childWnd:5" },
        ],
    },
    GenesisPass: { name: "Genesis Pass" },
    ChallengersMain: {
        name: "Challenger World",
        sections: [
            { name: "Regular Rewards", parentPath: "scrollBox:0/rewardSlot/general" },
            { name: "Premium Rewards", parentPath: "scrollBox:0/rewardSlot/special" },
        ],
    },
    "2512Kinetic": { name: "Kinesis Remaster" },
    "2512momentumPassS1": {
        name: "Momentum Pass S1",
        sections: [
            { name: "Regular Rewards", parentPath: "scrollBox:0/rewardSlot/general" },
            { name: "Premium Rewards", parentPath: "scrollBox:0/rewardSlot/special" },
        ],
    },
    "2601momentumPassS2": {
        name: "Momentum Pass S2",
        sections: [
            { name: "Regular Rewards", parentPath: "scrollBox:0/rewardSlot/general" },
            { name: "Premium Rewards", parentPath: "scrollBox:0/rewardSlot/special" },
        ],
    },
    "2601burningExpress": {
        name: "Burning Express",
        sections: [
            { name: "Regular Rewards", parentPath: "scrollBox:0/rewardSlot/general" },
            { name: "Premium Rewards", parentPath: "scrollBox:0/rewardSlot/special" },
        ],
    },
    "2602FrontierPassS2": {
        name: "Frontier Pass S2",
        sections: [
            { name: "Regular Rewards", parentPath: "scrollBox:0/rewardSlot/general" },
            { name: "Premium Rewards", parentPath: "scrollBox:0/rewardSlot/special" },
        ],
    },
    "2512Fantasia": {
        name: "Tallahart Fantasia (Check-in Event)",
        sections: [
            { name: "Daily Check-In", parentPath: "dlgtab:tab/dlgTabInfo/0" },
            { name: "Event Track", parentPath: "dlgtab:tab/dlgTabInfo/0/itemSlot" },
        ],
    },
    "2512ChallengersDuo": { name: "Challenger Duo" },
};

// ---- runtime helpers ----

const primaryIndex = (slotName) => {
    const m = /^itemslot:(\d+)/.exec(slotName || "");
    return m ? Number(m[1]) : null;
};

const matchesSection = (slot, section) => {
    if (section.include) return !!section.include(slot);
    if (section.slotNames) return section.slotNames.includes(slot.slot);
    if (section.parentPath != null) return slot.parent_path === section.parentPath;
    if (section.slotRange) {
        const idx = primaryIndex(slot.slot);
        if (idx == null) return false;
        const [lo, hi] = section.slotRange;
        return idx >= lo && idx <= hi;
    }
    return false;
};

// Returns an array of { name, slots }. For events with no manual config,
// auto-groups by parent_path; if every slot shares the same parent_path,
// returns a single un-named section.
export const groupRewards = (eventId, eventData) => {
    const rewards = eventData?.rewards ?? [];
    const cfg = eventSections[eventId];

    if (cfg?.sections?.length) {
        const groups = cfg.sections.map((sec) => ({
            name: sec.name,
            slots: rewards.filter((r) => matchesSection(r, sec)),
        }));
        const claimed = new Set();
        groups.forEach((g) => g.slots.forEach((s) => claimed.add(s)));
        const leftover = rewards.filter((r) => !claimed.has(r));
        if (leftover.length) groups.push({ name: "Other", slots: leftover });
        return groups.filter((g) => g.slots.length > 0);
    }

    const byParent = new Map();
    for (const r of rewards) {
        const key = r.parent_path || "";
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key).push(r);
    }
    if (byParent.size <= 1) {
        return [{ name: null, slots: rewards }];
    }
    return Array.from(byParent.entries()).map(([parentPath, slots]) => ({
        name: parentPath || "(root)",
        slots,
    }));
};

export const displayName = (eventId) => eventSections[eventId]?.name || eventId;
