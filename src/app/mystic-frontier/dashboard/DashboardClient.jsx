'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  SITE_RANKS, 
  SITE_RANK_CONFIG, 
  TILE_RARITIES,
  TILE_RARITY_CONFIG,
  TILE_TYPES,
  CHEST_TIERS,
  CHEST_TIER_CONFIG,
  POUCH_TYPES,
  POUCH_CONFIG,
} from '@/data/mysticFrontierData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ArrowLeft, RefreshCw, Filter, Database, TrendingUp, Layers, Gift, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [expeditions, setExpeditions] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [rewards, setRewards] = useState([]);
  
  // filters
  const [filterRank, setFilterRank] = useState('all');
  const [filterElementMatch, setFilterElementMatch] = useState('all');
  const [filterTypeMatch, setFilterTypeMatch] = useState('all');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [expRes, tilesRes, rewardsRes] = await Promise.all([
        supabase.from('expeditions').select('*'),
        supabase.from('tiles').select('*'),
        supabase.from('rewards').select('*'),
      ]);

      setExpeditions(expRes.data || []);
      setTiles(tilesRes.data || []);
      setRewards(rewardsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  // apply filters
  const filteredExpeditions = expeditions.filter(exp => {
    if (filterRank !== 'all' && exp.site_rank !== filterRank) return false;
    if (filterElementMatch !== 'all' && exp.element_match !== (filterElementMatch === 'yes')) return false;
    if (filterTypeMatch !== 'all' && exp.type_match !== (filterTypeMatch === 'yes')) return false;
    return true;
  });

  const filteredExpeditionIds = new Set(filteredExpeditions.map(e => e.id));
  const filteredTiles = tiles.filter(t => filteredExpeditionIds.has(t.expedition_id));
  const filteredRewards = rewards.filter(r => filteredExpeditionIds.has(r.expedition_id));

  // compute stats
  const stats = computeStats(filteredExpeditions, filteredTiles, filteredRewards);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-[var(--primary-dim)]">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/mystic-frontier" className="p-2 rounded bg-[var(--background-bright)] hover:bg-[var(--background-dim)] transition">
              <ArrowLeft className="w-5 h-5 text-[var(--primary)]" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl text-[var(--primary-bright)]">Mystic Frontier Dashboard</h1>
              <p className="text-[var(--primary-dim)] text-sm">Friend-aggregated expedition analytics</p>
            </div>
          </div>
          <button
            onClick={loadAllData}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] hover:border-[var(--secondary)] transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon={Database} label="Total Expeditions" value={filteredExpeditions.length} />
          <StatCard icon={Layers} label="Tiles Recorded" value={filteredTiles.length} />
          <StatCard icon={Gift} label="Rewards Logged" value={filteredRewards.length} />
          <StatCard icon={Sparkles} label="Total Tier-Ups" value={stats.tierUpStats.totalTierUps} />
          <StatCard icon={TrendingUp} label="Unique IGNs" value={new Set(filteredExpeditions.map(e => e.ign)).size} />
        </div>

        {/* filters */}
        <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)] mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-[var(--secondary)]" />
            <h2 className="text-lg text-[var(--primary-bright)]">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[var(--primary-dim)] block mb-1">Site Rank</label>
              <select
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value)}
                className="w-full p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)]"
              >
                <option value="all">All Ranks</option>
                {SITE_RANKS.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--primary-dim)] block mb-1">Element Match</label>
              <select
                value={filterElementMatch}
                onChange={(e) => setFilterElementMatch(e.target.value)}
                className="w-full p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)]"
              >
                <option value="all">All</option>
                <option value="yes">Element Match</option>
                <option value="no">No Element Match</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--primary-dim)] block mb-1">Type Match</label>
              <select
                value={filterTypeMatch}
                onChange={(e) => setFilterTypeMatch(e.target.value)}
                className="w-full p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)]"
              >
                <option value="all">All</option>
                <option value="yes">Type Match</option>
                <option value="no">No Type Match</option>
              </select>
            </div>
          </div>
        </div>

        {filteredExpeditions.length === 0 ? (
          <div className="bg-[var(--background-bright)] rounded-lg p-8 border border-[var(--primary-dim)] text-center">
            <Database className="w-12 h-12 text-[var(--primary-dim)] mx-auto mb-4" />
            <div className="text-[var(--primary-dim)]">No expedition data yet. Start submitting expeditions!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* expeditions by rank */}
            <ChartCard title="Expeditions by Site Rank">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.expeditionsByRank}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="rank" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" name="Expeditions">
                    {stats.expeditionsByRank.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SITE_RANK_CONFIG[entry.rank]?.color || '#666'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* tile rarity distribution */}
            <ChartCard title="Tile Rarity Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.tilesByRarity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="rarity"
                    label={({ rarity, percent }) => `${rarity} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.tilesByRarity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TILE_RARITY_CONFIG[entry.rarity]?.color || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* tile types distribution */}
            <ChartCard title="Tile Types Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.tilesByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="type" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="count" name="Count" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* avg AP cost by tile rarity */}
            <ChartCard title="Average AP Cost by Tile Rarity">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.avgApByRarity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="rarity" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value) => [value.toFixed(1), 'Avg AP']}
                  />
                  <Bar dataKey="avgAp" name="Average AP">
                    {stats.avgApByRarity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TILE_RARITY_CONFIG[entry.rarity]?.color || '#666'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* avg AP cost by round */}
            <ChartCard title="Average AP Cost by Round">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.avgApByRound}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="round" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value) => [value.toFixed(1), 'Avg AP']}
                  />
                  <Line type="monotone" dataKey="avgAp" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* top rewards */}
            <ChartCard title="Top Rewards">
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {stats.topRewards.map((reward, idx) => (
                  <div key={reward.name} className="bg-[var(--background)] rounded">
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--primary-dim)] text-sm w-6">#{idx + 1}</span>
                        <span className="text-[var(--primary)]">{reward.name}</span>
                      </div>
                      <span className="text-[var(--secondary)]">{reward.occurrences}</span>
                    </div>
                    {Object.entries(reward.breakdown).length > 1 && (
                      <div className="px-2 pb-2 space-y-1">
                        {Object.entries(reward.breakdown)
                          .sort((a, b) => {
                            const aQty = parseInt(a[0].split('x')[1]);
                            const bQty = parseInt(b[0].split('x')[1]);
                            return bQty - aQty;
                          })
                          .map(([breakdownKey, count]) => (
                            <div key={breakdownKey} className="flex items-center justify-between pl-8 text-xs">
                              <span className="text-[var(--primary-dim)]">{breakdownKey}</span>
                              <span className="text-[var(--primary-dim)]">{count}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
                {stats.topRewards.length === 0 && (
                  <div className="text-[var(--primary-dim)] text-center py-4">No rewards logged yet</div>
                )}
              </div>
            </ChartCard>

            {/* rewards by site rank */}
            <ChartCard title="Rewards by Site Rank">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.rewardsByRank}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="rank" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="count" name="Rewards">
                    {stats.rewardsByRank.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SITE_RANK_CONFIG[entry.rank]?.color || '#666'} />
                    ))}
                  </Bar>
                  <Bar dataKey="avgPerExpedition" name="Avg per Expedition" fill="#a78bfa" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* rewards by tile rarity */}
            <ChartCard title="Rewards by Tile Rarity (Selected Tiles)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.rewardsByTileRarity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="rarity" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="count" name="Rewards">
                    {stats.rewardsByTileRarity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TILE_RARITY_CONFIG[entry.rarity]?.color || '#666'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* tier-up statistics */}
            <ChartCard title="Chest Tier-Up Statistics">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-[var(--background)]">
                  <span className="text-[var(--primary)]">Expeditions with Tier-Ups</span>
                  <span className="text-[var(--secondary)] font-bold">
                    {stats.tierUpStats.expeditionsWithTierUps} / {filteredExpeditions.length}
                    <span className="text-[var(--primary-dim)] text-sm ml-2">
                      ({filteredExpeditions.length > 0 ? ((stats.tierUpStats.expeditionsWithTierUps / filteredExpeditions.length) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[var(--background)]">
                  <span className="text-[var(--primary)]">Avg Tier-Ups per Upgrade</span>
                  <span className="text-yellow-400 font-bold">{stats.tierUpStats.avgTierUpsPerUpgrade.toFixed(2)}</span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[var(--primary-dim)] text-sm mb-2">Tier-Up Distribution</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(tierUp => (
                      <div key={tierUp} className="text-center p-2 rounded bg-[var(--background)]">
                        <div className="text-yellow-400 font-bold">+{tierUp}</div>
                        <div className="text-[var(--primary-dim)] text-xs">
                          {stats.tierUpStats.tierUpDistribution[tierUp] || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-[var(--primary-dim)] text-sm mb-2">Pouches Collected</h4>
                  <div className="flex gap-1">
                    {POUCH_TYPES.map(pouch => {
                      const count = stats.tierUpStats.pouchDistribution[pouch] || 0;
                      return (
                        <div 
                          key={pouch} 
                          className="flex-1 text-center p-2 rounded"
                          style={{ backgroundColor: `${POUCH_CONFIG[pouch].color}20` }}
                        >
                          <div 
                            className="font-bold text-xs"
                            style={{ color: POUCH_CONFIG[pouch].color }}
                          >
                            {pouch}
                          </div>
                          <div className="text-[var(--primary-dim)] text-xs">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-[var(--primary-dim)] text-sm mb-2">Final Chest Tier Distribution</h4>
                  <div className="flex gap-1">
                    {CHEST_TIERS.map(tier => {
                      const count = stats.tierUpStats.finalTierDistribution[tier] || 0;
                      return (
                        <div 
                          key={tier} 
                          className="flex-1 text-center p-2 rounded"
                          style={{ backgroundColor: `${CHEST_TIER_CONFIG[tier].color}20` }}
                        >
                          <div 
                            className="font-bold text-xs"
                            style={{ color: CHEST_TIER_CONFIG[tier].color }}
                          >
                            {tier}
                          </div>
                          <div className="text-[var(--primary-dim)] text-xs">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* element/type match effects */}
            <ChartCard title="Element/Type Match Effects" className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[var(--primary-dim)] text-sm mb-2">Average Rewards per Expedition</h4>
                  <div className="space-y-2">
                    <MatchCompareRow 
                      label="No Match" 
                      value={stats.matchEffects.noMatch.avgRewards} 
                      count={stats.matchEffects.noMatch.count}
                    />
                    <MatchCompareRow 
                      label="Element Match" 
                      value={stats.matchEffects.elementOnly.avgRewards} 
                      count={stats.matchEffects.elementOnly.count}
                      color="#60a5fa"
                    />
                    <MatchCompareRow 
                      label="Type Match" 
                      value={stats.matchEffects.typeOnly.avgRewards} 
                      count={stats.matchEffects.typeOnly.count}
                      color="#a78bfa"
                    />
                    <MatchCompareRow 
                      label="Both Match" 
                      value={stats.matchEffects.bothMatch.avgRewards} 
                      count={stats.matchEffects.bothMatch.count}
                      color="#fbbf24"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-[var(--primary-dim)] text-sm mb-2">Average Tiles per Expedition</h4>
                  <div className="space-y-2">
                    <MatchCompareRow 
                      label="No Match" 
                      value={stats.matchEffects.noMatch.avgTiles} 
                      count={stats.matchEffects.noMatch.count}
                    />
                    <MatchCompareRow 
                      label="Element Match" 
                      value={stats.matchEffects.elementOnly.avgTiles} 
                      count={stats.matchEffects.elementOnly.count}
                      color="#60a5fa"
                    />
                    <MatchCompareRow 
                      label="Type Match" 
                      value={stats.matchEffects.typeOnly.avgTiles} 
                      count={stats.matchEffects.typeOnly.count}
                      color="#a78bfa"
                    />
                    <MatchCompareRow 
                      label="Both Match" 
                      value={stats.matchEffects.bothMatch.avgTiles} 
                      count={stats.matchEffects.bothMatch.count}
                      color="#fbbf24"
                    />
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[var(--secondary)]" />
        <span className="text-xs text-[var(--primary-dim)]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--primary-bright)]">{value}</div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)] ${className}`}>
      <h3 className="text-[var(--primary-bright)] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function MatchCompareRow({ label, value, count, color = '#6b7280' }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[var(--background)]">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
        <span className="text-[var(--primary)] text-sm">{label}</span>
        <span className="text-[var(--primary-dim)] text-xs">({count} exp)</span>
      </div>
      <span className="text-[var(--secondary)] font-bold">{value.toFixed(2)}</span>
    </div>
  );
}

function computeStats(expeditions, tiles, rewards) {
  // expeditions by rank
  const expeditionsByRank = SITE_RANKS.map(rank => ({
    rank,
    count: expeditions.filter(e => e.site_rank === rank).length
  }));

  // tiles by rarity
  const tilesByRarity = TILE_RARITIES.map(rarity => ({
    rarity,
    count: tiles.filter(t => t.tile_rarity === rarity).length
  }));

  // tiles by type
  const tilesByType = TILE_TYPES.map(type => ({
    type,
    count: tiles.filter(t => t.tile_type === type).length
  }));

  // avg AP by rarity
  const avgApByRarity = TILE_RARITIES.map(rarity => {
    const rarityTiles = tiles.filter(t => t.tile_rarity === rarity && t.ap_cost != null);
    const avgAp = rarityTiles.length > 0 
      ? rarityTiles.reduce((sum, t) => sum + t.ap_cost, 0) / rarityTiles.length 
      : 0;
    return { rarity, avgAp };
  });

  // avg AP by round
  const avgApByRound = [1, 2, 3, 4, 5].map(round => {
    const roundTiles = tiles.filter(t => t.round_number === round && t.ap_cost != null);
    const avgAp = roundTiles.length > 0 
      ? roundTiles.reduce((sum, t) => sum + t.ap_cost, 0) / roundTiles.length 
      : 0;
    return { round: `Round ${round}`, avgAp };
  });

  // top rewards
  const rewardGroups = {};
  rewards.forEach(r => {
    const key = r.item_name;
    if (!rewardGroups[key]) {
      rewardGroups[key] = {
        name: key,
        totalQuantity: 0,
        occurrences: 0,
        breakdown: {}
      };
    }
    rewardGroups[key].totalQuantity += r.quantity;
    rewardGroups[key].occurrences += 1;
    const qtyKey = `${key} x${r.quantity}`;
    rewardGroups[key].breakdown[qtyKey] = (rewardGroups[key].breakdown[qtyKey] || 0) + 1;
  });
  const topRewards = Object.values(rewardGroups)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  // rewards by rank
  const rewardsByRank = SITE_RANKS.map(rank => {
    const rankExpeditions = expeditions.filter(e => e.site_rank === rank);
    const rankExpIds = new Set(rankExpeditions.map(e => e.id));
    const rankRewards = rewards.filter(r => rankExpIds.has(r.expedition_id));
    const count = rankRewards.reduce((sum, r) => sum + r.quantity, 0);
    const avgPerExpedition = rankExpeditions.length > 0 ? count / rankExpeditions.length : 0;
    return { rank, count, avgPerExpedition };
  });

  // rewards by tile rarity (for tiles that were selected and have associated rewards)
  const tileIdToRarity = {};
  tiles.forEach(t => { tileIdToRarity[t.id] = t.tile_rarity; });
  
  const rewardsByTileRarity = TILE_RARITIES.map(rarity => {
    const count = rewards
      .filter(r => r.tile_id && tileIdToRarity[r.tile_id] === rarity)
      .reduce((sum, r) => sum + r.quantity, 0);
    return { rarity, count };
  });

  // match effects
  const computeMatchGroup = (filterFn) => {
    const groupExps = expeditions.filter(filterFn);
    const groupExpIds = new Set(groupExps.map(e => e.id));
    const groupTiles = tiles.filter(t => groupExpIds.has(t.expedition_id));
    const groupRewards = rewards.filter(r => groupExpIds.has(r.expedition_id));
    
    return {
      count: groupExps.length,
      avgRewards: groupExps.length > 0 
        ? groupRewards.reduce((sum, r) => sum + r.quantity, 0) / groupExps.length 
        : 0,
      avgTiles: groupExps.length > 0 
        ? groupTiles.length / groupExps.length 
        : 0,
    };
  };

  const matchEffects = {
    noMatch: computeMatchGroup(e => !e.element_match && !e.type_match),
    elementOnly: computeMatchGroup(e => e.element_match && !e.type_match),
    typeOnly: computeMatchGroup(e => !e.element_match && e.type_match),
    bothMatch: computeMatchGroup(e => e.element_match && e.type_match),
  };

  // tier-up statistics (now tracked at expedition level)
  const expeditionsWithTierUps = expeditions.filter(e => e.tier_ups && e.tier_ups > 0);
  const totalTierUps = expeditionsWithTierUps.reduce((sum, e) => sum + (e.tier_ups || 0), 0);
  
  const tierUpDistribution = {};
  expeditionsWithTierUps.forEach(e => {
    tierUpDistribution[e.tier_ups] = (tierUpDistribution[e.tier_ups] || 0) + 1;
  });

  const finalTierDistribution = {};
  const startingTierDistribution = {};
  expeditions.forEach(e => {
    if (e.final_chest_tier) {
      finalTierDistribution[e.final_chest_tier] = (finalTierDistribution[e.final_chest_tier] || 0) + 1;
    }
    if (e.starting_chest_tier) {
      startingTierDistribution[e.starting_chest_tier] = (startingTierDistribution[e.starting_chest_tier] || 0) + 1;
    }
  });

  // pouch distribution
  const pouchDistribution = {};
  POUCH_TYPES.forEach(p => { pouchDistribution[p] = 0; });
  expeditions.forEach(e => {
    if (e.pouches) {
      POUCH_TYPES.forEach(p => {
        pouchDistribution[p] += (e.pouches[p] || 0);
      });
    }
  });

  const tierUpStats = {
    totalTierUps,
    expeditionsWithTierUps: expeditionsWithTierUps.length,
    avgTierUpsPerUpgrade: expeditionsWithTierUps.length > 0 
      ? totalTierUps / expeditionsWithTierUps.length 
      : 0,
    tierUpDistribution,
    finalTierDistribution,
    startingTierDistribution,
    pouchDistribution,
  };

  return {
    expeditionsByRank,
    tilesByRarity,
    tilesByType,
    avgApByRarity,
    avgApByRound,
    topRewards,
    rewardsByRank,
    rewardsByTileRarity,
    matchEffects,
    tierUpStats,
  };
}
