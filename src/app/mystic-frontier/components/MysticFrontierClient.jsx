'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MAX_ROUNDS,
} from '@/data/mysticFrontierData';
import { Check, Compass, History, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';
import NewExpeditionForm from './NewExpeditionForm';
import MyExpeditions from './MyExpeditions';
import {
  DEFAULT_KNOWN_ITEMS,
  DEFAULT_REWARD,
} from './mysticFrontierUiConstants';

export default function MysticFrontierClient() {
  const { user, loading: authLoading } = useAuth();
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
    loadKnownItems();
  }, []);

  useEffect(() => {
    if (!user) {
      setIgn('');
      setIgnSaved(false);
      return;
    }

    const perUserKey = `mysticFrontierIgn:${user.id}`;
    const savedIgn = localStorage.getItem(perUserKey);
    if (savedIgn) {
      setIgn(savedIgn);
      setIgnSaved(true);
      return;
    }

    // one-time migration from old global key (if it exists)
    const legacyIgn = localStorage.getItem('mysticFrontierIgn');
    if (legacyIgn) {
      localStorage.setItem(perUserKey, legacyIgn);
      setIgn(legacyIgn);
      setIgnSaved(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadMyExpeditions();
    }
  }, [user, activeTab]);

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
    if (!user) return;
    if (ign.trim()) {
      localStorage.setItem(`mysticFrontierIgn:${user.id}`, ign.trim());
      setIgnSaved(true);
    }
  };

  const changeIgn = () => {
    if (user) {
      localStorage.removeItem(`mysticFrontierIgn:${user.id}`);
    }
    setIgnSaved(false);
  };

  const loadMyExpeditions = async () => {
    if (!user) return;
    setLoadingExpeditions(true);
    try {
      const { data, error } = await supabase
        .from('expeditions')
        .select(`
          *,
          tiles (*),
          rewards (*)
        `)
        .eq('user_id', user.id)
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
    if (!user) {
      alert('Please sign in to submit expeditions');
      return;
    }
    if (!siteRank) {
      alert('Please select a site rank');
      return;
    }

    setSubmitting(true);
    try {
      const { data: expedition, error: expError } = await supabase
        .from('expeditions')
        .insert({
          user_id: user.id,
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
            const option1Reward = tile.option1.reward || DEFAULT_REWARD;
            if (option1Reward || tile.option1.apCost) {
              allTiles.push({
                expedition_id: expedition.id,
                round_number: round,
                tile_type: tile.type,
                tile_rarity: tile.rarity,
                ap_cost: tile.option1.apCost,
                reward_option: option1Reward,
                selected: isSelectedTile && tile.selectedOption === 1,
                option_number: 1,
                tile_index: idx,
              });
            }
            const option2Reward = tile.option2.reward || DEFAULT_REWARD;
            if (option2Reward || tile.option2.apCost) {
              allTiles.push({
                expedition_id: expedition.id,
                round_number: round,
                tile_type: tile.type,
                tile_rarity: tile.rarity,
                ap_cost: tile.option2.apCost,
                reward_option: option2Reward,
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

  // show auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-[var(--primary-dim)]">Loading...</div>
      </div>
    );
  }

  // show IGN prompt if authenticated but no IGN saved
  if (user && !ignSaved) {
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

  // show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl text-[var(--primary-bright)]">Mystic Frontier Tracker</h1>
              <p className="text-[var(--primary-dim)] text-sm mt-1">Track your expeditions and view community statistics</p>
            </div>
            <Link 
              href="/mystic-frontier/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] hover:border-[var(--secondary)] transition"
            >
              <Compass className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>
          <div className="max-w-md">
            <LoginForm />
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
              <span className="text-[var(--primary-dim)] text-sm">IGN:</span>
              <span className="text-[var(--secondary)]">{ign}</span>
              <button onClick={changeIgn} className="text-xs text-[var(--primary-dim)] hover:text-[var(--primary)] underline">
                change
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LoginForm />
            <Link 
              href="/mystic-frontier/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] hover:border-[var(--secondary)] transition"
            >
              <Compass className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>
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
