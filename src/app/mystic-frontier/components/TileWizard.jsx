'use client';

import { useEffect, useState } from 'react';
import { TILE_RARITY_CONFIG } from '@/data/mysticFrontierData';
import { TILE_ICONS, TILE_RARITY_HOTKEYS, TILE_TYPE_HOTKEYS } from './mysticFrontierUiConstants';

export default function TileWizard({ isOpen, onClose, onComplete, roundNum }) {
  const [step, setStep] = useState('count'); // 'count' | 'type' | 'rarity'
  const [numTiles, setNumTiles] = useState(0);
  const [currentTileIndex, setCurrentTileIndex] = useState(0);
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep('count');
      setNumTiles(0);
      setCurrentTileIndex(0);
      setTiles([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === 'escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (step === 'count') {
        if (['0', '1', '2', '3', '4'].includes(key)) {
          e.preventDefault();
          const count = parseInt(key);
          if (count === 0) {
            onComplete([]);
            return;
          }
          setNumTiles(count);
          setTiles(Array(count).fill(null).map(() => ({ type: null, rarity: null })));
          setCurrentTileIndex(0);
          setStep('type');
        }
      } else if (step === 'type') {
        if (TILE_TYPE_HOTKEYS[key]) {
          e.preventDefault();
          const newTiles = [...tiles];
          newTiles[currentTileIndex] = { ...newTiles[currentTileIndex], type: TILE_TYPE_HOTKEYS[key] };
          setTiles(newTiles);
          setStep('rarity');
        }
      } else if (step === 'rarity') {
        if (TILE_RARITY_HOTKEYS[key]) {
          e.preventDefault();
          const newTiles = [...tiles];
          newTiles[currentTileIndex] = { ...newTiles[currentTileIndex], rarity: TILE_RARITY_HOTKEYS[key] };
          setTiles(newTiles);

          if (currentTileIndex < numTiles - 1) {
            setCurrentTileIndex(currentTileIndex + 1);
            setStep('type');
          } else {
            onComplete(newTiles);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, numTiles, currentTileIndex, tiles, onClose, onComplete]);

  if (!isOpen) return null;

  const getStepTitle = () => {
    if (step === 'count') return `Round ${roundNum}: How many tiles?`;
    if (step === 'type') return `Tile ${currentTileIndex + 1} of ${numTiles}: Type?`;
    if (step === 'rarity') return `Tile ${currentTileIndex + 1} of ${numTiles}: Rarity?`;
  };

  const getStepDescription = () => {
    if (step === 'count') return 'Press 0-4 for number of tiles (0 = no tiles this round)';
    if (step === 'type') return 'Press H (Hunting), E (Encounter), or L (Lucky)';
    if (step === 'rarity') return 'Press N (Normal), I (Intermediate), or A (Advanced)';
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--background-bright)] rounded-xl p-6 border-2 border-[var(--secondary)] max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[var(--primary-bright)] mb-2">
            {getStepTitle()}
          </h3>
          <p className="text-[var(--primary-dim)] text-sm">
            {getStepDescription()}
          </p>
        </div>

        {numTiles > 0 && (
          <div className="flex justify-center gap-2 mb-6">
            {tiles.map((tile, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                  idx === currentTileIndex
                    ? 'border-[var(--secondary)] bg-[var(--secondary)]/20 scale-110'
                    : idx < currentTileIndex
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-[var(--primary-dim)] bg-[var(--background)]'
                }`}
              >
                {tile?.type ? (
                  <div className="text-center">
                    {(() => {
                      const Icon = TILE_ICONS[tile.type];
                      return (
                        <Icon className={`w-4 h-4 ${idx <= currentTileIndex ? 'text-[var(--primary)]' : 'text-[var(--primary-dim)]'}`} />
                      );
                    })()}
                    {tile?.rarity && (
                      <div className="text-[8px] mt-0.5" style={{ color: TILE_RARITY_CONFIG[tile.rarity]?.color }}>
                        {tile.rarity.charAt(0)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[var(--primary-dim)] text-sm">{idx + 1}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {step === 'count' && (
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    if (n === 0) {
                      onComplete([]);
                    } else {
                      setNumTiles(n);
                      setTiles(Array(n).fill(null).map(() => ({ type: null, rarity: null })));
                      setCurrentTileIndex(0);
                      setStep('type');
                    }
                  }}
                  className="p-3 rounded-lg bg-[var(--background)] border border-[var(--primary-dim)] hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/10 transition text-center"
                >
                  <kbd className="text-lg font-bold text-[var(--primary-bright)]">{n}</kbd>
                  <div className="text-xs text-[var(--primary-dim)] mt-1">
                    {n === 0 ? 'None' : n === 1 ? '1 tile' : `${n} tiles`}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'type' && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TILE_TYPE_HOTKEYS).map(([key, type]) => {
                const Icon = TILE_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      const newTiles = [...tiles];
                      newTiles[currentTileIndex] = { ...newTiles[currentTileIndex], type };
                      setTiles(newTiles);
                      setStep('rarity');
                    }}
                    className="p-4 rounded-lg bg-[var(--background)] border border-[var(--primary-dim)] hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/10 transition text-center"
                  >
                    <Icon className="w-6 h-6 mx-auto text-[var(--primary-bright)] mb-1" />
                    <div className="text-sm text-[var(--primary)]">{type}</div>
                    <kbd className="text-xs px-2 py-0.5 rounded bg-[var(--background-bright)] text-[var(--secondary)] mt-1 inline-block">
                      {key.toUpperCase()}
                    </kbd>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'rarity' && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TILE_RARITY_HOTKEYS).map(([key, rarity]) => (
                <button
                  key={rarity}
                  onClick={() => {
                    const newTiles = [...tiles];
                    newTiles[currentTileIndex] = { ...newTiles[currentTileIndex], rarity };
                    setTiles(newTiles);
                    if (currentTileIndex < numTiles - 1) {
                      setCurrentTileIndex(currentTileIndex + 1);
                      setStep('type');
                    } else {
                      onComplete(newTiles);
                    }
                  }}
                  className="p-4 rounded-lg bg-[var(--background)] border border-[var(--primary-dim)] hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/10 transition text-center"
                >
                  <div
                    className="text-md font-bold mb-1"
                    style={{ color: TILE_RARITY_CONFIG[rarity]?.color }}
                  >
                    {rarity}
                  </div>
                  <kbd className="text-xs px-2 py-0.5 rounded bg-[var(--background-bright)] text-[var(--secondary)] inline-block">
                    {key.toUpperCase()}
                  </kbd>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-[var(--primary-dim)]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background)] text-[var(--primary)]">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  );
}
