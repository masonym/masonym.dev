'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Gift } from 'lucide-react';
import { CHEST_TIER_CONFIG, POUCH_CONFIG, POUCH_TYPES, SITE_RANK_CONFIG } from '@/data/mysticFrontierData';
import ExpeditionDetail from './ExpeditionDetail';

export default function MyExpeditions({ expeditions, loading, selectedExpedition, setSelectedExpedition, onRefresh }) {
  const [hideClaimed, setHideClaimed] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mf_hide_claimed') : null;
    if (stored === 'true') setHideClaimed(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mf_hide_claimed', hideClaimed ? 'true' : 'false');
  }, [hideClaimed]);

  if (loading) {
    return (
      <div className="bg-[var(--background-bright)] rounded-lg p-8 border border-[var(--primary-dim)] text-center">
        <div className="text-[var(--primary-dim)]">Loading expeditions...</div>
      </div>
    );
  }

  if (expeditions.length === 0) {
    return (
      <div className="bg-[var(--background-bright)] rounded-lg p-8 border border-[var(--primary-dim)] text-center">
        <Gift className="w-12 h-12 text-[var(--primary-dim)] mx-auto mb-4" />
        <div className="text-[var(--primary-dim)]">No expeditions yet. Submit your first one!</div>
      </div>
    );
  }

  if (selectedExpedition) {
    return (
      <ExpeditionDetail
        expedition={selectedExpedition}
        onBack={() => {
          setSelectedExpedition(null);
          onRefresh();
        }}
        onDelete={() => {
          setSelectedExpedition(null);
          onRefresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[var(--primary-dim)] text-sm">My Expeditions</div>
        <label className="flex items-center gap-2 text-sm text-[var(--primary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideClaimed}
            onChange={(e) => setHideClaimed(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--secondary)]"
          />
          <span>Hide rewards-added</span>
        </label>
      </div>
      {(hideClaimed ? expeditions.filter(exp => !exp.rewards_claimed) : expeditions).map(exp => (
        <button
          key={exp.id}
          onClick={() => setSelectedExpedition(exp)}
          className="w-full text-left bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)] hover:border-[var(--secondary)] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <span
                className="font-bold"
                style={{ color: SITE_RANK_CONFIG[exp.site_rank]?.color }}
              >
                {exp.site_rank}
              </span>
              <span className="text-[var(--primary-dim)] text-sm ml-2">
                {new Date(exp.created_at).toLocaleDateString()} {new Date(exp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {exp.element_match && <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">Element</span>}
              {exp.type_match && <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400">Type</span>}
              <span className={`text-xs px-2 py-1 rounded ${exp.rewards_claimed ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                {exp.rewards_claimed ? 'Rewards Added' : 'Awaiting Rewards'}
              </span>
              <ChevronRight className="w-5 h-5 text-[var(--primary-dim)]" />
            </div>
          </div>
          <div className="text-xs text-[var(--primary-dim)] mt-2">
            {exp.tiles?.length || 0} tiles recorded
          </div>
          {(() => {
            const selectedTiles = exp.tiles?.filter(t => t.selected && t.reward_option && t.tile_type !== 'Lucky') || [];
            if (selectedTiles.length === 0) return null;

            const pouchCounts = { Glowing: 0, Blue: 0, Purple: 0, Orange: 0, Green: 0 };
            selectedTiles.forEach(tile => {
              const rewardName = tile.reward_option.toLowerCase();
              if (rewardName.includes('glowing')) pouchCounts.Glowing++;
              else if (rewardName.includes('green')) pouchCounts.Green++;
              else if (rewardName.includes('orange')) pouchCounts.Orange++;
              else if (rewardName.includes('purple')) pouchCounts.Purple++;
              else if (rewardName.includes('blue')) pouchCounts.Blue++;
            });

            return (
              <div className="flex gap-2 mt-2 flex-wrap">
                {POUCH_TYPES.map(pouchType => pouchCounts[pouchType] > 0 && (
                  <div
                    key={pouchType}
                    className="flex items-center gap-1.5 px-2 py-1 rounded"
                    style={{ backgroundColor: `${POUCH_CONFIG[pouchType].color}15` }}
                  >
                    <img
                      src={POUCH_CONFIG[pouchType].image}
                      alt={POUCH_CONFIG[pouchType].label}
                      className="w-8 h-8 object-contain"
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: POUCH_CONFIG[pouchType].color }}
                    >
                      x{pouchCounts[pouchType]}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

          {exp.rewards_claimed && exp.rewards && exp.rewards.length > 0 && (
            <div className="mt-3 p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--primary-dim)]">Items Received</span>
                <div className="flex items-center gap-2">
                  {exp.tier_ups > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-400">
                      +{exp.tier_ups} Tier-Up{exp.tier_ups > 1 ? 's' : ''}
                    </span>
                  )}
                  {exp.starting_chest_tier && exp.final_chest_tier && (
                    <span className="text-xs text-[var(--primary-dim)]">
                      <span style={{ color: CHEST_TIER_CONFIG[exp.starting_chest_tier]?.color }}>
                        {exp.starting_chest_tier}
                      </span>
                      {' → '}
                      <span style={{ color: CHEST_TIER_CONFIG[exp.final_chest_tier]?.color }}>
                        {exp.final_chest_tier}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {exp.rewards.slice(0, 5).map((reward, idx) => (
                  <span key={idx} className="text-xs px-1.5 py-0.5 rounded bg-[var(--background-bright)] text-[var(--primary)]">
                    {reward.item_name} {reward.quantity > 1 && <span className="text-[var(--secondary)]">x{reward.quantity}</span>}
                  </span>
                ))}
                {exp.rewards.length > 5 && (
                  <span className="text-xs px-1.5 py-0.5 rounded text-[var(--primary-dim)]">
                    +{exp.rewards.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
