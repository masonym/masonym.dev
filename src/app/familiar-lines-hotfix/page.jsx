'use client';

import { useState, useEffect } from 'react';
import './styles.css';

export default function FamiliarLinesHotfixPage() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/familiar_data/lines-hotfix.json')
      .then(res => res.json())
      .then(data => {
        setChanges(data.Changes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load hotfix data:', err);
        setLoading(false);
      });
  }, []);

  const getTierFromId = (id) => {
    const idStr = String(id);
    if (idStr.length < 2) return 'unknown';
    const tierDigit = idStr[1];
    switch (tierDigit) {
      case '1': return 'common';
      case '2': return 'rare';
      case '3': return 'epic';
      case '4': return 'unique';
      case '5': return 'legendary';
      default: return 'unknown';
    }
  };

  const getTierName = (tier) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const extractId = (change) => {
    const match = change.PropertyPath?.match(/^(\d+)\//);
    return match ? match[1] : null;
  };

  const cleanString = (str) => {
    if (!str) return '';
    return str
      .replace(/^"|"$/g, '')
      .replace(/\\u002B/g, '+')
      .replace(/#w/g, 'X')
      .replace(/#mulx/g, 'Y%')
      .replace(/#add/g, 'Y');
  };

  const groupedChanges = changes.reduce((acc, change) => {
    const id = extractId(change);
    if (!id) return acc;
    const tier = getTierFromId(id);
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push({ ...change, id });
    return acc;
  }, {});

  const tierOrder = ['legendary', 'unique', 'epic', 'rare', 'common', 'unknown'];

  const deduplicateByText = (changes) => {
    const seen = new Map();
    for (const change of changes) {
      const key = `${cleanString(change.PatchValue)}|${cleanString(change.HotfixValue)}`;
      if (!seen.has(key)) {
        seen.set(key, { ...change, count: 1 });
      } else {
        seen.get(key).count++;
      }
    }
    return Array.from(seen.values());
  };

  if (loading) {
    return (
      <div className="hotfix-container">
        <h1>January 8th, 2026 Familiar Lines Hotfix</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="hotfix-container">
      <h1>January 8th, 2026 Familiar Lines Hotfix</h1>
      <p className="description">
        This page shows the familiar potential line text corrections from the January 8th, 2026 hotfix.
        The changes fix incorrect wording in dice-related and element-related familiar lines.
      </p>
      <p className="summary">
        <span className="count">{changes.length}</span> total line changes across all variants (includes duplicates)
      </p>

      {tierOrder.map(tier => {
        const tierChanges = groupedChanges[tier];
        if (!tierChanges || tierChanges.length === 0) return null;
        
        const dedupedChanges = deduplicateByText(tierChanges);

        return (
          <section key={tier} className="tier-section">
            <h2 className={`tier-header ${tier}`}>
              {getTierName(tier)} 
              <span className="tier-count">({tierChanges.length} lines, {dedupedChanges.length} unique)</span>
            </h2>
            <div className="changes-grid">
              {dedupedChanges.map((change, idx) => (
                <div key={idx} className={`change-card ${tier}`}>
                  <div className="change-header">
                    <span className="option-id">ID: {change.id}</span>
                    {change.count > 1 && (
                      <span className="duplicate-count">×{change.count} variants</span>
                    )}
                  </div>
                  <div className="change-content">
                    <div className="old-value">
                      <span className="label">Before:</span>
                      <span className="value">{cleanString(change.PatchValue)}</span>
                    </div>
                    <div className="arrow">→</div>
                    <div className="new-value">
                      <span className="label">After:</span>
                      <span className="value">{cleanString(change.HotfixValue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
