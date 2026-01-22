'use client';

import { forwardRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import TileCard from './TileCard';

const RoundSection = forwardRef(function RoundSection({ roundNum, roundData, setTileCount, updateTile, updateTileOption, selectTileForRound, knownItems, isKeyboardSelected }, ref) {
  const tileCount = roundData.tiles.length;

  return (
    <div ref={ref} className={`bg-[var(--background-bright)] rounded-lg p-4 border-2 transition ${isKeyboardSelected ? 'border-[var(--secondary)] ring-1 ring-[var(--secondary)]/30' : 'border-[var(--primary-dim)]'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[var(--primary-bright)] font-bold flex items-center gap-2">
          Round {roundNum}
          {isKeyboardSelected && <span className="text-xs px-2 py-0.5 rounded bg-[var(--secondary)]/20 text-[var(--secondary)]">Selected</span>}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--primary-dim)]">Tiles:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTileCount(roundNum, Math.max(0, tileCount - 1))}
              className="p-1 rounded bg-[var(--background)] hover:bg-[var(--background-dim)] transition"
            >
              <Minus className="w-4 h-4 text-[var(--primary)]" />
            </button>
            <input
              type="number"
              min="0"
              max="4"
              value={tileCount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setTileCount(roundNum, Math.max(0, Math.min(4, val)));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="w-10 text-center text-[var(--primary-bright)] font-bold bg-[var(--background)] border border-[var(--primary-dim)] rounded p-1 text-sm"
            />
            <button
              onClick={() => setTileCount(roundNum, Math.min(4, tileCount + 1))}
              className="p-1 rounded bg-[var(--background)] hover:bg-[var(--background-dim)] transition"
            >
              <Plus className="w-4 h-4 text-[var(--primary)]" />
            </button>
          </div>
        </div>
      </div>

      {tileCount === 0 ? (
        <div className="text-[var(--primary-dim)] text-sm text-center py-2">
          No tiles this round (ran out of AP)
        </div>
      ) : (
        <div className="space-y-3">
          {roundData.tiles.map((tile, idx) => (
            <TileCard
              key={idx}
              tile={tile}
              index={idx}
              roundNum={roundNum}
              isSelected={roundData.selectedTileIndex === idx}
              onSelect={(optionNum) => selectTileForRound(roundNum, idx, optionNum)}
              onUpdateTile={(field, value) => updateTile(roundNum, idx, field, value)}
              onUpdateOption={(optionKey, field, value) => updateTileOption(roundNum, idx, optionKey, field, value)}
              knownItems={knownItems}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default RoundSection;
