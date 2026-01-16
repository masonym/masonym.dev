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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ArrowLeft, RefreshCw, Filter, Database, TrendingUp, Layers, Gift, Sparkles } from 'lucide-react';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  ChartTooltip,
  ChartLegend
);

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
      const normalize = (data) => {
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
      };

      const [expRes, tilesRes, rewardsRes] = await Promise.all([
        supabase.from('expeditions').select('*'),
        supabase.from('tiles').select('*'),
        supabase.from('rewards').select('*'),
      ]);

      setExpeditions(normalize(expRes.data));
      setTiles(normalize(tilesRes.data));
      setRewards(normalize(rewardsRes.data));
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

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderColor: '#333',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  };

  const expeditionsByRankData = {
    labels: stats.expeditionsByRank.map(d => d.rank),
    datasets: [
      {
        label: 'Expeditions',
        data: stats.expeditionsByRank.map(d => d.count),
        backgroundColor: stats.expeditionsByRank.map(d => SITE_RANK_CONFIG[d.rank]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const tilesByRarityData = {
    labels: stats.tilesByRarity.map(d => d.rarity),
    datasets: [
      {
        label: 'Tiles',
        data: stats.tilesByRarity.map(d => d.count),
        backgroundColor: stats.tilesByRarity.map(d => TILE_RARITY_CONFIG[d.rarity]?.color || '#666'),
        borderColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
      },
    ],
  };

  const tilesByTypeData = {
    labels: stats.tilesByType.map(d => d.type),
    datasets: [
      {
        label: 'Count',
        data: stats.tilesByType.map(d => d.count),
        backgroundColor: '#60a5fa',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const avgApByRarityData = {
    labels: stats.avgApByRarity.map(d => d.rarity),
    datasets: [
      {
        label: 'Avg AP',
        data: stats.avgApByRarity.map(d => d.avgAp),
        backgroundColor: stats.avgApByRarity.map(d => TILE_RARITY_CONFIG[d.rarity]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const avgApByRoundData = {
    labels: stats.avgApByRound.map(d => d.round),
    datasets: [
      {
        label: 'Avg AP',
        data: stats.avgApByRound.map(d => d.avgAp),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.15)',
        pointBackgroundColor: '#fbbf24',
        pointBorderColor: '#fbbf24',
        pointRadius: 3,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const rewardsByRankData = {
    labels: stats.rewardsByRank.map(d => d.rank),
    datasets: [
      {
        label: 'Reward occurrences',
        data: stats.rewardsByRank.map(d => d.count),
        backgroundColor: stats.rewardsByRank.map(d => SITE_RANK_CONFIG[d.rank]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Avg per Expedition',
        data: stats.rewardsByRank.map(d => d.avgPerExpedition),
        backgroundColor: 'rgba(167,139,250,0.35)',
        borderColor: '#a78bfa',
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  const rewardsByRankOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        title: { display: true, text: 'Rewards', color: '#9ca3af' },
      },
      y1: {
        position: 'right',
        ticks: { color: '#9ca3af' },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Avg/Exp', color: '#9ca3af' },
      },
    },
  };

  const pouchAppearanceTotal = stats.pouchAppearanceTotal || 0;
  const pouchAppearanceAllTotal = stats.pouchAppearanceAllTotal || 0;
  const pouchAppearanceData = {
    labels: POUCH_TYPES,
    datasets: [
      {
        label: 'Pouch appearances',
        data: stats.pouchAppearance.map(d => d.count),
        backgroundColor: POUCH_TYPES.map(p => POUCH_CONFIG[p].color),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
      },
    ],
  };

  const pouchAppearanceAllData = {
    labels: POUCH_TYPES,
    datasets: [
      {
        label: 'Pouch appearances (all tiles)',
        data: stats.pouchAppearanceAll.map(d => d.count),
        backgroundColor: POUCH_TYPES.map(p => POUCH_CONFIG[p].color),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
      },
    ],
  };

  const siteApByRankData = {
    labels: stats.siteApByRank.map(d => d.rank),
    datasets: [
      {
        label: 'Avg AP per tile',
        data: stats.siteApByRank.map(d => d.avgAp),
        backgroundColor: stats.siteApByRank.map(d => SITE_RANK_CONFIG[d.rank]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

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
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar data={expeditionsByRankData} options={baseOptions} />
              </div>
            </ChartCard>

            {/* tile rarity distribution */}
            <ChartCard title="Tile Rarity Distribution">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Doughnut
                  data={tilesByRarityData}
                  options={{
                    ...baseOptions,
                    scales: undefined,
                    plugins: {
                      ...baseOptions.plugins,
                      legend: {
                        position: 'bottom',
                        labels: { color: '#e5e7eb' },
                      },
                    },
                  }}
                />
              </div>
            </ChartCard>

            {/* tile types distribution */}
            <ChartCard title="Tile Types Distribution">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar data={tilesByTypeData} options={baseOptions} />
              </div>
            </ChartCard>

            {/* avg AP cost by tile rarity */}
            <ChartCard title="Average AP Cost by Tile Rarity">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar
                  data={avgApByRarityData}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </ChartCard>

            {/* avg AP cost by round */}
            <ChartCard title="Average AP Cost by Round">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Line
                  data={avgApByRoundData}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}`,
                        },
                      },
                    },
                  }}
                />
              </div>
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
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar data={rewardsByRankData} options={rewardsByRankOptions} />
              </div>
            </ChartCard>

            {/* pouch appearance rate (selected tiles) */}
            <ChartCard title="Pouch Appearance Rate (Selected Tiles)">
              <div className="w-full" style={{ height: 320, minWidth: 200 }}>
                <Doughnut
                  data={{
                    labels: POUCH_TYPES,
                    datasets: [
                      {
                        label: 'Pouch share',
                        data: pouchAppearanceData.datasets[0].data, // counts; tooltip shows pct
                        backgroundColor: pouchAppearanceData.datasets[0].backgroundColor,
                        borderColor: 'rgba(0,0,0,0.35)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    ...baseOptions,
                    scales: undefined,
                    plugins: {
                      ...baseOptions.plugins,
                      legend: {
                        position: 'bottom',
                        labels: { color: '#e5e7eb' },
                      },
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const label = ctx.label || '';
                            const value = ctx.raw ?? 0; // count
                            const pct = pouchAppearanceTotal > 0 ? ((value / pouchAppearanceTotal) * 100).toFixed(1) : '0.0';
                            return `${label}: ${value} (${pct}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
                <div className="text-[var(--primary-dim)] text-xs">
                  Total pouches selected: {pouchAppearanceTotal}
                </div>
              </div>
            </ChartCard>

            {/* pouch appearance rate (all tiles) */}
            <ChartCard title="Pouch Appearance Rate (All Tiles)">
              <div className="w-full" style={{ height: 320, minWidth: 200 }}>
                <Doughnut
                  data={{
                    labels: POUCH_TYPES,
                    datasets: [
                      {
                        label: 'Pouch share (all tiles)',
                        data: pouchAppearanceAllData.datasets[0].data, // counts; tooltip shows pct
                        backgroundColor: pouchAppearanceAllData.datasets[0].backgroundColor,
                        borderColor: 'rgba(0,0,0,0.35)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    ...baseOptions,
                    scales: undefined,
                    plugins: {
                      ...baseOptions.plugins,
                      legend: {
                        position: 'bottom',
                        labels: { color: '#e5e7eb' },
                      },
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const label = ctx.label || '';
                            const value = ctx.raw ?? 0; // count
                            const pct = pouchAppearanceAllTotal > 0 ? ((value / pouchAppearanceAllTotal) * 100).toFixed(1) : '0.0';
                            return `${label}: ${value} (${pct}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
                <div className="text-[var(--primary-dim)] text-xs">
                  Total pouches observed: {pouchAppearanceAllTotal}
                </div>
              </div>
            </ChartCard>

            {/* average AP per tile by site rank */}
            <ChartCard title="Avg Tile AP by Site Rank">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar data={siteApByRankData} options={baseOptions} />
              </div>
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
    const count = rankRewards.length; // occurrences (not quantity sum)
    const avgPerExpedition = rankExpeditions.length > 0 ? count / rankExpeditions.length : 0;
    return { rank, count, avgPerExpedition };
  });

  // pouches by tile rarity (selected tiles)
  const rewardsByTileRarity = TILE_RARITIES.map(rarity => {
    const count = tiles.filter(t => t.selected && t.tile_rarity === rarity && t.reward_option).length;
    return { rarity, count };
  });

  // pouch appearance counts by pouch type (selected tiles)
  const pouchAppearanceMap = {};
  POUCH_TYPES.forEach(p => { pouchAppearanceMap[p] = 0; });
  tiles.forEach(t => {
    if (t.selected && t.reward_option) {
      const key = POUCH_TYPES.find(p => t.reward_option.toLowerCase().includes(p.toLowerCase()));
      if (key) {
        pouchAppearanceMap[key] = (pouchAppearanceMap[key] || 0) + 1;
      }
    }
  });
  const pouchAppearance = POUCH_TYPES.map(p => ({ pouch: p, count: pouchAppearanceMap[p] || 0 }));
  const pouchAppearanceTotal = pouchAppearance.reduce((sum, p) => sum + p.count, 0);

  // pouch appearance counts by pouch type (all tiles)
  const pouchAppearanceAllMap = {};
  POUCH_TYPES.forEach(p => { pouchAppearanceAllMap[p] = 0; });
  tiles.forEach(t => {
    if (t.reward_option) {
      const key = POUCH_TYPES.find(p => t.reward_option.toLowerCase().includes(p.toLowerCase()));
      if (key) {
        pouchAppearanceAllMap[key] = (pouchAppearanceAllMap[key] || 0) + 1;
      }
    }
  });
  const pouchAppearanceAll = POUCH_TYPES.map(p => ({ pouch: p, count: pouchAppearanceAllMap[p] || 0 }));
  const pouchAppearanceAllTotal = pouchAppearanceAll.reduce((sum, p) => sum + p.count, 0);

  // avg AP by site rank (per tile)
  const siteApByRank = SITE_RANKS.map(rank => {
    const rankExpIds = new Set(expeditions.filter(e => e.site_rank === rank).map(e => e.id));
    const rankTiles = tiles.filter(t => rankExpIds.has(t.expedition_id) && t.ap_cost != null);
    const avgAp = rankTiles.length > 0
      ? rankTiles.reduce((sum, t) => sum + t.ap_cost, 0) / rankTiles.length
      : 0;
    return { rank, avgAp };
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
    pouchAppearance,
    pouchAppearanceTotal,
    pouchAppearanceAll,
    pouchAppearanceAllTotal,
    siteApByRank,
    matchEffects,
    tierUpStats,
  };
}
