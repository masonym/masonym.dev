'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  sunnySundaySchedule,
  SUNNY_SUNDAY_EVENT_TYPES,
  EVENT_CATEGORIES,
  resolveEvent,
  hasShiningStarForce,
  getCategoryStyle,
} from '@/data/sunnySundayEvents';
import {
  Sun,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Filter,
  Star,
  Info,
  List,
  BarChart3,
  Clock,
  ChevronsUpDown,
} from 'lucide-react';

const DAY_MS = 24 * 60 * 60 * 1000;

const parseYmdAsUtcDate = (ymd) => {
  if (ymd instanceof Date) return ymd;
  if (typeof ymd !== 'string') return new Date(ymd);
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const getUtcStartOfDayMs = (date) => {
  const d = parseYmdAsUtcDate(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const isSameUtcDay = (date1, date2) => {
  const d1 = parseYmdAsUtcDate(date1);
  const d2 = parseYmdAsUtcDate(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};

const isPastUtc = (date) => {
  const todayUtcStartMs = getUtcStartOfDayMs(new Date());
  const dateUtcStartMs = getUtcStartOfDayMs(date);
  return dateUtcStartMs < todayUtcStartMs;
};

const isTodayUtc = (date) => {
  return isSameUtcDay(date, new Date());
};

const getSundayOfWeekUtc = (date) => {
  const d = parseYmdAsUtcDate(date);
  const utcMidnightMs = getUtcStartOfDayMs(d);
  const day = d.getUTCDay();
  return new Date(utcMidnightMs - day * DAY_MS);
};

const formatSundayDateUtc = (date) => {
  const d = parseYmdAsUtcDate(date);
  return d.toLocaleDateString('en-US', {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const formatSundayDateShortUtc = (date) => {
  const d = parseYmdAsUtcDate(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

// event icon component with fallback to placeholder
const EventIcon = ({ src, alt, size = 24 }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div 
      className="relative flex-shrink-0 bg-background-bright rounded" 
      style={{ width: size, height: size }}
    >
      {!hasError ? (
        <Image
          src={imgSrc}
          alt={alt}
          width={size}
          height={size}
          className="object-contain"
          onError={() => {
            setImgSrc('/sunnySundayIcons/sunny-sunday.png');
            setHasError(true);
          }}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-primary"
          style={{ fontSize: size * 0.5 }}
        >
          ?
        </div>
      )}
    </div>
  );
};

// event badge component
const EventBadge = ({ event, compact = false }) => {
  const categoryClass = getCategoryStyle(event.category);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${categoryClass}`}
        title={event.name}
      >
        <EventIcon src={event.icon} alt={event.shortName || event.name} size={20} />
        <span className="text-sm font-medium">{event.shortName || event.name}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:scale-[1.01] ${categoryClass}`}
    >
      <EventIcon src={event.icon} alt={event.shortName || event.name} size={28} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{event.shortName || event.name}</p>
        {event.shortName && event.shortName !== event.name && (
          <p className="text-xs opacity-70 truncate">{event.name}</p>
        )}
      </div>
      {event.isCustom && (
        <span className="px-2 py-0.5 rounded text-xs sunny-category-seasonal border font-medium">
          Seasonal
        </span>
      )}
    </div>
  );
};

// sunday card component
const SundayCard = ({ sunday, isExpanded, onToggle, isCurrentWeek }) => {
  const date = parseYmdAsUtcDate(sunday.date);
  const events = sunday.events.map(resolveEvent).filter(Boolean);
  const showShining = hasShiningStarForce(sunday.events);
  const past = isPastUtc(date);
  const today = isTodayUtc(date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        today
          ? 'border-secondary bg-secondary ring-2 ring-secondary dark:bg-primary-dark'
          : isCurrentWeek
          ? 'border-secondary bg-primary-dark'
          : past
          ? 'border-primary-dim bg-primary-dark'
          : 'border-primary-dim bg-primary-dark hover:border-secondary'
      }`}
    >
      {/* header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              today
                ? 'bg-primary-dark text-secondary dark:bg-secondary dark:text-primary-dark'
                : past
                ? 'bg-primary-dim text-primary'
                : 'bg-background-bright text-secondary'
            }`}
          >
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-bold text-lg ${
                  today
                    ? 'text-primary-dark dark:text-primary-bright'
                    : past
                    ? 'text-primary'
                    : 'text-primary-bright'
                }`}
              >
                {formatSundayDateShortUtc(date)}
              </h3>
              {today && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary-dark text-secondary border border-secondary font-bold animate-pulse">
                  TODAY
                </span>
              )}
              {!today && isCurrentWeek && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-primary-dark font-medium">
                  Upcoming
                </span>
              )}
              {showShining && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-primary-dark font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Shining Star Force
                </span>
              )}
            </div>
            <p className={`text-sm ${today ? 'text-primary-dark dark:text-primary' : 'text-primary'}`}>
              {date.getUTCFullYear()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {events.slice(0, 4).map((event, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-background-bright flex items-center justify-center border-2 border-primary-dark overflow-hidden"
                title={event.name}
              >
                <EventIcon src={event.icon} alt={event.name} size={20} />
              </div>
            ))}
            {events.length > 4 && (
              <span className="w-8 h-8 rounded-full bg-background-bright flex items-center justify-center text-xs text-primary border-2 border-primary-dark">
                +{events.length - 4}
              </span>
            )}
          </div>
          <ChevronRight
            className={`w-5 h-5 text-primary transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </button>

      {/* expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px bg-primary-dim" />
              <div className="grid gap-2">
                {events.map((event, i) => (
                  <EventBadge key={i} event={event} />
                ))}
              </div>
              {sunday.source && (
                <p className="text-xs text-primary flex items-center gap-1 pt-2">
                  <Info className="w-3 h-3" />
                  Source: {sunday.source}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// timeline view component
const TimelineView = ({ sundays, currentSunday }) => {
  // start with all expanded
  const [expandedIds, setExpandedIds] = useState(() => 
    new Set(sundays.map(s => s.date))
  );

  const nextUpcomingSundayUtc = (() => {
    const now = new Date();
    const currentWeekSundayUtc = getSundayOfWeekUtc(now);
    if (isSameUtcDay(now, currentWeekSundayUtc)) return currentWeekSundayUtc;
    return new Date(getUtcStartOfDayMs(currentWeekSundayUtc) + 7 * DAY_MS);
  })();

  const allExpanded = expandedIds.size === sundays.length;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(sundays.map(s => s.date)));
    }
  };

  const toggleOne = (date) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* expand/collapse all button */}
      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-background-bright text-primary hover:text-primary-bright transition-all flex items-center gap-2"
        >
          <ChevronsUpDown className="w-4 h-4" />
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {sundays.map((sunday) => {
        const sundayDate = parseYmdAsUtcDate(sunday.date);
        const isCurrentWeek = isSameUtcDay(sundayDate, nextUpcomingSundayUtc);

        return (
          <SundayCard
            key={sunday.date}
            sunday={sunday}
            isExpanded={expandedIds.has(sunday.date)}
            onToggle={() => toggleOne(sunday.date)}
            isCurrentWeek={isCurrentWeek}
          />
        );
      })}
    </div>
  );
};

// filter panel
const FilterPanel = ({ selectedCategories, onToggleCategory, onClearFilters }) => {
  return (
    <div className="p-4 rounded-xl bg-primary-dark border border-primary-dim">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-primary-bright flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by Category
        </h4>
        {selectedCategories.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-secondary hover:text-secondary-bright"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => onToggleCategory(key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedCategories.includes(key)
                ? 'bg-secondary text-primary-dark'
                : 'bg-background-bright text-primary hover:text-primary-bright'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// event legend - grouped by category
const EventLegend = () => {
  const allEvents = Object.values(SUNNY_SUNDAY_EVENT_TYPES);
  
  // group events by category
  const groupedEvents = useMemo(() => {
    const groups = {};
    allEvents.forEach((event) => {
      const cat = event.category || 'utility';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(event);
    });
    return groups;
  }, [allEvents]);

  return (
    <div className="p-5 rounded-2xl bg-primary-dark border border-primary-dim">
      <h4 className="font-bold text-primary-bright mb-4 flex items-center gap-2 text-lg">
        <Star className="w-5 h-5 text-secondary" />
        All Sunny Sunday Events
      </h4>
      <div className="space-y-4">
        {Object.entries(EVENT_CATEGORIES).map(([catKey, catInfo]) => {
          const events = groupedEvents[catKey];
          if (!events || events.length === 0) return null;
          
          return (
            <div key={catKey}>
              <h5 className={`text-sm font-medium mb-2 ${getCategoryStyle(catKey)} inline-block px-2 py-0.5 rounded border`}>
                {catInfo.name}
              </h5>
              <div className="grid gap-2 sm:grid-cols-2">
                {events.map((event) => (
                  <EventBadge key={event.id} event={event} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// simple list view - plain text for easy searching
const ListView = ({ sundays }) => {
  return (
    <div className="bg-primary-dark border border-primary-dim rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary-dim bg-background-bright">
            <th className="text-left px-4 py-3 text-primary-bright font-medium">Date</th>
            <th className="text-left px-4 py-3 text-primary-bright font-medium">Events</th>
          </tr>
        </thead>
        <tbody>
          {sundays.map((sunday) => {
            const events = sunday.events.map(resolveEvent).filter(Boolean);
            return (
              <tr key={sunday.date} className="border-b border-primary-dim/50 hover:bg-background-bright/50">
                <td className="px-4 py-2 text-primary whitespace-nowrap align-top">
                  {formatSundayDateUtc(sunday.date)}
                </td>
                <td className="px-4 py-2 text-primary">
                  {events.map(e => e.shortName || e.name).join(', ')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// analytics view
const AnalyticsView = ({ sundays }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate()));
    
    // count events
    const eventCounts = {};
    const categoryCounts = {};
    const yearEventCounts = {};
    const yearCategoryCounts = {};
    let totalEvents = 0;
    let yearEvents = 0;
    
    let shiningCount = 0;
    let yearShiningCount = 0;

    sundays.forEach((sunday) => {
      const sundayDate = parseYmdAsUtcDate(sunday.date);
      const isWithinYear = sundayDate >= oneYearAgo;
      
      // check for shining star force
      if (hasShiningStarForce(sunday.events)) {
        shiningCount++;
        if (isWithinYear) yearShiningCount++;
      }

      // filter events with .isCustom === true
      const filteredEvents = sunday.events.filter((eventRef) => {
        const event = resolveEvent(eventRef);
        return !event || !event.isCustom;
      });
      
      filteredEvents.forEach((eventRef) => {
        const event = resolveEvent(eventRef);
        if (!event) return;
        
        const name = event.shortName || event.name;
        const category = event.category;
        
        // all time
        eventCounts[name] = (eventCounts[name] || 0) + 1;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        totalEvents++;
        
        // last year
        if (isWithinYear) {
          yearEventCounts[name] = (yearEventCounts[name] || 0) + 1;
          yearCategoryCounts[category] = (yearCategoryCounts[category] || 0) + 1;
          yearEvents++;
        }
      });
    });
    
    // sort by count
    const sortedEvents = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1]);
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);
    const sortedYearEvents = Object.entries(yearEventCounts)
      .sort((a, b) => b[1] - a[1]);
    
    return {
      totalSundays: sundays.length,
      totalEvents,
      yearEvents,
      shiningCount,
      yearShiningCount,
      eventCounts: sortedEvents,
      categoryCounts: sortedCategories,
      yearEventCounts: sortedYearEvents,
      yearCategoryCounts,
    };
  }, [sundays]);

  return (
    <div className="space-y-6">
      {/* date notice */}
      <div className="text-center mb-8">
        <p className="text-sm text-primary font-italic my-2 mx-auto">
          Please note that data collection of previous Sunny Sundays only goes back to v.256, dated December 22, 2024.</p>
      </div>
      {/* summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-primary-dark border border-primary-dim rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-secondary">{stats.totalSundays}</div>
          <div className="text-sm text-primary">Total Sundays</div>
        </div>
        <div className="bg-primary-dark border border-primary-dim rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-secondary">{stats.totalEvents}</div>
          <div className="text-sm text-primary">Total Perks</div>
        </div>
        <div className="bg-primary-dark border border-primary-dim rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-secondary">
            {stats.totalSundays > 0 ? (stats.totalEvents / stats.totalSundays).toFixed(1) : 0}
          </div>
          <div className="text-sm text-primary">Avg Perks/Sunday</div>
        </div>
      </div>

      {/* shining star force card */}
      <div className="bg-primary-dark border-2 border-secondary rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-bold text-secondary">Shining Star Force</h3>
          <Sparkles className="w-5 h-5 text-secondary" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-bright">{stats.shiningCount}</div>
            <div className="text-sm text-primary">All Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-bright">{stats.yearShiningCount}</div>
            <div className="text-sm text-primary">Last 12 Months</div>
          </div>
        </div>
      </div>

      {/* last year event frequency */}
      <div className="bg-primary-dark border border-primary-dim rounded-xl p-4">
        <h3 className="text-lg font-bold text-primary-bright mb-4">Event Frequency (Last 12 Months)</h3>
        <div className="space-y-2">
          {stats.yearEventCounts.map(([name, count]) => {
            const maxCount = stats.yearEventCounts[0]?.[1] || 1;
            const percentage = (count / maxCount) * 100;
            return (
              <div key={name} className="flex items-center gap-3">
                <div className="w-40 sm:w-56 text-sm text-primary truncate" title={name}>
                  {name}
                </div>
                <div className="flex-1 h-6 bg-background-bright rounded overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium text-primary-bright">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* category breakdown */}
      <div className="bg-primary-dark border border-primary-dim rounded-xl p-4">
        <h3 className="text-lg font-bold text-primary-bright mb-4">Category Breakdown (All Time)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.categoryCounts.map(([category, count]) => {
            const catInfo = EVENT_CATEGORIES[category];
            const catClass = getCategoryStyle(category);
            return (
              <div
                key={category}
                className={`p-3 rounded-lg border ${catClass}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm">{catInfo?.name || category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* all time event frequency */}
      <div className="bg-primary-dark border border-primary-dim rounded-xl p-4">
        <h3 className="text-lg font-bold text-primary-bright mb-4">All-Time Perk Frequency</h3>
        <div className="space-y-2">
          {stats.eventCounts.map(([name, count]) => {
            const maxCount = stats.eventCounts[0]?.[1] || 1;
            const percentage = (count / maxCount) * 100;
            return (
              <div key={name} className="flex items-center gap-3">
                <div className="w-40 sm:w-56 text-sm text-primary truncate" title={name}>
                  {name}
                </div>
                <div className="flex-1 h-6 bg-background-bright rounded overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium text-primary-bright pl-2">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// main component
const SunnySundayClient = () => {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'list' | 'analytics'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showLegend, setShowLegend] = useState(false);

  // sort sundays by date
  const sortedSundays = useMemo(() => {
    return [...sunnySundaySchedule].sort(
      (a, b) => parseYmdAsUtcDate(b.date) - parseYmdAsUtcDate(a.date)
    );
  }, []);

  // filter sundays by category
  const filteredSundays = useMemo(() => {
    if (selectedCategories.length === 0) return sortedSundays;

    return sortedSundays.filter((sunday) => {
      const events = sunday.events.map(resolveEvent).filter(Boolean);
      return events.some(
        (event) =>
          selectedCategories.includes(event.category) ||
          (event.isCustom && selectedCategories.includes('seasonal'))
      );
    });
  }, [sortedSundays, selectedCategories]);

  // find current/next sunday
  const currentSunday = useMemo(() => {
    const today = new Date();
    const thisSunday = getSundayOfWeekUtc(today);

    // find this week's sunday or next upcoming
    return sortedSundays.find((s) => {
      const sundayDate = parseYmdAsUtcDate(s.date);
      return sundayDate >= thisSunday;
    });
  }, [sortedSundays]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary-bright tracking-tight">
          Sunny Sunday
        </h1>
        <p className="text-lg text-primary mt-2 max-w-2xl mx-auto">
          Track upcoming and past Sunny Sunday events in MapleStory
        </p>
      </div>

      {/* view toggle and controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-background-bright">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'timeline'
                ? 'bg-secondary text-primary-dark'
                : 'text-primary hover:text-primary-bright'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-secondary text-primary-dark'
                : 'text-primary hover:text-primary-bright'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'analytics'
                ? 'bg-secondary text-primary-dark'
                : 'text-primary hover:text-primary-bright'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>

        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            showLegend
              ? 'bg-secondary text-primary-dark'
              : 'bg-background-bright text-primary hover:text-primary-bright'
          }`}
        >
          <Star className="w-4 h-4" />
          Event Legend
        </button>
      </div>

      {/* legend panel */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <EventLegend />
          </motion.div>
        )}
      </AnimatePresence>

      {/* filter panel */}
      {viewMode != 'analytics' && 
      <div className="mb-6">
        <FilterPanel
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          onClearFilters={() => setSelectedCategories([])}
        />
      </div>
      }
      {/* main content */}
      <div className="min-h-[400px]">
        {viewMode === 'timeline' && (
          <TimelineView sundays={filteredSundays} currentSunday={currentSunday} />
        )}
        {viewMode === 'list' && (
          <ListView sundays={filteredSundays} />
        )}
        {viewMode === 'analytics' && (
          <AnalyticsView sundays={sortedSundays} />
        )}

        {viewMode !== 'analytics' && filteredSundays.length === 0 && (
          <div className="text-center py-12">
            <Sun className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-primary text-lg">No Sunny Sundays match your filters</p>
            <button
              onClick={() => setSelectedCategories([])}
              className="mt-4 px-4 py-2 rounded-lg bg-secondary text-primary-dark text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* footer info */}
      <footer className="text-center mt-12 text-primary text-sm space-y-2">
        <p>
          Sunny Sunday events are announced in MapleStory patch notes.
        </p>
        <p className="text-xs">
          Data is, unfortunately, manually updated. If you notice missing or incorrect information, please let me know!
        </p>
      </footer>
    </div>
  );
};

export default SunnySundayClient;
