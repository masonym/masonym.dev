'use client';

import { TILE_RARITIES, TILE_RARITY_CONFIG, TILE_TYPES } from '@/data/mysticFrontierData';
import { TILE_ICONS } from './mysticFrontierUiConstants';
import RewardOptionSelectable from './RewardOptionSelectable';

export default function TileCard({ tile, index, roundNum, isSelected, onSelect, onUpdateTile, onUpdateOption, knownItems }) {
  const TileIcon = TILE_ICONS[tile.type];
  const isLucky = tile.type === 'Lucky';

  return (
    <div className={`rounded p-3 border-2 transition ${
      isSelected
        ? 'bg-green-900/20 border-green-500'
        : 'bg-[var(--background)] border-[var(--primary-dim)]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--primary-dim)]">Tile {index + 1}</span>
          <div className="flex items-center gap-1">
            {TILE_TYPES.map(type => {
              const Icon = TILE_ICONS[type];
              return (
                <button
                  key={type}
                  tabIndex={-1}
                  onClick={() => onUpdateTile('type', type)}
                  className={`p-1.5 rounded transition ${
                    tile.type === type
                      ? 'bg-[var(--secondary)] text-[var(--background)]'
                      : 'bg-[var(--background-bright)] text-[var(--primary-dim)] hover:text-[var(--primary)]'
                  }`}
                  title={type}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <select
            tabIndex={-1}
            value={tile.rarity}
            onChange={(e) => onUpdateTile('rarity', e.target.value)}
            className="p-1.5 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-sm"
            style={{ color: TILE_RARITY_CONFIG[tile.rarity]?.color }}
          >
            {TILE_RARITIES.map(rarity => (
              <option key={rarity} value={rarity} style={{ color: TILE_RARITY_CONFIG[rarity]?.color }}>
                {rarity}
              </option>
            ))}
          </select>
        </div>
        {isLucky && (
          <button
            onClick={() => onSelect(null)}
            tabIndex={-1}
            className={`px-3 py-1.5 rounded text-sm font-bold transition ${
              isSelected
                ? 'bg-green-500 text-white'
                : 'bg-[var(--background-bright)] text-[var(--primary-dim)] hover:bg-[var(--background-dim)]'
            }`}
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
        )}
      </div>

      {!isLucky && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <RewardOptionSelectable
            label="Option 1"
            optionNum={1}
            option={tile.option1}
            onChange={(field, value) => onUpdateOption('option1', field, value)}
            knownItems={knownItems}
            isSelected={isSelected && tile.selectedOption === 1}
            onSelect={() => onSelect(1)}
          />
          <RewardOptionSelectable
            label="Option 2"
            optionNum={2}
            option={tile.option2}
            onChange={(field, value) => onUpdateOption('option2', field, value)}
            knownItems={knownItems}
            isSelected={isSelected && tile.selectedOption === 2}
            onSelect={() => onSelect(2)}
          />
        </div>
      )}
    </div>
  );
}
