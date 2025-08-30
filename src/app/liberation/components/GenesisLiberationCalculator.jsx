'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CustomDropdown from './CustomDropdown';

// Liberation quest data
const LIBERATION_QUESTS = [
  { id: 1, name: "Traces of Von Leon the Lion King", image: "/bossImages/von_leon.png", tracesRequired: 500 },
  { id: 2, name: "Traces of Arkarium, the Guardian of Time", image: "/bossImages/arkarium.png", tracesRequired: 500 },
  { id: 3, name: "Traces of the Tyrant Magnus", image: "/bossImages/magnus.png", tracesRequired: 500 },
  { id: 4, name: "Traces of Lotus, the Wing Master", image: "/bossImages/lotus.png", tracesRequired: 1000 },
  { id: 5, name: "Traces of Damien, the Sword of Destruction", image: "/bossImages/damien.png", tracesRequired: 1000 },
  { id: 6, name: "Traces of Will, the King of Spiders", image: "/bossImages/will.png", tracesRequired: 1000 },
  { id: 7, name: "Traces of Lucid, Keeper of Nightmares", image: "/bossImages/lucid.png", tracesRequired: 1000 },
  { id: 8, name: "Traces of Verus Hilla the Red Witch", image: "/bossImages/verus_hilla.png", tracesRequired: 1000 }
];

// Boss data with trace drops by difficulty
const BOSS_DATA = [
  {
    id: 'lotus',
    name: 'Lotus',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 10 },
      { name: 'Hard', traces: 50 }
    ]
  },
  {
    id: 'damien',
    name: 'Damien',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 10 },
      { name: 'Hard', traces: 50 }
    ]
  },
  {
    id: 'lucid',
    name: 'Lucid',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Easy', traces: 15 },
      { name: 'Normal', traces: 20 },
      { name: 'Hard', traces: 65 }
    ]
  },
  {
    id: 'will',
    name: 'Will',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Easy', traces: 15 },
      { name: 'Normal', traces: 25 },
      { name: 'Hard', traces: 75 }
    ]
  },
  {
    id: 'gloom',
    name: 'Gloom',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 20 },
      { name: 'Chaos', traces: 65 }
    ]
  },
  {
    id: 'verus_hilla',
    name: 'Verus Hilla',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 45 },
      { name: 'Hard', traces: 90 }
    ]
  },
  {
    id: 'darknell',
    name: 'Darknell',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Normal', traces: 25 },
      { name: 'Hard', traces: 75 }
    ]
  },
  {
    id: 'black_mage',
    name: 'Black Mage',
    difficulties: [
      { name: 'None', traces: 0 },
      { name: 'Hard', traces: 600 },
      { name: 'Extreme', traces: 600 }
    ],
    monthlyReset: true
  }
];

// Party size options
const PARTY_SIZES = [1, 2, 3, 4, 5, 6];

const GenesisLiberationCalculator = () => {
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
      isCleared: true // Whether the boss is cleared at all
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

    // Calculate how many traces we'll get immediately from bosses not yet cleared this week/month
    let immediateWeeklyTraces = 0;
    let immediateMonthlyTraces = 0;

    // Get the day of month for monthly reset tracking
    const dayOfMonth = startDateObj.getUTCDate();

    // Separate weekly and monthly bosses
    let weeklyBosses = [];
    let monthlyBosses = [];

    // Process each boss selection
    bossSelections.forEach(selection => {
      const boss = BOSS_DATA.find(b => b.id === selection.id);
      const difficulty = boss.difficulties.find(d => d.name === selection.selectedDifficulty);

      // If boss is not cleared at all or difficulty is None, skip
      if (!selection.isCleared || !difficulty || difficulty.name === 'None') {
        const bossData = {
          bossId: boss.id,
          bossName: boss.name,
          tracesPerWeek: 0,
          tracesPerClear: 0,
          isMonthly: boss.monthlyReset || false
        };

        if (boss.monthlyReset) {
          monthlyBosses.push(bossData);
        } else {
          weeklyBosses.push(bossData);
        }
        return;
      }

      // Calculate traces based on party size
      const tracesPerClear = Math.floor(difficulty.traces / selection.partySize);

      // If not cleared this week/month, add to immediate traces
      if (!selection.clearedThisWeek) {
        if (boss.monthlyReset) {
          immediateMonthlyTraces += tracesPerClear;
        } else {
          immediateWeeklyTraces += tracesPerClear;
        }
      }

      // Create boss data object
      const bossData = {
        bossId: boss.id,
        bossName: boss.name,
        tracesPerClear,
        isMonthly: boss.monthlyReset || false
      };

      if (boss.monthlyReset) {
        // For monthly bosses (Black Mage)
        const monthlyData = calculateMonthlyBossTraces(startDateObj, tracesPerClear, selection.clearedThisWeek);
        console.log("Monthly Data: ", monthlyData);
        bossData.clearedThisMonth = monthlyData.clearedThisMonth;
        bossData.tracesPerMonth = monthlyData.tracesPerClear;
        bossData.tracesPerWeek = 0; // We'll handle monthly traces separately
        monthlyBosses.push(bossData);
      } else {
        // For weekly bosses
        bossData.tracesPerWeek = calculateWeeklyBossTraces(startDateObj, tracesPerClear, selection.clearedThisWeek);
        weeklyBosses.push(bossData);
      }
    });

    // Combine weekly and monthly bosses for display purposes
    const weeklyTraces = [...weeklyBosses, ...monthlyBosses];

    // Calculate total weekly traces (excluding monthly bosses)
    const totalWeeklyTraces = weeklyBosses.reduce((sum, boss) => sum + boss.tracesPerWeek, 0);

    // Calculate total monthly traces
    const totalMonthlyTraces = monthlyBosses.reduce((sum, boss) => sum + boss.tracesPerClear, 0);

    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 4 = Thursday, ...)
    const dayOfWeek = startDateObj.getUTCDay();

    // Calculate days until next Thursday reset (Thursday is day 4)
    const daysUntilReset = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;

    // Calculate days until next monthly reset (1st of the month)
    const nextMonthlyReset = getNextMonthlyResetDate(startDateObj);
    console.log("Next Monthly Reset: ", nextMonthlyReset)
    const daysUntilMonthlyReset = Math.ceil((nextMonthlyReset - startDateObj) / (1000 * 60 * 60 * 24));
    console.log("Days Until Monthly Reset: ", daysUntilMonthlyReset)

    // Check if we can complete immediately with available traces
    const totalImmediateTraces = immediateWeeklyTraces + immediateMonthlyTraces;
    console.log("Total Immediate Traces: ", totalImmediateTraces)
    if (totalImmediateTraces >= totalTracesNeeded) {
      // Build timeline for immediate completion (events occur on start date)
      const timeline = [];
      let remaining = totalTracesNeeded;

      if (immediateMonthlyTraces > 0) {
        const amt = Math.min(immediateMonthlyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(startDateObj),
          label: 'Monthly',
          amount: amt,
          remaining
        });
      }

      if (remaining > 0 && immediateWeeklyTraces > 0) {
        const amt = Math.min(immediateWeeklyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(startDateObj),
          label: 'Weekly',
          amount: amt,
          remaining
        });
      }

      // Can complete on the start date itself
      const formattedCompletionDate = startDateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      }) + ' (UTC)';
      
      return {
        weeklyTraces: [...weeklyBosses, ...monthlyBosses],
        totalWeeklyTraces,
        totalMonthlyTraces,
        immediateTraces: totalImmediateTraces,
        firstWeekTraces: totalImmediateTraces,
        weeksNeeded: 0,
        completionDate: formattedCompletionDate,
        totalTracesNeeded,
        timeline
      };
    }

    // Calculate effective weekly traces for the first week (excluding monthly bosses)
    const firstWeekTraces = totalWeeklyTraces + immediateWeeklyTraces;

    // Initialize completion calculation variables
    let completionDate;
    let weeksNeeded = Infinity;

    // If we have weekly traces, calculate based on weekly resets
    if (totalWeeklyTraces > 0) {
      // First week handling with proper monthly ordering
      let remainingTraces = totalTracesNeeded;
      let tracesCollected = 0;
      let weeksCount = 0;
      let currentDate = new Date(startDateObj);

      const timeline = [];
      let remaining = totalTracesNeeded;

      // Determine the first weekly reset date
      const firstWeeklyResetDate = new Date(currentDate);
      firstWeeklyResetDate.setDate(firstWeeklyResetDate.getDate() + daysUntilReset);

      // 1) Add immediate monthly traces available at start (e.g., current month not cleared yet)
      if (immediateMonthlyTraces > 0) {
        tracesCollected += immediateMonthlyTraces;
        const amt = Math.min(immediateMonthlyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(startDateObj),
          label: 'Monthly',
          amount: amt,
          remaining
        });

        if (tracesCollected >= totalTracesNeeded) {
          const formattedCompletionDate = startDateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
          }) + ' (UTC)';

          return {
            weeklyTraces: [...weeklyBosses, ...monthlyBosses],
            totalWeeklyTraces,
            totalMonthlyTraces,
            immediateTraces: totalImmediateTraces,
            firstWeekTraces,
            weeksNeeded: 0,
            completionDate: formattedCompletionDate,
            totalTracesNeeded,
            timeline
          };
        }
      }

      // 1b) Add immediate weekly traces available at start (not yet cleared this week)
      if (immediateWeeklyTraces > 0) {
        tracesCollected += immediateWeeklyTraces;
        const amt = Math.min(immediateWeeklyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(startDateObj),
          label: 'Weekly',
          amount: amt,
          remaining
        });
      }

      // 2) If a monthly reset happens before or on the first weekly reset, add those monthly traces
      if (totalMonthlyTraces > 0) {
        const nextMonthlyFromStart = getNextMonthlyResetDate(startDateObj);
        if (nextMonthlyFromStart <= firstWeeklyResetDate) {
          tracesCollected += totalMonthlyTraces;

          const amt = Math.min(totalMonthlyTraces, remaining);
          remaining -= amt;
          timeline.push({
            date: new Date(nextMonthlyFromStart),
            label: 'Monthly',
            amount: amt,
            remaining
          });

          if (tracesCollected >= totalTracesNeeded) {
            const formattedCompletionDate = nextMonthlyFromStart.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
            }) + ' (UTC)';

            return {
              weeklyTraces: [...weeklyBosses, ...monthlyBosses],
              totalWeeklyTraces,
              totalMonthlyTraces,
              immediateTraces: totalImmediateTraces,
              firstWeekTraces,
              weeksNeeded: 0,
              completionDate: formattedCompletionDate,
              totalTracesNeeded,
              timeline
            };
          }
        }
      }

      // 3) Move to first weekly reset and add first week's weekly traces (excluding immediate weekly already added)
      currentDate = new Date(firstWeeklyResetDate);
      const firstWeekPayout = totalWeeklyTraces;
      tracesCollected += firstWeekPayout;
      weeksCount = 1;

      // Add timeline entry for first weekly payout
      if (firstWeekPayout > 0) {
        const amt = Math.min(firstWeekPayout, remaining);
        remaining -= amt;
        timeline.push({
          date: new Date(firstWeeklyResetDate),
          label: 'Weekly',
          amount: amt,
          remaining
        });
      }

      // Continue adding weekly traces until we have enough
      while (tracesCollected < totalTracesNeeded) {
        // Check if we'll get monthly traces before the next weekly reset
        const nextWeeklyReset = new Date(currentDate);
        nextWeeklyReset.setDate(nextWeeklyReset.getDate() + 7);

        const nextMonthReset = getNextMonthlyResetDate(currentDate);

        // If monthly reset happens before next weekly reset and we have monthly traces
        if (nextMonthReset <= nextWeeklyReset && totalMonthlyTraces > 0) {
          // Add traces from monthly bosses
          tracesCollected += totalMonthlyTraces;

          const amt = Math.min(totalMonthlyTraces, remaining);
          remaining -= amt;
          timeline.push({
            date: new Date(nextMonthReset),
            label: 'Monthly',
            amount: amt,
            remaining
          });

          // If we now have enough traces, set completion date to monthly reset
          if (tracesCollected >= totalTracesNeeded) {
            completionDate = nextMonthReset;
            break;
          }
        }

        // Add weekly traces
        tracesCollected += totalWeeklyTraces;
        if (totalWeeklyTraces > 0) {
          const amt = Math.min(totalWeeklyTraces, remaining);
          remaining -= amt;
          timeline.push({
            date: new Date(nextWeeklyReset),
            label: 'Weekly',
            amount: amt,
            remaining
          });
        }
        weeksCount++;

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }

      // If we didn't set a completion date yet, it's the last weekly reset
      if (!completionDate) {
        completionDate = new Date(currentDate);
      }

      weeksNeeded = weeksCount;

      // Format the completion date for display (UTC)
      const formattedCompletionDate = completionDate ? completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      }) + ' (UTC)' : "Never (no traces)";

      return {
        weeklyTraces,
        totalWeeklyTraces,
        totalMonthlyTraces,
        immediateTraces: totalImmediateTraces,
        firstWeekTraces,
        weeksNeeded,
        completionDate: formattedCompletionDate,
        totalTracesNeeded,
        timeline
      };
    }
    // If we only have monthly traces
    else if (totalMonthlyTraces > 0) {
      let remainingTraces = totalTracesNeeded;
      let monthsNeeded = Math.ceil(remainingTraces / totalMonthlyTraces);

      const timeline = [];
      let remaining = totalTracesNeeded;

      // Start with the next monthly reset
      completionDate = getNextMonthlyResetDate(startDateObj);

      // Add months as needed
      for (let i = 0; i < monthsNeeded; i++) {
        const eventDate = new Date(completionDate);
        const amt = Math.min(totalMonthlyTraces, remaining);
        remaining -= amt;
        timeline.push({
          date: eventDate,
          label: 'Monthly',
          amount: amt,
          remaining
        });

        if (i < monthsNeeded - 1) {
          completionDate.setUTCMonth(completionDate.getUTCMonth() + 1);
        }
      }

      weeksNeeded = monthsNeeded * 4.35; // Approximate weeks for display

      const formattedCompletionDate = completionDate ? completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      }) + ' (UTC)' : "Never (no traces)";

      return {
        weeklyTraces,
        totalWeeklyTraces,
        totalMonthlyTraces,
        immediateTraces: totalImmediateTraces,
        firstWeekTraces,
        weeksNeeded,
        completionDate: formattedCompletionDate,
        totalTracesNeeded,
        timeline
      };
    }
    // No traces at all
    else {
      weeksNeeded = Infinity;
      completionDate = null;
    }

    // Format the completion date for display (UTC)
    const formattedCompletionDate = completionDate ? completionDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }) + ' (UTC)' : "Never (no traces)";

    return {
      weeklyTraces,
      totalWeeklyTraces,
      totalMonthlyTraces,
      immediateTraces: totalImmediateTraces,
      firstWeekTraces,
      weeksNeeded,
      completionDate: formattedCompletionDate,
      totalTracesNeeded,
      timeline: []
    };
  };

  // Calculate traces per week for weekly bosses (reset on Thursday 00:00 UTC)
  const calculateWeeklyBossTraces = (startDate, tracesPerClear, clearedThisWeek) => {
    // For weekly calculation, we just return the traces per clear
    // The clearedThisWeek flag is handled in the main calculation function
    return tracesPerClear;
  };

  // For monthly bosses, we don't calculate a weekly average
  // Instead, we return the traces per clear and handle monthly resets separately in the main calculation
  const calculateMonthlyBossTraces = (startDate, tracesPerClear, clearedThisMonth) => {
    return { tracesPerClear, clearedThisMonth };
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }) + ' (UTC)';
  };

  // Helper function to get next monthly reset date
  const getNextMonthlyResetDate = (date) => {
    const currentDate = new Date(date);
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();

    // If we're on the 1st of the month, the next reset is next month
    if (currentDate.getUTCDate() === 1) {
      return new Date(Date.UTC(currentYear, currentMonth + 1, 1));
    }

    // Otherwise, the next reset is the 1st of next month
    return new Date(Date.UTC(currentYear, currentMonth + 1, 1));
  };

  // Calculate schedule results
  const scheduleResults = calculateSchedule();

  return (
    <div className="max-w-7xl mx-auto bg-primary-dark p-6 rounded-lg shadow-lg">
      {/* Input Details Section - Horizontal Row at Top */}
      <div className="mb-8 p-4 bg-background-bright flex justify-between flex-col rounded-lg">
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
            <label className="block text-primary-bright font-medium">Current Trace of Darkness</label>
            <input
              type="number"
              className="w-full max-w-[200px] p-2 bg-primary-dark text-primary-bright rounded border border-gray-700"
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
              className="w-full max-w-[200px] p-2 bg-primary-dark text-primary-bright rounded border border-gray-700"
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
            <div key={boss.id} className="bg-background-bright p-4 rounded-lg mb-4">
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
                            <div className="w-[40px] h-[40px] bg-primary-dim rounded-md flex items-center justify-center">
                              <span className="text-xs text-primary-dark">None</span>
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
                      className="w-fit p-2 bg-primary-dark text-primary-bright rounded border border-gray-700"
                      value={bossSelections.find(b => b.id === boss.id)?.partySize}
                      onChange={(e) => handleBossSelectionChange(boss.id, 'partySize', Number(e.target.value))}
                    >
                      {PARTY_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cleared This Week/Month Toggle - Takes up less space */}
                  <div className="sm:col-span-3 flex flex-col justify-center mt-2 sm:mt-0">
                    <label className="block text-primary-bright text-sm mb-1">{boss.monthlyReset ? 'Cleared This Month' : 'Cleared This Week'}</label>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={bossSelections.find(b => b.id === boss.id)?.clearedThisWeek}
                            onChange={(e) => handleBossSelectionChange(boss.id, 'clearedThisWeek', e.target.checked)}
                          />
                          <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${bossSelections.find(b => b.id === boss.id)?.clearedThisWeek
                            ? 'transform translate-x-full bg-blue-400'
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

          <div className="bg-background-bright p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
            <div className="flex justify-between">
              <span className="text-primary-bright">Total Traces Needed:</span>
              <span className="font-bold text-primary-bright">{scheduleResults.totalTracesNeeded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-bright">Weekly Traces:</span>
              <span className="font-bold text-primary-bright">{scheduleResults.totalWeeklyTraces.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-bright">Weeks to Complete:</span>
              <span className="font-bold text-primary-bright">
                {isFinite(scheduleResults.weeksNeeded) ? scheduleResults.weeksNeeded : "∞"}
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
            <h3 className="text-xl font-medium text-primary-bright">Weekly Traces Breakdown</h3>
            <div className="bg-background-bright p-3 sm:p-4 rounded-lg space-y-2">
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
                      {boss.isMonthly ? `${(boss.tracesPerMonth ?? 0).toFixed(0)} per month` : boss.tracesPerWeek.toFixed(0)}
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
            <div className="bg-background-bright p-3 sm:p-4 rounded-lg space-y-2">
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

export default GenesisLiberationCalculator;
