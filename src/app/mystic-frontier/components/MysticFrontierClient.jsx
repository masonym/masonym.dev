'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  SITE_RANKS, 
  SITE_RANK_CONFIG, 
  TILE_TYPES, 
  TILE_RARITIES,
  TILE_RARITY_CONFIG,
  MAX_ROUNDS,
  CHEST_TIERS,
  CHEST_TIER_CONFIG,
  POUCH_TYPES,
  POUCH_CONFIG
} from '@/data/mysticFrontierData';
import { ChevronRight, ChevronLeft, Plus, Minus, Trash2, Check, User, MapPin, Compass, Gift, History, Sword, Search, HeartPulse } from 'lucide-react';
import Link from 'next/link';

const TILE_ICONS = {
  Hunting: Sword,
  Encounter: Search,
  Lucky: HeartPulse,
};

const DEFAULT_KNOWN_ITEMS = [
  'Mysterious Glowing Pouch',
  'Mysterious Blue Pouch',
  'Mysterious Purple Pouch',
  'Mysterious Orange Pouch',
  'Mysterious Green Pouch',
  'Chaos Pitched Accessory Box',
  'Pitched Star Core Coupon',
  'Star Core Coupon',
  'Damaged Black Heart Coupon',
];

export default function MysticFrontierClient() {
  const [ign, setIgn] = useState('');
  const [ignSaved, setIgnSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  
  // expedition form state
  const [siteRank, setSiteRank] = useState('');
  const [elementMatch, setElementMatch] = useState(false);
  const [typeMatch, setTypeMatch] = useState(false);
  const [rounds, setRounds] = useState(() => {
    const initial = {};
    for (let i = 1; i <= MAX_ROUNDS; i++) {
      initial[i] = { tiles: [], selectedTileIndex: null };
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [knownItems, setKnownItems] = useState(DEFAULT_KNOWN_ITEMS);

  // my expeditions state
  const [myExpeditions, setMyExpeditions] = useState([]);
  const [loadingExpeditions, setLoadingExpeditions] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState(null);

  useEffect(() => {
    const savedIgn = localStorage.getItem('mysticFrontierIgn');
    if (savedIgn) {
      setIgn(savedIgn);
      setIgnSaved(true);
    }
    loadKnownItems();
  }, []);

  useEffect(() => {
    if (ignSaved && activeTab === 'history') {
      loadMyExpeditions();
    }
  }, [ignSaved, activeTab]);

  const loadKnownItems = async () => {
    const { data } = await supabase
      .from('known_items')
      .select('item_name')
      .order('item_name');
    const dbItems = data?.map(i => i.item_name) || [];
    const merged = [...new Set([...DEFAULT_KNOWN_ITEMS, ...dbItems])].sort();
    setKnownItems(merged);
  };

  const saveIgn = () => {
    if (ign.trim()) {
      localStorage.setItem('mysticFrontierIgn', ign.trim());
      setIgnSaved(true);
    }
  };

  const changeIgn = () => {
    setIgnSaved(false);
  };

  const loadMyExpeditions = async () => {
    setLoadingExpeditions(true);
    try {
      const { data, error } = await supabase
        .from('expeditions')
        .select(`
          *,
          tiles (*),
          rewards (*)
        `)
        .eq('ign', ign)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMyExpeditions(data || []);
    } catch (err) {
      console.error('Error loading expeditions:', err);
    }
    setLoadingExpeditions(false);
  };

  const setTileCount = (roundNum, count) => {
    setRounds(prev => {
      const currentTiles = prev[roundNum].tiles;
      const newTiles = [];
      for (let i = 0; i < count; i++) {
        if (currentTiles[i]) {
          newTiles.push(currentTiles[i]);
        } else {
          newTiles.push({
            type: 'Hunting',
            rarity: 'Normal',
            option1: { reward: '', apCost: null },
            option2: { reward: '', apCost: null },
            selectedOption: null,
          });
        }
      }
      return {
        ...prev,
        [roundNum]: {
          ...prev[roundNum],
          tiles: newTiles,
          selectedTileIndex: prev[roundNum].selectedTileIndex >= count ? null : prev[roundNum].selectedTileIndex,
        }
      };
    });
  };

  const updateTile = (roundNum, tileIndex, field, value) => {
    setRounds(prev => ({
      ...prev,
      [roundNum]: {
        ...prev[roundNum],
        tiles: prev[roundNum].tiles.map((tile, idx) => 
          idx === tileIndex ? { ...tile, [field]: value } : tile
        )
      }
    }));
  };

  const updateTileOption = (roundNum, tileIndex, optionKey, field, value) => {
    setRounds(prev => ({
      ...prev,
      [roundNum]: {
        ...prev[roundNum],
        tiles: prev[roundNum].tiles.map((tile, idx) => 
          idx === tileIndex ? { 
            ...tile, 
            [optionKey]: { ...tile[optionKey], [field]: value } 
          } : tile
        )
      }
    }));
  };

  const selectTileForRound = (roundNum, tileIndex, optionNum = null) => {
    setRounds(prev => {
      const isDeselecting = prev[roundNum].selectedTileIndex === tileIndex && 
        (optionNum === null || prev[roundNum].tiles[tileIndex]?.selectedOption === optionNum);
      
      return {
        ...prev,
        [roundNum]: {
          ...prev[roundNum],
          selectedTileIndex: isDeselecting ? null : tileIndex,
          tiles: prev[roundNum].tiles.map((tile, idx) => 
            idx === tileIndex 
              ? { ...tile, selectedOption: isDeselecting ? null : optionNum }
              : tile
          )
        }
      };
    });
  };

  const resetForm = () => {
    setSiteRank('');
    setElementMatch(false);
    setTypeMatch(false);
    const initial = {};
    for (let i = 1; i <= MAX_ROUNDS; i++) {
      initial[i] = { tiles: [], selectedTileIndex: null };
    }
    setRounds(initial);
  };

  const submitExpedition = async () => {
    if (!siteRank) {
      alert('Please select a site rank');
      return;
    }

    setSubmitting(true);
    try {
      const { data: expedition, error: expError } = await supabase
        .from('expeditions')
        .insert({
          ign: ign,
          site_rank: siteRank,
          element_match: elementMatch,
          type_match: typeMatch,
        })
        .select()
        .single();

      if (expError) throw expError;

      const allTiles = [];
      for (let round = 1; round <= MAX_ROUNDS; round++) {
        const roundData = rounds[round];
        roundData.tiles.forEach((tile, idx) => {
          const isSelectedTile = roundData.selectedTileIndex === idx;
          const isLucky = tile.type === 'Lucky';
          
          if (isLucky) {
            // lucky tiles have no reward options, just record the tile
            allTiles.push({
              expedition_id: expedition.id,
              round_number: round,
              tile_type: tile.type,
              tile_rarity: tile.rarity,
              ap_cost: null,
              reward_option: null,
              selected: isSelectedTile,
              option_number: null,
              tile_index: idx,
            });
          } else {
            // insert both options as separate tile records, marking which was selected
            if (tile.option1.reward || tile.option1.apCost) {
              allTiles.push({
                expedition_id: expedition.id,
                round_number: round,
                tile_type: tile.type,
                tile_rarity: tile.rarity,
                ap_cost: tile.option1.apCost,
                reward_option: tile.option1.reward,
                selected: isSelectedTile && tile.selectedOption === 1,
                option_number: 1,
                tile_index: idx,
              });
            }
            if (tile.option2.reward || tile.option2.apCost) {
              allTiles.push({
                expedition_id: expedition.id,
                round_number: round,
                tile_type: tile.type,
                tile_rarity: tile.rarity,
                ap_cost: tile.option2.apCost,
                reward_option: tile.option2.reward,
                selected: isSelectedTile && tile.selectedOption === 2,
                option_number: 2,
                tile_index: idx,
              });
            }
          }
        });
      }

      if (allTiles.length > 0) {
        const { error: tilesError } = await supabase
          .from('tiles')
          .insert(allTiles);
        if (tilesError) throw tilesError;
      }

      setSubmitSuccess(true);
      resetForm();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting expedition:', err);
      alert('Error submitting expedition. Please try again.');
    }
    setSubmitting(false);
  };

  // compute selected rewards summary (excluding Lucky tiles)
  const selectedRewards = useMemo(() => {
    const rewards = [];
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      const roundData = rounds[round];
      if (roundData.selectedTileIndex !== null) {
        const tile = roundData.tiles[roundData.selectedTileIndex];
        if (tile && tile.type !== 'Lucky') {
          if (tile.selectedOption === 1 && tile.option1.reward) {
            rewards.push({
              round,
              reward: tile.option1.reward,
              apCost: tile.option1.apCost,
              tileType: tile.type,
              tileRarity: tile.rarity,
            });
          } else if (tile.selectedOption === 2 && tile.option2.reward) {
            rewards.push({
              round,
              reward: tile.option2.reward,
              apCost: tile.option2.apCost,
              tileType: tile.type,
              tileRarity: tile.rarity,
            });
          }
        }
      }
    }
    return rewards;
  }, [rounds]);

  if (!ignSaved) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-[var(--background-bright)] rounded-lg p-6 border border-[var(--primary-dim)]">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-[var(--secondary)]" />
              <h1 className="text-xl text-[var(--primary-bright)]">Enter Your IGN</h1>
            </div>
            <p className="text-[var(--primary-dim)] text-sm mb-4">
              Your in-game name will be saved locally to track your expeditions.
            </p>
            <input
              type="text"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveIgn()}
              placeholder="Enter your IGN..."
              className="w-full p-3 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)] mb-4 focus:outline-none focus:border-[var(--secondary)]"
            />
            <button
              onClick={saveIgn}
              disabled={!ign.trim()}
              className="w-full py-3 rounded bg-[var(--secondary)] text-[var(--background)] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl text-[var(--primary-bright)]">Mystic Frontier Tracker</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[var(--primary-dim)] text-sm">Logged in as:</span>
              <span className="text-[var(--secondary)]">{ign}</span>
              <button onClick={changeIgn} className="text-xs text-[var(--primary-dim)] hover:text-[var(--primary)] underline">
                change
              </button>
            </div>
          </div>
          <Link 
            href="/mystic-frontier/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] hover:border-[var(--secondary)] transition"
          >
            <Compass className="w-4 h-4" />
            View Dashboard
          </Link>
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'new' 
                ? 'bg-[var(--secondary)] text-[var(--background)]' 
                : 'bg-[var(--background-bright)] text-[var(--primary)] hover:bg-[var(--background-dim)]'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Expedition
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'history' 
                ? 'bg-[var(--secondary)] text-[var(--background)]' 
                : 'bg-[var(--background-bright)] text-[var(--primary)] hover:bg-[var(--background-dim)]'
            }`}
          >
            <History className="w-4 h-4" />
            My Expeditions
          </button>
        </div>

        {submitSuccess && (
          <div className="mb-4 p-4 rounded bg-green-900/30 border border-green-500 text-green-400 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Expedition submitted successfully! Add rewards from "My Expeditions" when they're ready.
          </div>
        )}

        {activeTab === 'new' ? (
          <NewExpeditionForm
            siteRank={siteRank}
            setSiteRank={setSiteRank}
            elementMatch={elementMatch}
            setElementMatch={setElementMatch}
            typeMatch={typeMatch}
            setTypeMatch={setTypeMatch}
            rounds={rounds}
            setTileCount={setTileCount}
            updateTile={updateTile}
            updateTileOption={updateTileOption}
            selectTileForRound={selectTileForRound}
            selectedRewards={selectedRewards}
            submitExpedition={submitExpedition}
            submitting={submitting}
            knownItems={knownItems}
          />
        ) : (
          <MyExpeditions
            expeditions={myExpeditions}
            loading={loadingExpeditions}
            selectedExpedition={selectedExpedition}
            setSelectedExpedition={setSelectedExpedition}
            onRefresh={loadMyExpeditions}
          />
        )}
      </div>
    </div>
  );
}

function NewExpeditionForm({
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
  return (
    <div className="space-y-6">
      {/* site rank selection */}
      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-[var(--secondary)]" />
          <h2 className="text-lg text-[var(--primary-bright)]">Expedition Site</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SITE_RANKS.map(rank => (
            <button
              key={rank}
              onClick={() => setSiteRank(rank)}
              className={`p-3 rounded border-2 transition ${
                siteRank === rank
                  ? 'border-[var(--secondary)] bg-[var(--secondary)]/20'
                  : 'border-[var(--primary-dim)] hover:border-[var(--primary)]'
              }`}
              style={{ 
                color: SITE_RANK_CONFIG[rank].color,
                borderColor: siteRank === rank ? SITE_RANK_CONFIG[rank].color : undefined
              }}
            >
              <div className="font-bold">{rank}</div>
              <div className="text-xs opacity-70">{SITE_RANK_CONFIG[rank].duration}hr</div>
            </button>
          ))}
        </div>
      </div>

      {/* element/type matching */}
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

      {/* all rounds displayed at once */}
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
          />
        ))}
      </div>

      {/* selected rewards summary */}
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

      {/* submit */}
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

function RoundSection({ roundNum, roundData, setTileCount, updateTile, updateTileOption, selectTileForRound, knownItems }) {
  const tileCount = roundData.tiles.length;
  
  return (
    <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[var(--primary-bright)] font-bold">Round {roundNum}</h3>
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
          No tiles this round (skipped or ran out of AP)
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
}

function TileCard({ tile, index, roundNum, isSelected, onSelect, onUpdateTile, onUpdateOption, knownItems }) {
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

      {/* reward options - hidden for Lucky tiles */}
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

function RewardOptionSelectable({ label, optionNum, option, onChange, knownItems, isSelected, onSelect }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(option.reward || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const filteredItems = searchTerm 
    ? knownItems.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : knownItems;

  const selectItem = (item) => {
    setSearchTerm(item);
    onChange('reward', item);
    setShowDropdown(false);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredItems.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      case 'Tab':
        if (filteredItems[highlightedIndex]) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
    }
  };

  return (
    <div 
      className={`p-2 rounded border-2 transition cursor-pointer ${
        isSelected 
          ? 'border-green-500 bg-green-900/20' 
          : 'border-[var(--primary-dim)]/50 hover:border-[var(--primary-dim)]'
      }`}
      onClick={(e) => {
        if (e.target.tagName !== 'INPUT') {
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--primary-dim)]">{label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`px-2 py-0.5 rounded text-xs font-bold transition ${
            isSelected
              ? 'bg-green-500 text-white'
              : 'bg-[var(--background-bright)] text-[var(--primary-dim)] hover:bg-[var(--background-dim)]'
          }`}
        >
          {isSelected ? '✓' : 'Select'}
        </button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange('reward', e.target.value);
              setShowDropdown(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => {
              setShowDropdown(true);
              setHighlightedIndex(0);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Select reward..."
            className="w-full p-1.5 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] text-sm"
          />
          {showDropdown && filteredItems.length > 0 && (
            <div className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-[var(--background)] border border-[var(--primary-dim)] rounded shadow-lg">
              {filteredItems.map((item, idx) => (
                <button
                  key={item}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectItem(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-2 py-1.5 text-[var(--primary)] text-xs ${
                    idx === highlightedIndex 
                      ? 'bg-[var(--secondary)] text-[var(--background)]' 
                      : 'hover:bg-[var(--background-bright)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          value={option.apCost || ''}
          onChange={(e) => onChange('apCost', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="AP"
          className="w-16 p-1.5 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] text-sm text-center"
        />
      </div>
    </div>
  );
}

function MyExpeditions({ expeditions, loading, selectedExpedition, setSelectedExpedition, onRefresh }) {
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
      />
    );
  }

  return (
    <div className="space-y-3">
      {expeditions.map(exp => (
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
          {/* show selected rewards preview */}
          {(() => {
            const selectedTiles = exp.tiles?.filter(t => t.selected && t.reward_option && t.tile_type !== 'Lucky') || [];
            if (selectedTiles.length === 0) return null;
            
            // count pouches
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

          {/* rewards summary after claiming */}
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

function ExpeditionDetail({ expedition, onBack }) {
  const [rewards, setRewards] = useState(expedition.rewards || []);
  const [newReward, setNewReward] = useState({ item_name: '', quantity: '' });
  const [knownItems, setKnownItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const [finalTier, setFinalTier] = useState(expedition.final_chest_tier || null);
  const [pouchSaving, setPouchSaving] = useState(false);

  // auto-calculate pouches from selected tiles' reward_option
  const pouches = useMemo(() => {
    const counts = { Glowing: 0, Blue: 0, Purple: 0, Orange: 0, Green: 0 };
    const selectedTiles = expedition.tiles?.filter(t => t.selected && t.reward_option) || [];
    
    selectedTiles.forEach(tile => {
      const rewardName = tile.reward_option.toLowerCase();
      if (rewardName.includes('glowing')) counts.Glowing++;
      else if (rewardName.includes('green')) counts.Green++;
      else if (rewardName.includes('orange')) counts.Orange++;
      else if (rewardName.includes('purple')) counts.Purple++;
      else if (rewardName.includes('blue')) counts.Blue++;
    });
    
    return counts;
  }, [expedition.tiles]);

  // calculate starting chest tier from highest pouch
  const startingChestTier = useMemo(() => {
    // find highest pouch with count > 0
    for (let i = POUCH_TYPES.length - 1; i >= 0; i--) {
      if (pouches[POUCH_TYPES[i]] > 0) {
        return POUCH_TYPES[i];
      }
    }
    return null;
  }, [pouches]);

  // calculate tier-ups
  const tierUps = useMemo(() => {
    if (!startingChestTier || !finalTier) return 0;
    const startOrder = CHEST_TIER_CONFIG[startingChestTier]?.order || 0;
    const finalOrder = CHEST_TIER_CONFIG[finalTier]?.order || 0;
    return Math.max(0, finalOrder - startOrder);
  }, [startingChestTier, finalTier]);

  // total pouches
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

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredItems.length === 0) {
      if (e.key === 'Enter' && newReward.item_name.trim()) {
        e.preventDefault();
        if (newReward.quantity === '' && quantityInputRef.current) {
          // Focus quantity input if empty
          quantityInputRef.current.focus();
        } else {
          // Submit if quantity already has value
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
        // Focus quantity input after selecting
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
      // add to known items if new
      if (!knownItems.includes(newReward.item_name)) {
        await supabase.from('known_items').insert({ item_name: newReward.item_name });
        setKnownItems(prev => [...prev, newReward.item_name].sort());
      }

      // default quantity to 1 if empty or invalid
      const quantity = parseInt(newReward.quantity) || 1;

      // add reward
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

      // mark rewards as claimed
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

  const selectedTiles = expedition.tiles?.filter(t => t.selected) || [];

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--primary-dim)] hover:text-[var(--primary)] transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to expeditions
      </button>

      {/* expedition info */}
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
        <div className="flex gap-2">
          {expedition.element_match && <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">Element Match</span>}
          {expedition.type_match && <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400">Type Match</span>}
        </div>
      </div>

      {/* tiles summary - grouped by round */}
      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <h3 className="text-[var(--primary-bright)] mb-4">Tiles Recorded</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(roundNum => {
            const roundTiles = expedition.tiles?.filter(t => t.round_number === roundNum) || [];
            if (roundTiles.length === 0) return null;
            
            // group by tile_index to show options together
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
                          <div className="text-xs space-y-1 mt-1">
                            {tiles.map((t, i) => (
                              <div 
                                key={i} 
                                className={`flex items-center justify-between ${
                                  t.selected ? 'text-green-400' : 'text-[var(--primary-dim)]'
                                }`}
                              >
                                <span>{t.reward_option || `Option ${t.option_number}`}</span>
                                {t.ap_cost && <span>{t.ap_cost} AP</span>}
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

      {/* chest tier & tier-up */}
      {startingChestTier && (
        <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
          <h3 className="text-[var(--primary-bright)] mb-3">
            <Gift className="w-5 h-5 inline mr-2" />
            Chest Opening
          </h3>
          
          {/* pouches summary (auto-calculated from tiles) */}
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

      {/* item rewards from chest */}
      <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
        <h3 className="text-[var(--primary-bright)] mb-3">
          <Gift className="w-5 h-5 inline mr-2" />
          Items Received
        </h3>
        <p className="text-[var(--primary-dim)] text-sm mb-3">
          Enter the actual items you received when opening the chest.
        </p>

        {/* existing rewards */}
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

        {/* add new reward */}
        <div className="space-y-3">
          <div className="relative">
            <label className="text-xs text-[var(--primary-dim)] block mb-1">Item Name</label>
            <input
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

        {/* finish button */}
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
