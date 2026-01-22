'use client';

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Gift, Keyboard, MapPin, X } from 'lucide-react';
import { MAX_ROUNDS, SITE_RANK_CONFIG, SITE_RANKS } from '@/data/mysticFrontierData';
import RoundSection from './RoundSection';
import TileWizard from './TileWizard';
import { EXPEDITION_RARITY_HOTKEYS, TILE_RARITY_HOTKEYS } from './mysticFrontierUiConstants';

export default function NewExpeditionForm({
  siteRank, setSiteRank,
  elementMatch, setElementMatch,
  typeMatch, setTypeMatch,
  rounds,
  setTileCount,
  updateTile,
  updateTileOption,
  selectTileForRound,
  selectedRewards,
  submitExpedition, submitting,
  knownItems
}) {
  const [selectedRound, setSelectedRound] = useState(null);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showTileWizard, setShowTileWizard] = useState(false);
  const roundRefs = useRef({});
  const pendingFocusTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pendingFocusTimeoutRef.current) {
        clearTimeout(pendingFocusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isInput) return;

      if (showTileWizard) return;

      const key = e.key.toLowerCase();

      if (['1', '2', '3', '4', '5'].includes(key)) {
        e.preventDefault();
        const roundNum = parseInt(key);
        setSelectedRound(prev => {
          const newSelection = prev === roundNum ? null : roundNum;
          if (newSelection && roundRefs.current[newSelection]) {
            setTimeout(() => {
              const firstInput = roundRefs.current[newSelection]?.querySelector('input[type="text"]');
              firstInput?.focus();
            }, 50);
          }
          return newSelection;
        });
        return;
      }

      if (selectedRound && (key === '+' || key === '=' || key === '-' || key === '_')) {
        e.preventDefault();
        if (key === '+' || key === '=') {
          setShowTileWizard(true);
        } else {
          const currentCount = rounds[selectedRound]?.tiles?.length || 0;
          setTileCount(selectedRound, Math.max(0, currentCount - 1));
        }
        return;
      }

      if (EXPEDITION_RARITY_HOTKEYS[key]) {
        e.preventDefault();
        setSiteRank(EXPEDITION_RARITY_HOTKEYS[key]);
        return;
      }

      if (selectedRound && TILE_RARITY_HOTKEYS[key]) {
        e.preventDefault();
        const tiles = rounds[selectedRound]?.tiles || [];
        if (tiles.length > 0) {
          const lastTileIdx = tiles.length - 1;
          updateTile(selectedRound, lastTileIdx, 'rarity', TILE_RARITY_HOTKEYS[key]);
        }
        return;
      }

      if (key === 'escape') {
        setSelectedRound(null);
      }

      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        setShowHotkeys(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRound, rounds, setTileCount, updateTile, setSiteRank, showTileWizard]);

  const handleWizardComplete = (wizardTiles) => {
    setShowTileWizard(false);
    if (!selectedRound) return;

    setTileCount(selectedRound, wizardTiles.length);

    setTimeout(() => {
      wizardTiles.forEach((tile, idx) => {
        updateTile(selectedRound, idx, 'type', tile.type);
        updateTile(selectedRound, idx, 'rarity', tile.rarity);
      });

      setTimeout(() => {
        const roundEl = roundRefs.current[selectedRound];
        const firstRewardInput = roundEl?.querySelector('input[type="text"]');
        firstRewardInput?.focus();
      }, 100);
    }, 50);
  };

  return (
    <div className="space-y-6">
      <TileWizard
        isOpen={showTileWizard}
        onClose={() => setShowTileWizard(false)}
        onComplete={handleWizardComplete}
        roundNum={selectedRound}
      />

      {showHotkeys && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHotkeys(false)}>
          <div className="bg-[var(--background-bright)] rounded-lg p-6 border border-[var(--primary-dim)] max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[var(--primary-bright)] flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[var(--secondary)]" />
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowHotkeys(false)} className="p-1 hover:bg-[var(--background)] rounded">
                <X className="w-5 h-5 text-[var(--primary-dim)]" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="space-y-1 border-b border-[var(--primary-dim)] pb-3">
                <div className="text-[var(--secondary)] font-bold">Round Selection</div>
                <div className="grid grid-cols-[1fr_auto] gap-2 text-[var(--primary-dim)]">
                  <div className="flex items-center">Select round</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">1-5</kbd>
                  <div className="flex items-center">Deselect round</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">Esc</kbd>
                </div>
              </div>

              <div className="space-y-1 border-b border-[var(--primary-dim)] pb-3">
                <div className="text-[var(--secondary)] font-bold">Tile Entry (with round selected)</div>
                <div className="grid grid-cols-[1fr_auto] gap-2 text-[var(--primary-dim)]">
                  <div className="flex items-center">Open tile wizard</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">+</kbd>
                  <div className="flex items-center">Remove last tile</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">-</kbd>
                </div>
              </div>

              <div className="space-y-1 border-b border-[var(--primary-dim)] pb-3">
                <div className="text-[var(--secondary)] font-bold">Expedition Rarity</div>
                <div className="grid grid-cols-[1fr_auto] gap-2 text-[var(--primary-dim)]">
                  <div className="flex items-center">Common</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">C</kbd>
                  <div className="flex items-center">Rare</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">R</kbd>
                  <div className="flex items-center">Epic</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">E</kbd>
                  <div className="flex items-center">Unique</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">U</kbd>
                  <div className="flex items-center">Legendary</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">L</kbd>
                </div>
              </div>

              <div className="space-y-1 border-b border-[var(--primary-dim)] pb-3">
                <div className="text-[var(--secondary)] font-bold">Tile Rarity (with round selected)</div>
                <div className="grid grid-cols-[1fr_auto] gap-2 text-[var(--primary-dim)]">
                  <div className="flex items-center">Normal</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">N</kbd>
                  <div className="flex items-center">Intermediate</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">I</kbd>
                  <div className="flex items-center">Advanced</div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">A</kbd>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2 text-[var(--primary-dim)]">
                <div className="flex items-center">Toggle this help</div>
                <kbd className="px-2 py-0.5 rounded bg-[var(--background)] text-[var(--primary)] min-w-[2.5rem] text-center">?</kbd>
              </div>
            </div>
            <div className="mt-4 text-xs text-[var(--primary-dim)]">
              Tip: Hotkeys only work when not typing in an input field.
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowHotkeys(true)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary-dim)] hover:text-[var(--secondary)] hover:border-[var(--secondary)] transition shadow-lg"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-[var(--secondary)]" />
          <h2 className="text-lg text-[var(--primary-bright)]">Expedition Site</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SITE_RANKS.map(rank => (
            (() => {
              const isSelected = siteRank === rank;
              const rankColor = SITE_RANK_CONFIG[rank].color;
              return (
                <button
                  key={rank}
                  onClick={() => setSiteRank(rank)}
                  className={`relative p-3 rounded border-2 transition outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${
                    isSelected
                      ? 'bg-[var(--background)]'
                      : 'bg-[var(--background-bright)] border-[var(--primary-dim)] hover:border-[var(--primary)]'
                  }`}
                  style={
                    isSelected
                      ? {
                        color: rankColor,
                        borderColor: rankColor,
                        backgroundColor: `${rankColor}22`,
                        boxShadow: `0 0 0 1px ${rankColor}55, 0 0 16px ${rankColor}33`,
                      }
                      : { color: rankColor }
                  }
                >
                  {isSelected && (
                    <div
                      className="absolute -top-2 -right-2 rounded-full p-1"
                      style={{ backgroundColor: rankColor, boxShadow: `0 0 12px ${rankColor}66` }}
                    >
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="font-bold">{rank}</div>
                  <div className="text-xs opacity-70">{SITE_RANK_CONFIG[rank].duration}hr</div>
                </button>
              );
            })()
          ))}
        </div>
      </div>

      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <h2 className="text-lg text-[var(--primary-bright)] mb-3">Familiar Matching</h2>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={elementMatch}
              onChange={(e) => setElementMatch(e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--secondary)]"
            />
            <span className="text-[var(--primary)]">Element Match</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={typeMatch}
              onChange={(e) => setTypeMatch(e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--secondary)]"
            />
            <span className="text-[var(--primary)]">Type Match</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => i + 1).map(roundNum => (
          <RoundSection
            key={roundNum}
            roundNum={roundNum}
            roundData={rounds[roundNum]}
            setTileCount={setTileCount}
            updateTile={updateTile}
            updateTileOption={updateTileOption}
            selectTileForRound={selectTileForRound}
            knownItems={knownItems}
            isKeyboardSelected={selectedRound === roundNum}
            ref={el => roundRefs.current[roundNum] = el}
          />
        ))}
      </div>

      {selectedRewards.length > 0 && (
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Selected Rewards Summary
          </h3>
          <div className="space-y-2">
            {selectedRewards.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-[var(--primary)]">
                  <span className="text-[var(--primary-dim)]">R{r.round}:</span> {r.reward}
                </span>
                <span className="text-[var(--primary-dim)]">
                  {r.apCost && `${r.apCost} AP`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={submitExpedition}
        disabled={submitting || !siteRank}
        className="w-full py-4 rounded bg-[var(--secondary)] text-[var(--background)] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        {submitting ? 'Submitting...' : 'Submit Expedition'}
      </button>
    </div>
  );
}
