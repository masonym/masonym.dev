'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import CustomDropdown from './CustomDropdown';

const LIBERATION_QUESTS = [
  { id: 1, name: 'Decisive Battle, Chosen Seren', image: '/bossImages/chosen_seren.png', tracesRequired: 2000 },
  { id: 2, name: 'Decisive Battle, Watcher Kalos', image: '/bossImages/kalos_the_guardian.png', tracesRequired: 2500 },
  { id: 3, name: 'Decisive Battle, Apostle Kaling', image: '/bossImages/kaling.png', tracesRequired: 3000 },
];

// Boss data with trace drops by difficulty (5 weekly-only bosses)
const BOSS_DATA = [
  {
    id: 'seren',
    name: 'Chosen Seren',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Hard', traces: 6 },
      { name: 'Extreme', traces: 80 },
    ],
  },
  {
    id: 'kalos',
    name: 'Watcher Kalos',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 10 },
      { name: 'Hard', traces: 70 },
      { name: 'Extreme', traces: 400 },
    ],
  },
  {
    id: 'first_adversary',
    name: 'First Adversary',
    maxPartySize: 3,
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 15 },
      { name: 'Hard', traces: 120 },
      { name: 'Extreme', traces: 500 },
    ]
  },
  {
    id: 'kaling',
    name: 'Kaling',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 20 },
      { name: 'Hard', traces: 160 },
      { name: 'Extreme', traces: 1200 },
    ],
  },
  {
    id: 'limbo',
    name: 'Limbo',
    maxPartySize: 3,
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 120 },
      { name: 'Hard', traces: 360 },
    ],
  },
  {
    id: "baldrix",
    name: "Baldrix",
    maxPartySize: 3,
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 150 },
      { name: 'Hard', traces: 450 },
    ],
  }
];

const DestinyLiberationCalculator = () => {
  // State for user inputs
  const [currentQuest, setCurrentQuest] = useState(1);
  const [currentTraces, setCurrentTraces] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
  });
  const [bossSelections, setBossSelections] = useState(
    BOSS_DATA.map(boss => ({
      id: boss.id,
      selectedDifficulty: boss.difficulties[0].name,
      partySize: 1,
      clearedThisWeek: false,
      isCleared: true,
    }))
  );

  // Calculate traces per week and completion date
  const calculateSchedule = () => {
    // Get the current quest data
    const questIndex = currentQuest - 1;
    const currentQuestData = LIBERATION_QUESTS[questIndex];

    // Calculate remaining traces for current quest
    const remainingTracesForCurrentQuest = Math.max(0, currentQuestData.tracesRequired - currentTraces);

    // Calculate total traces needed for all quests (current and future)
    let totalTracesNeeded = remainingTracesForCurrentQuest;
    for (let i = questIndex + 1; i < LIBERATION_QUESTS.length; i++) {
      totalTracesNeeded += LIBERATION_QUESTS[i].tracesRequired;
    }

    // Get the start date as a Date object (parse as UTC)
    const startDateObj = new Date(startDate + 'T00:00:00.000Z');

    // Calculate how many traces we'll get immediately from bosses not yet cleared this week
    let immediateWeeklyTraces = 0;

    // Separate weekly bosses (no monthly bosses in Destiny)
    let weeklyBosses = [];

    // Process each boss selection
    bossSelections.forEach(selection => {
      const boss = BOSS_DATA.find(b => b.id === selection.id);
      const difficulty = boss.difficulties.find(d => d.name === selection.selectedDifficulty);

      // If boss is not cleared at all or difficulty is None, push zero traces entry
      if (!selection.isCleared || !difficulty || difficulty.name === 'None') {
        const bossData = {
          bossId: boss.id,
          bossName: boss.name,
          tracesPerWeek: 0,
          tracesPerClear: 0,
          isMonthly: false,
        };
        weeklyBosses.push(bossData);
        return;
      }

      // Calculate traces based on party size
      const tracesPerClear = Math.floor(difficulty.traces / selection.partySize);

      // If not cleared this week, add to immediate traces
      if (!selection.clearedThisWeek) {
        immediateWeeklyTraces += tracesPerClear;
      }

      // For weekly bosses
      const bossData = {
        bossId: boss.id,
        bossName: boss.name,
        tracesPerClear,
        isMonthly: false,
        tracesPerWeek: calculateWeeklyBossTraces(startDateObj, tracesPerClear, selection.clearedThisWeek),
      };
      weeklyBosses.push(bossData);
    });

    // Combine for display purposes (weekly only)
    const weeklyTraces = [...weeklyBosses];

    // Calculate total weekly traces
    const totalWeeklyTraces = weeklyBosses.reduce((sum, boss) => sum + boss.tracesPerWeek, 0);

    // Get the day of the week (0 = Sunday ... 4 = Thursday)
    const dayOfWeek = startDateObj.getUTCDay();

    // Calculate days until next Thursday reset (day 4)
    const daysUntilReset = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;

    // Check if we can complete immediately with available traces
    const totalImmediateTraces = immediateWeeklyTraces;
    if (totalImmediateTraces >= totalTracesNeeded) {
      const timeline = [];
      let remaining = totalTracesNeeded;

      if (immediateWeeklyTraces > 0) {
        const amt = Math.min(immediateWeeklyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(startDateObj),
          label: 'Weekly',
          amount: amt,
          remaining,
        });
      }

      const formattedCompletionDate = startDateObj.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      }) + ' (UTC)';

      return {
        weeklyTraces,
        totalWeeklyTraces,
        totalMonthlyTraces: 0,
        immediateTraces: totalImmediateTraces,
        firstWeekTraces: totalImmediateTraces,
        weeksNeeded: 0,
        completionDate: formattedCompletionDate,
        totalTracesNeeded,
        timeline,
      };
    }

    // First week traces
    const firstWeekTraces = totalWeeklyTraces + immediateWeeklyTraces;

    // Initialize completion variables
    let completionDate;
    let weeksNeeded = Infinity;

    if (totalWeeklyTraces > 0) {
      let tracesCollected = 0;
      let weeksCount = 0;
      let currentDate = new Date(startDateObj);

      const timeline = [];
      let remaining = totalTracesNeeded;

      // First weekly reset date
      const firstWeeklyResetDate = new Date(currentDate);
      firstWeeklyResetDate.setDate(firstWeeklyResetDate.getDate() + daysUntilReset);

      // Add immediate weekly traces available at start
      if (immediateWeeklyTraces > 0) {
        tracesCollected += immediateWeeklyTraces;
        const amt = Math.min(immediateWeeklyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(startDateObj),
          label: 'Weekly',
          amount: amt,
          remaining,
        });
      }

      // Move to first weekly reset and add first week's payout
      currentDate = new Date(firstWeeklyResetDate);
      const firstWeekPayout = totalWeeklyTraces;
      tracesCollected += firstWeekPayout;
      weeksCount = 1;

      if (firstWeekPayout > 0) {
        const amt = Math.min(firstWeekPayout, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(firstWeeklyResetDate),
          label: 'Weekly',
          amount: amt,
          remaining,
        });
      }

      // Continue adding weekly traces until we have enough
      while (tracesCollected < totalTracesNeeded) {
        const nextWeeklyReset = new Date(currentDate);
        nextWeeklyReset.setDate(nextWeeklyReset.getDate() + 7);

        tracesCollected += totalWeeklyTraces;
        if (totalWeeklyTraces > 0) {
          const amt = Math.min(totalWeeklyTraces, remaining);
          remaining -= amt;
          timeline.push({
            date: new Date(nextWeeklyReset),
            label: 'Weekly',
            amount: amt,
            remaining,
          });
        }
        weeksCount++;
        currentDate.setDate(currentDate.getDate() + 7);
      }

      if (!completionDate) {
        completionDate = new Date(currentDate);
      }

      weeksNeeded = weeksCount;

      const formattedCompletionDate = completionDate ? completionDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      }) + ' (UTC)' : 'Never (no traces)';

      return {
        weeklyTraces,
        totalWeeklyTraces,
        totalMonthlyTraces: 0,
        immediateTraces: totalImmediateTraces,
        firstWeekTraces,
        weeksNeeded,
        completionDate: formattedCompletionDate,
        totalTracesNeeded,
        timeline,
      };
    } else {
      weeksNeeded = Infinity;
      completionDate = null;
    }

    const formattedCompletionDate = completionDate ? completionDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }) + ' (UTC)' : 'Never (no traces)';

    return {
      weeklyTraces,
      totalWeeklyTraces,
      totalMonthlyTraces: 0,
      immediateTraces: totalImmediateTraces,
      firstWeekTraces,
      weeksNeeded,
      completionDate: formattedCompletionDate,
      totalTracesNeeded,
      timeline: [],
    };
  };

  // Calculate traces per week for weekly bosses (reset on Thursday 00:00 UTC)
  const calculateWeeklyBossTraces = (startDate, tracesPerClear, clearedThisWeek) => {
    return tracesPerClear;
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

  // Format date for display (UTC)
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00.000Z');
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }) + ' (UTC)';
  };

  // Calculate schedule results
  const scheduleResults = calculateSchedule();

  return (
    <div className="max-w-7xl mx-auto bg-primary-dark border border-primary-dim p-6 rounded-2xl">
      {/* Input Details Section */}
      <div className="mb-8 p-4 bg-background-bright border border-primary-dim flex justify-between flex-col rounded-xl">
        <h2 className="text-2xl font-semibold text-primary-bright mb-4 mx-auto">Current Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mx-auto w-full">
          {/* Quest Selection */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <label className="block text-primary-bright font-medium">Current Quest</label>
            <CustomDropdown
              options={LIBERATION_QUESTS}
              selectedId={currentQuest}
              onChange={setCurrentQuest}
            />
          </div>

          {/* Current Traces */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <label className="block text-primary-bright font-medium">Current Adversary's Determination</label>
            <input
              type="number"
              className="w-full max-w-[200px] p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
              value={currentTraces}
              onChange={(e) => setCurrentTraces(Math.max(0, Number(e.target.value)))}
              min="0"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <label className="block text-primary-bright font-medium">Start Date (UTC)</label>
            <input
              type="date"
              className="w-full max-w-[200px] p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Boss Selection Section - Left Column */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-2xl font-semibold text-primary-bright mb-4">Bosses Cleared</h2>

          {BOSS_DATA.map((boss) => (
            <div key={boss.id} className="bg-background-bright border border-primary-dim p-4 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Image
                    src={`/bossImages/largeIcons/${boss.id}.png`}
                    alt={boss.name}
                    width={48}
                    height={48}
                    className="rounded-md mr-3"
                  />
                  <h3 className="text-lg font-medium text-primary-bright">{boss.name}</h3>
                </div>

              </div>

              {/* Only show these options if boss is cleared */}
              {bossSelections.find(b => b.id === boss.id)?.isCleared && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 items-center">
                  {/* Difficulty Selection - Takes up more space */}
                  <div className="sm:col-span-7">
                    <div className="flex items-center flex-wrap gap-3 sm:gap-6 justify-start">
                      {boss.difficulties.map((difficulty) => (
                        <div
                          key={difficulty.name}
                          onClick={() => handleBossSelectionChange(boss.id, 'selectedDifficulty', difficulty.name)}
                          className={`relative cursor-pointer transition-all ${bossSelections.find(b => b.id === boss.id)?.selectedDifficulty === difficulty.name
                            ? 'scale-110 sm:scale-125'
                            : 'opacity-60 hover:opacity-80'}`}
                        >
                          {difficulty.name !== 'None' ? (
                            <div className="relative">
                              <Image
                                src={`/bossDifficulties/${difficulty.name.toLowerCase()}.png`}
                                alt={difficulty.name}
                                width={80}
                                height={80}
                                className="rounded-md"
                              />
                              <div className="absolute -top-2 -right-4 bg-primary-dark rounded-full w-6 h-6 flex items-center justify-center border border-primary-bright">
                                <span className="text-xs text-primary-bright font-bold">{difficulty.traces}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-[40px] h-[40px] bg-primary-dark rounded-md flex items-center justify-center border border-primary-dim border-dashed">
                              <span className="text-xs text-primary-bright">Skip</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Party Size - Takes up less space */}
                  <div className="sm:col-span-2">
                    <label className="block text-primary-bright text-sm mb-1">Party Size</label>
                    <select
                      className="w-fit p-2 bg-primary-dark text-primary-bright rounded border border-primary-dim"
                      value={bossSelections.find(b => b.id === boss.id)?.partySize}
                      onChange={(e) => handleBossSelectionChange(boss.id, 'partySize', Number(e.target.value))}
                    >
                      {Array.from({ length: boss.maxPartySize || 6 }, (_, i) => i + 1).map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cleared This Week Toggle */}
                  <div className="sm:col-span-3 flex flex-col justify-center mt-2 sm:mt-0">
                    <label className="block text-primary-bright text-sm mb-1">Cleared This Week</label>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={bossSelections.find(b => b.id === boss.id)?.clearedThisWeek}
                            onChange={(e) => handleBossSelectionChange(boss.id, 'clearedThisWeek', e.target.checked)}
                          />
                          <div className="block bg-background-bright w-10 h-6 rounded-full border border-primary-dim"></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${bossSelections.find(b => b.id === boss.id)?.clearedThisWeek
                            ? 'transform translate-x-full bg-secondary'
                            : ''
                            }`}></div>
                        </div>
                        <div className="ml-3 text-primary-bright text-sm">
                          {bossSelections.find(b => b.id === boss.id)?.clearedThisWeek ? 'Yes' : 'No'}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Results Section - Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-semibold text-primary-bright mb-4">Liberation Schedule</h2>

          <div className="bg-background-bright border border-primary-dim p-3 sm:p-4 rounded-xl space-y-3 sm:space-y-4">
            <div className="flex justify-between">
              <span className="text-primary-bright">Total Adversary's Determination Needed:</span>
              <span className="font-bold text-primary-bright">{scheduleResults.totalTracesNeeded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-bright">Weekly Adversary's Determination:</span>
              <span className="font-bold text-primary-bright">{scheduleResults.totalWeeklyTraces.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-bright">Weeks to Complete:</span>
              <span className="font-bold text-primary-bright">
                {isFinite(scheduleResults.weeksNeeded) ? scheduleResults.weeksNeeded : '∞'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-bright">Start Date:</span>
              <span className="font-bold text-primary-bright">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-bright">Completion Date:</span>
              <span className="font-bold text-primary-bright">{scheduleResults.completionDate}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-primary-bright">Weekly Adversary's Determination Breakdown</h3>
            <div className="bg-background-bright border border-primary-dim p-3 sm:p-4 rounded-xl space-y-2">
              {scheduleResults.weeklyTraces.map((boss) => (
                <div key={boss.bossId} className="flex justify-between items-center py-1">
                  <div className="flex items-center">
                    <Image
                      src={`/bossImages/largeIcons/${boss.bossId}.png`}
                      alt={boss.bossName}
                      width={32}
                      height={32}
                      className="rounded-md mr-2"
                    />
                    <span className="text-primary-bright text-sm sm:text-base">{boss.bossName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-primary-bright">
                      {boss.tracesPerWeek.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
      {/* Schedule Timeline */}
      <div className="space-y-2 mt-4">
        <h3 className="text-xl font-medium text-primary-bright">Schedule Timeline</h3>
        <div className="bg-background-bright border border-primary-dim p-3 sm:p-4 rounded-xl space-y-2">
          {scheduleResults.timeline && scheduleResults.timeline.length > 0 ? (
            scheduleResults.timeline.map((ev, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <div className="text-primary-bright text-sm sm:text-base">
                  {ev.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} - {ev.label}
                </div>
                <div className="text-primary-bright font-bold text-sm sm:text-base">
                  +{Number(ev.amount).toFixed(0)} (remaining {Number(ev.remaining).toFixed(0)})
                </div>
              </div>
            ))
          ) : (
            <div className="text-primary-bright text-sm opacity-75">No accrual events yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinyLiberationCalculator;
