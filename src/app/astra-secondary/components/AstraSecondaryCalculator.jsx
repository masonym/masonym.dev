"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Check, Pencil } from "lucide-react";

const STORAGE_KEY = "astraSecondaryState";
const PRESETS_STORAGE_KEY = "astraSecondaryPresets";
const PRESET_COUNT = 3;

// Astra Subweapon Mission Requirements
const MISSIONS = [
  {
    id: 1,
    name: "1st Mission",
    description: "Initial Awakening",
    tracesRequired: 600,
    fragmentsRequired: 3000,
  },
  {
    id: 2,
    name: "2nd Mission",
    description: "The True Nature of Erion",
    tracesRequired: 600,
    fragmentsRequired: 3000,
  },
  {
    id: 3,
    name: "3rd Mission",
    description: "Final Enhancement",
    tracesRequired: 800,
    fragmentsRequired: 4000,
  },
];

// Fierce Battle Traces acquisition data
// voucherCount = tickets that drop per kill, voucherValue = fragments per ticket
const TRACES_BOSS_DATA = [
  {
    id: "seren",
    name: "Chosen Seren",
    difficulties: [
      { name: "Normal", traces: 6, hasVoucher: false },
      { name: "Hard", traces: 15, hasVoucher: false },
      {
        name: "Extreme",
        traces: 180,
        hasVoucher: true,
        voucherCount: 6,
        voucherValue: 5,
      },
    ],
  },
  {
    id: "kalos",
    name: "Watcher Kalos",
    difficulties: [
      { name: "Easy", traces: 6, hasVoucher: false },
      { name: "Normal", traces: 30, hasVoucher: false },
      { name: "Chaos", traces: 100, hasVoucher: false },
      {
        name: "Extreme",
        traces: 500,
        hasVoucher: true,
        voucherCount: 6,
        voucherValue: 30,
      },
    ],
  },
  {
    id: "first_adversary",
    name: "First Adversary",
    maxPartySize: 3,
    difficulties: [
      { name: "Easy", traces: 10, hasVoucher: false },
      { name: "Normal", traces: 40, hasVoucher: false },
      {
        name: "Hard",
        traces: 180,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 10,
      },
      {
        name: "Extreme",
        traces: 540,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 80,
      },
    ],
  },
  {
    id: "malefic_star",
    name: "Malefic Star",
    maxPartySize: 3,
    difficulties: [
      { name: "Normal", traces: 60, hasVoucher: false },
      {
        name: "Hard",
        traces: 240,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 30,
      },
    ],
  },
  {
    id: "kaling",
    name: "Kaling",
    difficulties: [
      { name: "Easy", traces: 20, hasVoucher: false },
      { name: "Normal", traces: 80, hasVoucher: false },
      {
        name: "Hard",
        traces: 240,
        hasVoucher: true,
        voucherCount: 6,
        voucherValue: 10,
      },
      {
        name: "Extreme",
        traces: 1440,
        hasVoucher: true,
        voucherCount: 6,
        voucherValue: 80,
      },
    ],
  },
  {
    id: "limbo",
    name: "Limbo",
    maxPartySize: 3,
    difficulties: [
      { name: "Normal", traces: 80, hasVoucher: false },
      {
        name: "Hard",
        traces: 240,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 20,
      },
    ],
  },
  {
    id: "baldrix",
    name: "Baldrix",
    maxPartySize: 3,
    difficulties: [
      { name: "Normal", traces: 80, hasVoucher: false },
      {
        name: "Hard",
        traces: 240,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 40,
      },
    ],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    maxPartySize: 3,
    difficulties: [
      {
        name: "Normal",
        traces: 210,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 15,
      },
      {
        name: "Hard",
        traces: 630,
        hasVoucher: true,
        voucherCount: 3,
        voucherValue: 120,
      },
    ],
  },
];

// Daily Quest data for Vestige of Erion
const DAILY_QUESTS = [
  { id: "cernium", name: "Cernium Research", fragments: 1 },
  { id: "hotel_arcs", name: "Clean Up Around Hotel Arcus", fragments: 3 },
  { id: "odium", name: "Odium Area Expedition", fragments: 6 },
  {
    id: "shangri_la",
    name: "Shangri-La Contamination Purification",
    fragments: 10,
  },
  { id: "arteria", name: "Defeat the Arteria Remnants", fragments: 15 },
  { id: "carcion", name: "Carcion Recovery Support", fragments: 25 },
  {
    id: "tallahart",
    name: "Investigate the Tallahart Ancient God's Power",
    fragments: 45,
  },
  {
    id: "geardrak",
    name: "Geardrak Cronos’ Remnants Collection",
    fragments: 65,
  },
];

// Maximum traces that can be accumulated
const MAX_TRACES_CAPACITY = 1000;

// Rounds to 2 decimal places to avoid floating-point drift from fractional
// (averaged) voucher counts, e.g. 1.1 * 30 === 33.000000000000004.
const round2 = (n) => Math.round(n * 100) / 100;

// Earliest selectable start date (UTC) - Astra Secondary release date.
const MIN_START_DATE = "2026-07-22";

// Today's date (UTC), clamped to not be earlier than MIN_START_DATE.
const getDefaultStartDate = () => {
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
    .toISOString()
    .split("T")[0];
  return todayUTC < MIN_START_DATE ? MIN_START_DATE : todayUTC;
};

// Maps old (cached) boss ids to their current id so saved selections in
// localStorage carry over when a boss id is renamed.
const ID_MIGRATIONS = {
  radiant_malefic_star: "malefic_star",
};

// Which preset slot the live form currently represents. Kept out of the
// preset payload itself so saving a preset never bakes in "was active".
const ACTIVE_PRESET_STORAGE_KEY = "astraSecondaryActivePreset";

const emptyPreset = (idx) => ({
  name: `Preset ${idx + 1}`,
  savedAt: null,
  config: null,
  // Index of the preset this one hands its coupon Vestige to (null = keeps it)
  funnelTo: null,
});

// Rebuilds boss selections from the current boss list so renamed/removed/added
// bosses don't break saved data - saved values are merged in by id, with a
// migration map for ids that have been renamed.
const normalizeBossSelections = (saved) => {
  const savedById = new Map(
    (saved || []).map((b) => [ID_MIGRATIONS[b.id] ?? b.id, b]),
  );
  return TRACES_BOSS_DATA.map((boss) => {
    const s = savedById.get(boss.id);
    return {
      id: boss.id,
      selectedDifficulty: s?.selectedDifficulty ?? "None",
      partySize: s?.partySize ?? 1,
      clearedThisWeek: s?.clearedThisWeek ?? false,
      vouchersKept: s?.vouchersKept ?? 0,
    };
  });
};

// Weekly traces / coupon fragments per boss. Takes plain selections rather
// than reading component state so a preset's numbers can be computed without
// loading it into the form.
const computeBossWeeklyData = (bossSelections) =>
  normalizeBossSelections(bossSelections).map((selection) => {
    const boss = TRACES_BOSS_DATA.find((b) => b.id === selection.id);
    const difficulty = boss.difficulties.find(
      (d) => d.name === selection.selectedDifficulty,
    );

    if (!difficulty || selection.selectedDifficulty === "None") {
      return {
        bossId: boss.id,
        bossName: boss.name,
        tracesPerClear: 0,
        tracesPerWeek: 0,
        voucherFragmentsPerWeek: 0,
        pendingTraces: 0,
        pendingVoucherFragments: 0,
        clearedThisWeek: false,
        voucherCount: 0,
        voucherValue: 0,
        vouchersKept: 0,
      };
    }

    const tracesPerClear = Math.floor(difficulty.traces / selection.partySize);
    const vouchersKept = difficulty.hasVoucher
      ? selection.vouchersKept || 0
      : 0;
    const voucherFragmentsPerWeek = round2(
      vouchersKept * (difficulty.voucherValue || 0),
    );

    // "Cleared this week" only removes the clear still standing between now
    // and the next Thursday reset - every reset after that one is clearable
    // again, so the steady weekly rate is unaffected.
    const clearedThisWeek = !!selection.clearedThisWeek;

    return {
      bossId: boss.id,
      bossName: boss.name,
      difficulty: difficulty.name,
      tracesPerClear,
      tracesPerWeek: tracesPerClear,
      voucherFragmentsPerWeek,
      pendingTraces: clearedThisWeek ? 0 : tracesPerClear,
      pendingVoucherFragments: clearedThisWeek ? 0 : voucherFragmentsPerWeek,
      clearedThisWeek,
      voucherCount: difficulty.voucherCount || 0,
      voucherValue: difficulty.voucherValue || 0,
      vouchersKept,
      hasVoucher: difficulty.hasVoucher,
    };
  });

// Daily-quest Vestige income for a given date, honouring a scheduled quest
// upgrade if the date is on/after its switch-over.
const getDailyFragmentsForDate = (config, date) => {
  if (config.futureQuestDate && config.futureQuestId) {
    const futureDate = new Date(config.futureQuestDate + "T00:00:00.000Z");
    if (date >= futureDate) {
      const quest = DAILY_QUESTS.find((q) => q.id === config.futureQuestId);
      return quest ? quest.fragments : 0;
    }
  }
  const quest = DAILY_QUESTS.find((q) => q.id === config.highestDailyQuest);
  return quest ? quest.fragments : 0;
};

// Headline weekly rates for a config, before any funnelling is applied.
const computeWeeklySummary = (config) => {
  const bossData = computeBossWeeklyData(config.bossSelections);
  const dailyFragments = getDailyFragmentsForDate(config, new Date());
  const daysPerWeek = config.daysPerWeek ?? 7;
  return {
    bossData,
    weeklyTraces: bossData.reduce((sum, b) => sum + b.tracesPerWeek, 0),
    weeklyVoucherFragments: round2(
      bossData.reduce((sum, b) => sum + b.voucherFragmentsPerWeek, 0),
    ),
    pendingTraces: bossData.reduce((sum, b) => sum + b.pendingTraces, 0),
    pendingVoucherFragments: round2(
      bossData.reduce((sum, b) => sum + b.pendingVoucherFragments, 0),
    ),
    dailyFragments,
    weeklyDailyFragments: dailyFragments * daysPerWeek,
  };
};

// Follows a preset's funnel chain to the slot that ultimately ends up holding
// the coupons (3 -> 2 -> 1 lands everything in 1). A chain that loops back on
// itself has no valid destination, so the preset keeps its own coupons and the
// UI flags the cycle.
const resolveFunnelTarget = (presets, start) => {
  const seen = new Set([start]);
  let current = start;
  for (;;) {
    const next = presets[current]?.funnelTo;
    // A dangling link (unset, or pointing at a slot that has since been
    // cleared) stops the chain where it is rather than voiding it.
    if (next === null || next === undefined || !presets[next]?.config) {
      return { target: current, cycle: false };
    }
    if (seen.has(next)) return { target: start, cycle: true };
    seen.add(next);
    current = next;
  }
};

// Stable string for "has this config changed?" checks. Numeric fields are
// coerced because the inputs are allowed to hold "" mid-edit, and boss
// selections are normalized so an older saved shape doesn't read as dirty.
const configFingerprint = (config) =>
  JSON.stringify({
    ...config,
    currentTraces: Number(config.currentTraces) || 0,
    currentFragments: Number(config.currentFragments) || 0,
    bossSelections: normalizeBossSelections(config.bossSelections),
  });

const AstraSecondaryCalculator = () => {
  // User input state
  const [currentMission, setCurrentMission] = useState(1);
  const [currentTraces, setCurrentTraces] = useState(0);
  const [currentFragments, setCurrentFragments] = useState(0);
  const [startDate, setStartDate] = useState(getDefaultStartDate);

  // Boss configuration state
  const [bossSelections, setBossSelections] = useState(
    TRACES_BOSS_DATA.map((boss) => ({
      id: boss.id,
      selectedDifficulty: "None",
      partySize: 1,
      clearedThisWeek: false,
      vouchersKept: 0,
    })),
  );

  // Daily quest state - stores the highest quest completed (or null if none)
  const [highestDailyQuest, setHighestDailyQuest] = useState("tallahart");
  const [daysPerWeek, setDaysPerWeek] = useState(7);

  // Future quest upgrade state
  const [futureQuestDate, setFutureQuestDate] = useState("");
  const [futureQuestId, setFutureQuestId] = useState("");

  // Saved configuration presets (3 slots)
  const [presets, setPresets] = useState(() =>
    Array.from({ length: PRESET_COUNT }, (_, i) => emptyPreset(i)),
  );
  const [presetsLoaded, setPresetsLoaded] = useState(false);

  // Which preset slot the live form represents, so funnelled coupons from the
  // other slots know where to land. null = working outside any preset.
  const [activePresetIdx, setActivePresetIdx] = useState(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Gathers the current form state into a plain object suitable for storage
  // (localStorage autosave or a preset slot).
  const getCurrentConfig = () => ({
    currentMission,
    currentTraces,
    currentFragments,
    startDate,
    bossSelections,
    highestDailyQuest,
    daysPerWeek,
    futureQuestDate,
    futureQuestId,
  });

  // Applies a saved config (from localStorage or a preset) to the live form
  // state.
  const applyState = (config) => {
    if (config.currentMission !== undefined)
      setCurrentMission(config.currentMission);
    if (config.currentTraces !== undefined)
      setCurrentTraces(config.currentTraces);
    if (config.currentFragments !== undefined)
      setCurrentFragments(config.currentFragments);
    if (config.startDate)
      setStartDate(
        config.startDate < MIN_START_DATE ? MIN_START_DATE : config.startDate,
      );
    if (config.bossSelections) {
      setBossSelections(normalizeBossSelections(config.bossSelections));
    }
    if (config.highestDailyQuest)
      setHighestDailyQuest(config.highestDailyQuest);
    if (config.daysPerWeek !== undefined) setDaysPerWeek(config.daysPerWeek);
    if (config.futureQuestDate !== undefined)
      setFutureQuestDate(config.futureQuestDate);
    if (config.futureQuestId !== undefined)
      setFutureQuestId(config.futureQuestId);
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (saved) {
        applyState(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getCurrentConfig()));
      }
    } catch {
      // ignore storage errors
    }
  }, [
    currentMission,
    currentTraces,
    currentFragments,
    startDate,
    bossSelections,
    highestDailyQuest,
    daysPerWeek,
    futureQuestDate,
    futureQuestId,
    isLoaded,
  ]);

  // Load presets (and which one is active) from localStorage on mount
  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(PRESETS_STORAGE_KEY)
          : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPresets((prev) =>
            prev.map((slot, i) => ({ ...slot, ...(parsed[i] || {}) })),
          );
        }
      }
      const activeRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(ACTIVE_PRESET_STORAGE_KEY)
          : null;
      const activeIdx = activeRaw === null ? NaN : Number(activeRaw);
      if (Number.isInteger(activeIdx) && activeIdx >= 0 && activeIdx < PRESET_COUNT) {
        setActivePresetIdx(activeIdx);
      }
    } catch {
      // ignore storage errors
    }
    setPresetsLoaded(true);
  }, []);

  // Save presets to localStorage when they change
  useEffect(() => {
    if (!presetsLoaded) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
        if (activePresetIdx === null) {
          localStorage.removeItem(ACTIVE_PRESET_STORAGE_KEY);
        } else {
          localStorage.setItem(ACTIVE_PRESET_STORAGE_KEY, String(activePresetIdx));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [presets, activePresetIdx, presetsLoaded]);

  // Autosave: while a preset is selected, every edit to the form writes
  // straight back into that slot, so "selected" always means "this preset is
  // what you're looking at". Gated on both load flags so the pre-hydration
  // defaults can't overwrite a saved slot on mount, and fingerprinted so an
  // unchanged form doesn't churn savedAt.
  useEffect(() => {
    if (!isLoaded || !presetsLoaded) return;
    if (activePresetIdx === null) return;
    const config = getCurrentConfig();
    const fingerprint = configFingerprint(config);
    setPresets((prev) => {
      const slot = prev[activePresetIdx];
      if (!slot?.config) return prev;
      if (configFingerprint(slot.config) === fingerprint) return prev;
      return prev.map((s, i) =>
        i === activePresetIdx
          ? { ...s, savedAt: new Date().toISOString(), config }
          : s,
      );
    });
  }, [
    currentMission,
    currentTraces,
    currentFragments,
    startDate,
    bossSelections,
    highestDailyQuest,
    daysPerWeek,
    futureQuestDate,
    futureQuestId,
    activePresetIdx,
    isLoaded,
    presetsLoaded,
  ]);

  // Save the current form state into a preset slot (confirms before
  // overwriting an occupied one)
  const handleSavePreset = (idx) => {
    const existing = presets[idx];
    if (
      existing?.config &&
      typeof window !== "undefined" &&
      !window.confirm(`Overwrite "${existing.name}" with the current setup?`)
    ) {
      return;
    }
    setPresets((prev) =>
      prev.map((slot, i) =>
        i === idx
          ? {
              ...slot,
              savedAt: new Date().toISOString(),
              config: getCurrentConfig(),
            }
          : slot,
      ),
    );
    setActivePresetIdx(idx);
  };

  // Load a preset slot into the live form state
  const handleLoadPreset = (idx) => {
    const preset = presets[idx];
    if (!preset?.config) return;
    applyState(preset.config);
    setActivePresetIdx(idx);
  };

  // Clear a preset slot back to empty. Any other slot funnelling into it is
  // reset too, so nothing is left pointing at an empty destination.
  const handleClearPreset = (idx) => {
    const existing = presets[idx];
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Clear "${existing.name}"?`)
    ) {
      return;
    }
    setPresets((prev) =>
      prev.map((slot, i) => {
        if (i === idx) return emptyPreset(idx);
        return slot.funnelTo === idx ? { ...slot, funnelTo: null } : slot;
      }),
    );
    if (activePresetIdx === idx) setActivePresetIdx(null);
  };

  // Rename a preset slot
  const handleRenamePreset = (idx, name) => {
    setPresets((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, name } : slot)),
    );
  };

  // The name fields double as the rename UI, so the pencil button just hands
  // focus to the matching input.
  const presetNameRefs = useRef([]);
  const focusPresetName = (idx) => {
    const input = presetNameRefs.current[idx];
    if (!input) return;
    input.focus();
    input.select();
  };

  // Point a preset's coupon Vestige at another slot (or null to keep it)
  const handleSetFunnelTarget = (idx, targetIdx) => {
    setPresets((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, funnelTo: targetIdx } : slot)),
    );
  };

  // Reset all state
  const handleReset = () => {
    setCurrentMission(1);
    setCurrentTraces(0);
    setCurrentFragments(0);
    setStartDate(getDefaultStartDate());
    setBossSelections(
      TRACES_BOSS_DATA.map((boss) => ({
        id: boss.id,
        selectedDifficulty: "None",
        partySize: 1,
        clearedThisWeek: false,
        vouchersKept: 0,
      })),
    );
    setHighestDailyQuest("tallahart");
    setDaysPerWeek(7);
    setFutureQuestDate("");
    setFutureQuestId("");
    setActivePresetIdx(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  // Handle boss selection changes
  const handleBossSelectionChange = (bossId, field, value) => {
    setBossSelections((prev) =>
      prev.map((boss) =>
        boss.id === bossId ? { ...boss, [field]: value } : boss,
      ),
    );
  };

  // Nudge a boss's vouchersKept up/down by a fixed step, clamped to [0, max]
  const adjustVouchersKept = (bossId, delta, max) => {
    setBossSelections((prev) =>
      prev.map((boss) =>
        boss.id === bossId
          ? {
              ...boss,
              vouchersKept: round2(
                Math.min(max, Math.max(0, (boss.vouchersKept || 0) + delta)),
              ),
            }
          : boss,
      ),
    );
  };

  // Daily fragments for the live config on a given date
  const getDailyFragments = () =>
    getDailyFragmentsForDate(
      { highestDailyQuest, futureQuestDate, futureQuestId },
      new Date(),
    );

  // Per-slot weekly rates, computed from each preset's *saved* config so the
  // funnel maths doesn't depend on which preset happens to be loaded.
  const presetSummaries = useMemo(
    () => presets.map((p) => (p.config ? computeWeeklySummary(p.config) : null)),
    [presets],
  );

  // Where the active preset's coupons go, and what the other slots send it.
  // Only coupon Vestige moves: daily-quest Vestige is untradable.
  const funnelInfo = useMemo(() => {
    const none = {
      active: false,
      donatesTo: null,
      cycle: false,
      incomingWeekly: 0,
      incomingPending: 0,
      sources: [],
    };
    if (activePresetIdx === null || !presets[activePresetIdx]?.config) {
      return none;
    }

    const self = resolveFunnelTarget(presets, activePresetIdx);
    const sources = [];
    let incomingWeekly = 0;
    let incomingPending = 0;

    presets.forEach((preset, i) => {
      if (i === activePresetIdx || !preset.config) return;
      const resolved = resolveFunnelTarget(presets, i);
      if (resolved.cycle || resolved.target !== activePresetIdx) return;
      const summary = presetSummaries[i];
      if (!summary) return;
      incomingWeekly += summary.weeklyVoucherFragments;
      incomingPending += summary.pendingVoucherFragments;
      sources.push({
        idx: i,
        name: preset.name,
        weekly: summary.weeklyVoucherFragments,
        pending: summary.pendingVoucherFragments,
        // A slot two hops away routes through an intermediate preset
        indirect: preset.funnelTo !== activePresetIdx,
      });
    });

    return {
      active: true,
      donatesTo: self.cycle || self.target === activePresetIdx ? null : self.target,
      cycle: self.cycle,
      incomingWeekly: round2(incomingWeekly),
      incomingPending: round2(incomingPending),
      sources,
    };
  }, [presets, presetSummaries, activePresetIdx]);

  // Main calculation logic
  const calculateSchedule = useMemo(() => {
    const liveConfig = getCurrentConfig();
    const own = computeWeeklySummary(liveConfig);
    const bossData = own.bossData;
    const weeklyTraces = own.weeklyTraces;

    // Coupons handed to another preset leave this character entirely; coupons
    // funnelled in from other presets land here on top of whatever is kept.
    const donatingAway = funnelInfo.donatesTo !== null;
    // Pre-funnel figure, kept for display so the "sent away" row reflects the
    // live form rather than the donor preset's last save.
    const ownVoucherFragments = own.weeklyVoucherFragments;
    const keptVoucherFragments = donatingAway ? 0 : ownVoucherFragments;
    const ownPendingVoucherFragments = donatingAway
      ? 0
      : own.pendingVoucherFragments;

    const weeklyVoucherFragments = round2(
      keptVoucherFragments + funnelInfo.incomingWeekly,
    );
    // Income still available before the next reset - bosses already cleared
    // this week contribute nothing until that reset comes around.
    const pendingTraces = own.pendingTraces;
    const pendingVoucherFragments = round2(
      ownPendingVoucherFragments + funnelInfo.incomingPending,
    );
    const dailyFragments = own.dailyFragments;
    const weeklyDailyFragments = own.weeklyDailyFragments;

    // Get missions starting from current
    const startMissionIndex = currentMission - 1;
    const remainingMissions = MISSIONS.slice(startMissionIndex);

    // Both inputs are allowed to sit empty while being typed into, so coerce
    // before any arithmetic rather than letting "" reach it.
    const tracesHave = Math.min(
      Number(currentTraces) || 0,
      MAX_TRACES_CAPACITY,
    );

    // Initial state
    let traces = tracesHave;
    let fragments = Number(currentFragments) || 0;
    let currentDate = new Date(startDate + "T00:00:00.000Z");
    const dayOfWeek = currentDate.getUTCDay();
    const daysUntilThursdayReset = (4 - dayOfWeek + 7) % 7;
    let nextThursday = new Date(currentDate);
    nextThursday.setDate(nextThursday.getDate() + daysUntilThursdayReset);

    const missionResults = [];
    const timeline = [];
    let dayCount = 0;
    let missionIndex = 0;
    let missionStartTraces = traces;
    let missionStartFragments = fragments;
    let missionStartDate = new Date(currentDate);
    let missionDays = 0;

    // Whatever is still clearable in the current week is available right now
    // (day 0) rather than making the player wait for the next reset.
    traces += pendingTraces;
    fragments = round2(fragments + pendingVoucherFragments);

    if (pendingTraces > 0 || pendingVoucherFragments > 0) {
      timeline.push({
        date: new Date(currentDate),
        type: "pending",
        tracesAdded: pendingTraces,
        fragmentsAdded: pendingVoucherFragments,
        tracesTotal: traces,
        fragmentsTotal: fragments,
      });
    }

    // A start date that is itself a Thursday has already had its reset
    // consumed by the grant above, so the next payout is a full week out.
    if (daysUntilThursdayReset === 0) {
      nextThursday.setDate(nextThursday.getDate() + 7);
    }

    // Greedily completes every remaining mission affordable with the
    // current traces/fragments balance. A single big income event (e.g. a
    // Thursday reset) can fund several consecutive missions at once -
    // overflow from one mission's traces should carry straight into the
    // next rather than being discarded by the storage cap prematurely.
    const tryCompleteMissions = () => {
      while (
        missionIndex < remainingMissions.length &&
        traces >= remainingMissions[missionIndex].tracesRequired &&
        fragments >= remainingMissions[missionIndex].fragmentsRequired
      ) {
        const mission = remainingMissions[missionIndex];
        const traceOverflow = Math.max(0, traces - mission.tracesRequired);
        traces -= mission.tracesRequired;
        fragments -= mission.fragmentsRequired;

        missionResults.push({
          mission,
          startDate: missionStartDate,
          completionDate: new Date(currentDate),
          daysNeeded: missionDays,
          startTraces: missionStartTraces,
          startFragments: missionStartFragments,
          traceOverflow,
        });

        missionIndex++;
        missionStartTraces = traces;
        missionStartFragments = fragments;
        missionStartDate = new Date(currentDate);
        missionDays = 0;
      }
    };

    // Complete anything already affordable before any days pass
    tryCompleteMissions();
    traces = Math.min(traces, MAX_TRACES_CAPACITY);

    // Check if completion is impossible (no weekly traces and need more
    // traces than can ever be banked for what's left)
    const totalTracesNeeded = remainingMissions
      .slice(missionIndex)
      .reduce((sum, m) => sum + m.tracesRequired, 0);
    const tracesNeeded = Math.max(0, totalTracesNeeded - traces);
    const isUnreachable =
      missionIndex < remainingMissions.length &&
      weeklyTraces === 0 &&
      tracesNeeded > 0;

    // If unreachable, return early with infinity
    if (isUnreachable) {
      return {
        bossData,
        weeklyTraces,
        weeklyVoucherFragments,
        ownVoucherFragments,
        pendingTraces,
        pendingVoucherFragments,
        dailyFragments,
        weeklyDailyFragments,
        missionResults: [
          ...missionResults,
          ...remainingMissions.slice(missionIndex).map((mission) => ({
            mission,
            startDate: new Date(currentDate),
            completionDate: null,
            daysNeeded: Infinity,
            startTraces: traces,
            startFragments: fragments,
            traceOverflow: 0,
          })),
        ],
        completionDate: "Never (no trace income)",
        totalDays: Infinity,
        timeline: [],
        isUnreachable: true,
      };
    }

    while (missionIndex < remainingMissions.length) {
      dayCount++;
      missionDays++;

      // Advance to the day being simulated first, so the checks below (and
      // the completion date they can trigger) reflect that day itself
      // rather than lagging one day behind it.
      currentDate.setDate(currentDate.getDate() + 1);

      // Add daily fragments (check for future quest upgrade). Grants
      // fragments on exactly `daysPerWeek` of every 7 simulated days.
      const fragmentsToday = getDailyFragmentsForDate(liveConfig, currentDate);
      if ((dayCount - 1) % 7 < daysPerWeek) {
        fragments += fragmentsToday;
      }

      // Check for Thursday reset (weekly boss traces + weekly voucher fragments)
      if (
        currentDate.getTime() === nextThursday.getTime() ||
        currentDate > nextThursday
      ) {
        traces += weeklyTraces;
        fragments = round2(fragments + weeklyVoucherFragments);

        if (weeklyTraces > 0 || weeklyVoucherFragments > 0) {
          timeline.push({
            date: new Date(nextThursday),
            type: "weekly",
            tracesAdded: weeklyTraces,
            fragmentsAdded: weeklyVoucherFragments,
            tracesTotal: traces,
            fragmentsTotal: fragments,
          });
        }

        nextThursday = new Date(currentDate);
        nextThursday.setDate(nextThursday.getDate() + 7);
      }

      // Add timeline entry for daily fragments milestone
      if (dailyFragments > 0 && missionDays % 7 === 0) {
        timeline.push({
          date: new Date(currentDate),
          type: "daily_week",
          tracesAdded: 0,
          fragmentsAdded: weeklyDailyFragments,
          tracesTotal: traces,
          fragmentsTotal: fragments,
        });
      }

      // Complete as many missions as this new balance allows, then cap
      // whatever's left idling (couldn't be spent yet) at the storage limit
      tryCompleteMissions();
      traces = Math.min(traces, MAX_TRACES_CAPACITY);
    }

    // Format completion date
    const formattedCompletionDate =
      missionResults.length > 0
        ? missionResults[
            missionResults.length - 1
          ].completionDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          }) + " (UTC)"
        : "Already Complete!";

    return {
      bossData,
      weeklyTraces,
      weeklyVoucherFragments,
      ownVoucherFragments,
      pendingTraces,
      pendingVoucherFragments,
      dailyFragments,
      weeklyDailyFragments,
      missionResults,
      completionDate: formattedCompletionDate,
      totalDays: dayCount,
      timeline,
      isUnreachable: false,
    };
  }, [
    currentMission,
    currentTraces,
    currentFragments,
    startDate,
    bossSelections,
    highestDailyQuest,
    daysPerWeek,
    futureQuestDate,
    futureQuestId,
    funnelInfo,
  ]);

  // Get traces cap for current mission
  const getTracesCap = () => {
    const currentMissionData = MISSIONS[currentMission - 1];
    if (!currentMissionData) return MAX_TRACES_CAPACITY;

    // Calculate if we have excess from previous missions
    let excessTraces = 0;
    for (let i = 0; i < currentMission - 1; i++) {
      // This is simplified - in reality excess would be tracked
    }

    return Math.min(currentTraces, MAX_TRACES_CAPACITY);
  };

  return (
    <div className="max-w-7xl mx-auto bg-primary-dark border border-primary-dim p-6 rounded-2xl">
      {/* Presets Section */}
      <div className="mb-6 p-4 bg-background-bright border border-primary-dim rounded-xl">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
          <h2 className="text-lg font-semibold text-primary-bright">
            Presets
          </h2>
          <p className="text-xs text-primary-bright/60">
            You can use these to calculate mules, different permutations, or to
            calculate funneling Erion Coupons. Edits save to the selected preset
            automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset, idx) => {
            const summary = presetSummaries[idx];
            const isActive = activePresetIdx === idx;
            const resolved = preset.config
              ? resolveFunnelTarget(presets, idx)
              : { target: idx, cycle: false };
            const donatesTo =
              resolved.cycle || resolved.target === idx ? null : resolved.target;

            return (
              <div
                key={idx}
                className={`p-3 border-2 rounded-lg flex flex-col transition-colors ${
                  isActive
                    ? "border-secondary ring-2 ring-secondary/25 bg-secondary/[0.07]"
                    : "border-primary-dim bg-primary-dark"
                }`}
              >
                {/* Fixed-height status row so the cards stay aligned.
                    Badge uses dark text: --secondary is light in both themes. */}
                <div className="h-5 mb-1 flex items-center">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-wide bg-secondary text-black/90 px-1.5 py-0.5 rounded">
                      <Check size={11} strokeWidth={3} aria-hidden="true" />
                      Selected
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide text-primary-bright/35">
                      {preset.config ? "Not selected" : "Empty slot"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    ref={(el) => {
                      presetNameRefs.current[idx] = el;
                    }}
                    value={preset.name}
                    onChange={(e) => handleRenamePreset(idx, e.target.value)}
                    placeholder={`Preset ${idx + 1}`}
                    aria-label={`Name for preset ${idx + 1}`}
                    className="min-w-0 flex-1 bg-transparent text-primary-bright font-medium text-sm border-b border-transparent hover:border-primary-dim focus:border-secondary focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => focusPresetName(idx)}
                    aria-label={`Rename preset ${idx + 1}`}
                    title="Rename preset"
                    className="shrink-0 p-1 rounded text-primary-bright/40 hover:text-secondary hover:bg-primary-dim/40 transition-colors"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                </div>

                <p className="text-xs text-primary-bright/50 mt-1 mb-2 h-4 truncate">
                  {preset.config
                    ? `Saved ${new Date(preset.savedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}`
                    : "Empty"}
                  {isActive && preset.config && (
                    <span className="text-secondary/80"> · autosaving</span>
                  )}
                </p>

                {/* Weekly income summary for this slot */}
                {summary ? (
                  <dl className="text-xs space-y-1 mb-3 p-2 bg-background-bright/60 rounded border border-primary-dim/50">
                    <div className="flex justify-between gap-2">
                      <dt className="text-primary-bright/60">Traces</dt>
                      <dd className="font-semibold text-secondary">
                        +{summary.weeklyTraces.toLocaleString()}/wk
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-primary-bright/60">Erion (dailies)</dt>
                      <dd className="font-semibold text-secondary">
                        +{summary.weeklyDailyFragments.toLocaleString()}/wk
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-primary-bright/60">Erion (coupons)</dt>
                      <dd
                        className={
                          donatesTo !== null
                            ? "font-semibold text-primary-bright/40 line-through"
                            : "font-semibold text-secondary"
                        }
                      >
                        +{summary.weeklyVoucherFragments.toLocaleString()}/wk
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t border-primary-dim/50">
                      <dt className="text-primary-bright/70">Erion kept</dt>
                      <dd className="font-bold text-secondary">
                        +
                        {round2(
                          summary.weeklyDailyFragments +
                            (donatesTo === null
                              ? summary.weeklyVoucherFragments
                              : 0),
                        ).toLocaleString()}
                        /wk
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <div className="text-xs text-primary-bright/40 mb-3 p-2 bg-background-bright/60 rounded border border-primary-dim/50 text-center">
                    Save a setup to see weekly stats
                  </div>
                )}

                {/* Coupon funnel target */}
                <div className="mb-3">
                  <label
                    htmlFor={`funnel-${idx}`}
                    className="block text-primary-bright/70 text-xs mb-1"
                  >
                    Send Erion Coupons to
                  </label>
                  <select
                    id={`funnel-${idx}`}
                    className="w-full p-1.5 text-xs bg-background-bright text-primary-bright rounded border border-primary-dim disabled:opacity-40 disabled:cursor-not-allowed"
                    value={preset.funnelTo === null ? "" : String(preset.funnelTo)}
                    disabled={!preset.config}
                    onChange={(e) =>
                      handleSetFunnelTarget(
                        idx,
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  >
                    <option value="">Keep on this character</option>
                    {presets.map((target, tIdx) =>
                      tIdx === idx || !target.config ? null : (
                        <option key={tIdx} value={tIdx}>
                          {target.name || `Preset ${tIdx + 1}`}
                        </option>
                      ),
                    )}
                  </select>
                  {resolved.cycle && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      Funnel loops back here - coupons kept until it's broken.
                    </p>
                  )}
                  {donatesTo !== null && preset.funnelTo !== donatesTo && (
                    <p className="text-[11px] text-primary-bright/50 mt-1">
                      Ends up in {presets[donatesTo].name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  {isActive ? (
                    // Nothing to save by hand while this slot is autosaving -
                    // the only useful action left is to stop tracking it.
                    <button
                      type="button"
                      onClick={() => setActivePresetIdx(null)}
                      title="Keep these numbers on screen, but stop saving them to this preset"
                      className="flex-1 text-xs px-2 py-1.5 bg-primary-dim/50 text-primary-bright rounded border border-primary-dim hover:bg-primary-dim transition-colors"
                    >
                      Stop editing
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(idx)}
                        disabled={!preset.config}
                        className="flex-1 text-xs px-2 py-1.5 bg-secondary/20 text-secondary rounded border border-secondary/30 hover:bg-secondary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSavePreset(idx)}
                        title="Save the current setup into this slot and start editing it"
                        className="flex-1 text-xs px-2 py-1.5 bg-primary-dim/50 text-primary-bright rounded border border-primary-dim hover:bg-primary-dim transition-colors"
                      >
                        Save
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClearPreset(idx)}
                    disabled={!preset.config}
                    aria-label={`Clear ${preset.name}`}
                    title="Clear preset"
                    className="text-xs px-2 py-1.5 bg-primary-dim/50 text-primary-bright/70 rounded border border-primary-dim hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How the funnel affects the numbers below */}
        {funnelInfo.active &&
          (funnelInfo.donatesTo !== null || funnelInfo.sources.length > 0) && (
            <div className="mt-3 p-3 bg-secondary/10 border border-secondary/30 rounded-lg text-xs space-y-1">
              {funnelInfo.donatesTo !== null && (
                <p className="text-primary-bright/80">
                  <span className="text-secondary font-semibold">
                    {presets[activePresetIdx].name}
                  </span>{" "}
                  sends all coupon Vestige to{" "}
                  <span className="text-secondary font-semibold">
                    {presets[funnelInfo.donatesTo].name}
                  </span>
                  , so the projection below counts none of its own coupons.
                </p>
              )}
              {funnelInfo.sources.length > 0 && (
                <p className="text-primary-bright/80">
                  Receiving{" "}
                  <span className="text-secondary font-semibold">
                    +{funnelInfo.incomingWeekly.toLocaleString()} Erion/week
                  </span>{" "}
                  from{" "}
                  {funnelInfo.sources
                    .map(
                      (s) =>
                        `${s.name} (${s.weekly.toLocaleString()}${s.indirect ? ", via another preset" : ""})`,
                    )
                    .join(", ")}
                  .
                </p>
              )}
            </div>
          )}
        {activePresetIdx === null && presets.some((p) => p.config) && (
          <p className="mt-3 text-xs text-primary-bright/50">
            Load a preset to apply coupon funnelling to the projection below.
          </p>
        )}
      </div>

      {/* Current Status Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4">
          <h2 className="text-2xl font-semibold text-primary-bright">
            Current Status
          </h2>
          {activePresetIdx !== null ? (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-secondary/40 bg-secondary/10 text-secondary">
              <Check size={13} strokeWidth={3} aria-hidden="true" />
              Editing{" "}
              <strong className="font-semibold">
                {presets[activePresetIdx].name ||
                  `Preset ${activePresetIdx + 1}`}
              </strong>
              <span className="text-secondary/70">· saved automatically</span>
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-lg border border-primary-dim bg-primary-dark text-primary-bright/50">
              No preset selected
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-sm px-3 py-1 bg-primary-dark hover:bg-primary-dim text-primary-bright/70 hover:text-primary-bright rounded-lg border border-primary-dim transition-colors"
            title="Reset all values to default"
          >
            Reset
          </button>
        </div>

        {/* Mission Selection - Full Width Card */}
        <div className="mb-4 p-4 bg-background-bright border border-primary-dim rounded-xl">
          <label className="block text-primary-bright font-medium mb-3 text-center">
            Current Mission
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MISSIONS.map((mission) => {
              const isSelected = currentMission === mission.id;
              return (
                <button
                  key={mission.id}
                  onClick={() => setCurrentMission(mission.id)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "bg-secondary/20 border-secondary"
                      : "bg-primary-dark border-primary-dim hover:border-primary-bright/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        isSelected
                          ? "bg-secondary text-primary-dark"
                          : "bg-primary-dim text-primary-bright"
                      }`}
                    >
                      {mission.id}
                    </div>
                    <div>
                      <div
                        className={`font-semibold ${isSelected ? "text-secondary" : "text-primary-bright"}`}
                      >
                        {mission.name}
                      </div>
                      <div className="text-xs text-primary-bright/60">
                        {mission.tracesRequired.toLocaleString()} Traces ·{" "}
                        {mission.fragmentsRequired.toLocaleString()} Fragments
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources & Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Current Traces */}
          <div className="p-4 bg-background-bright border border-primary-dim rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center">
                <Image
                  src="/astra-secondary/trace-of-battle.webp"
                  alt="Fierce Battle Trace"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <label className="block text-primary-bright font-medium text-sm">
                  Fierce Battle Traces
                </label>
                <span className="text-xs text-primary-bright/60">
                  Max 1,000 per mission
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="flex-1 p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center font-semibold"
                value={currentTraces}
                onChange={(e) => {
                  const val = e.target.value;
                  // Let the field go empty while typing - clamping "" straight
                  // back to 0 makes the 0 impossible to delete.
                  setCurrentTraces(
                    val === ""
                      ? val
                      : Math.min(
                          MAX_TRACES_CAPACITY,
                          Math.max(0, Number(val)),
                        ),
                  );
                }}
                onBlur={(e) => {
                  if (e.target.value === "") setCurrentTraces(0);
                }}
                min="0"
                max={MAX_TRACES_CAPACITY}
              />
              <span className="text-primary-bright/60 text-sm">
                / {MAX_TRACES_CAPACITY.toLocaleString()}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 bg-primary-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (currentTraces / MAX_TRACES_CAPACITY) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Current Fragments */}
          <div className="p-4 bg-background-bright border border-primary-dim rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center">
                <Image
                  src="/astra-secondary/erion-fragment.webp"
                  alt="Vestige of Erion"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <label className="block text-primary-bright font-medium text-sm">
                  Vestige of Erion
                </label>
                <span className="text-xs text-primary-bright/60">
                  No capacity limit
                </span>
              </div>
            </div>
            <input
              type="number"
              className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center font-semibold"
              value={currentFragments}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || val === "-") {
                  setCurrentFragments(val);
                } else {
                  setCurrentFragments(Number(val));
                }
              }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val === "" || val === "-") {
                  setCurrentFragments(0);
                }
              }}
            />
            <p className="text-xs text-primary-bright/40 mt-2 text-center">
              Interactive players: If you plan to buy tradable fragments, input
              them here.{" "}
            </p>
          </div>

          {/* Start Date */}
          <div className="p-4 bg-background-bright border border-primary-dim rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-secondary"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <div>
                <label className="block text-primary-bright font-medium text-sm">
                  Start Date
                </label>
                <span className="text-xs text-primary-bright/60">
                  UTC timezone
                </span>
              </div>
            </div>
            <input
              type="date"
              className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center font-semibold"
              value={startDate}
              min={MIN_START_DATE}
              onChange={(e) =>
                setStartDate(
                  e.target.value < MIN_START_DATE
                    ? MIN_START_DATE
                    : e.target.value,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Boss & Daily Quest Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Boss Configuration */}
          <div>
            <h2 className="text-2xl font-semibold text-primary-bright mb-4">
              Boss Configuration
            </h2>
            <p className="text-sm text-primary-bright/70 mb-4">
              Select difficulty, party size, and whether you cleared this week.
              Traces are divided by party size. Vestige of Erion's Coupons drop
              every kill - set how many you keep per week. You can add
              fractional amount to imply averages (i.e. 1.5 = 3 every other
              week).
            </p>

            {TRACES_BOSS_DATA.map((boss) => {
              const selection = bossSelections.find((b) => b.id === boss.id);
              const selectedDifficulty = boss.difficulties.find(
                (d) => d.name === selection?.selectedDifficulty,
              );

              return (
                <div
                  key={boss.id}
                  className="bg-background-bright border border-primary-dim p-4 rounded-xl mb-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={`/bossImages/largeIcons/${boss.id === "seren" ? "seren" : boss.id === "kalos" ? "kalos" : boss.id === "first_adversary" ? "first_adversary" : boss.id}.png`}
                        alt={boss.name}
                        width={40}
                        height={40}
                        className="rounded-md"
                      />
                      <h3 className="text-lg font-medium text-primary-bright">
                        {boss.name}
                      </h3>
                    </div>

                    {/* Cleared This Week Toggle */}
                    <label
                      className={`flex items-center gap-2 select-none ${
                        selection?.selectedDifficulty === "None"
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <span className="text-primary-bright/80 text-sm hidden sm:inline">
                        Cleared This Week
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selection?.clearedThisWeek || false}
                          onChange={(e) =>
                            handleBossSelectionChange(
                              boss.id,
                              "clearedThisWeek",
                              e.target.checked,
                            )
                          }
                          disabled={selection?.selectedDifficulty === "None"}
                        />
                        <div
                          className={`block w-10 h-6 rounded-full border border-primary-dim ${selection?.clearedThisWeek ? "bg-secondary" : "bg-primary-dark"}`}
                        ></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${selection?.clearedThisWeek ? "transform translate-x-full" : ""}`}
                        ></div>
                      </div>
                      <span className="text-primary-bright text-sm w-7">
                        {selection?.clearedThisWeek ? "Yes" : "No"}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Difficulty Selection */}
                    <div
                      className={
                        selectedDifficulty?.hasVoucher
                          ? "sm:col-span-6"
                          : "sm:col-span-9"
                      }
                    >
                      <label className="block text-primary-bright text-sm mb-1">
                        Difficulty
                      </label>
                      <select
                        className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                        value={selection?.selectedDifficulty || "None"}
                        onChange={(e) =>
                          handleBossSelectionChange(
                            boss.id,
                            "selectedDifficulty",
                            e.target.value,
                          )
                        }
                      >
                        <option value="None">Not Clearing</option>
                        {boss.difficulties.map((diff) => (
                          <option key={diff.name} value={diff.name}>
                            {diff.name} ({diff.traces} traces
                            {diff.hasVoucher
                              ? `, ${diff.voucherCount}×${diff.voucherValue} fragments`
                              : ""}
                            )
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Party Size */}
                    <div
                      className={
                        selectedDifficulty?.hasVoucher
                          ? "sm:col-span-2"
                          : "sm:col-span-3"
                      }
                    >
                      <label className="block text-primary-bright text-sm mb-1">
                        Party
                      </label>
                      <select
                        className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                        value={selection?.partySize || 1}
                        onChange={(e) =>
                          handleBossSelectionChange(
                            boss.id,
                            "partySize",
                            Number(e.target.value),
                          )
                        }
                      >
                        {Array.from(
                          { length: boss.maxPartySize || 6 },
                          (_, i) => i + 1,
                        ).map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tickets Kept */}
                    {selectedDifficulty?.hasVoucher && (
                      <div className="sm:col-span-4">
                        <label className="block text-primary-bright text-sm mb-1">
                          Erion Coupons Kept
                        </label>
                        <div className="flex items-stretch bg-primary-dark rounded border border-primary-dim overflow-hidden">
                          <input
                            type="number"
                            className="w-full min-w-0 p-2 bg-transparent text-primary-bright text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={selection?.vouchersKept ?? 0}
                            min={0}
                            max={selectedDifficulty.voucherCount}
                            step={0.1}
                            onChange={(e) =>
                              handleBossSelectionChange(
                                boss.id,
                                "vouchersKept",
                                Math.min(
                                  selectedDifficulty.voucherCount,
                                  Math.max(0, Number(e.target.value)),
                                ),
                              )
                            }
                          />
                          <span className="flex items-center pr-2 text-primary-bright/50 whitespace-nowrap select-none">
                            / {selectedDifficulty.voucherCount}
                          </span>
                          <div className="flex flex-col border-l border-primary-dim">
                            <button
                              type="button"
                              aria-label="Increase coupons kept"
                              onClick={() =>
                                adjustVouchersKept(
                                  boss.id,
                                  0.5,
                                  selectedDifficulty.voucherCount,
                                )
                              }
                              className="flex-1 px-2 leading-none text-[10px] text-primary-bright/70 hover:text-primary-bright hover:bg-primary-dim/50"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              aria-label="Decrease coupons kept"
                              onClick={() =>
                                adjustVouchersKept(
                                  boss.id,
                                  -0.5,
                                  selectedDifficulty.voucherCount,
                                )
                              }
                              className="flex-1 px-2 leading-none text-[10px] text-primary-bright/70 hover:text-primary-bright hover:bg-primary-dim/50 border-t border-primary-dim"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedDifficulty && selectedDifficulty.name !== "None" && (
                    <div className="mt-3 p-2 bg-primary-dark rounded-lg text-sm flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-primary-bright/70">
                        Traces:{" "}
                        <span className="font-semibold text-secondary">
                          {Math.floor(
                            selectedDifficulty.traces /
                              (selection?.partySize || 1),
                          )}
                          /week
                        </span>
                      </span>
                      {selectedDifficulty.hasVoucher && (
                        <span className="text-primary-bright/70">
                          Erion Coupons:{" "}
                          <span className="font-semibold text-secondary">
                            {selectedDifficulty.voucherCount} drops
                          </span>
                          <span className="text-primary-bright/50">
                            {" "}
                            × {selectedDifficulty.voucherValue} Vestige of Erion
                            each
                          </span>
                          {(selection?.vouchersKept || 0) > 0 && (
                            <span className="text-secondary font-semibold ml-1">
                              →{" "}
                              {round2(
                                selection.vouchersKept *
                                  selectedDifficulty.voucherValue,
                              ).toLocaleString()}{" "}
                              frags/week kept
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily Quest Configuration */}
          <div>
            <h2 className="text-2xl font-semibold text-primary-bright mb-4">
              Daily Quest Configuration
            </h2>
            <p className="text-sm text-primary-bright/70 mb-4">
              Select the highest level daily quest you complete. You receive
              fragments equal to that quest's reward.
            </p>

            <div className="bg-background-bright border border-primary-dim p-4 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary-bright font-medium mb-2">
                    Highest Daily Quest Completed
                  </label>
                  <select
                    className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                    value={highestDailyQuest}
                    onChange={(e) => setHighestDailyQuest(e.target.value)}
                  >
                    {DAILY_QUESTS.map((quest) => (
                      <option key={quest.id} value={quest.id}>
                        {quest.name} ({quest.fragments} fragments/day)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-primary-bright font-medium mb-2">
                    Days Per Week
                  </label>
                  <select
                    className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                      <option key={days} value={days}>
                        {days} days/week
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Future Quest Upgrade Section */}
              <div className="mt-4 pt-4 border-t border-primary-dim">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-secondary"
                  >
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <label className="text-primary-bright font-medium">
                    Future Quest Upgrade (Optional)
                  </label>
                </div>
                <p className="text-xs text-primary-bright/60 mb-3">
                  Schedule a higher daily quest for when you can access a new
                  region.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-bright/80 text-sm mb-1">
                      Switch to Quest
                    </label>
                    <select
                      className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                      value={futureQuestId}
                      onChange={(e) => setFutureQuestId(e.target.value)}
                    >
                      <option value="">No planned upgrade</option>
                      {DAILY_QUESTS.filter(
                        (q) =>
                          q.fragments >
                            DAILY_QUESTS.find(
                              (dq) => dq.id === highestDailyQuest,
                            )?.fragments || 0,
                      ).map((quest) => (
                        <option key={quest.id} value={quest.id}>
                          {quest.name} ({quest.fragments} fragments/day)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-primary-bright/80 text-sm mb-1">
                      Starting Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                      value={futureQuestDate}
                      onChange={(e) => setFutureQuestDate(e.target.value)}
                      disabled={!futureQuestId}
                    />
                  </div>
                </div>
                {futureQuestId && futureQuestDate && (
                  <div className="mt-3 p-2 bg-secondary/10 border border-secondary/30 rounded-lg">
                    <p className="text-xs text-secondary">
                      Will switch from{" "}
                      {
                        DAILY_QUESTS.find((q) => q.id === highestDailyQuest)
                          ?.name
                      }{" "}
                      (
                      {
                        DAILY_QUESTS.find((q) => q.id === highestDailyQuest)
                          ?.fragments
                      }{" "}
                      fragments) to{" "}
                      {DAILY_QUESTS.find((q) => q.id === futureQuestId)?.name} (
                      {
                        DAILY_QUESTS.find((q) => q.id === futureQuestId)
                          ?.fragments
                      }{" "}
                      fragments) on{" "}
                      {new Date(
                        futureQuestDate + "T00:00:00.000Z",
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}{" "}
                      (UTC)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-primary-dark rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-primary-bright">
                    Current Daily Erion Income:
                  </span>
                  <span className="font-bold text-secondary">
                    {getDailyFragments()} erion/day
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-primary-bright">
                    Weekly Erion Income (dailies only):
                  </span>
                  <span className="font-bold text-secondary">
                    {getDailyFragments() * daysPerWeek} erion/week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-semibold text-primary-bright mb-4">
            Progress Overview
          </h2>

          {/* Summary Card */}
          <div className="bg-background-bright border border-primary-dim p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/astra-secondary/trace-of-battle.webp"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-80"
                />
                <span className="text-primary-bright text-sm">
                  Weekly Traces:
                </span>
              </div>
              <span className="font-bold text-secondary">
                {calculateSchedule.weeklyTraces}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/astra-secondary/erion-fragment.webp"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-80"
                />
                <span className="text-primary-bright text-sm">
                  Weekly Erion (dailies):
                </span>
              </div>
              <span className="font-bold text-secondary">
                {calculateSchedule.weeklyDailyFragments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/astra-secondary/erion-fragment.webp"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-80"
                />
                <span className="text-primary-bright text-sm">
                  Weekly Erion (boss coupons):
                </span>
              </div>
              <span className="font-bold text-secondary">
                {calculateSchedule.weeklyVoucherFragments}
              </span>
            </div>
            {funnelInfo.donatesTo !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary-bright/60">
                  ↳ funnelled out to {presets[funnelInfo.donatesTo].name}:
                </span>
                <span className="text-primary-bright/60">
                  −{calculateSchedule.ownVoucherFragments}
                </span>
              </div>
            )}
            {funnelInfo.incomingWeekly > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary-bright/60">
                  ↳ funnelled in from{" "}
                  {funnelInfo.sources.map((s) => s.name).join(", ")}:
                </span>
                <span className="text-secondary/80">
                  +{funnelInfo.incomingWeekly}
                </span>
              </div>
            )}
            {calculateSchedule.weeklyTraces > 0 && (
              <div className="flex items-center justify-between border-t border-primary-dim/50 pt-3">
                <span className="text-primary-bright/70 text-sm">
                  Still clearable this week:
                </span>
                <span className="font-bold text-secondary">
                  {calculateSchedule.pendingTraces} traces
                  {calculateSchedule.pendingVoucherFragments > 0
                    ? ` + ${calculateSchedule.pendingVoucherFragments} Erion`
                    : ""}
                </span>
              </div>
            )}
          </div>

          {/* Mission Results */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-primary-bright">
              Mission Timeline
            </h3>

            {calculateSchedule.missionResults.map((result, idx) => (
              <div
                key={result.mission.id}
                className={`bg-background-bright border p-4 rounded-xl ${
                  idx === 0
                    ? "border-secondary/50 ring-1 ring-secondary/20"
                    : "border-primary-dim"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      idx === 0 ? "bg-secondary/30" : "bg-primary-dark"
                    }`}
                  >
                    <span
                      className={`text-lg font-bold ${idx === 0 ? "text-secondary" : "text-primary-bright"}`}
                    >
                      {result.mission.id}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-primary-bright">
                        {result.mission.name}
                      </h4>
                      {idx === 0 && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-primary-bright/60">
                      {result.mission.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/astra-secondary/trace-of-battle.webp"
                        alt=""
                        width={14}
                        height={14}
                      />
                      <span className="text-primary-bright/70">Traces:</span>
                    </div>
                    <span className="text-primary-bright">
                      {result.mission.tracesRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/astra-secondary/erion-fragment.webp"
                        alt=""
                        width={14}
                        height={14}
                      />
                      <span className="text-primary-bright/70">Fragments:</span>
                    </div>
                    <span className="text-primary-bright">
                      {result.mission.fragmentsRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-bright/70">Est. Days:</span>
                    <span className="font-semibold text-secondary">
                      {isFinite(result.daysNeeded)
                        ? `${result.daysNeeded} days`
                        : "∞"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-primary-dim/50">
                    <span className="text-primary-bright/70 text-xs">
                      Complete by:
                    </span>
                    <span className="font-semibold text-primary-bright text-sm">
                      {result.completionDate
                        ? result.completionDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })
                        : "Never"}
                    </span>
                  </div>
                  {result.traceOverflow > 0 && (
                    <div className="flex justify-between text-xs bg-primary-dark/50 p-1.5 rounded">
                      <span className="text-primary-bright/60">
                        Overflow to next:
                      </span>
                      <span className="text-secondary font-medium">
                        +{result.traceOverflow} traces
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final Completion */}
          {calculateSchedule.missionResults.length > 0 && (
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-primary-bright">
                  Final Completion
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-secondary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="text-primary-bright text-sm">
                      Total Days:
                    </span>
                  </div>
                  <span className="font-bold text-secondary text-lg">
                    {isFinite(calculateSchedule.totalDays)
                      ? `${calculateSchedule.totalDays} days`
                      : "∞"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-secondary/20">
                  <span className="text-primary-bright/80 text-sm">
                    Complete Astra Secondary:
                  </span>
                  <span className="font-bold text-secondary">
                    {calculateSchedule.completionDate}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boss Weekly Breakdown */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-medium text-primary-bright">
            Weekly Boss Breakdown
          </h3>
          <span className="text-sm text-primary-bright/60 ml-auto">
            {
              calculateSchedule.bossData.filter(
                (b) => b.tracesPerWeek > 0 || b.voucherFragmentsPerWeek > 0,
              ).length
            }{" "}
            bosses selected
          </span>
        </div>
        {funnelInfo.donatesTo !== null && (
          <p className="text-xs text-amber-400/90">
            Erion Coupons below is what this character earns per week; you've selected to funnel all of it to {presets[funnelInfo.donatesTo].name}, so none of it
            counts toward the projection above.
          </p>
        )}
        <div className="bg-background-bright border border-primary-dim p-4 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calculateSchedule.bossData
              .filter(
                (b) => b.tracesPerWeek > 0 || b.voucherFragmentsPerWeek > 0,
              )
              .map((boss) => (
                <div
                  key={boss.bossId}
                  className="flex items-center justify-between p-3 bg-primary-dark rounded-lg border border-primary-dim/50"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={`/bossImages/largeIcons/${boss.bossId === "seren" ? "seren" : boss.bossId === "kalos" ? "kalos" : boss.bossId === "first_adversary" ? "first_adversary" : boss.bossId}.png`}
                      alt={boss.bossName}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                    <div>
                      <div className="text-sm text-primary-bright font-medium">
                        {boss.bossName}
                      </div>
                      <div className="text-xs text-primary-bright/60">
                        {boss.difficulty}
                        {boss.clearedThisWeek ? " · cleared this week" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Image
                        src="/astra-secondary/trace-of-battle.webp"
                        alt=""
                        width={12}
                        height={12}
                      />
                      <span className="text-sm font-bold text-secondary">
                        +{boss.tracesPerWeek}
                      </span>
                    </div>
                    {boss.voucherFragmentsPerWeek > 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        <Image
                          src="/astra-secondary/erion-fragment.webp"
                          alt=""
                          width={12}
                          height={12}
                        />
                        <span className="text-xs text-secondary/80">
                          +{boss.voucherFragmentsPerWeek} frags
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            {calculateSchedule.bossData.filter(
              (b) => b.tracesPerWeek > 0 || b.voucherFragmentsPerWeek > 0,
            ).length === 0 && (
              <div className="col-span-full text-center text-primary-bright/60 py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-2 opacity-50"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                <p>Select boss difficulties above to see your weekly gains</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstraSecondaryCalculator;
