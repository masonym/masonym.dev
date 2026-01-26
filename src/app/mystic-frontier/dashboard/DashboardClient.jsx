'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
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
import { ArrowLeft, RefreshCw, Filter, Database, TrendingUp, Layers, Gift, Sparkles, User } from 'lucide-react';
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

const BIG_TICKET_ITEMS = [
  'Black Heart Coupon',
  'Chaos Pitched Accessory Box',
  'Pitched Star Core Coupon',
];

const apErrorBarsPlugin = {
  id: 'apErrorBars',
  afterDatasetsDraw: (chart, _args, pluginOptions) => {
    const datasets = pluginOptions?.datasets;
    if (!Array.isArray(datasets) || datasets.length === 0) return;

    const { ctx } = chart;
    if (!ctx) return;

    datasets.forEach((cfg) => {
      const datasetIndex = cfg?.datasetIndex;
      if (typeof datasetIndex !== 'number') return;

      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta || meta.hidden) return;

      const points = meta.data;
      const minValues = cfg?.min;
      const maxValues = cfg?.max;
      if (!Array.isArray(points) || !Array.isArray(minValues) || !Array.isArray(maxValues)) return;

      const yScale = meta.yScale;
      if (!yScale) return;

      const color = cfg?.color || '#9ca3af';
      const lineWidth = cfg?.lineWidth ?? 2;
      const capWidth = cfg?.capWidth ?? 10;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      points.forEach((pt, i) => {
        const minVal = minValues[i];
        const maxVal = maxValues[i];
        if (minVal == null || maxVal == null) return;

        const x = pt.x;
        const yMin = yScale.getPixelForValue(minVal);
        const yMax = yScale.getPixelForValue(maxVal);

        if (!Number.isFinite(x) || !Number.isFinite(yMin) || !Number.isFinite(yMax)) return;

        ctx.beginPath();
        ctx.moveTo(x, yMax);
        ctx.lineTo(x, yMin);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - capWidth / 2, yMax);
        ctx.lineTo(x + capWidth / 2, yMax);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - capWidth / 2, yMin);
        ctx.lineTo(x + capWidth / 2, yMin);
        ctx.stroke();
      });

      ctx.restore();
    });
  },
};

ChartJS.register(apErrorBarsPlugin);

export default function DashboardClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expeditions, setExpeditions] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [rewards, setRewards] = useState([]);
  
  // filters
  const [filterRank, setFilterRank] = useState('all');
  const [filterElementMatch, setFilterElementMatch] = useState('all');
  const [filterTypeMatch, setFilterTypeMatch] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // all | overlay | mine

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

      const fetchAll = async (table) => {
        const pageSize = 1000;
        let from = 0;
        let all = [];
        while (true) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .range(from, from + pageSize - 1);

          if (error) throw error;
          const page = normalize(data);
          all = all.concat(page);
          if (page.length < pageSize) break;
          from += pageSize;
        }
        return all;
      };

      const [allExpeditions, allTiles, allRewards] = await Promise.all([
        fetchAll('expeditions'),
        fetchAll('tiles'),
        fetchAll('rewards'),
      ]);

      const filteredRewards = allRewards.filter(r => {
        const name = (r.item_name ?? '').trim().toLowerCase();
        if (!name) return true;
        if (name.includes('coupon')) return true;
        return name !== 'frontier coins' && name !== 'frontier coin';
      });

      setExpeditions(allExpeditions);
      setTiles(allTiles);
      setRewards(filteredRewards);
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

  const expeditionById = new Map(expeditions.map(e => [e.id, e]));
  const bigTicketItemNamesLower = new Set(BIG_TICKET_ITEMS.map(n => n.toLowerCase()));
  const bigTicketWinners = rewards
    .filter(r => bigTicketItemNamesLower.has((r.item_name ?? '').trim().toLowerCase()))
    .map(r => {
      const exp = expeditionById.get(r.expedition_id);
      return {
        id: r.id,
        itemName: r.item_name,
        ign: exp?.ign ?? 'Unknown',
        expeditionDate: exp?.created_at ?? null,
      };
    })
    .sort((a, b) => {
      const da = a.expeditionDate ? new Date(a.expeditionDate).getTime() : 0;
      const db = b.expeditionDate ? new Date(b.expeditionDate).getTime() : 0;
      return db - da;
    });

  // compute stats
  const stats = computeStats(filteredExpeditions, filteredTiles, filteredRewards);

  // compute user-specific stats for overlay/mine modes
  const userExpeditions = user ? filteredExpeditions.filter(e => e.user_id === user.id) : [];
  const userExpeditionIds = new Set(userExpeditions.map(e => e.id));
  const userTiles = filteredTiles.filter(t => userExpeditionIds.has(t.expedition_id));
  const userRewards = filteredRewards.filter(r => userExpeditionIds.has(r.expedition_id));
  const userStats = user ? computeStats(userExpeditions, userTiles, userRewards) : null;

  const overlayActive = viewMode === 'overlay' && userStats;
  const displayStats = viewMode === 'mine' && userStats ? userStats : stats;

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
    labels: displayStats.expeditionsByRank.map(d => d.rank),
    datasets: [
      {
        label: viewMode === 'mine' ? 'My Expeditions' : 'All Expeditions',
        data: displayStats.expeditionsByRank.map(d => d.count),
        backgroundColor: displayStats.expeditionsByRank.map(d => SITE_RANK_CONFIG[d.rank]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
      ...(overlayActive ? [{
        label: 'My Expeditions',
        data: userStats.expeditionsByRank.map(d => d.count),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      }] : []),
    ],
  };

  const tilesByRarityData = {
    labels: displayStats.tilesByRarity.map(d => d.rarity),
    datasets: [
      {
        label: 'Tiles',
        data: displayStats.tilesByRarity.map(d => d.count),
        backgroundColor: displayStats.tilesByRarity.map(d => TILE_RARITY_CONFIG[d.rarity]?.color || '#666'),
        borderColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
      },
    ],
  };

  const totalExpeditionsByRank = displayStats.expeditionsByRank.reduce((sum, d) => sum + d.count, 0);
  const totalExpeditionsByRankUser = userStats ? userStats.expeditionsByRank.reduce((sum, d) => sum + d.count, 0) : 0;
  const totalTilesByRarity = displayStats.tilesByRarity.reduce((sum, d) => sum + d.count, 0);
  const totalTilesByType = displayStats.tilesByType.reduce((sum, d) => sum + d.count, 0);
  const totalTilesByTypeUser = userStats ? userStats.tilesByType.reduce((sum, d) => sum + d.count, 0) : 0;
  const totalBothMatchTiles = displayStats.bothMatchStats?.tileCount || 0;
  const totalNoMatchTiles = displayStats.noMatchStats?.tileCount || 0;
  const totalNoMatchPouches = displayStats.noMatchStats?.pouchTotal || 0;

  const tilesByTypeData = {
    labels: displayStats.tilesByType.map(d => d.type),
    datasets: [
      {
        label: viewMode === 'mine' ? 'My Tiles' : 'All Tiles',
        data: displayStats.tilesByType.map(d => d.count),
        backgroundColor: '#60a5fa',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
      ...(overlayActive ? [{
        label: 'My Tiles',
        data: userStats.tilesByType.map(d => d.count),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      }] : []),
    ],
  };

  const avgApByRarityData = {
    labels: displayStats.avgApByRarity.map(d => d.rarity),
    datasets: [
      {
        label: viewMode === 'mine' ? 'My Avg AP' : 'All Avg AP',
        data: displayStats.avgApByRarity.map(d => d.avgAp),
        backgroundColor: displayStats.avgApByRarity.map(d => TILE_RARITY_CONFIG[d.rarity]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
      ...(overlayActive ? [{
        label: 'My Avg AP',
        data: userStats.avgApByRarity.map(d => d.avgAp),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      }] : []),
    ],
  };

  const avgApByRoundData = {
    labels: displayStats.avgApByRound.map(d => d.round),
    datasets: [
      {
        label: viewMode === 'mine' ? 'My Avg AP' : 'All Avg AP',
        data: displayStats.avgApByRound.map(d => d.avgAp),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.15)',
        pointBackgroundColor: '#fbbf24',
        pointBorderColor: '#fbbf24',
        pointRadius: 6,
        tension: 0.3,
        fill: true,
      },
      ...(overlayActive ? [{
        label: 'My Avg AP',
        data: userStats.avgApByRound.map(d => d.avgAp),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointRadius: 6,
        tension: 0.3,
        fill: true,
      }] : []),
    ],
  };

  const avgApByRoundErrorBars = {
    datasets: [
      {
        datasetIndex: 0,
        min: displayStats.avgApByRound.map(d => d.minAp),
        max: displayStats.avgApByRound.map(d => d.maxAp),
        color: '#fbbf24',
      },
      ...(overlayActive ? [{
        datasetIndex: 1,
        min: userStats.avgApByRound.map(d => d.minAp),
        max: userStats.avgApByRound.map(d => d.maxAp),
        color: '#10b981',
      }] : []),
    ],
  };

  const rewardsByRankData = {
    labels: displayStats.rewardsByRank.map(d => d.rank),
    datasets: [
      {
        label: 'Reward occurrences',
        data: displayStats.rewardsByRank.map(d => d.count),
        backgroundColor: displayStats.rewardsByRank.map(d => SITE_RANK_CONFIG[d.rank]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Avg per Expedition',
        data: displayStats.rewardsByRank.map(d => d.avgPerExpedition),
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

  const pouchAppearanceTotal = displayStats.pouchAppearanceTotal || 0;
  const pouchAppearanceAllTotal = displayStats.pouchAppearanceAllTotal || 0;
  const pouchAppearanceData = {
    labels: POUCH_TYPES,
    datasets: [
      {
        label: 'Pouch appearances',
        data: displayStats.pouchAppearance.map(d => d.count),
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
        data: displayStats.pouchAppearanceAll.map(d => d.count),
        backgroundColor: POUCH_TYPES.map(p => POUCH_CONFIG[p].color),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
      },
    ],
  };

  const rewardDistributionCategories = displayStats.rewardDistributionByTileRarity?.map(r => r.category) || [];
  const rewardDistributionTotalsByRarity = displayStats.rewardDistributionTotalsByTileRarity || TILE_RARITIES.map(() => 0);
  const rewardDistributionByTileRarityData = {
    labels: TILE_RARITIES,
    datasets: rewardDistributionCategories.map((category, categoryIndex) => {
      const isPouch = POUCH_TYPES.includes(category);
      const color = isPouch
        ? (POUCH_CONFIG[category]?.color || '#6b7280')
        : ['#fbbf24', '#a78bfa', '#60a5fa'][categoryIndex % 3];

      const row = displayStats.rewardDistributionByTileRarity?.find(r => r.category === category);
      const counts = row?.counts || TILE_RARITIES.map(() => 0);

      return {
        label: isPouch ? category : category,
        data: counts,
        backgroundColor: color,
        borderColor: 'rgba(0,0,0,0.35)',
        borderWidth: 1,
        borderRadius: 6,
        stack: 'rewardDist',
      };
    }),
  };

  const rewardDistributionByTileRarityOptions = {
    ...baseOptions,
    scales: {
      x: {
        ...baseOptions.scales.x,
        stacked: true,
      },
      y: {
        ...baseOptions.scales.y,
        stacked: true,
      },
    },
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || '';
            const value = Number(ctx.raw ?? 0);
            const denom = rewardDistributionTotalsByRarity?.[ctx.dataIndex] || 0;
            const pct = denom > 0 ? ((value / denom) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${pct}%)`;
          },
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
        },
      },
    },
  };

  const tileRarityByRankRows = displayStats.tileRarityByRank || [];
  const tileRarityByRankTotals = displayStats.tileRarityByRankTotals || SITE_RANKS.map(() => 0);
  const tileRarityByRankChartData = {
    labels: SITE_RANKS,
    datasets: TILE_RARITIES.map((rarity) => {
      const color = TILE_RARITY_CONFIG[rarity]?.color || '#6b7280';
      const data = SITE_RANKS.map((rank) => {
        const row = tileRarityByRankRows.find(r => r.rank === rank);
        const idx = TILE_RARITIES.indexOf(rarity);
        return row?.counts?.[idx] || 0;
      });

      return {
        label: rarity,
        data,
        backgroundColor: color,
        borderColor: 'rgba(0,0,0,0.35)',
        borderWidth: 1,
        borderRadius: 6,
        stack: 'tileRarityRank',
      };
    }),
  };

  const tileRarityByRankChartOptions = {
    ...baseOptions,
    scales: {
      x: {
        ...baseOptions.scales.x,
        stacked: true,
      },
      y: {
        ...baseOptions.scales.y,
        stacked: true,
      },
    },
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || '';
            const value = Number(ctx.raw ?? 0);
            const denom = tileRarityByRankTotals?.[ctx.dataIndex] || 0;
            const pct = denom > 0 ? ((value / denom) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${pct}%)`;
          },
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
        },
      },
    },
  };

  const siteApByRankData = {
    labels: displayStats.siteApByRank.map(d => d.rank),
    datasets: [
      {
        label: viewMode === 'mine' ? 'My Avg AP' : 'All Avg AP',
        data: displayStats.siteApByRank.map(d => d.avgAp),
        backgroundColor: displayStats.siteApByRank.map(d => SITE_RANK_CONFIG[d.rank]?.color || '#666'),
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 6,
      },
      ...(overlayActive ? [{
        label: 'My Avg AP',
        data: userStats.siteApByRank.map(d => d.avgAp),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      }] : []),
    ],
  };

  // both-match chart data
  const bothMatchTileRarityData = {
    labels: stats.bothMatchStats.tilesByRarity.map(d => d.rarity),
    datasets: [
      {
        label: 'Tiles',
        data: stats.bothMatchStats.tilesByRarity.map(d => d.count),
        backgroundColor: stats.bothMatchStats.tilesByRarity.map(d => TILE_RARITY_CONFIG[d.rarity]?.color || '#666'),
        borderColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
      },
    ],
  };

  const bothMatchPouchData = {
    labels: POUCH_TYPES,
    datasets: [
      {
        label: 'Pouches',
        data: stats.bothMatchStats.pouchDistribution.map(d => d.count),
        backgroundColor: POUCH_TYPES.map(p => POUCH_CONFIG[p].color),
        borderColor: 'rgba(0,0,0,0.35)',
        borderWidth: 1,
      },
    ],
  };

  const noMatchTileRarityData = {
    labels: stats.noMatchStats.tilesByRarity.map(d => d.rarity),
    datasets: [
      {
        label: 'Tiles',
        data: stats.noMatchStats.tilesByRarity.map(d => d.count),
        backgroundColor: stats.noMatchStats.tilesByRarity.map(d => TILE_RARITY_CONFIG[d.rarity]?.color || '#666'),
        borderColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
      },
    ],
  };

  const noMatchPouchData = {
    labels: POUCH_TYPES,
    datasets: [
      {
        label: 'Pouches',
        data: stats.noMatchStats.pouchDistribution.map(d => d.count),
        backgroundColor: POUCH_TYPES.map(p => POUCH_CONFIG[p].color),
        borderColor: 'rgba(0,0,0,0.35)',
        borderWidth: 1,
      },
    ],
  };

  const tierUpComparisonData = {
    labels: ['Both Match', 'No/Half Match'],
    datasets: [
      {
        label: 'Tier-Up Rate (%)',
        data: [stats.bothMatchStats.tierUpRate, stats.noMatchStats.tierUpRate],
        backgroundColor: ['#fbbf24', '#6b7280'],
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
          <StatCard icon={Layers} label="Tiles Recorded" value={stats.tileCount} />
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
          {user && (
            <div className="mt-4 pt-4 border-t border-[var(--primary-dim)] space-y-3">
              <div className="text-xs text-[var(--primary-dim)]">My Stats View</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex items-center gap-2 px-3 py-2 rounded border ${
                    viewMode === 'all'
                      ? 'border-[var(--secondary)] bg-[var(--background)] text-[var(--primary)]'
                      : 'border-[var(--primary-dim)] text-[var(--primary-dim)]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  All Data
                </button>
                <button
                  onClick={() => setViewMode('overlay')}
                  disabled={!userStats}
                  className={`flex items-center gap-2 px-3 py-2 rounded border ${
                    viewMode === 'overlay'
                      ? 'border-[var(--secondary)] bg-[var(--background)] text-[var(--primary)]'
                      : 'border-[var(--primary-dim)] text-[var(--primary-dim)]'
                  } ${!userStats ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={!userStats ? 'No personal data yet' : ''}
                >
                  <User className="w-4 h-4" />
                  Overlay Mine
                </button>
                <button
                  onClick={() => setViewMode('mine')}
                  disabled={!userStats}
                  className={`flex items-center gap-2 px-3 py-2 rounded border ${
                    viewMode === 'mine'
                      ? 'border-[var(--secondary)] bg-[var(--background)] text-[var(--primary)]'
                      : 'border-[var(--primary-dim)] text-[var(--primary-dim)]'
                  } ${!userStats ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={!userStats ? 'No personal data yet' : ''}
                >
                  <User className="w-4 h-4" />
                  Only Mine
                </button>
              </div>
              {userStats && (
                <div className="text-xs text-[var(--primary-dim)]">
                  My expeditions in current filters: {userExpeditions.length}
                </div>
              )}
            </div>
          )}
        </div>

        {filteredExpeditions.length === 0 ? (
          <div className="bg-[var(--background-bright)] rounded-lg p-8 border border-[var(--primary-dim)] text-center">
            <Database className="w-12 h-12 text-[var(--primary-dim)] mx-auto mb-4" />
            <div className="text-[var(--primary-dim)]">No expedition data yet. Start submitting expeditions!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* for fun */}
            <ChartCard title="For Fun" className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Sparkles} label="Advanced Lucky Tiles" value={displayStats.funStats.advancedLuckyTiles} />
                <StatCard icon={Layers} label="Round 5: All Lucky Tiles" value={displayStats.funStats.round5AllLucky} />
                <StatCard icon={Gift} label="Green Pouch Missed" value={displayStats.funStats.missedGreenPouchNoSelectRound} />
                <StatCard icon={Gift} label="Orange Pouch Missed" value={displayStats.funStats.missedOrangePouchNoSelectRound} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <StatCard icon={Gift} label="Black Heart Coupon Missed" value={displayStats.funStats.missedBlackHeartCouponNoSelectRound} />
                <StatCard icon={Gift} label="Chaos Pitched Box Missed" value={displayStats.funStats.missedChaosPitchedBoxNoSelectRound} />
                <StatCard icon={Gift} label="Pitched Star Core Coupon Missed" value={displayStats.funStats.missedPitchedStarCoreCouponNoSelectRound} />
              </div>
              <div className="text-[var(--primary-dim)] text-xs mt-3">
                Miss counts are computed assuming a reward is only marked selected when the dice roll succeeded.<br/>
                If a round has no selected reward and one of these rewards appeared in that round's options, it's counted as a miss.
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--primary-dim)]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--secondary)]" />
                    <h2 className="text-lg text-[var(--primary-bright)]">Big Ticket Winners</h2>
                  </div>
                  <div className="text-xs text-[var(--primary-dim)]">
                    {bigTicketWinners.length} total
                  </div>
                </div>

                <div className="text-xs text-[var(--primary-dim)] mb-3">
                  Tracking: {BIG_TICKET_ITEMS.join(', ')}
                </div>

                {bigTicketWinners.length === 0 ? (
                  <div className="text-[var(--primary-dim)] text-sm">No big ticket rewards logged yet.</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto rounded border border-[var(--primary-dim)] bg-[var(--background)]">
                    {bigTicketWinners.map(w => (
                      <div key={w.id} className="px-3 py-2 border-b border-[var(--primary-dim)] last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[var(--primary)] font-bold truncate">{w.itemName}</div>
                            <div className="text-xs text-[var(--primary-dim)] truncate">{w.ign}</div>
                          </div>
                          <div className="text-xs text-[var(--primary-dim)] whitespace-nowrap">
                            {w.expeditionDate ? new Date(w.expeditionDate).toLocaleString() : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ChartCard>

            {/* expeditions by rank */}
            <ChartCard title="Expeditions by Site Rank">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar
                  data={expeditionsByRankData}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const value = ctx.raw ?? 0;
                            const isUser = ctx.dataset.label === 'My Expeditions';
                            const denom = isUser ? totalExpeditionsByRankUser : totalExpeditionsByRank;
                            const pct = denom > 0 ? ((value / denom) * 100).toFixed(1) : '0.0';
                            return `${ctx.dataset.label || 'Count'}: ${value} (${pct}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
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
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const label = ctx.label || '';
                            const value = ctx.raw ?? 0;
                            const pct = totalTilesByRarity > 0 ? ((value / totalTilesByRarity) * 100).toFixed(1) : '0.0';
                            return `${label}: ${value} (${pct}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </ChartCard>

            {/* tile types distribution */}
            <ChartCard title="Tile Types Distribution">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar
                  data={tilesByTypeData}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const value = ctx.raw ?? 0;
                            const isUser = ctx.dataset.label === 'My Tiles';
                            const denom = isUser ? totalTilesByTypeUser : totalTilesByType;
                            const pct = denom > 0 ? ((value / denom) * 100).toFixed(1) : '0.0';
                            return `${ctx.dataset.label || 'Count'}: ${value} (${pct}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
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
                      apErrorBars: avgApByRoundErrorBars,
                      tooltip: {
                        ...baseOptions.plugins.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const isUserOverlay = overlayActive && ctx.dataset.label === 'My Avg AP' && viewMode !== 'mine';
                            const series = isUserOverlay ? userStats.avgApByRound : displayStats.avgApByRound;
                            const row = series?.[ctx.dataIndex];
                            const avg = Number(ctx.parsed.y);
                            const min = row?.minAp;
                            const max = row?.maxAp;
                            const n = row?.count ?? 0;
                            const parts = [`${ctx.dataset.label}: ${Number.isFinite(avg) ? avg.toFixed(1) : '0.0'}`];
                            if (min != null && max != null && n > 0) {
                              parts.push(`min ${Number(min).toFixed(1)}`);
                              parts.push(`max ${Number(max).toFixed(1)}`);
                              parts.push(`n=${n}`);
                            }
                            return parts.join(' | ');
                          },
                        },
                      },
                    },
                  }}
                />
              </div>

              <div className="mt-3 text-xs text-[var(--primary-dim)]">
                {!overlayActive ? (
                  <div>
                    Worst-case AP (Rounds 1-4 combined):{' '}
                    <span className="text-[var(--secondary)] font-bold">
                      {displayStats.worstCaseApRounds1to4 != null ? Number(displayStats.worstCaseApRounds1to4).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div>
                      Worst-case AP (Rounds 1-4 combined) - All:{' '}
                      <span className="text-[var(--secondary)] font-bold">
                        {stats.worstCaseApRounds1to4 != null ? Number(stats.worstCaseApRounds1to4).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      Worst-case AP (Rounds 1-4 combined) - Mine:{' '}
                      <span className="text-[var(--secondary)] font-bold">
                        {userStats?.worstCaseApRounds1to4 != null ? Number(userStats.worstCaseApRounds1to4).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
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
            {/* <ChartCard title="Rewards by Site Rank">
              <div className="w-full" style={{ height: 300, minWidth: 200 }}>
                <Bar
                  data={rewardsByRankData}
                  options={{
                    ...rewardsByRankOptions,
                    plugins: {
                      ...rewardsByRankOptions.plugins,
                      tooltip: {
                        ...rewardsByRankOptions.plugins?.tooltip,
                        callbacks: {
                          label: (ctx) => {
                            const label = ctx.dataset.label || '';
                            const value = ctx.raw ?? 0;
                            if (ctx.datasetIndex === 0) {
                              const total = stats.rewardsByRank.reduce((sum, d) => sum + d.count, 0);
                              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                              return `${label}: ${value} (${pct}%)`;
                            }
                            return `${label}: ${Number(value).toFixed(2)}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </ChartCard> */}

            <ChartCard title="Tile Rarity by Expedition Rank">
              <div className="w-full" style={{ height: 360, minWidth: 200 }}>
                <Bar
                  data={tileRarityByRankChartData}
                  options={tileRarityByRankChartOptions}
                />
              </div>

              <div className="mt-4 overflow-x-auto rounded border border-[var(--primary-dim)]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--background)]">
                    <tr>
                      <th className="text-left p-2 text-[var(--primary-dim)]">Rank</th>
                      {TILE_RARITIES.map(r => (
                        <th key={r} className="text-right p-2 text-[var(--primary-dim)]">{r}</th>
                      ))}
                      <th className="text-right p-2 text-[var(--primary-dim)]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SITE_RANKS.map(rank => {
                      const row = tileRarityByRankRows.find(r => r.rank === rank);
                      const counts = row?.counts || TILE_RARITIES.map(() => 0);
                      const total = counts.reduce((sum, v) => sum + v, 0);
                      return (
                        <tr key={rank} className="border-t border-[var(--primary-dim)]">
                          <td className="p-2 text-[var(--primary)] whitespace-nowrap">{rank}</td>
                          {counts.map((c, idx) => (
                            <td key={idx} className="p-2 text-right text-[var(--secondary)]">{c}</td>
                          ))}
                          <td className="p-2 text-right text-[var(--secondary)]">{total}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-[var(--primary-dim)] bg-[var(--background)]">
                      <td className="p-2 text-[var(--primary-dim)]">Total</td>
                      {TILE_RARITIES.map((_, idx) => (
                        <td key={idx} className="p-2 text-right text-[var(--primary-dim)]">
                          {SITE_RANKS.reduce((sum, rank) => {
                            const row = tileRarityByRankRows.find(r => r.rank === rank);
                            return sum + (row?.counts?.[idx] || 0);
                          }, 0)}
                        </td>
                      ))}
                      <td className="p-2 text-right text-[var(--primary-dim)]">
                        {tileRarityByRankTotals.reduce((sum, v) => sum + v, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ChartCard>

            <ChartCard title="Rewards by Tile Rarity (Selected Tiles)">
              <div className="w-full" style={{ height: 360, minWidth: 200 }}>
                <Bar
                  data={rewardDistributionByTileRarityData}
                  options={rewardDistributionByTileRarityOptions}
                />
              </div>

              <div className="mt-4 overflow-x-auto rounded border border-[var(--primary-dim)]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--background)]">
                    <tr>
                      <th className="text-left p-2 text-[var(--primary-dim)]">Reward</th>
                      {TILE_RARITIES.map(r => (
                        <th key={r} className="text-right p-2 text-[var(--primary-dim)]">{r}</th>
                      ))}
                      <th className="text-right p-2 text-[var(--primary-dim)]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(displayStats.rewardDistributionByTileRarity || []).map(row => {
                      const isPouch = POUCH_TYPES.includes(row.category);
                      const label = isPouch ? row.category : row.category;
                      return (
                        <tr key={row.category} className="border-t border-[var(--primary-dim)]">
                          <td className="p-2 text-[var(--primary)] whitespace-nowrap">{label}</td>
                          {row.counts.map((c, idx) => (
                            <td key={idx} className="p-2 text-right text-[var(--secondary)]">{c}</td>
                          ))}
                          <td className="p-2 text-right text-[var(--secondary)]">{row.total}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-[var(--primary-dim)] bg-[var(--background)]">
                      <td className="p-2 text-[var(--primary-dim)]">Total</td>
                      {rewardDistributionTotalsByRarity.map((t, idx) => (
                        <td key={idx} className="p-2 text-right text-[var(--primary-dim)]">{t}</td>
                      ))}
                      <td className="p-2 text-right text-[var(--primary-dim)]">
                        {rewardDistributionTotalsByRarity.reduce((sum, v) => sum + v, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                  <h4 className="text-[var(--primary-dim)] text-sm mb-2">Tiered Up From</h4>
                  <div className="flex gap-1">
                    {CHEST_TIERS.map(tier => {
                      const count = stats.tierUpStats.startingTierDistribution[tier] || 0;
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

            {/* both element+type match deep dive */}
            {(stats.bothMatchStats.expeditionCount > 0 || stats.noMatchStats.expeditionCount > 0) && (
              <>
                <ChartCard title="Match Summary (Both vs No/Half Match)" className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[var(--background)] rounded p-4 border border-[var(--primary-dim)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[var(--primary-dim)] text-sm">Both Match</span>
                        <span className="text-xs text-[var(--primary-dim)]">Expeditions: {stats.bothMatchStats.expeditionCount}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-xl font-bold text-[#fbbf24]">{stats.bothMatchStats.tileCount}</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Tiles</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#fbbf24]">{stats.bothMatchStats.rewardCount}</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Rewards</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#fbbf24]">{stats.bothMatchStats.avgAp.toFixed(1)}</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Avg AP/Tile</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#fbbf24]">{stats.bothMatchStats.tierUpRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Tier-Up Rate</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-[var(--primary-dim)] text-xs mb-1">Top Rewards</h4>
                        <div className="space-y-1">
                          {stats.bothMatchStats.topRewards.map((r, i) => (
                            <div key={r.name} className="flex justify-between p-2 bg-[var(--background)] rounded text-xs">
                              <span className="text-[var(--primary)]">#{i + 1} {r.name}</span>
                              <span className="text-[var(--secondary)]">{r.occurrences}</span>
                            </div>
                          ))}
                          {stats.bothMatchStats.topRewards.length === 0 && (
                            <div className="text-[var(--primary-dim)] text-center py-2 text-xs">No rewards yet</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--background)] rounded p-4 border border-[var(--primary-dim)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[var(--primary-dim)] text-sm">No/Half Match</span>
                        <span className="text-xs text-[var(--primary-dim)]">Expeditions: {stats.noMatchStats.expeditionCount}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-xl font-bold text-[#9ca3af]">{stats.noMatchStats.tileCount}</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Tiles</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#9ca3af]">{stats.noMatchStats.rewardCount}</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Rewards</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#9ca3af]">{stats.noMatchStats.avgAp.toFixed(1)}</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Avg AP/Tile</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#9ca3af]">{stats.noMatchStats.tierUpRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-[var(--primary-dim)]">Tier-Up Rate</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-[var(--primary-dim)] text-xs mb-1">Top Rewards</h4>
                        <div className="space-y-1">
                          {stats.noMatchStats.topRewards.map((r, i) => (
                            <div key={r.name} className="flex justify-between p-2 bg-[var(--background)] rounded text-xs">
                              <span className="text-[var(--primary)]">#{i + 1} {r.name}</span>
                              <span className="text-[var(--secondary)]">{r.occurrences}</span>
                            </div>
                          ))}
                          {stats.noMatchStats.topRewards.length === 0 && (
                            <div className="text-[var(--primary-dim)] text-center py-2 text-xs">No rewards yet</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[var(--primary-dim)] text-sm mb-2">Tier-Up Comparison</h4>
                      <div className="h-[180px]">
                        <Bar data={tierUpComparisonData} options={{
                          ...baseOptions,
                          indexAxis: 'y',
                          plugins: {
                            ...baseOptions.plugins,
                            tooltip: {
                              ...baseOptions.plugins.tooltip,
                              callbacks: {
                                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`,
                              },
                            },
                          },
                        }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[var(--background)] rounded p-3 text-center border border-[var(--primary-dim)]">
                        <div className="text-sm text-[var(--primary-dim)]">Avg Tiles / Exp</div>
                        <div className="text-2xl font-bold text-[#fbbf24]">{(stats.bothMatchStats.expeditionCount > 0 ? (stats.bothMatchStats.tileCount / stats.bothMatchStats.expeditionCount) : 0).toFixed(2)}</div>
                        <div className="text-xs text-[var(--primary-dim)]">Both Match</div>
                      </div>
                      <div className="bg-[var(--background)] rounded p-3 text-center border border-[var(--primary-dim)]">
                        <div className="text-sm text-[var(--primary-dim)]">Avg Tiles / Exp</div>
                        <div className="text-2xl font-bold text-[#9ca3af]">{(stats.noMatchStats.expeditionCount > 0 ? (stats.noMatchStats.tileCount / stats.noMatchStats.expeditionCount) : 0).toFixed(2)}</div>
                        <div className="text-xs text-[var(--primary-dim)]">No/Half Match</div>
                      </div>
                    </div>
                  </div>
                </ChartCard>

                <ChartCard title="Tile Rarity (Both vs No/Half Match)">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full" style={{ height: 280, minWidth: 200 }}>
                      <Doughnut
                        data={bothMatchTileRarityData}
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
                                  const value = ctx.raw ?? 0;
                                  const pct = totalBothMatchTiles > 0 ? ((value / totalBothMatchTiles) * 100).toFixed(1) : '0.0';
                                  return `${label}: ${value} (${pct}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="w-full" style={{ height: 280, minWidth: 200 }}>
                      <Doughnut
                        data={noMatchTileRarityData}
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
                                  const value = ctx.raw ?? 0;
                                  const pct = totalNoMatchTiles > 0 ? ((value / totalNoMatchTiles) * 100).toFixed(1) : '0.0';
                                  return `${label}: ${value} (${pct}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </ChartCard>

                <ChartCard title="Pouch Distribution (Both vs No/Half Match)">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full" style={{ height: 280, minWidth: 200 }}>
                      <Doughnut
                        data={bothMatchPouchData}
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
                                  const value = ctx.raw ?? 0;
                                  const pct = stats.bothMatchStats.pouchTotal > 0 ? ((value / stats.bothMatchStats.pouchTotal) * 100).toFixed(1) : '0.0';
                                  return `${label}: ${value} (${pct}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                      <div className="text-[var(--primary-dim)] text-xs text-center">
                        Total: {stats.bothMatchStats.pouchTotal}
                      </div>
                    </div>
                    <div className="w-full" style={{ height: 280, minWidth: 200 }}>
                      <Doughnut
                        data={noMatchPouchData}
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
                                  const value = ctx.raw ?? 0;
                                  const pct = totalNoMatchPouches > 0 ? ((value / totalNoMatchPouches) * 100).toFixed(1) : '0.0';
                                  return `${label}: ${value} (${pct}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                      <div className="text-[var(--primary-dim)] text-xs text-center">
                        Total: {stats.noMatchStats.pouchTotal}
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </>
            )}
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
  const tilesByKey = new Map();
  const selectedTileRecordByKey = new Map();
  const optionRecordsByTileKey = new Map();

  const tilesWithIndex = tiles.filter(t => t.tile_index != null);
  tilesWithIndex.forEach(t => {
    const key = `${t.expedition_id}:${t.round_number}:${t.tile_index}`;
    if (!tilesByKey.has(key)) {
      tilesByKey.set(key, { ...t, _tileKey: key });
    }
    if (!optionRecordsByTileKey.has(key)) optionRecordsByTileKey.set(key, []);
    optionRecordsByTileKey.get(key).push(t);
    if (t.selected) {
      selectedTileRecordByKey.set(key, t);
    }
  });

  // legacy fallback: some older rows may not have tile_index. try to pair option rows by
  // (expedition_id, round_number) ordering to avoid collapsing multiple tiles into one.
  const tilesWithoutIndex = tiles.filter(t => t.tile_index == null);
  const legacyGroups = new Map();
  tilesWithoutIndex.forEach(t => {
    const key = `${t.expedition_id}:${t.round_number}`;
    if (!legacyGroups.has(key)) legacyGroups.set(key, []);
    legacyGroups.get(key).push(t);
  });

  legacyGroups.forEach((groupTiles, groupKey) => {
    const sorted = [...groupTiles].sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (da !== db) return da - db;
      return String(a.id).localeCompare(String(b.id));
    });

    let seq = 0;
    let openKey = null;
    let openMeta = null;

    const startNew = (t) => {
      seq += 1;
      openKey = `${groupKey}:legacy:${seq}`;
      openMeta = { tile_type: t.tile_type, tile_rarity: t.tile_rarity };

      if (!tilesByKey.has(openKey)) {
        tilesByKey.set(openKey, { ...t, _tileKey: openKey });
      }
      if (!optionRecordsByTileKey.has(openKey)) optionRecordsByTileKey.set(openKey, []);
      optionRecordsByTileKey.get(openKey).push(t);
      if (t.selected) {
        selectedTileRecordByKey.set(openKey, t);
      }
    };

    sorted.forEach(t => {
      const isLucky = t.tile_type === 'Lucky';
      if (isLucky || t.option_number == null) {
        const key = `${groupKey}:legacy:single:${t.id}`;
        if (!tilesByKey.has(key)) {
          tilesByKey.set(key, { ...t, _tileKey: key });
        }
        if (!optionRecordsByTileKey.has(key)) optionRecordsByTileKey.set(key, []);
        optionRecordsByTileKey.get(key).push(t);
        if (t.selected) {
          selectedTileRecordByKey.set(key, t);
        }
        return;
      }

      if (t.option_number === 1) {
        startNew(t);
        return;
      }

      if (
        t.option_number === 2 &&
        openKey &&
        openMeta &&
        openMeta.tile_type === t.tile_type &&
        openMeta.tile_rarity === t.tile_rarity
      ) {
        if (!optionRecordsByTileKey.has(openKey)) optionRecordsByTileKey.set(openKey, []);
        optionRecordsByTileKey.get(openKey).push(t);
        if (t.selected) {
          selectedTileRecordByKey.set(openKey, t);
        }
        return;
      }

      startNew(t);
    });
  });

  const uniqueTiles = Array.from(tilesByKey.values());
  const selectedTileRecords = uniqueTiles
    .map(t => selectedTileRecordByKey.get(t._tileKey) ?? t)
    .filter(t => t.selected);

  const bigTicketItemNamesLower = new Set(BIG_TICKET_ITEMS.map(n => n.toLowerCase()));
  const isBigTicket = (rewardOption) => {
    const name = (rewardOption ?? '').trim().toLowerCase();
    if (!name) return false;
    return bigTicketItemNamesLower.has(name);
  };

  const isBigTicketName = (rewardOption, targetName) => {
    const name = (rewardOption ?? '').trim().toLowerCase();
    if (!name) return false;
    return name === targetName.toLowerCase();
  };

  const isPouchColor = (rewardOption, color) => {
    const s = (rewardOption ?? '').toLowerCase();
    if (!s) return false;
    return s.includes('pouch') && s.includes(color.toLowerCase());
  };

  const advancedLuckyTiles = uniqueTiles.filter(t => t.tile_type === 'Lucky' && t.tile_rarity === 'Advanced').length;

  // round 5 where all recorded tile options are Lucky (i.e., all tiles shown that round were Lucky)
  const expIds = new Set(expeditions.map(e => e.id));
  let round5AllLucky = 0;
  expIds.forEach(expId => {
    const round5Tiles = uniqueTiles.filter(t => t.expedition_id === expId && t.round_number === 5);
    if (round5Tiles.length === 0) return;
    if (round5Tiles.every(t => t.tile_type === 'Lucky')) {
      round5AllLucky += 1;
    }
  });

  const roundKey = (t) => `${t.expedition_id}:${t.round_number}`;
  const roundTilesMap = new Map();
  tiles.forEach(t => {
    const key = roundKey(t);
    if (!roundTilesMap.has(key)) roundTilesMap.set(key, []);
    roundTilesMap.get(key).push(t);
  });

  let missedGreenPouchNoSelectRound = 0;
  let missedOrangePouchNoSelectRound = 0;
  let missedBlackHeartCouponNoSelectRound = 0;
  let missedChaosPitchedBoxNoSelectRound = 0;
  let missedPitchedStarCoreCouponNoSelectRound = 0;

  roundTilesMap.forEach((roundRows) => {
    const anySelected = roundRows.some(r => r.selected);
    if (anySelected) return;

    const hasGreen = roundRows.some(r => isPouchColor(r.reward_option, 'green'));
    const hasOrange = roundRows.some(r => isPouchColor(r.reward_option, 'orange'));
    const hasBlackHeart = roundRows.some(r => isBigTicketName(r.reward_option, 'Black Heart Coupon'));
    const hasChaosPitched = roundRows.some(r => isBigTicketName(r.reward_option, 'Chaos Pitched Accessory Box'));
    const hasPitchedStar = roundRows.some(r => isBigTicketName(r.reward_option, 'Pitched Star Core Coupon'));

    if (hasGreen) missedGreenPouchNoSelectRound += 1;
    if (hasOrange) missedOrangePouchNoSelectRound += 1;
    if (hasBlackHeart) missedBlackHeartCouponNoSelectRound += 1;
    if (hasChaosPitched) missedChaosPitchedBoxNoSelectRound += 1;
    if (hasPitchedStar) missedPitchedStarCoreCouponNoSelectRound += 1;
  });

  const funStats = {
    advancedLuckyTiles,
    round5AllLucky,
    missedGreenPouchNoSelectRound,
    missedOrangePouchNoSelectRound,
    missedBlackHeartCouponNoSelectRound,
    missedChaosPitchedBoxNoSelectRound,
    missedPitchedStarCoreCouponNoSelectRound,
  };

  // expeditions by rank
  const expeditionsByRank = SITE_RANKS.map(rank => ({
    rank,
    count: expeditions.filter(e => e.site_rank === rank).length
  }));

  // tiles by rarity
  const tilesByRarity = TILE_RARITIES.map(rarity => ({
    rarity,
    count: uniqueTiles.filter(t => t.tile_rarity === rarity).length
  }));

  // tiles by type
  const tilesByType = TILE_TYPES.map(type => ({
    type,
    count: uniqueTiles.filter(t => t.tile_type === type).length
  }));

  // avg AP by rarity
  const avgApByRarity = TILE_RARITIES.map(rarity => {
    const rarityTiles = selectedTileRecords.filter(t => t.tile_rarity === rarity && t.ap_cost != null);
    const avgAp = rarityTiles.length > 0 
      ? rarityTiles.reduce((sum, t) => sum + t.ap_cost, 0) / rarityTiles.length 
      : 0;
    return { rarity, avgAp };
  });

  // avg AP by round
  const avgApByRound = [1, 2, 3, 4, 5].map(round => {
    const roundTiles = selectedTileRecords.filter(t => t.round_number === round && t.ap_cost != null);
    const apValues = roundTiles.map(t => t.ap_cost);
    const count = apValues.length;
    const avgAp = count > 0
      ? apValues.reduce((sum, v) => sum + v, 0) / count
      : 0;
    const minAp = count > 0 ? Math.min(...apValues) : null;
    const maxAp = count > 0 ? Math.max(...apValues) : null;
    return { round: `Round ${round}`, avgAp, minAp, maxAp, count };
  });

  const worstCaseRounds = avgApByRound.filter(r => ['Round 1', 'Round 2', 'Round 3', 'Round 4'].includes(r.round));
  const worstCaseApRounds1to4 = worstCaseRounds.every(r => r.maxAp != null)
    ? worstCaseRounds.reduce((sum, r) => sum + r.maxAp, 0)
    : null;

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
    const count = selectedTileRecords.filter(t => t.tile_rarity === rarity && t.reward_option).length;
    return { rarity, count };
  });

  // pouch appearance counts by pouch type (selected tiles)
  const pouchAppearanceMap = {};
  POUCH_TYPES.forEach(p => { pouchAppearanceMap[p] = 0; });
  selectedTileRecords.forEach(t => {
    if (t.reward_option) {
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
  uniqueTiles.forEach(t => {
    if (t.reward_option) {
      const key = POUCH_TYPES.find(p => t.reward_option.toLowerCase().includes(p.toLowerCase()));
      if (key) {
        pouchAppearanceAllMap[key] = (pouchAppearanceAllMap[key] || 0) + 1;
      }
    }
  });
  const pouchAppearanceAll = POUCH_TYPES.map(p => ({ pouch: p, count: pouchAppearanceAllMap[p] || 0 }));
  const pouchAppearanceAllTotal = pouchAppearanceAll.reduce((sum, p) => sum + p.count, 0);

  const rewardDistributionCategories = [...POUCH_TYPES, ...BIG_TICKET_ITEMS];
  const rewardDistributionMap = new Map();
  rewardDistributionCategories.forEach(category => {
    rewardDistributionMap.set(category, TILE_RARITIES.map(() => 0));
  });

  const tileRarityIndex = new Map(TILE_RARITIES.map((r, i) => [r, i]));
  const normalizeName = (s) => (s ?? '').trim().toLowerCase();
  const rewardCategoryForOption = (rewardOption) => {
    const raw = normalizeName(rewardOption);
    if (!raw) return null;

    const pouchKey = POUCH_TYPES.find(p => raw.includes('pouch') && raw.includes(p.toLowerCase()));
    if (pouchKey) return pouchKey;

    const bigTicketKey = BIG_TICKET_ITEMS.find(n => raw === n.toLowerCase());
    if (bigTicketKey) return bigTicketKey;

    return null;
  };

  selectedTileRecords.forEach(t => {
    const rarity = t.tile_rarity;
    const rarityIdx = tileRarityIndex.get(rarity);
    if (rarityIdx == null) return;

    const category = rewardCategoryForOption(t.reward_option);
    if (!category) return;

    const arr = rewardDistributionMap.get(category);
    if (!arr) return;
    arr[rarityIdx] += 1;
  });

  const rewardDistributionByTileRarity = rewardDistributionCategories
    .map(category => {
      const counts = rewardDistributionMap.get(category) || TILE_RARITIES.map(() => 0);
      const total = counts.reduce((sum, v) => sum + v, 0);
      return { category, counts, total };
    })
    .filter(r => r.total > 0);

  const rewardDistributionTotalsByTileRarity = TILE_RARITIES.map((_, idx) =>
    rewardDistributionByTileRarity.reduce((sum, row) => sum + (row.counts[idx] || 0), 0)
  );

  const expRankById = new Map(expeditions.map(e => [e.id, e.site_rank]));
  const tileRarityByRankMap = new Map();
  SITE_RANKS.forEach(rank => {
    tileRarityByRankMap.set(rank, TILE_RARITIES.map(() => 0));
  });

  uniqueTiles.forEach(t => {
    const rank = expRankById.get(t.expedition_id);
    const arr = tileRarityByRankMap.get(rank);
    const rarityIdx = tileRarityIndex.get(t.tile_rarity);
    if (!arr || rarityIdx == null) return;
    arr[rarityIdx] += 1;
  });

  const tileRarityByRank = SITE_RANKS.map(rank => {
    const counts = tileRarityByRankMap.get(rank) || TILE_RARITIES.map(() => 0);
    const total = counts.reduce((sum, v) => sum + v, 0);
    return { rank, counts, total };
  });

  const tileRarityByRankTotals = SITE_RANKS.map(rank => {
    const row = tileRarityByRank.find(r => r.rank === rank);
    return row?.total || 0;
  });

  // avg AP by site rank (per tile)
  const siteApByRank = SITE_RANKS.map(rank => {
    const rankExpIds = new Set(expeditions.filter(e => e.site_rank === rank).map(e => e.id));
    const rankTiles = selectedTileRecords.filter(t => rankExpIds.has(t.expedition_id) && t.ap_cost != null);
    const avgAp = rankTiles.length > 0
      ? rankTiles.reduce((sum, t) => sum + t.ap_cost, 0) / rankTiles.length
      : 0;
    return { rank, avgAp };
  });

  // match effects
  const computeMatchGroup = (filterFn) => {
    const groupExps = expeditions.filter(filterFn);
    const groupExpIds = new Set(groupExps.map(e => e.id));
    const groupTiles = uniqueTiles.filter(t => groupExpIds.has(t.expedition_id));
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

  // detailed both-match analytics
  const bothMatchExps = expeditions.filter(e => e.element_match && e.type_match);
  const bothMatchExpIds = new Set(bothMatchExps.map(e => e.id));
  const bothMatchTiles = uniqueTiles.filter(t => bothMatchExpIds.has(t.expedition_id));
  const bothMatchRewards = rewards.filter(r => bothMatchExpIds.has(r.expedition_id));

  // tile rarity distribution for both-match
  const bothMatchTilesByRarity = TILE_RARITIES.map(rarity => ({
    rarity,
    count: bothMatchTiles.filter(t => t.tile_rarity === rarity).length,
  }));

  // avg AP for both-match tiles (use selected option records)
  const bothMatchSelectedTiles = selectedTileRecords.filter(t => bothMatchExpIds.has(t.expedition_id));
  const bothMatchSelectedTilesWithAp = bothMatchSelectedTiles.filter(t => t.ap_cost != null);
  const bothMatchAvgAp = bothMatchSelectedTilesWithAp.length > 0
    ? bothMatchSelectedTilesWithAp.reduce((sum, t) => sum + t.ap_cost, 0) / bothMatchSelectedTilesWithAp.length
    : 0;

  // pouch distribution for both-match (all tiles)
  const bothMatchPouchMap = {};
  POUCH_TYPES.forEach(p => { bothMatchPouchMap[p] = 0; });
  bothMatchTiles.forEach(t => {
    if (t.reward_option) {
      const key = POUCH_TYPES.find(p => t.reward_option.toLowerCase().includes(p.toLowerCase()));
      if (key) {
        bothMatchPouchMap[key] = (bothMatchPouchMap[key] || 0) + 1;
      }
    }
  });
  const bothMatchPouchDistribution = POUCH_TYPES.map(p => ({ pouch: p, count: bothMatchPouchMap[p] || 0 }));
  const bothMatchPouchTotal = bothMatchPouchDistribution.reduce((sum, p) => sum + p.count, 0);

  // tier-up stats for both-match
  const bothMatchWithTierUps = bothMatchExps.filter(e => e.tier_ups && e.tier_ups > 0);
  const bothMatchTotalTierUps = bothMatchWithTierUps.reduce((sum, e) => sum + (e.tier_ups || 0), 0);
  const bothMatchTierUpRate = bothMatchExps.length > 0 ? (bothMatchWithTierUps.length / bothMatchExps.length) * 100 : 0;
  const bothMatchAvgTierUps = bothMatchWithTierUps.length > 0 ? bothMatchTotalTierUps / bothMatchWithTierUps.length : 0;

  // top rewards for both-match
  const bothMatchRewardGroups = {};
  bothMatchRewards.forEach(r => {
    const key = r.item_name;
    if (!bothMatchRewardGroups[key]) {
      bothMatchRewardGroups[key] = { name: key, occurrences: 0, totalQuantity: 0 };
    }
    bothMatchRewardGroups[key].occurrences += 1;
    bothMatchRewardGroups[key].totalQuantity += r.quantity;
  });
  const bothMatchTopRewards = Object.values(bothMatchRewardGroups)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);

  // detailed no/half-match analytics (anything that isn't both-match)
  const noMatchExps = expeditions.filter(e => !(e.element_match && e.type_match));
  const noMatchWithTierUps = noMatchExps.filter(e => e.tier_ups && e.tier_ups > 0);
  const noMatchTierUpRate = noMatchExps.length > 0 ? (noMatchWithTierUps.length / noMatchExps.length) * 100 : 0;

  // detailed no/half-match analytics
  const noMatchExpIds = new Set(noMatchExps.map(e => e.id));
  const noMatchTiles = uniqueTiles.filter(t => noMatchExpIds.has(t.expedition_id));
  const noMatchRewards = rewards.filter(r => noMatchExpIds.has(r.expedition_id));

  const noMatchTilesByRarity = TILE_RARITIES.map(rarity => ({
    rarity,
    count: noMatchTiles.filter(t => t.tile_rarity === rarity).length,
  }));

  const noMatchSelectedTiles = selectedTileRecords.filter(t => noMatchExpIds.has(t.expedition_id));
  const noMatchSelectedTilesWithAp = noMatchSelectedTiles.filter(t => t.ap_cost != null);
  const noMatchAvgAp = noMatchSelectedTilesWithAp.length > 0
    ? noMatchSelectedTilesWithAp.reduce((sum, t) => sum + t.ap_cost, 0) / noMatchSelectedTilesWithAp.length
    : 0;

  const noMatchPouchMap = {};
  POUCH_TYPES.forEach(p => { noMatchPouchMap[p] = 0; });
  noMatchTiles.forEach(t => {
    if (t.reward_option) {
      const key = POUCH_TYPES.find(p => t.reward_option.toLowerCase().includes(p.toLowerCase()));
      if (key) {
        noMatchPouchMap[key] = (noMatchPouchMap[key] || 0) + 1;
      }
    }
  });
  const noMatchPouchDistribution = POUCH_TYPES.map(p => ({ pouch: p, count: noMatchPouchMap[p] || 0 }));
  const noMatchPouchTotal = noMatchPouchDistribution.reduce((sum, p) => sum + p.count, 0);

  const noMatchRewardGroups = {};
  noMatchRewards.forEach(r => {
    const key = r.item_name;
    if (!noMatchRewardGroups[key]) {
      noMatchRewardGroups[key] = { name: key, occurrences: 0, totalQuantity: 0 };
    }
    noMatchRewardGroups[key].occurrences += 1;
    noMatchRewardGroups[key].totalQuantity += r.quantity;
  });
  const noMatchTopRewards = Object.values(noMatchRewardGroups)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);

  const bothMatchStats = {
    expeditionCount: bothMatchExps.length,
    tileCount: bothMatchTiles.length,
    rewardCount: bothMatchRewards.length,
    avgAp: bothMatchAvgAp,
    tilesByRarity: bothMatchTilesByRarity,
    pouchDistribution: bothMatchPouchDistribution,
    pouchTotal: bothMatchPouchTotal,
    tierUpRate: bothMatchTierUpRate,
    avgTierUps: bothMatchAvgTierUps,
    topRewards: bothMatchTopRewards,
  };

  const noMatchStats = {
    expeditionCount: noMatchExps.length,
    tileCount: noMatchTiles.length,
    rewardCount: noMatchRewards.length,
    avgAp: noMatchAvgAp,
    tilesByRarity: noMatchTilesByRarity,
    pouchDistribution: noMatchPouchDistribution,
    pouchTotal: noMatchPouchTotal,
    tierUpRate: noMatchTierUpRate,
    topRewards: noMatchTopRewards,
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
  expeditionsWithTierUps.forEach(e => {
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
    tileCount: uniqueTiles.length,
    tileOptionRecordCount: tiles.length,
    funStats,
    expeditionsByRank,
    tilesByRarity,
    tilesByType,
    avgApByRarity,
    avgApByRound,
    worstCaseApRounds1to4,
    topRewards,
    rewardsByRank,
    rewardsByTileRarity,
    pouchAppearance,
    pouchAppearanceTotal,
    pouchAppearanceAll,
    pouchAppearanceAllTotal,
    rewardDistributionByTileRarity,
    rewardDistributionTotalsByTileRarity,
    tileRarityByRank,
    tileRarityByRankTotals,
    siteApByRank,
    matchEffects,
    bothMatchStats,
    noMatchStats,
    tierUpStats,
  };
}
