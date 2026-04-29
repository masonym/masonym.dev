'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';

const STORAGE_KEY = 'astraSecondaryState';

// Astra Subweapon Mission Requirements
const MISSIONS = [
  {
    id: 1,
    name: '1st Mission',
    description: 'Initial Awakening',
    tracesRequired: 600,
    fragmentsRequired: 3000,
  },
  {
    id: 2,
    name: '2nd Mission',
    description: 'The True Nature of Erion',
    tracesRequired: 600,
    fragmentsRequired: 3000,
  },
  {
    id: 3,
    name: '3rd Mission',
    description: 'Final Enhancement',
    tracesRequired: 800,
    fragmentsRequired: 4000,
  },
];

// Fierce Battle Traces acquisition data
// voucherCount = tickets that drop per kill, voucherValue = fragments per ticket
const TRACES_BOSS_DATA = [
  {
    id: 'seren',
    name: 'Chosen Seren',
    difficulties: [
      { name: 'Normal', traces: 6, hasVoucher: false },
      { name: 'Hard', traces: 15, hasVoucher: false },
      { name: 'Extreme', traces: 180, hasVoucher: true, voucherCount: 6, voucherValue: 5 },
    ],
  },
  {
    id: 'kalos',
    name: 'Watcher Kalos',
    difficulties: [
      { name: 'Easy', traces: 6, hasVoucher: false },
      { name: 'Normal', traces: 30, hasVoucher: false },
      { name: 'Chaos', traces: 100, hasVoucher: false },
      { name: 'Extreme', traces: 500, hasVoucher: true, voucherCount: 6, voucherValue: 30 },
    ],
  },
  {
    id: 'first_adversary',
    name: 'First Adversary',
    maxPartySize: 3,
    difficulties: [
      { name: 'Easy', traces: 10, hasVoucher: false },
      { name: 'Normal', traces: 40, hasVoucher: false },
      { name: 'Hard', traces: 180, hasVoucher: true, voucherCount: 3, voucherValue: 10 },
      { name: 'Extreme', traces: 540, hasVoucher: true, voucherCount: 3, voucherValue: 80 },
    ],
  },
  {
    id: 'radiant_malefic_star',
    name: 'Radiant Malefic Star',
    maxPartySize: 3,
    difficulties: [
      { name: 'Normal', traces: 60, hasVoucher: false },
      { name: 'Hard', traces: 240, hasVoucher: true, voucherCount: 3, voucherValue: 30 },
    ],
  },
  {
    id: 'kaling',
    name: 'Kaling',
    difficulties: [
      { name: 'Easy', traces: 20, hasVoucher: false },
      { name: 'Normal', traces: 80, hasVoucher: false },
      { name: 'Hard', traces: 240, hasVoucher: true, voucherCount: 6, voucherValue: 10 },
      { name: 'Extreme', traces: 1440, hasVoucher: true, voucherCount: 6, voucherValue: 80 },
    ],
  },
  {
    id: 'limbo',
    name: 'Limbo',
    maxPartySize: 3,
    difficulties: [
      { name: 'Normal', traces: 80, hasVoucher: false },
      { name: 'Hard', traces: 240, hasVoucher: true, voucherCount: 3, voucherValue: 20 },
    ],
  },
  {
    id: 'baldrix',
    name: 'Baldrix',
    maxPartySize: 3,
    difficulties: [
      { name: 'Normal', traces: 80, hasVoucher: false },
      { name: 'Hard', traces: 240, hasVoucher: true, voucherCount: 3, voucherValue: 40 },
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    maxPartySize: 3,
    difficulties: [
      { name: 'Normal', traces: 210, hasVoucher: true, voucherCount: 3, voucherValue: 15 },
      { name: 'Hard', traces: 630, hasVoucher: true, voucherCount: 3, voucherValue: 120 },
    ],
  },
];

// Daily Quest data for Erion's Fragments
const DAILY_QUESTS = [
  { id: 'cernium', name: 'Cernium Research', fragments: 1 },
  { id: 'hotel_arcs', name: 'Clean Up Around Hotel Arcus', fragments: 3 },
  { id: 'odium', name: 'Odium Area Expedition', fragments: 6 },
  { id: 'shangri_la', name: 'Shangri-La Contamination Purification', fragments: 10 },
  { id: 'arteria', name: 'Defeat the Arteria Remnants', fragments: 15 },
  { id: 'carcion', name: 'Carcion Recovery Support', fragments: 25 },
  { id: 'tallahart', name: "Investigate the Tallahart Ancient God's Power", fragments: 45 },
  { id: 'geardrak', name: 'Geardrak Cronos’ Remnants Collection', fragments: 65 },
];

// Maximum traces that can be accumulated
const MAX_TRACES_CAPACITY = 1000;

const AstraSecondaryCalculator = () => {
  // User input state
  const [currentMission, setCurrentMission] = useState(1);
  const [currentTraces, setCurrentTraces] = useState(0);
  const [currentFragments, setCurrentFragments] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
  });

  // Boss configuration state
  const [bossSelections, setBossSelections] = useState(
    TRACES_BOSS_DATA.map(boss => ({
      id: boss.id,
      selectedDifficulty: 'None',
      partySize: 1,
      clearedThisWeek: false,
      vouchersKept: 0,
    }))
  );

  // Daily quest state - stores the highest quest completed (or null if none)
  const [highestDailyQuest, setHighestDailyQuest] = useState('tallahart');
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  
  // Future quest upgrade state
  const [futureQuestDate, setFutureQuestDate] = useState('');
  const [futureQuestId, setFutureQuestId] = useState('');
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentMission !== undefined) setCurrentMission(parsed.currentMission);
        if (parsed.currentTraces !== undefined) setCurrentTraces(parsed.currentTraces);
        if (parsed.currentFragments !== undefined) setCurrentFragments(parsed.currentFragments);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.bossSelections) {
          setBossSelections(parsed.bossSelections.map(b => ({
            ...b,
            vouchersKept: b.vouchersKept ?? 0,
          })));
        }
        if (parsed.highestDailyQuest) setHighestDailyQuest(parsed.highestDailyQuest);
        if (parsed.daysPerWeek !== undefined) setDaysPerWeek(parsed.daysPerWeek);
        if (parsed.futureQuestDate !== undefined) setFutureQuestDate(parsed.futureQuestDate);
        if (parsed.futureQuestId !== undefined) setFutureQuestId(parsed.futureQuestId);
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
      const state = {
        currentMission,
        currentTraces,
        currentFragments,
        startDate,
        bossSelections,
        highestDailyQuest,
        daysPerWeek,
        futureQuestDate,
        futureQuestId,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // ignore storage errors
    }
  }, [currentMission, currentTraces, currentFragments, startDate, bossSelections, highestDailyQuest, daysPerWeek, futureQuestDate, futureQuestId, isLoaded]);

  // Reset all state
  const handleReset = () => {
    const now = new Date();
    const defaultDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
    
    setCurrentMission(1);
    setCurrentTraces(0);
    setCurrentFragments(0);
    setStartDate(defaultDate);
    setBossSelections(
      TRACES_BOSS_DATA.map(boss => ({
        id: boss.id,
        selectedDifficulty: 'None',
        partySize: 1,
        clearedThisWeek: false,
        vouchersKept: 0,
      }))
    );
    setHighestDailyQuest('tallahart');
    setDaysPerWeek(7);
    setFutureQuestDate('');
    setFutureQuestId('');
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  // Handle boss selection changes
  const handleBossSelectionChange = (bossId, field, value) => {
    setBossSelections(prev =>
      prev.map(boss =>
        boss.id === bossId
          ? { ...boss, [field]: value }
          : boss
      )
    );
  };

  // Calculate weekly traces and voucher fragments per boss
  const calculateBossWeeklyData = () => {
    return bossSelections.map(selection => {
      const boss = TRACES_BOSS_DATA.find(b => b.id === selection.id);
      const difficulty = boss.difficulties.find(d => d.name === selection.selectedDifficulty);

      if (!difficulty || selection.selectedDifficulty === 'None') {
        return {
          bossId: boss.id,
          bossName: boss.name,
          tracesPerClear: 0,
          tracesPerWeek: 0,
          voucherFragmentsPerWeek: 0,
          voucherCount: 0,
          voucherValue: 0,
          vouchersKept: 0,
        };
      }

      const tracesPerClear = Math.floor(difficulty.traces / selection.partySize);
      const tracesPerWeek = selection.clearedThisWeek ? 0 : tracesPerClear;
      const vouchersKept = difficulty.hasVoucher ? (selection.vouchersKept || 0) : 0;
      const voucherFragmentsPerWeek = vouchersKept * (difficulty.voucherValue || 0);

      return {
        bossId: boss.id,
        bossName: boss.name,
        difficulty: difficulty.name,
        tracesPerClear,
        tracesPerWeek,
        voucherFragmentsPerWeek,
        voucherCount: difficulty.voucherCount || 0,
        voucherValue: difficulty.voucherValue || 0,
        vouchersKept,
        hasVoucher: difficulty.hasVoucher,
      };
    });
  };

  // Calculate daily fragment acquisition for a specific date
  const getDailyFragmentsForDate = (date) => {
    // Check if we've passed the future quest date
    if (futureQuestDate && futureQuestId) {
      const futureDate = new Date(futureQuestDate + 'T00:00:00.000Z');
      if (date >= futureDate) {
        const quest = DAILY_QUESTS.find(q => q.id === futureQuestId);
        return quest ? quest.fragments : 0;
      }
    }
    const quest = DAILY_QUESTS.find(q => q.id === highestDailyQuest);
    return quest ? quest.fragments : 0;
  };
  
  // Backward compatibility - get daily fragments for current date
  const getDailyFragments = () => getDailyFragmentsForDate(new Date());

  // Main calculation logic
  const calculateSchedule = useMemo(() => {
    const bossData = calculateBossWeeklyData();
    const weeklyTraces = bossData.reduce((sum, b) => sum + b.tracesPerWeek, 0);
    const weeklyVoucherFragments = bossData.reduce((sum, b) => sum + b.voucherFragmentsPerWeek, 0);
    const dailyFragments = getDailyFragments();
    const weeklyDailyFragments = dailyFragments * daysPerWeek;

    // Get missions starting from current
    const startMissionIndex = currentMission - 1;
    const remainingMissions = MISSIONS.slice(startMissionIndex);

    // Check if completion is impossible (no weekly traces and need more traces)
    const totalTracesNeeded = remainingMissions.reduce((sum, m) => sum + m.tracesRequired, 0);
    const tracesHave = Math.min(currentTraces, MAX_TRACES_CAPACITY);
    const tracesNeeded = Math.max(0, totalTracesNeeded - tracesHave);
    const isUnreachable = weeklyTraces === 0 && tracesNeeded > 0;

    // Initial state
    let traces = tracesHave;
    let fragments = currentFragments;
    let currentDate = new Date(startDate + 'T00:00:00.000Z');
    const dayOfWeek = currentDate.getUTCDay();
    const daysUntilThursdayReset = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;
    let nextThursday = new Date(currentDate);
    nextThursday.setDate(nextThursday.getDate() + daysUntilThursdayReset);

    const missionResults = [];
    const timeline = [];
    let dayCount = 0;
    // If unreachable, return early with infinity
    if (isUnreachable) {
      return {
        bossData,
        weeklyTraces,
        weeklyVoucherFragments,
        dailyFragments,
        weeklyDailyFragments,
        missionResults: remainingMissions.map(mission => ({
          mission,
          startDate: new Date(currentDate),
          completionDate: null,
          daysNeeded: Infinity,
          startTraces: tracesHave,
          startFragments: currentFragments,
          traceOverflow: 0,
        })),
        completionDate: 'Never (no trace income)',
        totalDays: Infinity,
        timeline: [],
        isUnreachable: true,
      };
    }

    for (const mission of remainingMissions) {
      const missionStartTraces = traces;
      const missionStartFragments = fragments;
      const missionStartDate = new Date(currentDate);
      let missionDays = 0;
      let missionTraceOverflow = 0;

      while ((traces < mission.tracesRequired || fragments < mission.fragmentsRequired)) {
        dayCount++;
        missionDays++;

        // Add daily fragments (check for future quest upgrade)
        const fragmentsToday = getDailyFragmentsForDate(currentDate);
        if (dayCount % 7 <= daysPerWeek || daysPerWeek === 7) {
          fragments += fragmentsToday;
        }

        // Check for Thursday reset (weekly boss traces + weekly voucher fragments)
        if (currentDate.getTime() === nextThursday.getTime() || currentDate > nextThursday) {
          traces = Math.min(traces + weeklyTraces, MAX_TRACES_CAPACITY);
          fragments += weeklyVoucherFragments;
          
          if (weeklyTraces > 0 || weeklyVoucherFragments > 0) {
            timeline.push({
              date: new Date(nextThursday),
              type: 'weekly',
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
            type: 'daily_week',
            tracesAdded: 0,
            fragmentsAdded: weeklyDailyFragments,
            tracesTotal: traces,
            fragmentsTotal: fragments,
          });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate overflow traces for next mission
      missionTraceOverflow = Math.max(0, traces - mission.tracesRequired);

      // Deduct mission costs
      traces -= mission.tracesRequired;
      fragments -= mission.fragmentsRequired;

      missionResults.push({
        mission,
        startDate: missionStartDate,
        completionDate: new Date(currentDate),
        daysNeeded: missionDays,
        startTraces: missionStartTraces,
        startFragments: missionStartFragments,
        traceOverflow: missionTraceOverflow,
      });
    }

    // Format completion date
    const formattedCompletionDate = missionResults.length > 0
      ? missionResults[missionResults.length - 1].completionDate.toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        }) + ' (UTC)'
      : 'Already Complete!';

    return {
      bossData,
      weeklyTraces,
      weeklyVoucherFragments,
      dailyFragments,
      weeklyDailyFragments,
      missionResults,
      completionDate: formattedCompletionDate,
      totalDays: dayCount,
      timeline,
      isUnreachable: false,
    };
  }, [currentMission, currentTraces, currentFragments, startDate, bossSelections, highestDailyQuest, daysPerWeek, futureQuestDate, futureQuestId]);

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
      {/* Current Status Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold text-primary-bright">Current Status</h2>
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
          <label className="block text-primary-bright font-medium mb-3 text-center">Current Mission</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MISSIONS.map(mission => {
              const isSelected = currentMission === mission.id;
              return (
                <button
                  key={mission.id}
                  onClick={() => setCurrentMission(mission.id)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    isSelected 
                      ? 'bg-secondary/20 border-secondary' 
                      : 'bg-primary-dark border-primary-dim hover:border-primary-bright/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected ? 'bg-secondary text-primary-dark' : 'bg-primary-dim text-primary-bright'
                    }`}>
                      {mission.id}
                    </div>
                    <div>
                      <div className={`font-semibold ${isSelected ? 'text-secondary' : 'text-primary-bright'}`}>
                        {mission.name}
                      </div>
                      <div className="text-xs text-primary-bright/60">
                        {mission.tracesRequired.toLocaleString()} Traces · {mission.fragmentsRequired.toLocaleString()} Fragments
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
                <label className="block text-primary-bright font-medium text-sm">Fierce Battle Traces</label>
                <span className="text-xs text-primary-bright/60">Max 1,000 per mission</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="flex-1 p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center font-semibold"
                value={currentTraces}
                onChange={(e) => setCurrentTraces(Math.min(MAX_TRACES_CAPACITY, Math.max(0, Number(e.target.value))))}
                min="0"
                max={MAX_TRACES_CAPACITY}
              />
              <span className="text-primary-bright/60 text-sm">/ {MAX_TRACES_CAPACITY.toLocaleString()}</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 bg-primary-dark rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentTraces / MAX_TRACES_CAPACITY) * 100)}%` }}
              />
            </div>
          </div>

          {/* Current Fragments */}
          <div className="p-4 bg-background-bright border border-primary-dim rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center">
                <Image
                  src="/astra-secondary/erion-fragment.webp"
                  alt="Erion's Fragment"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <label className="block text-primary-bright font-medium text-sm">Erion's Fragments</label>
                <span className="text-xs text-primary-bright/60">No capacity limit</span>
              </div>
            </div>
            <input
              type="number"
              className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center font-semibold"
              value={currentFragments}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  setCurrentFragments(val);
                } else {
                  setCurrentFragments(Number(val));
                }
              }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  setCurrentFragments(0);
                }
              }}
            />
            <p className="text-xs text-primary-bright/40 mt-2 text-center">Interactive players: If you plan to buy tradable fragments, input them here. </p>
          </div>

          {/* Start Date */}
          <div className="p-4 bg-background-bright border border-primary-dim rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
              </div>
              <div>
                <label className="block text-primary-bright font-medium text-sm">Start Date</label>
                <span className="text-xs text-primary-bright/60">UTC timezone</span>
              </div>
            </div>
            <input
              type="date"
              className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center font-semibold"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
            <h2 className="text-2xl font-semibold text-primary-bright mb-4">Boss Configuration</h2>
            <p className="text-sm text-primary-bright/70 mb-4">
              Select difficulty, party size, and whether you cleared this week.
              Traces are divided by party size. Erion's Fragment Exchange Tickets drop every kill - set how many you keep per week (0 = sell all).
            </p>

            {TRACES_BOSS_DATA.map((boss) => {
              const selection = bossSelections.find(b => b.id === boss.id);
              const selectedDifficulty = boss.difficulties.find(d => d.name === selection?.selectedDifficulty);
              
              return (
                <div key={boss.id} className="bg-background-bright border border-primary-dim p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={`/bossImages/largeIcons/${boss.id === 'seren' ? 'seren' : boss.id === 'kalos' ? 'kalos' : boss.id === 'first_adversary' ? 'first_adversary' : boss.id}.png`}
                      alt={boss.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <h3 className="text-lg font-medium text-primary-bright">{boss.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Difficulty Selection */}
                    <div className="sm:col-span-4">
                      <label className="block text-primary-bright text-sm mb-1">Difficulty</label>
                      <select
                        className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                        value={selection?.selectedDifficulty || 'None'}
                        onChange={(e) => handleBossSelectionChange(boss.id, 'selectedDifficulty', e.target.value)}
                      >
                        <option value="None">Not Clearing</option>
                        {boss.difficulties.map(diff => (
                          <option key={diff.name} value={diff.name}>
                            {diff.name} ({diff.traces} traces{diff.hasVoucher ? `, ${diff.voucherCount}×${diff.voucherValue} fragments` : ''})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Party Size */}
                    <div className="sm:col-span-2">
                      <label className="block text-primary-bright text-sm mb-1">Party</label>
                      <select
                        className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                        value={selection?.partySize || 1}
                        onChange={(e) => handleBossSelectionChange(boss.id, 'partySize', Number(e.target.value))}
                      >
                        {Array.from({ length: boss.maxPartySize || 6 }, (_, i) => i + 1).map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tickets Kept */}
                    {selectedDifficulty?.hasVoucher && (
                      <div className="sm:col-span-3">
                        <label className="block text-primary-bright text-sm mb-1">
                          Vouchers Kept
                          <span className="text-primary-bright/50 font-normal ml-1">(of {selectedDifficulty.voucherCount})</span>
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim text-center"
                          value={selection?.vouchersKept ?? 0}
                          min={0}
                          max={selectedDifficulty.voucherCount}
                          onChange={(e) => handleBossSelectionChange(boss.id, 'vouchersKept', Math.min(selectedDifficulty.voucherCount, Math.max(0, Number(e.target.value))))}
                        />
                      </div>
                    )}

                    {/* Cleared This Week Toggle */}
                    <div className={selectedDifficulty?.hasVoucher ? 'sm:col-span-3' : 'sm:col-span-6'}>
                      <label className="block text-primary-bright text-sm mb-1">Cleared This Week</label>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selection?.clearedThisWeek || false}
                            onChange={(e) => handleBossSelectionChange(boss.id, 'clearedThisWeek', e.target.checked)}
                            disabled={selection?.selectedDifficulty === 'None'}
                          />
                          <div className={`block w-10 h-6 rounded-full border border-primary-dim ${selection?.clearedThisWeek ? 'bg-secondary' : 'bg-primary-dark'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${selection?.clearedThisWeek ? 'transform translate-x-full' : ''}`}></div>
                        </div>
                        <span className="ml-2 text-primary-bright text-sm">
                          {selection?.clearedThisWeek ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {selectedDifficulty && selectedDifficulty.name !== 'None' && (
                    <div className="mt-3 p-2 bg-primary-dark rounded-lg text-sm flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-primary-bright/70">
                        Traces: <span className="font-semibold text-secondary">{Math.floor(selectedDifficulty.traces / (selection?.partySize || 1))}/week</span>
                      </span>
                      {selectedDifficulty.hasVoucher && (
                        <span className="text-primary-bright/70">
                          Vouchers: <span className="font-semibold text-secondary">{selectedDifficulty.voucherCount} drops</span>
                          <span className="text-primary-bright/50"> × {selectedDifficulty.voucherValue} Erion's Fragments each</span>
                          {(selection?.vouchersKept || 0) > 0 && (
                            <span className="text-secondary font-semibold ml-1">→ {(selection.vouchersKept * selectedDifficulty.voucherValue).toLocaleString()} frags/week kept</span>
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
            <h2 className="text-2xl font-semibold text-primary-bright mb-4">Daily Quest Configuration</h2>
            <p className="text-sm text-primary-bright/70 mb-4">
              Select the highest level daily quest you complete. You receive fragments equal to that quest's reward.
            </p>

            <div className="bg-background-bright border border-primary-dim p-4 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary-bright font-medium mb-2">Highest Daily Quest Completed</label>
                  <select
                    className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                    value={highestDailyQuest}
                    onChange={(e) => setHighestDailyQuest(e.target.value)}
                  >
                    {DAILY_QUESTS.map(quest => (
                      <option key={quest.id} value={quest.id}>
                        {quest.name} ({quest.fragments} fragments/day)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-primary-bright font-medium mb-2">Days Per Week</label>
                  <select
                    className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(days => (
                      <option key={days} value={days}>{days} days/week</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Future Quest Upgrade Section */}
              <div className="mt-4 pt-4 border-t border-primary-dim">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                    <path d="M12 8v4l3 3"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  <label className="text-primary-bright font-medium">Future Quest Upgrade (Optional)</label>
                </div>
                <p className="text-xs text-primary-bright/60 mb-3">
                  Schedule a higher daily quest for when you can access a new region.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-bright/80 text-sm mb-1">Switch to Quest</label>
                    <select
                      className="w-full p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                      value={futureQuestId}
                      onChange={(e) => setFutureQuestId(e.target.value)}
                    >
                      <option value="">No planned upgrade</option>
                      {DAILY_QUESTS.filter(q => q.fragments > DAILY_QUESTS.find(dq => dq.id === highestDailyQuest)?.fragments || 0).map(quest => (
                        <option key={quest.id} value={quest.id}>
                          {quest.name} ({quest.fragments} fragments/day)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-primary-bright/80 text-sm mb-1">Starting Date</label>
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
                      Will switch from {DAILY_QUESTS.find(q => q.id === highestDailyQuest)?.name} ({DAILY_QUESTS.find(q => q.id === highestDailyQuest)?.fragments} fragments) 
                      to {DAILY_QUESTS.find(q => q.id === futureQuestId)?.name} ({DAILY_QUESTS.find(q => q.id === futureQuestId)?.fragments} fragments) 
                      on {new Date(futureQuestDate + 'T00:00:00.000Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} (UTC)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-primary-dark rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-primary-bright">Current Daily Fragment Income:</span>
                  <span className="font-bold text-secondary">{getDailyFragments()} fragments/day</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-primary-bright">Weekly Fragment Income (dailies only):</span>
                  <span className="font-bold text-secondary">{getDailyFragments() * daysPerWeek} fragments/week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-semibold text-primary-bright mb-4">Progress Overview</h2>

          {/* Summary Card */}
          <div className="bg-background-bright border border-primary-dim p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/astra-secondary/trace-of-battle.webp" alt="" width={20} height={20} className="opacity-80" />
                <span className="text-primary-bright text-sm">Weekly Traces:</span>
              </div>
              <span className="font-bold text-secondary">{calculateSchedule.weeklyTraces}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/astra-secondary/erion-fragment.webp" alt="" width={20} height={20} className="opacity-80" />
                <span className="text-primary-bright text-sm">Weekly Fragments (dailies):</span>
              </div>
              <span className="font-bold text-secondary">{calculateSchedule.weeklyDailyFragments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/astra-secondary/erion-fragment.webp" alt="" width={20} height={20} className="opacity-80" />
                <span className="text-primary-bright text-sm">Weekly Fragments (vouchers):</span>
              </div>
              <span className="font-bold text-secondary">{calculateSchedule.weeklyVoucherFragments}</span>
            </div>
          </div>

          {/* Mission Results */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-primary-bright">Mission Timeline</h3>
            
            {calculateSchedule.missionResults.map((result, idx) => (
              <div key={result.mission.id} className={`bg-background-bright border p-4 rounded-xl ${
                idx === 0 ? 'border-secondary/50 ring-1 ring-secondary/20' : 'border-primary-dim'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    idx === 0 ? 'bg-secondary/30' : 'bg-primary-dark'
                  }`}>
                    <span className={`text-lg font-bold ${idx === 0 ? 'text-secondary' : 'text-primary-bright'}`}>
                      {result.mission.id}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-primary-bright">{result.mission.name}</h4>
                      {idx === 0 && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-primary-bright/60">{result.mission.description}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Image src="/astra-secondary/trace-of-battle.webp" alt="" width={14} height={14} />
                      <span className="text-primary-bright/70">Traces:</span>
                    </div>
                    <span className="text-primary-bright">{result.mission.tracesRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Image src="/astra-secondary/erion-fragment.webp" alt="" width={14} height={14} />
                      <span className="text-primary-bright/70">Fragments:</span>
                    </div>
                    <span className="text-primary-bright">{result.mission.fragmentsRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-bright/70">Est. Days:</span>
                    <span className="font-semibold text-secondary">
                      {isFinite(result.daysNeeded) ? `${result.daysNeeded} days` : '∞'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-primary-dim/50">
                    <span className="text-primary-bright/70 text-xs">Complete by:</span>
                    <span className="font-semibold text-primary-bright text-sm">
                      {result.completionDate ? result.completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'Never'}
                    </span>
                  </div>
                  {result.traceOverflow > 0 && (
                    <div className="flex justify-between text-xs bg-primary-dark/50 p-1.5 rounded">
                      <span className="text-primary-bright/60">Overflow to next:</span>
                      <span className="text-secondary font-medium">+{result.traceOverflow} traces</span>
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
                <h3 className="text-lg font-semibold text-primary-bright">Final Completion</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <span className="text-primary-bright text-sm">Total Days:</span>
                  </div>
                  <span className="font-bold text-secondary text-lg">
                    {isFinite(calculateSchedule.totalDays) ? `${calculateSchedule.totalDays} days` : '∞'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-secondary/20">
                  <span className="text-primary-bright/80 text-sm">Complete Astra Secondary:</span>
                  <span className="font-bold text-secondary">{calculateSchedule.completionDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boss Weekly Breakdown */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-medium text-primary-bright">Weekly Boss Breakdown</h3>
          <span className="text-sm text-primary-bright/60 ml-auto">
            {calculateSchedule.bossData.filter(b => b.tracesPerWeek > 0 || b.voucherFragmentsPerWeek > 0).length} bosses selected
          </span>
        </div>
        <div className="bg-background-bright border border-primary-dim p-4 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calculateSchedule.bossData.filter(b => b.tracesPerWeek > 0 || b.voucherFragmentsPerWeek > 0).map(boss => (
              <div key={boss.bossId} className="flex items-center justify-between p-3 bg-primary-dark rounded-lg border border-primary-dim/50">
                <div className="flex items-center gap-2">
                  <Image
                    src={`/bossImages/largeIcons/${boss.bossId === 'seren' ? 'seren' : boss.bossId === 'kalos' ? 'kalos' : boss.bossId === 'first_adversary' ? 'first_adversary' : boss.bossId}.png`}
                    alt={boss.bossName}
                    width={32}
                    height={32}
                    className="rounded-md"
                  />
                  <div>
                    <div className="text-sm text-primary-bright font-medium">{boss.bossName}</div>
                    <div className="text-xs text-primary-bright/60">{boss.difficulty}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Image src="/astra-secondary/trace-of-battle.webp" alt="" width={12} height={12} />
                    <span className="text-sm font-bold text-secondary">+{boss.tracesPerWeek}</span>
                  </div>
                  {boss.voucherFragmentsPerWeek > 0 && (
                    <div className="flex items-center gap-1 justify-end">
                      <Image src="/astra-secondary/erion-fragment.webp" alt="" width={12} height={12} />
                      <span className="text-xs text-secondary/80">+{boss.voucherFragmentsPerWeek} frags</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {calculateSchedule.bossData.filter(b => b.tracesPerWeek > 0 || b.voucherFragmentsPerWeek > 0).length === 0 && (
              <div className="col-span-full text-center text-primary-bright/60 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
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
