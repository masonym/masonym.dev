'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Gift, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CHEST_TIERS, CHEST_TIER_CONFIG, POUCH_CONFIG, POUCH_TYPES, SITE_RANK_CONFIG, TILE_RARITY_CONFIG } from '@/data/mysticFrontierData';
import { DEFAULT_REWARD, TILE_ICONS } from './mysticFrontierUiConstants';

export default function ExpeditionDetail({ expedition, onBack, onDelete }) {
  const [rewards, setRewards] = useState(expedition.rewards || []);
  const [tileEdits, setTileEdits] = useState(() => expedition.tiles?.map(t => ({ ...t })) || []);
  const [editMode, setEditMode] = useState(false);
  const [newReward, setNewReward] = useState({ item_name: '', quantity: '' });
  const [knownItems, setKnownItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savingTiles, setSavingTiles] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [finalTier, setFinalTier] = useState(expedition.final_chest_tier || null);
  const [pouchSaving, setPouchSaving] = useState(false);

  const pouches = useMemo(() => {
    const counts = { Glowing: 0, Blue: 0, Purple: 0, Orange: 0, Green: 0 };
    const selectedTiles = tileEdits?.filter(t => t.selected && t.reward_option) || [];

    selectedTiles.forEach(tile => {
      const rewardName = tile.reward_option.toLowerCase();
      if (rewardName.includes('glowing')) counts.Glowing++;
      else if (rewardName.includes('green')) counts.Green++;
      else if (rewardName.includes('orange')) counts.Orange++;
      else if (rewardName.includes('purple')) counts.Purple++;
      else if (rewardName.includes('blue')) counts.Blue++;
    });

    return counts;
  }, [tileEdits]);

  const startingChestTier = useMemo(() => {
    for (let i = POUCH_TYPES.length - 1; i >= 0; i--) {
      if (pouches[POUCH_TYPES[i]] > 0) {
        return POUCH_TYPES[i];
      }
    }
    return null;
  }, [pouches]);

  const tierUps = useMemo(() => {
    if (!startingChestTier || !finalTier) return 0;
    const startOrder = CHEST_TIER_CONFIG[startingChestTier]?.order || 0;
    const finalOrder = CHEST_TIER_CONFIG[finalTier]?.order || 0;
    return Math.max(0, finalOrder - startOrder);
  }, [startingChestTier, finalTier]);

  const totalPouches = useMemo(() => {
    return Object.values(pouches).reduce((sum, count) => sum + count, 0);
  }, [pouches]);

  useEffect(() => {
    loadKnownItems();
  }, []);

  const loadKnownItems = async () => {
    const { data } = await supabase
      .from('known_items')
      .select('item_name')
      .order('item_name');
    setKnownItems(data?.map(i => i.item_name) || []);
  };

  const filteredItems = knownItems.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectItem = (item) => {
    setSearchTerm(item);
    setNewReward(prev => ({ ...prev, item_name: item }));
    setShowDropdown(false);
  };

  const quantityInputRef = useRef(null);
  const itemNameInputRef = useRef(null);

  const deleteExpedition = async () => {
    setDeleting(true);
    try {
      await supabase.from('expeditions').delete().eq('id', expedition.id);
      onDelete?.();
    } catch (err) {
      console.error('Error deleting expedition:', err);
    }
    setDeleting(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredItems.length === 0) {
      if (e.key === 'Enter' && newReward.item_name.trim()) {
        e.preventDefault();
        if (newReward.quantity === '' && quantityInputRef.current) {
          quantityInputRef.current.focus();
        } else {
          addReward();
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[highlightedIndex]) {
        selectItem(filteredItems[highlightedIndex]);
        setTimeout(() => quantityInputRef.current?.focus(), 0);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleQuantityKeyDown = (e) => {
    if (e.key === 'Enter' && newReward.item_name.trim()) {
      e.preventDefault();
      addReward();
    }
  };

  const saveTierData = async (newFinalTier) => {
    setPouchSaving(true);
    try {
      await supabase
        .from('expeditions')
        .update({
          starting_chest_tier: startingChestTier,
          final_chest_tier: newFinalTier,
          tier_ups: newFinalTier ? Math.max(0, CHEST_TIER_CONFIG[newFinalTier]?.order - CHEST_TIER_CONFIG[startingChestTier]?.order) : 0,
        })
        .eq('id', expedition.id);
    } catch (err) {
      console.error('Error saving tier data:', err);
    }
    setPouchSaving(false);
  };

  const addReward = async () => {
    if (!newReward.item_name.trim()) return;

    setSaving(true);
    try {
      if (!knownItems.includes(newReward.item_name)) {
        await supabase.from('known_items').insert({ item_name: newReward.item_name });
        setKnownItems(prev => [...prev, newReward.item_name].sort());
      }

      const quantity = parseInt(newReward.quantity) || 1;

      const { data, error } = await supabase
        .from('rewards')
        .insert({
          expedition_id: expedition.id,
          item_name: newReward.item_name,
          quantity: Math.max(1, quantity),
        })
        .select()
        .single();

      if (error) throw error;

      setRewards(prev => [...prev, data]);
      setNewReward({ item_name: '', quantity: '' });
      setSearchTerm('');

      setTimeout(() => itemNameInputRef.current?.focus(), 0);

      await supabase
        .from('expeditions')
        .update({ rewards_claimed: true, rewards_claimed_at: new Date().toISOString() })
        .eq('id', expedition.id);

    } catch (err) {
      console.error('Error adding reward:', err);
    }
    setSaving(false);
  };

  const removeReward = async (rewardId) => {
    try {
      await supabase.from('rewards').delete().eq('id', rewardId);
      setRewards(prev => prev.filter(r => r.id !== rewardId));
    } catch (err) {
      console.error('Error removing reward:', err);
    }
  };

  const selectedTiles = tileEdits?.filter(t => t.selected) || [];

  const handleRewardChange = (tileId, value) => {
    setTileEdits(prev => prev.map(t => t.id === tileId ? { ...t, reward_option: value } : t));
  };

  const handleSelectOption = (roundNumber, tileIndex, optionNumber) => {
    setTileEdits(prev => prev.map(t => {
      if (t.round_number !== roundNumber) return t;
      if (t.tile_index !== tileIndex) return { ...t, selected: false };
      return { ...t, selected: t.option_number === optionNumber };
    }));
  };

  const saveTileRewards = async () => {
    if (!tileEdits || tileEdits.length === 0) return;
    setSavingTiles(true);
    try {
      const updates = tileEdits.map(t => ({
        id: t.id,
        reward_option: t.reward_option || DEFAULT_REWARD,
        selected: !!t.selected,
      }));
      await Promise.all(
        updates.map(u =>
          supabase
            .from('tiles')
            .update({ reward_option: u.reward_option, selected: u.selected })
            .eq('id', u.id)
        )
      );
    } catch (err) {
      console.error('Error saving tile rewards:', err);
    }
    setSavingTiles(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--primary-dim)] hover:text-[var(--primary)] transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to expeditions
      </button>

      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xl font-bold"
            style={{ color: SITE_RANK_CONFIG[expedition.site_rank]?.color }}
          >
            {expedition.site_rank} Expedition
          </span>
          <span className="text-[var(--primary-dim)] text-sm">
            {new Date(expedition.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {expedition.element_match && <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">Element Match</span>}
            {expedition.type_match && <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400">Type Match</span>}
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <button
                onClick={deleteExpedition}
                disabled={deleting}
                className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 rounded bg-[var(--background)] text-[var(--primary-dim)] hover:text-[var(--primary)] transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--primary-bright)]">Tiles Recorded</h3>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={async () => {
                    await saveTileRewards();
                    setEditMode(false);
                  }}
                  disabled={savingTiles}
                  className="text-xs px-3 py-1.5 rounded bg-[var(--secondary)] text-[var(--primary-dark)] hover:opacity-90 transition disabled:opacity-50"
                >
                  {savingTiles ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setTileEdits(expedition.tiles?.map(t => ({ ...t })) || []);
                    setEditMode(false);
                  }}
                  disabled={savingTiles}
                  className="text-xs px-3 py-1.5 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)] hover:bg-[var(--background-dim)] transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs px-3 py-1.5 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)] hover:bg-[var(--background-dim)] transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(roundNum => {
            const roundTiles = tileEdits?.filter(t => t.round_number === roundNum) || [];
            if (roundTiles.length === 0) return null;

            const tilesByIndex = {};
            roundTiles.forEach(t => {
              const idx = t.tile_index ?? 0;
              if (!tilesByIndex[idx]) tilesByIndex[idx] = [];
              tilesByIndex[idx].push(t);
            });

            return (
              <div key={roundNum} className="bg-[var(--background)] rounded-lg p-3">
                <div className="text-sm font-bold text-[var(--primary-bright)] mb-2">Round {roundNum}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(tilesByIndex).map(([tileIdx, tiles]) => {
                    const firstTile = tiles[0];
                    const selectedTile = tiles.find(t => t.selected);
                    const TileIcon = TILE_ICONS[firstTile.tile_type];

                    return (
                      <div
                        key={tileIdx}
                        className={`p-2 rounded text-sm ${
                          selectedTile
                            ? 'bg-green-900/20 border border-green-500/30'
                            : 'border border-[var(--primary-dim)]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {TileIcon && <TileIcon className="w-4 h-4 text-[var(--primary-dim)]" />}
                          <span style={{ color: TILE_RARITY_CONFIG[firstTile.tile_rarity]?.color }}>
                            {firstTile.tile_rarity}
                          </span>
                          <span className="text-[var(--primary)]">{firstTile.tile_type}</span>
                          {selectedTile && <span className="ml-auto text-green-400 text-xs">✓ Selected</span>}
                        </div>
                        {firstTile.tile_type !== 'Lucky' && (
                          <div className="text-xs space-y-2 mt-1">
                            {tiles.map((t, i) => (
                              <div
                                key={i}
                                className={`space-y-1 p-2 rounded ${
                                  t.selected ? 'bg-green-900/20 text-green-200' : 'bg-[var(--background)] text-[var(--primary-dim)]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {editMode ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectOption(t.round_number, t.tile_index, t.option_number)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        t.selected ? 'bg-green-500 text-white' : 'bg-[var(--background-bright)] text-[var(--primary-dim)] hover:bg-[var(--background-dim)]'
                                      }`}
                                    >
                                      {t.selected ? 'Selected' : `Select Option ${t.option_number}`}
                                    </button>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--background-bright)] text-[var(--primary-dim)]">
                                      {t.selected ? 'Selected' : `Option ${t.option_number}`}
                                    </span>
                                  )}
                                  {t.ap_cost && <span>{t.ap_cost} AP</span>}
                                </div>
                                {editMode ? (
                                  <input
                                    type="text"
                                    value={t.reward_option || ''}
                                    onChange={(e) => handleRewardChange(t.id, e.target.value)}
                                    placeholder={`Reward for option ${t.option_number}`}
                                    className="w-full p-2 rounded border border-[var(--primary-dim)] bg-[var(--background-bright)] text-[var(--primary)]"
                                  />
                                ) : (
                                  <div className="text-[var(--primary)]">{t.reward_option || `Option ${t.option_number}`}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {startingChestTier && (
        <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
          <h3 className="text-[var(--primary-bright)] mb-3">
            <Gift className="w-5 h-5 inline mr-2" />
            Chest Opening
          </h3>

          <div className="flex gap-3 mb-3 flex-wrap">
            {POUCH_TYPES.map(pouchType => pouches[pouchType] > 0 && (
              <div
                key={pouchType}
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ backgroundColor: `${POUCH_CONFIG[pouchType].color}15` }}
              >
                <img
                  src={POUCH_CONFIG[pouchType].image}
                  alt={POUCH_CONFIG[pouchType].label}
                  className="w-10 h-10 object-contain"
                />
                <span
                  className="text-base font-bold"
                  style={{ color: POUCH_CONFIG[pouchType].color }}
                >
                  x{pouches[pouchType]}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-[var(--background)] rounded p-3 border border-[var(--primary-dim)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--primary-dim)] text-sm">Starting Chest Tier:</span>
              <span
                className="font-bold"
                style={{ color: CHEST_TIER_CONFIG[startingChestTier].color }}
              >
                {startingChestTier}
              </span>
            </div>

            <div className="mb-2">
              <label className="text-xs text-[var(--primary-dim)] block mb-1">Final Chest Tier (did it tier-up?)</label>
              <div className="flex gap-1">
                {CHEST_TIERS.map(tier => {
                  const startOrder = CHEST_TIER_CONFIG[startingChestTier]?.order ?? 0;
                  const tierOrder = CHEST_TIER_CONFIG[tier]?.order ?? 0;
                  const isDisabled = tierOrder < startOrder;

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        const newTier = finalTier === tier ? startingChestTier : tier;
                        setFinalTier(newTier);
                        saveTierData(newTier);
                      }}
                      disabled={isDisabled}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition ${
                        finalTier === tier
                          ? 'ring-2 ring-white'
                          : isDisabled
                            ? 'opacity-20 cursor-not-allowed'
                            : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: CHEST_TIER_CONFIG[tier].color,
                        color: tier === 'White' ? '#000' : '#fff'
                      }}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            {tierUps > 0 && (
              <div className="text-center text-sm mt-2">
                <span className="text-yellow-400 font-bold">+{tierUps} Tier-Up{tierUps > 1 ? 's' : ''}!</span>
              </div>
            )}
          </div>

          <div className="text-xs text-[var(--primary-dim)] mt-2 text-center">
            {totalPouches} pouch{totalPouches !== 1 ? 'es' : ''} → {rewards.length} item{rewards.length !== 1 ? 's' : ''} received
          </div>
        </div>
      )}

      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <h3 className="text-[var(--primary-bright)] mb-3">
          <Gift className="w-5 h-5 inline mr-2" />
          Items Received
        </h3>
        <p className="text-[var(--primary-dim)] text-sm mb-3">
          Enter the actual items you received when opening the chest.
        </p>

        {rewards.length > 0 && (
          <div className="space-y-2 mb-4">
            {rewards.map(reward => (
              <div key={reward.id} className="flex items-center justify-between p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)]">
                <span className="text-[var(--primary)]">
                  {reward.item_name} {reward.quantity > 1 && <span className="text-[var(--secondary)]">x{reward.quantity}</span>}
                </span>
                <button onClick={() => removeReward(reward.id)} className="p-1 hover:bg-red-900/30 rounded">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <label className="text-xs text-[var(--primary-dim)] block mb-1">Item Name</label>
            <input
              ref={itemNameInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setNewReward(prev => ({ ...prev, item_name: e.target.value }));
                setShowDropdown(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => {
                setShowDropdown(true);
                setHighlightedIndex(0);
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder="Search or type new item..."
              className="w-full p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)]"
            />
            {showDropdown && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-[var(--background)] border border-[var(--primary-dim)] rounded shadow-lg">
                {filteredItems.map((item, idx) => (
                  <button
                    key={item}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectItem(item);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3 py-2 text-[var(--primary)] text-sm ${
                      idx === highlightedIndex
                        ? 'bg-[var(--secondary)] text-[var(--primary-dark)]'
                        : 'hover:bg-[var(--background-bright)]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            {showDropdown && searchTerm && filteredItems.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[var(--background)] border border-[var(--primary-dim)] rounded shadow-lg px-3 py-2 text-[var(--primary-dim)] text-sm">
                Press Enter to add "{searchTerm}" as new item
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-[var(--primary-dim)] block mb-1">Quantity</label>
            <input
              ref={quantityInputRef}
              type="text"
              inputMode="numeric"
              value={newReward.quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setNewReward(prev => ({ ...prev, quantity: val }));
                }
              }}
              onKeyDown={handleQuantityKeyDown}
              placeholder="1"
              className="w-full p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)]"
            />
          </div>

          <button
            onClick={addReward}
            disabled={!newReward.item_name.trim() || saving}
            className="w-full py-2 rounded bg-[var(--secondary)] text-[var(--background)] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </div>

        {rewards.length > 0 && (
          <button
            onClick={onBack}
            className="w-full mt-4 py-2 rounded border border-[var(--primary-dim)] text-[var(--primary)] hover:bg-[var(--background)] transition"
          >
            Done - Back to Expeditions
          </button>
        )}
      </div>
    </div>
  );
}
